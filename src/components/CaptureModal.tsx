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

// Umbral para considerar “nueva sesión” de dictado (solté y volví a pulsar)
const NEW_LINE_GAP_MS = 1200;

/** Normaliza espacios para comparar buffers de dictado */
function normalizeForCompare(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

/**
 * Devuelve SOLO lo nuevo que trae nextFull respecto a prevFull.
 * Casos típicos Android:
 *  - prev="test" next="test número"  -> "número"
 *  - prev="test número" next="test número 1" -> "1"
 * Si next se repite o “retrocede”, devuelve "".
 */
function deltaFromGrowingBuffer(prevFull: string, nextFull: string) {
  const prev = normalizeForCompare(prevFull);
  const next = normalizeForCompare(nextFull);

  if (!next) return "";
  if (!prev) return next;
  if (next === prev) return "";

  // Caso ideal: next contiene prev al inicio (crece)
  if (next.startsWith(prev)) {
    const tail = next.slice(prev.length).trim();
    return tail;
  }

  // A veces el motor “retrocede” (next más corto)
  if (prev.startsWith(next)) {
    return "";
  }

  // Fallback: intenta solapamiento (suffix(prev) == prefix(next))
  const max = Math.min(prev.length, next.length);
  for (let k = max; k >= 3; k--) {
    if (prev.endsWith(next.slice(0, k))) {
      const tail = next.slice(k).trim();
      return tail;
    }
  }

  // Si no podemos asegurar nada, mejor NO apendar todo (evita duplicados masivos)
  return "";
}

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

  // ✅ Estado para dictado: agrupar “sesiones” y calcular deltas
  const lastDictationAppendAtRef = useRef<number>(0);
  const lastDictationBufferRef = useRef<string>(""); // último “full transcript” recibido en la sesión

  /* ───────────────────────────────
     Tips (2 líneas máx, altura fija)
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

      const incomingFull = typeof raw === "string" ? raw : "";
      const incomingNorm = normalizeForCompare(incomingFull);
      if (!incomingNorm) return;

      userEditedRef.current = true;

      const now = Date.now();
      const current = textRef.current ?? "";
      const gap = now - (lastDictationAppendAtRef.current || 0);
      const isNewSession = gap > NEW_LINE_GAP_MS;

      if (isNewSession) {
        // ✅ nueva sesión: resetea el buffer para que el primer delta sea “todo”
        lastDictationBufferRef.current = "";
      }

      // ✅ calcula solo lo NUEVO del buffer creciente
      const delta = deltaFromGrowingBuffer(
        lastDictationBufferRef.current,
        incomingNorm
      );

      // actualiza buffer/tiempo aunque el delta sea vacío (para estabilizar)
      lastDictationBufferRef.current = incomingNorm;
      lastDictationAppendAtRef.current = now;

      if (!delta) return;

      // ✅ separador:
      // - nueva sesión -> nueva línea (una sola vez)
      // - misma sesión -> espacio
      let sep = "";
      if (current.length === 0) {
        sep = "";
      } else if (current.endsWith("\n")) {
        sep = "";
      } else if (isNewSession) {
        sep = "\n";
      } else {
        sep = " ";
      }

      const next = current + sep + delta;

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

    // ✅ reset dictado
    lastDictationAppendAtRef.current = 0;
    lastDictationBufferRef.current = "";
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

          // ✅ el usuario tocó el texto: corta sesión de dictado
          lastDictationAppendAtRef.current = 0;
          lastDictationBufferRef.current = "";
        }}
      />

      {/* ✅ Zona fija de tips (2 líneas, altura fija, NO mueve layout) */}
      <div
        style={{
          marginTop: 6,
          marginBottom: 6,
          height: 32, // ✅ fijo: 2 líneas * 16px
          fontSize: 11,
          color: "#9ca3af",
          lineHeight: "16px",
          userSelect: "none",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
        aria-live="polite"
      >
        {text.trim().length === 0 && totalTips > 0 ? tips[tipIndex] : "\u00A0"}
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
