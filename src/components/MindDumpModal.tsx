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
import { useSpeechDictation } from "@/hooks/useSpeechDictation";

// ✅ NUEVO: para ocultar BottomNav cuando el modal está abierto
import { useModalUi } from "@/contexts/ModalUiContext";

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

/* ───────────────────────────────
   ✅ Teclado real: visualViewport
─────────────────────────────── */
function getKeyboardOffsetPx() {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  const offset = window.innerHeight - (vv.height + vv.offsetTop);
  return Math.max(0, Math.round(offset));
}

/* ───────────────────────────────
   ✅ Haptics (Android / compatible)
─────────────────────────────── */
function hapticTick(ms = 20) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as any).vibrate?.(ms);
    }
  } catch {
    // ignore
  }
}

/* ───────────────────────────────
   ✅ Normaliza texto entrante:
   - sustituye saltos de línea por espacio
   - colapsa espacios múltiples
   - trim
─────────────────────────────── */
function normalizeIncomingText(raw: string): string {
  return String(raw ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

  const [text, setText] = useState(normalizeIncomingText(initialText ?? ""));
  const [interim, setInterim] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ teclado real (FAB guardar) + foco (para evitar “fantasmas”)
  const [kbdOffset, setKbdOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // ✅ ripple / pressed
  const [talkPressed, setTalkPressed] = useState(false);
  const [rippleTick, setRippleTick] = useState(0);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);

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

  const blurTextarea = () => {
    try {
      textareaRef.current?.blur();
    } catch {}
    try {
      (document.activeElement as any)?.blur?.();
    } catch {}
  };

  const BULLET = "• ";

  const ensureNewBulletBlock = (prevText: string) => {
    const out = prevText ?? "";
    const trimmed = out.trim();

    if (!trimmed) return BULLET;
    if (out.endsWith("\n\n")) return out + BULLET;
    if (out.endsWith("\n")) return out + "\n" + BULLET;
    return out + "\n\n" + BULLET;
  };

  const appendFinalDelta = (delta: string) => {
    const clean = (delta || "").trim();
    if (!clean) return;

    setText((prev) => {
      const out = prev ?? "";
      const base = out.trim().length === 0 ? BULLET : out;

      // si acabas de crear el bullet, pega directo
      if (
        base.endsWith(BULLET) ||
        base.endsWith("\n" + BULLET) ||
        base.endsWith("\n\n" + BULLET)
      ) {
        return base + clean;
      }

      // separador suave
      if (base.endsWith("\n") || base.endsWith(" ")) return base + clean;
      return base + " " + clean;
    });
  };

  // ✅ Hook robusto de dictado (mismo enfoque que te funcionaba)
  const { isSupported, status, error, start, stop } = useSpeechDictation({
    lang: speechLangByUiLang[uiLang] || "es-ES",
    continuous: true,
    interimResults: true,
  });

  const listening = status === "listening";
  const showTalkButton = android && isSupported;

  // ✅ NUEVO: marcar modal abierto/cerrado para ocultar BottomNav (contador)
  const { setModalOpen } = useModalUi();
  useEffect(() => {
    if (!open) return;
    setModalOpen(true);
    return () => setModalOpen(false);
  }, [open, setModalOpen]);

  // Evitar spam de toasts por error
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    // Mapeo básico de errores típicos del Web Speech API
    if (error === "not-allowed" || error === "service-not-allowed") {
      toast.error(
        safeT("capture.toast.micDenied", "Permiso de micrófono denegado.")
      );
    } else if (error === "no-speech") {
      toast.message(safeT("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo."));
    } else {
      toast.error(safeT("capture.toast.dictationError", "Error de dictado."));
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si se corta el dictado, limpia estados visuales
  useEffect(() => {
    if (!listening) {
      setInterim("");
      setTalkPressed(false);
    }
  }, [listening]);

  const startedRef = useRef(false);

  const handleTalkDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!showTalkButton) return;
    e.preventDefault();
    e.stopPropagation();

    // ✅ haptic + waves
    hapticTick(20);
    setTalkPressed(true);
    setRippleTick((n) => n + 1);

    // ✅ NO teclado al hablar
    blurTextarea();
    setTimeout(blurTextarea, 0);

    try {
      (e.currentTarget as any)?.setPointerCapture?.(e.pointerId);
    } catch {}

    // ✅ prepara bloque bullet (solo una vez por “pulsación”)
    setText((prev) => ensureNewBulletBlock(prev ?? ""));

    if (startedRef.current) return;
    startedRef.current = true;

    start(
      ({ finalText, interimText }) => {
        setInterim(interimText || "");
        if (finalText) appendFinalDelta(finalText);
      },
      speechLangByUiLang[uiLang] || "es-ES"
    );
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

    startedRef.current = false;
    stop();
    setInterim("");
    setTalkPressed(false);
  };

  const handlePaste = async () => {
    blurTextarea();
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
      const normalizedClip = normalizeIncomingText(clip);
      if (!normalizedClip) {
        toast.message(
          safeT("capture.toast.clipboardEmpty", "No hay texto en el portapapeles.")
        );
        return;
      }
      setText((prev) => (prev ? `${prev} ${normalizedClip}` : normalizedClip));
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
    // para no mezclar dictado + guardar
    startedRef.current = false;
    stop();
    blurTextarea();

    const trimmed = text.trim();
    if (!trimmed) {
      toast.message(safeT("capture.toast.writeSomething", "Escribe algo primero."));
      return;
    }
    onOpenReview(trimmed);
    onClose();
  };

  const handleClose = () => {
    startedRef.current = false;
    stop();
    blurTextarea();
    onClose();
  };

  useEffect(() => {
    if (typeof initialTextNonce === "number") setText(normalizeIncomingText(initialText ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTextNonce]);

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

  // Cerrar dictado al cerrar modal
  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      stop();
      setInterim("");
      setTalkPressed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Teclado: visualViewport + focus/blur (evita que quede el FAB “pegado”)
  useEffect(() => {
    if (!open) return;

    const update = () => setKbdOffset(getKeyboardOffsetPx());

    update();
    const vv = window.visualViewport;

    let raf = 0;
    const updateRaf = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    if (vv) {
      vv.addEventListener("resize", updateRaf);
      vv.addEventListener("scroll", updateRaf);
    }
    window.addEventListener("resize", updateRaf);

    return () => {
      cancelAnimationFrame(raf);
      if (vv) {
        vv.removeEventListener("resize", updateRaf);
        vv.removeEventListener("scroll", updateRaf);
      }
      window.removeEventListener("resize", updateRaf);
    };
  }, [open]);

  if (!open) return null;

  const langLabel = uiLang.toUpperCase();

  const isKeyboardOpen = isFocused && kbdOffset > 80;

  // ✅ Evita duplicados: cuando hay teclado, NO mostramos el botón Guardar del “pill”
  const showSaveFab = isKeyboardOpen;
  const showInlineSave = !showSaveFab;

  const saveFabBottomPx = Math.max(14, kbdOffset + 14);

  const showTalkActiveRing = listening;
  const showTalkRipple = talkPressed || listening;

  return (
    <div
      className="fixed inset-0 z-[1000]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`
        @keyframes remiRipple {
          from { transform: scale(0); opacity: .35; }
          to   { transform: scale(2.2); opacity: 0; }
        }
        .remi-ripple {
          position: absolute;
          inset: -10px;
          border-radius: 999px;
          background: rgba(125,89,201,0.22);
          animation: remiRipple .55s ease-out;
          pointer-events: none;
        }
        @keyframes remiRingPulse {
          0%   { transform: scale(0.96); opacity: .25; }
          50%  { transform: scale(1.06); opacity: .45; }
          100% { transform: scale(0.96); opacity: .25; }
        }
        .remi-ring {
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          border: 2px solid rgba(125,89,201,0.35);
          animation: remiRingPulse 1.1s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="absolute inset-0" style={{ background: "#ffffff" }} />

      <div className="absolute inset-0">
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
              <div
                className="text-[16px] font-semibold leading-tight"
                style={{ color: "#ffffff" }}
              >
                {safeT("capture.title", "Vacía tu mente")}
              </div>

              <div
                className="text-[11px] mt-1"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                {safeT(
                  "capture.subtitle",
                  "Habla, escribe o pega texto. Remi se encarga."
                )}
              </div>

              {showTalkButton && listening && (
                <div
                  className="text-[11px] mt-2"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  {safeT("capture.listening", "Escuchando…")}{" "}
                  {interim ? (
                    <span style={{ color: "rgba(255,255,255,0.70)" }}>
                      {interim}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

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

        <div className="px-5 pt-5 pb-44">
          <textarea
  ref={textareaRef}
  value={text}
  onChange={(e) => setText(e.target.value)}
  onPaste={(e) => {
    const pasted = e.clipboardData?.getData("text") ?? "";
    const normalized = normalizeIncomingText(pasted);
    if (!normalized) return;

    // Interceptamos el pegado normal
    e.preventDefault();

    // ✅ Capturar cursor/selección ANTES del setState (no usar e dentro luego)
    const el = e.currentTarget as HTMLTextAreaElement | null;
    const startRaw = el?.selectionStart;
    const endRaw = el?.selectionEnd;

    setText((prev) => {
      const current = String(prev ?? "");

      // Fallback seguro si por lo que sea no hay selección disponible
      const start =
        typeof startRaw === "number" ? Math.min(startRaw, current.length) : current.length;
      const end =
        typeof endRaw === "number" ? Math.min(endRaw, current.length) : start;

      const next = current.slice(0, start) + normalized + current.slice(end);

      // Recolocar cursor después de pegar (usar ref, no el evento)
      requestAnimationFrame(() => {
        const node = textareaRef.current;
        if (!node) return;
        try {
          const pos = Math.min(start + normalized.length, node.value.length);
          node.selectionStart = node.selectionEnd = pos;
        } catch {
          // ignore
        }
      });

      return next;
    });
  }}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  placeholder={safeT(
    "capture.placeholder",
    "Vacía tu mente aquí… (habla, escribe o pega)"
  )}
  className="w-full resize-none outline-none text-[18px] leading-7"
  style={{ minHeight: "70vh", color: REMI_TEXT, background: "transparent" }}
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
                data-no-focus
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
                        data-no-focus
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

            {/* pill */}
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 999,
                padding: "10px 12px",
                boxShadow: "0 18px 50px rgba(15,23,42,0.16)",
                backdropFilter: "blur(12px)",
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
                          position: "relative",
                          overflow: "hidden",
                        }}
                        aria-pressed={listening}
                        title={safeT("capture.speakHold", "Mantén pulsado para hablar")}
                        aria-label={safeT("capture.speakHold", "Mantén pulsado para hablar")}
                      >
                        {showTalkActiveRing && <span className="remi-ring" />}
                        {showTalkRipple && <span key={rippleTick} className="remi-ripple" />}

                        <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
                          <Mic className="h-5 w-5" />
                        </span>
                      </button>

                      <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                        {safeT("common.speak", "Hablar")}
                      </div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Guardar (solo si NO hay teclado) */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {showInlineSave ? (
                    <>
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
                          cursor: "pointer",
                        }}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <div style={{ fontSize: 11, fontWeight: 900, color: REMI_PURPLE }}>
                        {safeT("common.save", "Guardar")}
                      </div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: 6 }} />
          </div>
        </div>

        {/* FAB Guardar encima del teclado */}
        {showSaveFab && (
          <button
            data-no-focus
            type="button"
            onClick={handleSave}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={safeT("common.save", "Guardar")}
            style={{
              position: "fixed",
              right: 16,
              bottom: `calc(env(safe-area-inset-bottom) + ${saveFabBottomPx}px)`,
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "1px solid rgba(125,89,201,0.35)",
              background: REMI_PURPLE,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 45px rgba(35,18,90,0.30)",
              zIndex: 2000,
              cursor: "pointer",
            }}
          >
            <Check className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
