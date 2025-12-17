// src/components/BottomNav.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Brain, ListTodo, Lightbulb, Mic, type LucideIcon } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useMemo, useRef } from "react";
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

// ✅ texto pendiente cuando dictas desde otras páginas (para no perder el evento)
const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const { pathname } = location;

  const activeUiLang: UiLang = useMemo(() => {
    const l = (lang as any) as string;
    return l === "de" || l === "en" || l === "es" ? (l as UiLang) : "es";
  }, [lang]);

  const activeSpeechLang = useMemo(() => {
    return speechLangByUiLang[activeUiLang] ?? "es-ES";
  }, [activeUiLang]);

  const { isSupported, status, error, start, stop } = useSpeechDictation({
    lang: activeSpeechLang,
    continuous: false,
    interimResults: false,
  });

  const isListening = status === "listening";
  const startedRef = useRef(false);

  const vibrateTiny = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(18);
    } catch {
      // ignore
    }
  };

  const emitAppend = (text: string) => {
    window.dispatchEvent(
      new CustomEvent(CAPTURE_APPEND_EVENT, { detail: { text } })
    );
  };

  const openCaptureModal = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CAPTURE_EVENT));
  };

  // ✅ Manejo único del texto final (no perderlo al navegar)
  const handleFinalText = (raw: string) => {
    const clean = raw.trim();
    if (!clean) return;

    // Si estamos ya en Index, inyectamos directo al CaptureModal embebido
    if (pathname === "/") {
      emitAppend(clean);
      return;
    }

    // En otras páginas: guardamos dictado pendiente para Index
    try {
      sessionStorage.setItem(NAV_DICTATION_KEY, clean);
    } catch {
      // fallback
      emitAppend(clean);
    }

    // Navegamos a Index y abrimos modal flotante
    navigate("/");

    setTimeout(() => {
      openCaptureModal();
    }, 120);
  };

  const handleStart = async () => {
    if (!isSupported) return;
    if (startedRef.current) return;

    // ✅ 1) pedir permiso SOLO al iniciar (click/press)
    const perm = await requestMicPermission();

    if (!perm.ok) {
      startedRef.current = false;

      if (perm.reason === "no_https") {
        toast.error("El micrófono requiere HTTPS (o localhost).");
        return;
      }
      if (perm.reason === "not_supported") {
        toast.error("Este navegador no soporta micrófono.");
        return;
      }

      // denied / cancelado / bloqueado
      toast.error(
        "No se pudo usar el micrófono. Activa el permiso del micrófono para este sitio en los ajustes del navegador."
      );
      return;
    }

    // ✅ 2) si ok, empezamos dictado
    startedRef.current = true;
    vibrateTiny();

    start(
      ({ finalText }) => {
        if (finalText && finalText.trim()) {
          handleFinalText(finalText);
        }
      },
      activeSpeechLang
    );
  };

  const handleStop = () => {
    startedRef.current = false;
    stop();
  };

  const isTasksActive = pathname === "/tasks";
  const isIdeasActive = pathname === "/ideas";

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
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

        {/* Botón central: Mic (mantener pulsado) */}
        <div style={{ position: "relative" }}>
          {isListening ? (
            <>
              <span
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: 999,
                  background: "rgba(125,89,201,0.18)",
                  animation: "remiPulse 1.2s ease-out infinite",
                  pointerEvents: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: -22,
                  borderRadius: 999,
                  background: "rgba(125,89,201,0.10)",
                  animation: "remiPulse 1.2s ease-out infinite",
                  animationDelay: "0.25s",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : null}

          <button
            className="flex h-14 w-14 items-center justify-center rounded-full border-1 border-white bg-[#7d59c9] text-white shadow-[0_8px_20px_rgba(143,49,243,0.2)] -translate-y-0"
            type="button"
            disabled={!isSupported}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleStop();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handleStop();
            }}
            onPointerLeave={(e) => {
              if (isListening) {
                e.preventDefault();
                handleStop();
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleStop();
            }}
            aria-label={
              !isSupported
                ? "Dictado no compatible"
                : "Mantén apretado para hablar"
            }
            title={
              !isSupported
                ? "Dictado no compatible"
                : "Mantén apretado para hablar"
            }
            style={{
              touchAction: "none",
              userSelect: "none",
              opacity: !isSupported ? 0.5 : 1,
              transform: isListening ? "scale(1.03)" : "scale(1)",
              transition: "transform 120ms ease, opacity 120ms ease",
            }}
          >
            <Mic className="w-7 h-7" />
          </button>
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

      {error ? (
        <div
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 11,
            color: "#b91c1c",
          }}
        >
          {String(error)}
        </div>
      ) : null}

      <style>
        {`
          @keyframes remiPulse {
            0% { transform: scale(0.92); opacity: 0.9; }
            70% { transform: scale(1.25); opacity: 0.0; }
            100% { transform: scale(1.25); opacity: 0.0; }
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

function NavItem({ to, label, active, icon: Icon }: NavItemProps) {
  return (
    <Link
      to={to}
      className="flex h-12 w-12 items-center justify-center rounded-full transition"
    >
      <Icon className={`w-6 h-6 ${active ? "text-[#7d59c9]" : "text-neutral-800"}`} />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
