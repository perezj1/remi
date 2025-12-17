import { useEffect, useMemo, useState } from "react";
import { Mic } from "lucide-react";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";

type UiLang = "es" | "en" | "de";

const speechLangByUiLang: Record<UiLang, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
};

const STORAGE_KEY = "remi_dictation_lang_choice_v1"; // "es" | "en" | "de"
type StoredChoice = UiLang | "";

type Props = {
  uiLang: UiLang;
  value: string;
  onChange: (next: string) => void;

  /** Texto opcional debajo del icono */
  speakLabel?: string;

  /** Renderiza el selector arriba-derecha (dentro del wrapper relativo del modal) */
  compactLangUi?: boolean;

  /** Estilo extra para posicionar/estilizar el pill */
  langStyle?: React.CSSProperties;
};

function readStoredChoice(): StoredChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "es" || v === "en" || v === "de") return v;
  } catch {}
  return "";
}

function writeStoredChoice(v: StoredChoice) {
  try {
    if (!v) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, v);
  } catch {}
}

function toLabel(v: UiLang) {
  return v.toUpperCase();
}

export default function DictationMicButton({
  uiLang,
  value,
  onChange,
  speakLabel,
  compactLangUi = false,
  langStyle,
}: Props) {
  // "" = usuario NO eligió -> usamos uiLang (idioma de la app)
  const [choice, setChoice] = useState<StoredChoice>("");
  const [interim, setInterim] = useState("");

  useEffect(() => {
    setChoice(readStoredChoice());
  }, []);

  const activeUiLang: UiLang = useMemo(() => {
    return choice ? choice : uiLang;
  }, [choice, uiLang]);

  const activeSpeechLang = useMemo(() => {
    return speechLangByUiLang[activeUiLang] ?? "es-ES";
  }, [activeUiLang]);

  const { isSupported, status, error, start, stop } = useSpeechDictation({
    lang: activeSpeechLang,
    continuous: true,
    interimResults: true,
  });

  const isListening = status === "listening";

  function ensureNewLineBeforeDictation() {
    const trimmedEnd = value.replace(/[ \t]+$/g, ""); // solo quita espacios/tabs al final
    if (!trimmedEnd) return; // vacío => no añadimos nada
    if (trimmedEnd.endsWith("\n")) return; // ya está en nueva línea
    onChange(value + "\n"); // nueva tarea en línea nueva
  }

  function append(finalText: string, interimText: string) {
    if (finalText) {
      const needsSpace =
        value.length > 0 && !value.endsWith("\n") && !value.endsWith(" ");

      const next = value ? value + (needsSpace ? " " : "") + finalText : finalText;

      onChange(next);
      setInterim("");
    } else {
      setInterim(interimText);
    }
  }

  const labelText = speakLabel ?? (isListening ? "Listening…" : "Tap to Speak!");

  const handleStart = () => {
    if (!isSupported) return;

    // ✅ Cada dictado nuevo empieza en una nueva línea (nueva tarea)
    ensureNewLineBeforeDictation();

    start(
      ({ finalText, interimText }) => append(finalText, interimText),
      activeSpeechLang
    );
  };

  const handleStop = () => {
    stop();
    setInterim("");
  };

  // ✅ Solo ES/EN/DE visibles, pero el valor por defecto es uiLang si choice == ""
  const pillLabel = toLabel(activeUiLang);

  const LangPicker = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...(compactLangUi
          ? {
              position: "absolute",
              top: 10,
              right: 12,
              zIndex: 2,
            }
          : {}),
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(226,232,240,0.9)",
        borderRadius: 999,
        padding: "4px 10px",
        boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
        backdropFilter: "blur(6px)",
        ...langStyle,
      }}
      title="Idioma del dictado"
    >
      <select
        value={choice || uiLang}
        onChange={(e) => {
          const v = e.target.value as UiLang;

          // Si selecciona el mismo que el idioma de la app => “modo por defecto” (no guardamos)
          if (v === uiLang) {
            setChoice("");
            writeStoredChoice("");
          } else {
            setChoice(v);
            writeStoredChoice(v);
          }

          if (isListening) handleStop();
        }}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          outline: "none",
          cursor: "pointer",
          appearance: "auto",
        }}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>

      <span
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {pillLabel}
      </span>
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      {compactLangUi ? LangPicker : null}

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
        }}
      >
        <button
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
          aria-label="Mantén apretado para dictar"
          title={!isSupported ? "Dictado no compatible" : "Mantén apretado para hablar"}
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.22)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%), linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)",
            boxShadow:
              "0 16px 30px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !isSupported ? "not-allowed" : "pointer",
            opacity: !isSupported ? 0.45 : 1,
            transform: isListening ? "scale(1.03)" : "scale(1)",
            transition: "transform 120ms ease, opacity 120ms ease",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <Mic size={28} color="white" />
        </button>

        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 600,
            lineHeight: 1.1,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {labelText}
        </div>

        {!compactLangUi ? LangPicker : null}

        {interim ? (
          <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", maxWidth: 360 }}>
            {interim}
          </div>
        ) : null}

        {error ? (
          <div style={{ fontSize: 12, color: "#b91c1c", textAlign: "center", maxWidth: 360 }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
