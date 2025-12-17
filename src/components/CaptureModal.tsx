import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { useModalUi } from "@/contexts/ModalUiContext";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onOpenReview: (text: string) => void;
  embedded?: boolean;
  initialText?: string;
  initialTextNonce?: number;
}

// Evento global para dictado -> append al textarea
const CAPTURE_APPEND_EVENT = "remi-capture-append";

// Keys de tips (igual que los hints, indexados)
const TIP_KEYS = [
  "capture.tips.0",
  "capture.tips.1",
  "capture.tips.2",
  "capture.tips.3",
];

export default function CaptureModal({
  open,
  onClose,
  onOpenReview,
  embedded = false,
  initialText,
  initialTextNonce,
}: CaptureModalProps) {
  const { t } = useI18n();
  const { setModalOpen } = useModalUi();

  /* ───────────────────────────────
     Modal open state
  ─────────────────────────────── */
  useEffect(() => {
    const isRealModalOpen = open && !embedded;
    setModalOpen(isRealModalOpen);
    return () => setModalOpen(false);
  }, [open, embedded, setModalOpen]);

  const [text, setText] = useState("");
  const textRef = useRef<string>("");

  const [loading, setLoading] = useState(false);

  // Evitar pisar texto del usuario
  const userEditedRef = useRef(false);
  const lastInitialAppliedRef = useRef<string>("");
  const lastInitialAppliedNonceRef = useRef<number>(-1);

  /* ───────────────────────────────
     Tips (1 línea, rotativos)
     -> MISMO FORMATO QUE HINTS
  ─────────────────────────────── */
  const tips = TIP_KEYS.map((key) => t(key)).filter(Boolean);
  const totalTips = tips.length;
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if ((!open && !embedded) || totalTips === 0) return;

    setTipIndex(0);
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % totalTips);
    }, 12000);

    return () => clearInterval(interval);
  }, [open, embedded, totalTips]);

  /* ───────────────────────────────
     Aplicar initialText
  ─────────────────────────────── */
  useEffect(() => {
    const visible = embedded || open;
    if (!visible) return;

    const incoming = (initialText ?? "").trim();
    if (!incoming) return;

    const nonce =
      typeof initialTextNonce === "number" ? initialTextNonce : null;

    if (nonce !== null) {
      if (nonce <= lastInitialAppliedNonceRef.current) return;
    } else {
      if (incoming === lastInitialAppliedRef.current) return;
    }

    const currentText = (textRef.current ?? "").trim();
    const canOverwrite = !userEditedRef.current || currentText === "";
    if (!canOverwrite) return;

    if (nonce !== null) lastInitialAppliedNonceRef.current = nonce;
    lastInitialAppliedRef.current = incoming;

    userEditedRef.current = false;
    textRef.current = incoming;
    setText(incoming);
  }, [initialText, initialTextNonce, open, embedded]);

  /* ───────────────────────────────
     Escuchar dictado global
  ─────────────────────────────── */
  useEffect(() => {
    const visible = embedded || open;
    if (!visible) return;

    const handler = (ev: Event) => {
      const ce = ev as CustomEvent<{ text?: unknown }>;
      const raw = ce?.detail?.text;
      const incoming = typeof raw === "string" ? raw.trim() : "";
      if (!incoming) return;

      userEditedRef.current = true;

      const current = textRef.current ?? "";
      const needsNewLine =
        current.trim().length > 0 && !current.endsWith("\n");

      const next = current + (needsNewLine ? "\n" : "") + incoming;

      textRef.current = next;
      setText(next);
    };

    window.addEventListener(CAPTURE_APPEND_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(CAPTURE_APPEND_EVENT, handler as EventListener);
  }, [open, embedded]);

  if (!embedded && !open) return null;

  /* ───────────────────────────────
     Helpers
  ─────────────────────────────── */
  const resetOnly = () => {
    setText("");
    textRef.current = "";
    userEditedRef.current = false;
  };

  const resetAndClose = () => {
    resetOnly();
    if (!embedded) setModalOpen(false);
    if (!embedded) onClose();
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      if (!trimmed) toast.error(t("capture.toastEmpty"));
      return;
    }

    setLoading(true);
    try {
      onOpenReview(trimmed);
      if (embedded) resetOnly();
      else resetAndClose();
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────────
     Header
  ─────────────────────────────── */
  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="remi-modal-title">{t("capture.title")}</div>
        <div className="remi-modal-sub">{t("capture.subtitle")}</div>
      </div>

      {!embedded && (
        <button
          type="button"
          onClick={resetAndClose}
          disabled={loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  /* ───────────────────────────────
     Body
  ─────────────────────────────── */
  const body = (
    <div className="remi-modal-body">
      <textarea
        className="remi-modal-textarea"
        placeholder={[
          t("capture.textareaPlaceholder"),
          "",
          t("capture.exampleVoice"),
          t("capture.examplePaste"),
          t("capture.exampleIdea"),
        ].join("\n")}
        value={text}
        onChange={(e) => {
          userEditedRef.current = true;
          const v = e.target.value;
          textRef.current = v;
          setText(v);
        }}
      />

      {/* ── CONSEJO PEQUEÑO (zona marcada en rojo) ── */}
      {/* Zona fija de tips (no mueve el layout) */}
<div
  style={{
    marginTop: 6,
    marginBottom: 6,
    minHeight: 16,        // ← ALTURA FIJA (clave)
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: "16px",   // ← coincide con minHeight
    userSelect: "none",
    overflow: "hidden",
  }}
>
  {text.trim().length === 0 && totalTips > 0 ? tips[tipIndex] : ""}
</div>


      <div
        className="remi-modal-footer"
        style={{ display: "flex", gap: 10, marginTop: 14 }}
      >
        {!embedded && (
          <button
            className="remi-btn-ghost"
            style={{ flex: 1 }}
            onClick={resetAndClose}
            disabled={loading}
            type="button"
          >
            {t("common.cancel")}
          </button>
        )}

        <button
          className="remi-btn-primary"
          style={{
            flex: 1,
            background: "#7d59c9",
            padding: "4px 10px",
            fontSize: 14,
          }}
          onClick={handleSave}
          disabled={loading || text.trim().length === 0}
          type="button"
        >
          {t("common.save")}
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div
        className="remi-inline-card"
        style={{
          borderRadius: 18,
          background: "#ffffff",
          boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
          padding: "16px 16px 14px",
        }}
      >
        {header}
        {body}
      </div>
    );
  }

  return (
    <div className="remi-modal-backdrop">
      <div className="remi-modal-card">
        {header}
        {body}
      </div>
    </div>
  );
}
