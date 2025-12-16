// src/components/CaptureModal.tsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

// ✅ NUEVO
import { useModalUi } from "@/contexts/ModalUiContext";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;

  /** Abre el MentalDumpModal en modo revisión (preview) con este texto */
  onOpenReview: (text: string) => void;

  /** Cuando es true, se usa como card embebida en Index (sin backdrop) */
  embedded?: boolean;

  /** Texto que llega desde fuera (Share Target / copiar-pegar desde otras apps) */
  initialText?: string;

  /**
   * Cambia cuando llega un nuevo share.
   * Permite re-aplicar aunque el texto sea idéntico.
   */
  initialTextNonce?: number;
}

// Solo las keys; los textos vienen de i18n (reutiliza mentalDump.hints.*)
const HINT_KEYS = [
  "mentalDump.hints.0",
  "mentalDump.hints.7",
  "mentalDump.hints.1",
  "mentalDump.hints.2",
  "mentalDump.hints.3",
  "mentalDump.hints.4",
  "mentalDump.hints.5",
  "mentalDump.hints.6",
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

  // ✅ controla si hay “algún modal abierto” para ocultar BottomNav
  const { setModalOpen } = useModalUi();

  // ✅ cuando este modal real está abierto => ocultar BottomNav
  useEffect(() => {
    const isRealModalOpen = open && !embedded;
    setModalOpen(isRealModalOpen);
    return () => setModalOpen(false);
  }, [open, embedded, setModalOpen]);

  const [text, setText] = useState("");
  const textRef = useRef<string>("");

  const [loading, setLoading] = useState(false);

  // Evitar pisar el texto si el usuario ya empezó a escribir
  const userEditedRef = useRef(false);
  const lastInitialAppliedRef = useRef<string>("");
  const lastInitialAppliedNonceRef = useRef<number>(-1);

  // Hints dinámicos
  const [hintIndex, setHintIndex] = useState(0);
  const hints = HINT_KEYS.map((key) => t(key));
  const totalHints = hints.length;

  // ✅ Aplicar initialText cuando el modal/card sea visible
  useEffect(() => {
    const visible = embedded || open;
    if (!visible) return;

    const incoming = (initialText ?? "").trim();
    if (!incoming) return;

    const nonce = typeof initialTextNonce === "number" ? initialTextNonce : null;

    // (A) Si hay nonce: solo aplicamos si es nuevo
    if (nonce !== null) {
      if (nonce <= lastInitialAppliedNonceRef.current) return;
    } else {
      // (B) Sin nonce: evitamos re-aplicar el mismo string
      if (incoming === lastInitialAppliedRef.current) return;
    }

    // No pisamos si el usuario ya escribió (salvo textarea vacío)
    const currentText = (textRef.current ?? "").trim();
    const canOverwrite = !userEditedRef.current || currentText === "";
    if (!canOverwrite) return;

    if (nonce !== null) lastInitialAppliedNonceRef.current = nonce;
    lastInitialAppliedRef.current = incoming;

    userEditedRef.current = false;
    textRef.current = incoming;
    setText(incoming);
  }, [initialText, initialTextNonce, open, embedded]);

  // Rotar hints cada 15s mientras visible
  useEffect(() => {
    if ((!open && !embedded) || totalHints === 0) return;

    setHintIndex(0);
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % totalHints);
    }, 15000);

    return () => clearInterval(interval);
  }, [open, embedded, totalHints]);

  // En modo modal respetamos "open". En modo embebido se muestra siempre.
  if (!embedded && !open) return null;

  const resetOnly = () => {
    // ✅ IMPORTANTE: NO resetear lastInitialApplied* aquí,
    // o se volverá a re-aplicar initialText en el embebido (bug)
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
      if (!trimmed) toast.error(t("capture.toastEmpty") ?? t("capture.toastTaskError"));
      return;
    }

    setLoading(true);
    try {
      onOpenReview(trimmed);
      // limpiamos el input (en embebido se queda la card; en modal se cierra)
      if (embedded) {
        resetOnly();
      } else {
        resetAndClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="remi-modal-title">{t("capture.title")}</div>
        <div className="remi-modal-sub">{t("capture.subtitle")}</div>

        {totalHints > 0 && (
          <div
            className="remi-hint-banner"
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 12,
              background: "#f9fafb",
              border: "1px solid rgba(226,232,240,0.9)",
              fontSize: 11,
              color: "#4b5563",
              maxWidth: 420,
              height: 40,
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {hints[hintIndex]}
          </div>
        )}
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

  const body = (
    <div className="remi-modal-body">
      <textarea
        className="remi-modal-textarea"
        placeholder={t("capture.textareaPlaceholder")}
        value={text}
        onChange={(e) => {
          userEditedRef.current = true;
          const v = e.target.value;
          textRef.current = v;
          setText(v);
        }}
      />

      <div className="remi-modal-footer" style={{ display: "flex", gap: 10, marginTop: 14 }}>
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
          style={{ flex: 1, background: "#7d59c9", padding: "14px 18px",  
    fontSize: 16,    }}
          onClick={handleSave}
          disabled={loading || text.trim().length === 0}
          type="button"
        >
          {t("common.save") ?? t("capture.saveTask") ?? "Guardar"}
        </button>
      </div>
    </div>
  );

  // Versión card embebida para Index
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

  // Versión modal flotante con backdrop
  return (
    <div className="remi-modal-backdrop">
      <div className="remi-modal-card">
        {header}
        {body}
      </div>
    </div>
  );
}
