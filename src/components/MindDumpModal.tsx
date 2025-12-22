// src/components/MindDumpModal.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { X, ClipboardPaste, Mic, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

const REMI_PURPLE = "#7d59c9";
const REMI_PURPLE_BORDER = "rgba(143,49,243,0.30)";
const REMI_PURPLE_BG = "rgba(143,49,243,0.10)";
const REMI_TEXT = "rgba(15,23,42,0.92)";
const REMI_SUB = "rgba(15,23,42,0.55)";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1)
  );
}
function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}
function getSpeechRecognitionCtor(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

type UiLang = "es" | "en" | "de";
const speechLangByUiLang: Record<UiLang, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenReview: (text: string) => void;
  initialText?: string;
  initialTextNonce?: number;
};

export default function MindDumpModal({
  open,
  onClose,
  onOpenReview,
  initialText,
  initialTextNonce,
}: Props) {
  const i18n = useI18n() as any;
  const t = i18n?.t as (k: string, vars?: any) => string;

  const currentUiLang: UiLang =
    (i18n?.lang ?? i18n?.uiLang ?? i18n?.language ?? "es") as UiLang;

  const [uiLang, setUiLang] = useState<UiLang>(currentUiLang);
  const [langOpen, setLangOpen] = useState(false);

  const [text, setText] = useState(initialText ?? "");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const speechSessionIdRef = useRef(0);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);
  const SpeechRecognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const showTalkButton = android && !!SpeechRecognitionCtor;

  const safeT = (key: string, fallback: string) => {
    try {
      if (!t) return fallback;
      const value = t(key);
      if (!value) return fallback;
      if (value === key) return fallback;
      return value;
    } catch {
      return fallback;
    }
  };

  const focusTextarea = () => textareaRef.current?.focus();

  // ✅ guía visual en el textarea
  const BULLET = "• ";

  const ensureNewBulletBlock = (prevText: string) => {
    const out = prevText ?? "";
    const trimmed = out.trim();

    if (!trimmed) return BULLET;
    if (out.endsWith("\n\n")) return out + BULLET;
    if (out.endsWith("\n")) return out + "\n" + BULLET;
    return out + "\n\n" + BULLET;
  };

  const stopDictation = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(false);
      setInterim("");
      return;
    }
    try {
      rec.stop?.();
    } catch {
      // ignore
    } finally {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
    }
  };

  const startDictationNewSession = () => {
    if (!SpeechRecognitionCtor) return;

    speechSessionIdRef.current += 1;
    const mySessionId = speechSessionIdRef.current;

    stopDictation();

    try {
      const rec = new SpeechRecognitionCtor();
      recognitionRef.current = rec;

      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = speechLangByUiLang[uiLang] || "es-ES";

      rec.onresult = (event: any) => {
        if (mySessionId !== speechSessionIdRef.current) return;

        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = String(res?.[0]?.transcript ?? "");
          if (!transcript) continue;
          if (res.isFinal) finalChunk += transcript;
          else interimChunk += transcript;
        }

        setInterim(interimChunk.trim());

        if (finalChunk.trim()) {
          const incoming = finalChunk.trim();

          setText((prev) => {
            const out = prev ?? "";
            const base = out.trim().length === 0 ? BULLET : out;

            if (
              base.endsWith(BULLET) ||
              base.endsWith("\n" + BULLET) ||
              base.endsWith("\n\n" + BULLET)
            ) {
              return base + incoming;
            }

            if (base.length > 0 && !base.endsWith("\n") && !base.endsWith(" ")) {
              return base + " " + incoming;
            }

            return base + incoming;
          });

          setTimeout(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.focus();
            el.selectionStart = el.selectionEnd = el.value.length;
          }, 0);
        }
      };

      rec.onerror = (e: any) => {
        const code = String(e?.error ?? "");
        if (code === "not-allowed" || code === "service-not-allowed") {
          toast.error(
            safeT("capture.toast.micDenied", "Permiso de micrófono denegado.")
          );
        } else if (code === "no-speech") {
          toast.message(
            safeT("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo.")
          );
        } else {
          toast.error(safeT("capture.toast.dictationError", "Error de dictado."));
        }
        try {
          rec.abort?.();
        } catch {}
        recognitionRef.current = null;
        setListening(false);
        setInterim("");
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setListening(false);
        setInterim("");
      };

      rec.start();
      setListening(true);
      setInterim("");
      focusTextarea();
    } catch {
      toast.error(
        safeT("capture.toast.dictationStartError", "No pude iniciar el dictado.")
      );
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
    }
  };

  const handleTalkDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!showTalkButton) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.currentTarget as any)?.setPointerCapture?.(e.pointerId);
    } catch {}

    // ✅ cada sesión de voz crea un nuevo item: doble salto + bullet
    setText((prev) => ensureNewBulletBlock(prev ?? ""));

    startDictationNewSession();
  };

  const handleTalkUp = (e?: ReactPointerEvent<HTMLButtonElement>) => {
    if (!showTalkButton) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        (e.currentTarget as any)?.releasePointerCapture?.(e.pointerId);
      } catch {}
    }
    stopDictation();
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        toast.error(
          safeT(
            "capture.toast.pasteUnavailable",
            "No puedo pegar aquí (portapapeles no disponible)."
          )
        );
        return;
      }
      const clip = await navigator.clipboard.readText();
      if (!clip?.trim()) {
        toast.message(
          safeT("capture.toast.clipboardEmpty", "No hay texto en el portapapeles.")
        );
        return;
      }
      setText((prev) => (prev ? `${prev}\n${clip}` : clip));

      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }, 0);
    } catch {
      toast.error(
        safeT(
          "capture.toast.pasteError",
          "No pude acceder al portapapeles. Mantén pulsado y pega."
        )
      );
    }
  };

  const handleSave = () => {
    stopDictation();
    const trimmed = text.trim();
    if (!trimmed) {
      toast.message(safeT("capture.toast.writeSomething", "Escribe algo primero."));
      focusTextarea();
      return;
    }
    onOpenReview(trimmed);
    onClose();
  };

  const handleClose = () => {
    stopDictation();
    onClose();
  };

  // sincroniza initialText
  useEffect(() => {
    if (typeof initialTextNonce === "number") setText(initialText ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTextNonce]);

  // sincronizar idioma UI global si existe setter
  useEffect(() => {
    const setLangFn =
      i18n?.setLang ?? i18n?.setUiLang ?? i18n?.setLanguage ?? null;
    if (typeof setLangFn === "function") {
      try {
        setLangFn(uiLang);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);

  // cerrar dropdown al click fuera
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-lang]")) return;
      setLangOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as any);
    };
  }, [langOpen]);

  // si el modal se cierra, paramos dictado
  useEffect(() => {
    if (!open) stopDictation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // cleanup al desmontar
  useEffect(() => {
    return () => stopDictation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open) return null;

  const langLabel = uiLang.toUpperCase();

  return (
    <div className="fixed inset-0 z-[1000]" onContextMenu={(e) => e.preventDefault()}>
      <div className="absolute inset-0" style={{ background: "#ffffff" }} />

      <div
        className="absolute inset-0"
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-focus]")) return;
          focusTextarea();
        }}
        onTouchStart={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-focus]")) return;
          focusTextarea();
        }}
      >
        {/* top bar */}
        <div
          className="sticky top-0 z-10"
          style={{
            background: REMI_PURPLE,
            color: "#fff",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
          }}
        >
          <div className="px-5 pt-4 pb-4 flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="text-[16px] font-semibold leading-tight" style={{ color: "#ffffff" }}>
                {safeT("capture.title", "Vacía tu mente")}
              </div>

              <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.88)" }}>
                {safeT("capture.subtitle", "Habla, escribe o pega texto. Remi se encarga.")}
              </div>

              {showTalkButton && listening && (
                <div className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {safeT("capture.listening", "Escuchando…")}{" "}
                  {interim ? (
                    <span style={{ color: "rgba(255,255,255,0.70)" }}>{interim}</span>
                  ) : null}
                </div>
              )}
            </div>

            {/* X gris */}
            <button
              data-no-focus
              onClick={handleClose}
              aria-label={safeT("common.close", "Cerrar")}
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(15,23,42,0.10)",
                cursor: "pointer",
              }}
            >
              <X className="h-5 w-5" style={{ color: "rgba(15,23,42,0.65)" }} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="px-5 pt-5 pb-44">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={safeT("capture.placeholder", "Vacía tu mente aquí… (habla, escribe o pega)")}
            className="w-full resize-none outline-none text-[18px] leading-7"
            style={{
              minHeight: "70vh",
              color: REMI_TEXT,
              background: "transparent",
            }}
            inputMode="text"
          />

          {ios && (
            <div className="mt-3 text-xs" style={{ color: REMI_SUB }}>
              {safeT(
                "capture.iosKeyboardMicHint",
                "En iPhone: usa el micrófono del teclado para dictar."
              )}
            </div>
          )}
        </div>

        {/* bottom flotante */}
        <div
          className="fixed left-0 right-0"
          style={{
            bottom: "max(env(safe-area-inset-bottom), 14px)",
            pointerEvents: "none",
          }}
        >
          <div
            className="mx-auto"
            style={{
              width: "calc(100% - 32px)",
              maxWidth: 420,
              pointerEvents: "auto",
              position: "relative",
            }}
          >
            {/* dropdown idioma */}
            <div
              data-lang
              data-no-focus
              style={{
                position: "absolute",
                right: 22,
                transform: "translateY(-66px)",
                zIndex: 50,
              }}
            >
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.92)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "rgba(15,23,42,0.75)",
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: "0 10px 25px rgba(15,23,42,0.10)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: 51,
                  cursor: "pointer",
                }}
              >
                {langLabel}
                <ChevronDown size={14} />
              </button>

              {langOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 38,
                    zIndex: 60,
                    background: "#fff",
                    border: "1px solid rgba(15,23,42,0.08)",
                    borderRadius: 16,
                    boxShadow: "0 18px 40px rgba(15,23,42,0.14)",
                    overflow: "hidden",
                    minWidth: 96,
                  }}
                >
                  {(["es", "en", "de"] as UiLang[]).map((code) => {
                    const active = code === uiLang;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setUiLang(code);
                          setLangOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          fontSize: 12,
                          fontWeight: active ? 900 : 700,
                          color: active ? REMI_PURPLE : "rgba(15,23,42,0.78)",
                          background: active ? "rgba(125,89,201,0.10)" : "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {code.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* pill flotante */}
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 999,
                padding: "10px 12px",
                boxShadow: "0 18px 50px rgba(15,23,42,0.16)",
                backdropFilter: "blur(12px)",
                position: "relative",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  alignItems: "center",
                }}
              >
                {/* Pegar */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <button
                    data-no-focus
                    type="button"
                    onClick={handlePaste}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 999,
                      border: `1px solid ${REMI_PURPLE_BORDER}`,
                      background: REMI_PURPLE_BG,
                      color: REMI_PURPLE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ClipboardPaste className="h-5 w-5" />
                  </button>
                  <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                    {safeT("common.paste", "Pegar")}
                  </div>
                </div>

                {/* Hablar */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {showTalkButton ? (
                    <>
                      <button
                        data-no-focus
                        type="button"
                        onPointerDown={handleTalkDown}
                        onPointerUp={handleTalkUp}
                        onPointerCancel={handleTalkUp}
                        onPointerLeave={handleTalkUp}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          border: `1px solid ${REMI_PURPLE_BORDER}`,
                          background: listening ? "rgba(125,89,201,0.18)" : REMI_PURPLE_BG,
                          color: REMI_PURPLE,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          userSelect: "none",
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          touchAction: "none",
                          cursor: "pointer",
                        }}
                        aria-pressed={listening}
                        title={safeT("capture.speakHold", "Mantén pulsado para hablar")}
                        aria-label={safeT("capture.speakHold", "Mantén pulsado para hablar")}
                      >
                        <Mic className="h-5 w-5" />
                      </button>
                      <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                        {safeT("common.speak", "Hablar")}
                      </div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Guardar */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <button
                    data-no-focus
                    type="button"
                    onClick={handleSave}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 999,
                      border: "1px solid rgba(125,89,201,0.35)",
                      background: REMI_PURPLE,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 14px 30px rgba(35,18,90,0.28)",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <div style={{ fontSize: 11, fontWeight: 900, color: REMI_PURPLE }}>
                    {safeT("common.save", "Guardar")}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
