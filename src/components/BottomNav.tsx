// src/components/BottomNav.tsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Brain,
  ListTodo,
  Lightbulb,
  Mic,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useMemo, useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { requestMicPermission } from "@/lib/micPermission";

type UiLang = "es" | "en" | "de";

const speechLangByUiLang: Record<UiLang, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
};

const CAPTURE_APPEND_EVENT = "remi-capture-append";
const OPEN_CAPTURE_EVENT = "remi-open-capture";

// ✅ evento global para indicar si el dictado está escuchando (por si vuelves a activarlo)
export const DICTATION_STATE_EVENT = "remi-dictation-state";

// ✅ texto pendiente cuando dictas desde otras páginas (por si vuelves a activarlo)
const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";

function detectIOS() {
  // iPhone/iPad/iPod + iPadOS (que a veces reporta MacIntel)
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS = platform === "MacIntel" && maxTouchPoints > 1;

  return isAppleMobile || isIpadOS;
}

// ✅ Helpers anti-long-press selection / callout (especialmente iOS)
const noSelectStyle: React.CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
  WebkitTapHighlightColor: "transparent",
};

// ✅ Evita warning: "Unable to preventDefault inside passive event listener"
const prevent = (e: any) => {
  if (e?.cancelable) e.preventDefault();
};

/**
 * Detecta teclado abierto (móvil) usando VisualViewport cuando existe.
 * - thresholdPx evita falsos positivos por barras pequeñas.
 */
function useKeyboardVisible(thresholdPx = 140) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;

    const computeDiff = () => {
      const vvHeight = vv?.height ?? window.innerHeight;
      return window.innerHeight - vvHeight;
    };

    const update = () => {
      const diff = computeDiff();
      setVisible(diff > thresholdPx);
    };

    update();

    if (!vv) {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [thresholdPx]);

  return visible;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const { pathname } = location;

  const isIOS = useMemo(() => detectIOS(), []);

  const activeUiLang: UiLang = useMemo(() => {
    const l = (lang as any) as string;
    return l === "de" || l === "en" || l === "es" ? (l as UiLang) : "es";
  }, [lang]);

  const activeSpeechLang = useMemo(() => {
    return speechLangByUiLang[activeUiLang] ?? "es-ES";
  }, [activeUiLang]);

  /**
   * ✅ IMPORTANTE:
   * El modal ya no se abre automáticamente en Index, así que el botón central
   * ahora debe ser "+" también en Android para abrir el nuevo modal.
   *
   * Dejamos el dictado COMENTADO (sin borrarlo) por si quieres reactivarlo
   * más adelante con otro flujo.
   */

  // // ✅ Dictado por voz (guardado para futuro)
  // const { isSupported, status, error, start, stop } = useSpeechDictation({
  //   lang: activeSpeechLang,
  //   continuous: false,
  //   interimResults: false,
  // });
  //
  // const dictationEnabled = !isIOS && isSupported;
  // const isListening = dictationEnabled && status === "listening";
  // const startedRef = useRef(false);
  //
  // const vibrateTiny = () => {
  //   try {
  //     if (navigator.vibrate) navigator.vibrate(18);
  //   } catch {
  //     // ignore
  //   }
  // };
  //
  // const emitAppend = (text: string) => {
  //   window.dispatchEvent(
  //     new CustomEvent(CAPTURE_APPEND_EVENT, { detail: { text } })
  //   );
  // };
  //
  // const emitDictationState = (listening: boolean) => {
  //   window.dispatchEvent(
  //     new CustomEvent(DICTATION_STATE_EVENT, { detail: { listening } })
  //   );
  // };
  //
  // // ✅ refleja estado listening hacia fuera (CaptureModal lo usará)
  // useEffect(() => {
  //   if (isIOS) return; // en iOS no dictamos por botón
  //   emitDictationState(isListening);
  // }, [isIOS, isListening]);
  //
  // // ✅ Manejo único del texto final (no perderlo al navegar)
  // const handleFinalText = (raw: string) => {
  //   const clean = raw.trim();
  //   if (!clean) return;
  //
  //   // Si estamos ya en Index, inyectamos directo al CaptureModal embebido
  //   if (pathname === "/") {
  //     emitAppend(clean);
  //     return;
  //   }
  //
  //   // En otras páginas: guardamos dictado pendiente para Index
  //   try {
  //     sessionStorage.setItem(NAV_DICTATION_KEY, clean);
  //   } catch {
  //     // fallback
  //     emitAppend(clean);
  //   }
  //
  //   // Navegamos a Index y abrimos modal flotante
  //   navigate("/");
  //
  //   setTimeout(() => {
  //     openCaptureModal();
  //   }, 120);
  // };
  //
  // const handleStart = async () => {
  //   if (!dictationEnabled) return;
  //   if (startedRef.current) return;
  //
  //   // ✅ pedir permiso SOLO al iniciar (gesto del usuario)
  //   const perm = await requestMicPermission();
  //
  //   if (!perm.ok) {
  //     startedRef.current = false;
  //     emitDictationState(false);
  //
  //     if (perm.reason === "no_https") {
  //       toast.error("El micrófono requiere HTTPS (o localhost).");
  //       return;
  //     }
  //     if (perm.reason === "not_supported") {
  //       toast.error("Este navegador no soporta micrófono.");
  //       return;
  //     }
  //
  //     toast.error(
  //       "No se pudo usar el micrófono. Activa el permiso del micrófono para este sitio en los ajustes del navegador."
  //     );
  //     return;
  //   }
  //
  //   startedRef.current = true;
  //   vibrateTiny();
  //
  //   start(
  //     ({ finalText }) => {
  //       if (finalText && finalText.trim()) {
  //         handleFinalText(finalText);
  //       }
  //     },
  //     activeSpeechLang
  //   );
  // };
  //
  // const handleStop = () => {
  //   startedRef.current = false;
  //   stop();
  //   emitDictationState(false); // ✅ aseguramos OFF al soltar
  // };

  const openCaptureModal = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CAPTURE_EVENT));
  };

  const openCaptureFromNav = () => {
    // Abre el nuevo modal en Index siempre
    if (pathname !== "/") {
      navigate("/");
      setTimeout(() => openCaptureModal(), 120);
    } else {
      openCaptureModal();
    }
  };

  const isTasksActive = pathname === "/tasks";
  const isIdeasActive = pathname === "/ideas";

  /* ─────────────────────────────────────────────
     ✅ OCULTAR NAVBAR CUANDO HAY TECLADO + CAMPO ENFOCADO (INDEX)
  ───────────────────────────────────────────── */
  const keyboardVisible = useKeyboardVisible(140);
  const [fieldFocused, setFieldFocused] = useState(false);

  useEffect(() => {
    const isEditableEl = (el: Element | null) => {
      if (!el) return false;
      const node = el as HTMLElement;
      return !!node.closest("textarea, input, select, [contenteditable='true']");
    };

    const updateFromActive = () => {
      const ae = document.activeElement as Element | null;
      setFieldFocused(isEditableEl(ae));
    };

    const onFocusIn = () => updateFromActive();

    const onFocusOut = () => {
      // Espera al próximo tick por si el foco salta a otro input
      setTimeout(updateFromActive, 0);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // init
    updateFromActive();

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Solo esconder en Index ("/") cuando hay teclado y un campo enfocado
  const hideNav = pathname === "/" && keyboardVisible && fieldFocused;

  return (
    <nav
      className={[
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2",
        "remi-bottomnav",
        hideNav ? "remi-bottomnav--hidden" : "",
      ].join(" ")}
      style={noSelectStyle}
      onContextMenu={prevent}
      aria-hidden={hideNav ? true : undefined}
    >
      <div
        className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        style={noSelectStyle}
        onContextMenu={prevent}
      >
        <NavItem
          to="/"
          label={t("bottomNav.today")}
          icon={Home}
          active={pathname === "/"}
        />

        <NavItem
          to="/status"
          label={t("bottomNav.status")}
          icon={Brain}
          active={pathname === "/status"}
        />

        {/* ✅ Botón central:
            - Ahora SIEMPRE es "+"
            - Abre el nuevo modal en Index (igual que en iPhone)
        */}
        <div style={{ position: "relative", ...noSelectStyle }}>
          <button
            className="flex h-14 w-14 items-center justify-center rounded-full border-1 border-white bg-[#7d59c9] text-white shadow-[0_8px_20px_rgba(143,49,243,0.2)] -translate-y-0"
            type="button"
            onClick={(e) => {
              if (e.cancelable) e.preventDefault();
              openCaptureFromNav();
            }}
            onContextMenu={prevent}
            onPointerDown={prevent}
            onMouseDown={prevent}
            draggable={false}
            onDragStart={prevent}
            aria-label="Añadir"
            title="Añadir"
            style={{
              ...noSelectStyle,
              touchAction: "manipulation",
              transform: "scale(1)",
              transition: "transform 120ms ease, opacity 120ms ease",
            }}
          >
            <Plus className="w-7 h-7" />
          </button>

          {/* ✅ Dejado como recordatorio visual del icono Mic (no usado ahora)
              <Mic className="w-7 h-7" />
          */}
        </div>

        <NavItem
          to="/tasks"
          label={t("bottomNav.tasks")}
          icon={ListTodo}
          active={isTasksActive}
        />

        <NavItem
          to="/ideas"
          label={t("bottomNav.ideas")}
          icon={Lightbulb}
          active={isIdeasActive}
        />
      </div>

      {/* Dictado comentado => no mostramos errores */}
      {/* {!isIOS && error ? (
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "#b91c1c" }}>
          {String(error)}
        </div>
      ) : null} */}

      <style>
        {`
          @keyframes remiPulse {
            0% { transform: scale(0.92); opacity: 0.9; }
            70% { transform: scale(1.25); opacity: 0.0; }
            100% { transform: scale(1.25); opacity: 0.0; }
          }

          /* ✅ Animación/ocultación de la barra inferior sin romper translate-x de Tailwind */
          .remi-bottomnav {
            transition: transform 180ms ease, opacity 180ms ease;
            will-change: transform, opacity;
          }
          .remi-bottomnav.remi-bottomnav--hidden {
            --tw-translate-y: 140%;
            opacity: 0;
            pointer-events: none;
          }
        `}
      </style>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
}

/**
 * ✅ IMPORTANTE:
 * Usamos <button> + navigate() (en vez de <a>/<Link>) para evitar
 * selección / callout / preview por pulsación larga en iOS.
 */
function NavItem({ to, label, active, icon: Icon }: NavItemProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-full transition"
      onClick={() => navigate(to)}
      onContextMenu={prevent}
      onPointerDown={prevent}
      onMouseDown={prevent}
      draggable={false}
      onDragStart={prevent}
      aria-label={label}
      title={label}
      style={{
        ...noSelectStyle,
        touchAction: "manipulation",
      }}
    >
      <Icon
        className={`w-6 h-6 ${active ? "text-[#7d59c9]" : "text-neutral-800"}`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
