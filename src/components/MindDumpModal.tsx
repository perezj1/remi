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

/* ───────────────────────────────
   ✅ Anti-duplicados robusto (por palabras)
─────────────────────────────── */
function normSpaces(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}
function tokenizeWords(s: string) {
  const t = normSpaces(s);
  return t ? t.split(" ").filter(Boolean) : [];
}
function wordsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function startsWithWords(full: string[], prefix: string[]) {
  if (prefix.length > full.length) return false;
  for (let i = 0; i < prefix.length; i++) if (full[i] !== prefix[i]) return false;
  return true;
}
function appendWithOverlapWords(acc: string, seg: string) {
  const A = tokenizeWords(acc);
  const S = tokenizeWords(seg);

  if (!S.length) return A.join(" ");
  if (!A.length) return S.join(" ");

  // A termina exactamente con S
  if (S.length <= A.length && wordsEqual(A.slice(-S.length), S)) return A.join(" ");

  // S empieza con A
  if (A.length <= S.length && wordsEqual(S.slice(0, A.length), A)) return S.join(" ");

  // Solape sufijo/prefijo por palabras
  const max = Math.min(A.length, S.length);
  for (let k = max; k >= 1; k--) {
    if (wordsEqual(A.slice(-k), S.slice(0, k))) {
      return [...A, ...S.slice(k)].join(" ").trim();
    }
  }

  return [...A, ...S].join(" ").trim();
}
function deltaFromGrowingWords(prevFull: string, nextFull: string) {
  const prev = tokenizeWords(prevFull);
  const next = tokenizeWords(nextFull);

  if (!next.length) return "";
  if (!prev.length) return next.join(" ");
  if (wordsEqual(prev, next)) return "";

  // next empieza con prev => devuelve cola
  if (startsWithWords(next, prev)) return next.slice(prev.length).join(" ").trim();

  // retroceso
  if (startsWithWords(prev, next)) return "";

  // solape suffix(prev)==prefix(next)
  const max = Math.min(prev.length, next.length);
  for (let k = max; k >= 1; k--) {
    if (wordsEqual(prev.slice(-k), next.slice(0, k))) {
      return next.slice(k).join(" ").trim();
    }
  }

  return "";
}

/* ───────────────────────────────
   ✅ VisualViewport helper (botón guardar encima del teclado)
─────────────────────────────── */
function getKeyboardBottomOffsetPx(): number {
  if (typeof window === "undefined") return 0;

  const vv = (window as any).visualViewport as VisualViewport | undefined;
  if (!vv) return 0;

  // Layout viewport height ~ window.innerHeight
  // Visual viewport height se reduce cuando aparece el teclado.
  const keyboardHeight = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
  return keyboardHeight;
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

  const [text, setText] = useState(initialText ?? "");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const speechSessionIdRef = useRef(0);

  // ✅ buffers por sesión (para calcular delta FINAL sin duplicados)
  const lastFinalAccumRef = useRef<string>("");

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);
  const SpeechRecognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const showTalkButton = android && !!SpeechRecognitionCtor;

  // ✅ teclado: SOLO aparece cuando el usuario toca el textarea
  const [isTextFocused, setIsTextFocused] = useState(false);

  // ✅ guardar flotante encima del teclado
  const [kbdOffset, setKbdOffset] = useState(0);

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

      // ✅ reset buffers de sesión (clave para anti-duplicados)
      lastFinalAccumRef.current = "";

      rec.onresult = (event: any) => {
        if (mySessionId !== speechSessionIdRef.current) return;

        // 1) FINAL acumulado estable
        let finalAccum = "";
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (!res || !res.isFinal) continue;
          const raw = String(res?.[0]?.transcript ?? "");
          const chunk = normSpaces(raw);
          if (!chunk) continue;
          finalAccum = appendWithOverlapWords(finalAccum, chunk);
        }

        // 2) Interim actual (UI)
        let interimNow = "";
        for (let i = event.results.length - 1; i >= 0; i--) {
          const res = event.results[i];
          if (!res || res.isFinal) continue;
          const raw = String(res?.[0]?.transcript ?? "");
          const chunk = normSpaces(raw);
          if (chunk) {
            interimNow = chunk;
            break;
          }
        }
        setInterim(interimNow);

        // 3) Delta FINAL seguro
        const prevFinal = lastFinalAccumRef.current;
        const finalDelta = deltaFromGrowingWords(prevFinal, finalAccum);
        if (finalAccum) lastFinalAccumRef.current = finalAccum;
        if (!finalDelta) return;

        const incoming = finalDelta;

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

        // ❌ IMPORTANTE: no focus aquí (no abrir teclado)
      };

      rec.onerror = (e: any) => {
        const code = String(e?.error ?? "");
        if (code === "not-allowed" || code === "service-not-allowed") {
          toast.error(safeT("capture.toast.micDenied", "Permiso de micrófono denegado."));
        } else if (code === "no-speech") {
          toast.message(safeT("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo."));
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
      // ❌ no focusTextarea()
    } catch {
      toast.error(safeT("capture.toast.dictationStartError", "No pude iniciar el dictado."));
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

    // ✅ cada sesión crea nuevo item con bullet
    setText((prev) => ensureNewBulletBlock(prev ?? ""));

    // ✅ dictado sin abrir teclado
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
      // ❌ no focus (no abrir teclado)
    } catch {
      toast.error(
        safeT("capture.toast.pasteError", "No pude acceder al portapapeles. Mantén pulsado y pega.")
      );
    }
  };

  const handleSave = () => {
    stopDictation();
    const trimmed = text.trim();
    if (!trimmed) {
      toast.message(safeT("capture.toast.writeSomething", "Escribe algo primero."));
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
    const setLangFn = i18n?.setLang ?? i18n?.setUiLang ?? i18n?.setLanguage ?? null;
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

  // ✅ cuando se abre: no enfocamos nada, teclado cerrado
  useEffect(() => {
    if (open) {
      setIsTextFocused(false);
      setKbdOffset(0);
    }
  }, [open]);

  // ✅ seguimiento de VisualViewport para colocar el botón “Guardar” encima del teclado
  useEffect(() => {
    if (!open) return;
    if (!isTextFocused) {
      setKbdOffset(0);
      return;
    }

    const vv = (window as any).visualViewport as VisualViewport | undefined;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setKbdOffset(getKeyboardBottomOffsetPx());
      });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update as any);
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
    };
  }, [open, isTextFocused]);

  if (!open) return null;

  const langLabel = uiLang.toUpperCase();

  // ✅ botón flotante: abajo-derecha, siempre por encima del teclado cuando está abierto
  const saveFabBottom = Math.max(14, kbdOffset + 14);
  const showSaveFab = isTextFocused; // solo cuando el usuario está escribiendo (teclado visible)

  return (
    <div className="fixed inset-0 z-[1000]" onContextMenu={(e) => e.preventDefault()}>
      <div className="absolute inset-0" style={{ background: "#ffffff" }} />

      <div className="absolute inset-0">
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
            onFocus={() => setIsTextFocused(true)}
            onBlur={() => setIsTextFocused(false)}
            // ✅ NO hacemos focus programático: el teclado solo aparece por tap directo del usuario
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
              {safeT("capture.iosKeyboardMicHint", "En iPhone: usa el micrófono del teclado para dictar.")}
            </div>
          )}
        </div>

        {/* ✅ Guardar flotante: abajo-derecha y por encima del teclado */}
        {showSaveFab && (
          <button
            type="button"
            // ✅ evita que el click quite el foco del textarea (mantiene teclado y posición estable)
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleSave}
            aria-label={safeT("common.save", "Guardar")}
            title={safeT("common.save", "Guardar")}
            style={{
              position: "fixed",
              right: 14,
              bottom: saveFabBottom,
              zIndex: 2000,
              width: 54,
              height: 54,
              borderRadius: 999,
              border: "1px solid rgba(125,89,201,0.35)",
              background: REMI_PURPLE,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 34px rgba(35,18,90,0.30)",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              cursor: "pointer",
            }}
          >
            <Check className="h-5 w-5" />
          </button>
        )}

        {/* bottom flotante (acciones) */}
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

                {/* Guardar (en pill) */}
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
