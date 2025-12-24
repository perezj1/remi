// src/components/MindDumpModal.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  X,
  ClipboardPaste,
  Mic,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { useModalUi } from "@/contexts/ModalUiContext";

const REMI_PURPLE = "#7d59c9";
const REMI_PURPLE_BORDER = "rgba(143,49,243,0.30)";
const REMI_PURPLE_BG = "rgba(143,49,243,0.10)";
const REMI_TEXT = "rgba(15,23,42,0.92)";
const REMI_SUB = "rgba(15,23,42,0.55)";

/** ✅ Modal language persistence (independent from app) */
const MODAL_LANG_STORAGE_KEY = "remi.mindDumpModal.lang";

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

function isUiLang(x: any): x is UiLang {
  return x === "es" || x === "en" || x === "de";
}

function readStoredModalLang(): UiLang | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(MODAL_LANG_STORAGE_KEY);
    return isUiLang(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStoredModalLang(lang: UiLang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODAL_LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

/* ───────────────────────────────
   ✅ Local (modal-only) i18n dictionary
   - This is independent from the app i18n.
─────────────────────────────── */
const MODAL_I18N: Record<UiLang, Record<string, string>> = {
  es: {
    "common.close": "Cerrar",
    "common.paste": "Pegar",
    "common.speak": "Hablar",
    "common.save": "Guardar",

    "capture.title": "Vacía tu mente",
    "capture.subtitle": "Habla, escribe o pega texto. Remi se encarga.",
    "capture.listening": "Escuchando…",
    "capture.placeholder": "Vacía tu mente aquí… (habla, escribe o pega)",
    "capture.iosKeyboardMicHint":
      "En iPhone: usa el micrófono del teclado para dictar.",
    "capture.speakHold": "Mantén pulsado para hablar",

    "capture.toast.micDenied": "Permiso de micrófono denegado.",
    "capture.toast.noSpeech": "No detecté voz. Prueba de nuevo.",
    "capture.toast.dictationError": "Error de dictado.",
    "capture.toast.pasteUnavailable":
      "No puedo pegar aquí (portapapeles no disponible).",
    "capture.toast.clipboardEmpty": "No hay texto en el portapapeles.",
    "capture.toast.pasteError":
      "No pude acceder al portapapeles. Mantén pulsado y pega.",
    "capture.toast.writeSomething": "Escribe algo primero.",

    "capture.chips.title": "Atajos inteligentes",
    "capture.chips.title2": "Fecha / hábito",
    "capture.chips.title3": "Hora",
    "capture.chips.title4": "Recordatorio",
    "capture.chips.backHint": "Volver a atajos",
    "capture.chips.back": "Atajos",

    "capture.chip.buy": "Comprar",
    "capture.chip.buyWord": "Comprar",
    "capture.chip.call": "Llamar",
    "capture.chip.callWord": "Llamar",
    "capture.chip.pay": "Pagar",
    "capture.chip.payWord": "Pagar",
    "capture.chip.birthday": "Cumpleaños",
    "capture.chip.birthdayWord": "Cumpleaños",
    "capture.chip.appt": "Cita",
    "capture.chip.apptWord": "Cita",
    "capture.chip.idea": "Idea",
    "capture.chip.ideaWord": "Idea:",

    "capture.chip.schedule.el": "el",
    "capture.chip.schedule.cada": "cada",
    "capture.chip.schedule.antesDel": "antes del",
    "capture.chip.schedule.hoy": "hoy",
    "capture.chip.schedule.manana": "mañana",

    "capture.chip.time.prefix": "a las",
    "capture.chip.time.t0900": "09:00",
    "capture.chip.time.t1800": "18:00",

    "capture.chip.reminder.dailyLabel": "cada día",
    "capture.chip.reminder.dailyInsert": "recordatorio estándar",
    "capture.chip.reminder.dayBeforeLabel": "día de antes",
    "capture.chip.reminder.dayBeforeInsert": "recordar el día de antes",
  },

  en: {
    "common.close": "Close",
    "common.paste": "Paste",
    "common.speak": "Speak",
    "common.save": "Save",

    "capture.title": "Mind dump",
    "capture.subtitle": "Speak, type or paste. Remi handles the rest.",
    "capture.listening": "Listening…",
    "capture.placeholder": "Dump your thoughts here… (speak, type or paste)",
    "capture.iosKeyboardMicHint":
      "On iPhone: use the keyboard microphone to диктate.",
    "capture.speakHold": "Hold to speak",

    "capture.toast.micDenied": "Microphone permission denied.",
    "capture.toast.noSpeech": "I didn’t detect speech. Try again.",
    "capture.toast.dictationError": "Dictation error.",
    "capture.toast.pasteUnavailable": "Paste isn’t available here (clipboard).",
    "capture.toast.clipboardEmpty": "Clipboard is empty.",
    "capture.toast.pasteError":
      "Couldn’t access clipboard. Long-press and paste.",
    "capture.toast.writeSomething": "Write something first.",

    "capture.chips.title": "Smart shortcuts",
    "capture.chips.title2": "Date / habit",
    "capture.chips.title3": "Time",
    "capture.chips.title4": "Reminder",
    "capture.chips.backHint": "Back to shortcuts",
    "capture.chips.back": "Shortcuts",

    "capture.chip.buy": "Buy",
    "capture.chip.buyWord": "Buy",
    "capture.chip.call": "Call",
    "capture.chip.callWord": "Call",
    "capture.chip.pay": "Pay",
    "capture.chip.payWord": "Pay",
    "capture.chip.birthday": "Birthday",
    "capture.chip.birthdayWord": "Birthday",
    "capture.chip.appt": "Meeting",
    "capture.chip.apptWord": "Meeting",
    "capture.chip.idea": "Idea",
    "capture.chip.ideaWord": "Idea:",

    "capture.chip.schedule.on": "on",
    "capture.chip.schedule.every": "every",
    "capture.chip.schedule.before": "before",
    "capture.chip.schedule.today": "today",
    "capture.chip.schedule.tomorrow": "tomorrow",

    "capture.chip.time.prefix": "at",
    "capture.chip.time.t0900": "9:00",
    "capture.chip.time.t1800": "18:00",

    "capture.chip.reminder.dailyLabel": "every day",
    "capture.chip.reminder.dailyInsert": "standard reminder",
    "capture.chip.reminder.dayBeforeLabel": "day before",
    "capture.chip.reminder.dayBeforeInsert": "remind the day before",
  },

  de: {
    "common.close": "Schließen",
    "common.paste": "Einfügen",
    "common.speak": "Sprechen",
    "common.save": "Speichern",

    "capture.title": "Kopf frei machen",
    "capture.subtitle": "Sprich, tippe oder füge Text ein. Remi kümmert sich.",
    "capture.listening": "Höre zu…",
    "capture.placeholder": "Schreib hier alles rein… (sprechen, tippen oder einfügen)",
    "capture.iosKeyboardMicHint":
      "Auf dem iPhone: Nutze das Mikrofon der Tastatur zum Diktieren.",
    "capture.speakHold": "Gedrückt halten zum Sprechen",

    "capture.toast.micDenied": "Mikrofon-Zugriff verweigert.",
    "capture.toast.noSpeech": "Keine Sprache erkannt. Versuch es nochmal.",
    "capture.toast.dictationError": "Diktat-Fehler.",
    "capture.toast.pasteUnavailable":
      "Einfügen nicht möglich (Zwischenablage nicht verfügbar).",
    "capture.toast.clipboardEmpty": "Zwischenablage ist leer.",
    "capture.toast.pasteError":
      "Kein Zugriff auf die Zwischenablage. Lange drücken und einfügen.",
    "capture.toast.writeSomething": "Schreib zuerst etwas.",

    "capture.chips.title": "Smarte Shortcuts",
    "capture.chips.title2": "Datum / Gewohnheit",
    "capture.chips.title3": "Uhrzeit",
    "capture.chips.title4": "Erinnerung",
    "capture.chips.backHint": "Zurück zu Shortcuts",
    "capture.chips.back": "Shortcuts",

    "capture.chip.buy": "Kaufen",
    "capture.chip.buyWord": "Kaufen",
    "capture.chip.call": "Anrufen",
    "capture.chip.callWord": "Anrufen",
    "capture.chip.pay": "Zahlen",
    "capture.chip.payWord": "Zahlen",
    "capture.chip.birthday": "Geburtstag",
    "capture.chip.birthdayWord": "Geburtstag",
    "capture.chip.appt": "Termin",
    "capture.chip.apptWord": "Termin",
    "capture.chip.idea": "Idee",
    "capture.chip.ideaWord": "Idee:",

    "capture.chip.schedule.am": "am",
    "capture.chip.schedule.jeden": "jeden",
    "capture.chip.schedule.vor": "vor",
    "capture.chip.schedule.heute": "heute",
    "capture.chip.schedule.morgen": "morgen",

    "capture.chip.time.prefix": "um",
    "capture.chip.time.t0900": "09:00",
    "capture.chip.time.t1800": "18:00",

    "capture.chip.reminder.dailyLabel": "jeden Tag",
    "capture.chip.reminder.dailyInsert": "Standard-Erinnerung",
    "capture.chip.reminder.dayBeforeLabel": "Vortag",
    "capture.chip.reminder.dayBeforeInsert": "am Vortag erinnern",
  },
};

function tr(
  lang: UiLang,
  key: string,
  fallback: string,
  vars?: Record<string, any>
): string {
  try {
    const dict = MODAL_I18N[lang] || MODAL_I18N.es;
    let out = dict[key] ?? fallback;
    if (!vars) return out;

    // simple {{var}} interpolation
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), String(v));
    }
    return out;
  } catch {
    return fallback;
  }
}

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
   ✅ Normaliza texto entrante/pegado:
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

type ChipStage = "ROOT" | "SCHEDULE" | "TIME" | "REMINDER";
type RootChipId = "birthday" | "call" | "buy" | "pay" | "appointment" | "idea";

const GAP = " "; // ✅ 1 solo espacio

export default function MindDumpModal({
  open,
  onClose,
  onOpenReview,
  initialText,
  initialTextNonce,
}: Props) {
  // ✅ IMPORTANTE: NO pongas `if (!open) return null;` antes de hooks.

  // We still read app lang only as a fallback default (modal remains independent).
  const appI18n = useI18n() as any;
  const appLangGuess: UiLang = (appI18n?.lang ??
    appI18n?.uiLang ??
    appI18n?.language ??
    "es") as UiLang;

  // ✅ Modal language: read localStorage once (initial), fallback to app language.
  const [uiLang, setUiLang] = useState<UiLang>(() => {
    const stored = readStoredModalLang();
    if (stored) return stored;
    return isUiLang(appLangGuess) ? appLangGuess : "es";
  });
  const [langOpen, setLangOpen] = useState(false);

  // Keep it persisted
  useEffect(() => {
    writeStoredModalLang(uiLang);
  }, [uiLang]);

  // If modal opens, re-sync from storage (e.g., other tab changed it)
  useEffect(() => {
    if (!open) return;
    const stored = readStoredModalLang();
    if (stored && stored !== uiLang) setUiLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const t = (key: string, fallback: string, vars?: any) =>
    tr(uiLang, key, fallback, vars);

  const [text, setText] = useState(normalizeIncomingText(initialText ?? ""));
  const [interim, setInterim] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ teclado real (FAB guardar) + foco
  const [kbdOffset, setKbdOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // ✅ ripple / pressed
  const [talkPressed, setTalkPressed] = useState(false);
  const [rippleTick, setRippleTick] = useState(0);

  // ✅ Smart chips (auto)
  const [chipStage, setChipStage] = useState<ChipStage>("ROOT");
  const [activeRootChip, setActiveRootChip] = useState<RootChipId | null>(null);

  // ✅ caret tracking
  const [caretTick, setCaretTick] = useState(0);
  const caretRef = useRef<number>(0);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);

  // ✅ Helpers: siempre texto + 1 espacio final (GAP)
  const withGap = (s: string) => `${String(s ?? "").trim()}${GAP}`;

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

      if (
        base.endsWith(BULLET) ||
        base.endsWith("\n" + BULLET) ||
        base.endsWith("\n\n" + BULLET)
      ) {
        return base + clean;
      }

      if (base.endsWith("\n") || base.endsWith(" ")) return base + clean;
      return base + " " + clean;
    });
  };

  // ✅ Hook robusto de dictado (lang depends on modal uiLang)
  const { isSupported, status, error, start, stop } = useSpeechDictation({
    lang: speechLangByUiLang[uiLang] || "es-ES",
    continuous: true,
    interimResults: true,
  });

  const listening = status === "listening";
  const showTalkButton = android && isSupported;

  // ✅ Ocultar BottomNav cuando el modal está abierto
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

    if (error === "not-allowed" || error === "service-not-allowed") {
      toast.error(t("capture.toast.micDenied", "Permiso de micrófono denegado."));
    } else if (error === "no-speech") {
      toast.message(t("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo."));
    } else {
      toast.error(t("capture.toast.dictationError", "Error de dictado."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, uiLang]);

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

    hapticTick(20);
    setTalkPressed(true);
    setRippleTick((n) => n + 1);

    blurTextarea();
    setTimeout(blurTextarea, 0);

    try {
      (e.currentTarget as any)?.setPointerCapture?.(e.pointerId);
    } catch {}

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
          t(
            "capture.toast.pasteUnavailable",
            "No puedo pegar aquí (portapapeles no disponible)."
          )
        );
        return;
      }
      const clip = await navigator.clipboard.readText();
      const normalizedClip = normalizeIncomingText(clip);
      if (!normalizedClip) {
        toast.message(t("capture.toast.clipboardEmpty", "No hay texto en el portapapeles."));
        return;
      }
      setText((prev) => (prev ? `${prev} ${normalizedClip}` : normalizedClip));
    } catch {
      toast.error(
        t(
          "capture.toast.pasteError",
          "No pude acceder al portapapeles. Mantén pulsado y pega."
        )
      );
    }
  };

  const handleSave = () => {
    startedRef.current = false;
    stop();
    blurTextarea();

    const trimmed = text.trim();
    if (!trimmed) {
      toast.message(t("capture.toast.writeSomething", "Escribe algo primero."));
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

  // ✅ caret update
  const updateCaret = () => {
    const node = textareaRef.current;
    if (!node) return;
    try {
      caretRef.current = node.selectionStart ?? node.value.length;
      setCaretTick((n) => n + 1);
    } catch {
      // ignore
    }
  };

  // ✅ Si llega texto de fuera (share, etc), normalizamos
  useEffect(() => {
    if (typeof initialTextNonce === "number") {
      setText(normalizeIncomingText(initialText ?? ""));
      setChipStage("ROOT");
      setActiveRootChip(null);
      caretRef.current = 0;
      setCaretTick((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTextNonce]);

  // ✅ Cerrar dropdown idioma al click fuera
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

  // ✅ Cerrar dictado al cerrar modal
  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      stop();
      setInterim("");
      setTalkPressed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ✅ Teclado: visualViewport + focus/blur
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

  /* ───────────────────────────────
     ✅ Smart chips helpers (cursor + línea actual)
  ──────────────────────────────── */

  const insertAtCursor = (snippet: string) => {
    const node = textareaRef.current;
    const s = String(snippet ?? "");
    if (!s) return;

    if (!node) {
      setText((prev) => (prev ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${s}` : s));
      return;
    }

    const start = node.selectionStart ?? node.value.length;
    const end = node.selectionEnd ?? node.value.length;

    setText((prev) => {
      const current = String(prev ?? "");
      const safeStart = Math.min(start, current.length);
      const safeEnd = Math.min(end, current.length);
      const next = current.slice(0, safeStart) + s + current.slice(safeEnd);

      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        try {
          const pos = Math.min(safeStart + s.length, el.value.length);
          el.selectionStart = el.selectionEnd = pos;
          caretRef.current = pos;
          setCaretTick((n) => n + 1);
          el.focus();
        } catch {
          // ignore
        }
      });

      return next;
    });
  };

  // línea actual
  const getCurrentLineInfo = (full: string, caretIndex: number) => {
    const s = String(full ?? "");
    const idx = Math.max(0, Math.min(caretIndex, s.length));
    const lineStart = s.lastIndexOf("\n", idx - 1) + 1;
    const nextNl = s.indexOf("\n", idx);
    const lineEnd = nextNl === -1 ? s.length : nextNl;
    const rawLine = s.slice(lineStart, lineEnd);
    const line = rawLine.replace(/^\s*•\s*/, "").trim();
    return { line, lineStart, lineEnd, rawLine };
  };

  // Detectores (por idioma UI del MODAL)
  const detection = useMemo(() => {
    const lower = (x: string) => x.toLowerCase();

    const es = {
      root: [
        { id: "buy" as const, re: /^(compr|compra|comprar)\b/i },
        { id: "call" as const, re: /^(llama|llamar|llamad|llam)\b/i },
        { id: "pay" as const, re: /^(paga|pagar|pago)\b/i },
        { id: "birthday" as const, re: /^(cumple|cumpleaños)\b/i },
        { id: "appointment" as const, re: /^(cita|reunión|reunion)\b/i },
        { id: "idea" as const, re: /^(idea)\b/i },
      ],
      scheduleTokens: [
        /\bel\b/i,
        /\bcada\b/i,
        /\bantes de\b/i,
        /\bantes del\b/i,
        /\bhoy\b/i,
        /\bmañana\b/i,
        /\besta semana\b/i,
        /\beste\b/i,
        /\bpróxim[oa]\b/i,
        /\bproxim[oa]\b/i,
      ],
      timeTokens: [/\ba las\b/i, /\b\d{1,2}:\d{2}\b/, /\b\d{1,2}\b/],
      reminderTokens: [/\brecordar\b/i, /\brecuérdame\b/i, /\bnotificar\b/i],
    };

    const en = {
      root: [
        { id: "buy" as const, re: /^(buy|purchase)\b/i },
        { id: "call" as const, re: /^(call|ring)\b/i },
        { id: "pay" as const, re: /^(pay)\b/i },
        { id: "birthday" as const, re: /^(birthday)\b/i },
        { id: "appointment" as const, re: /^(meeting|appointment)\b/i },
        { id: "idea" as const, re: /^(idea)\b/i },
      ],
      scheduleTokens: [/\bon\b/i, /\bevery\b/i, /\bbefore\b/i, /\btoday\b/i, /\btomorrow\b/i],
      timeTokens: [/\bat\b/i, /\b\d{1,2}:\d{2}\b/, /\b\d{1,2}\s?(am|pm)\b/i],
      reminderTokens: [/\bremind\b/i, /\bnotify\b/i],
    };

    const de = {
      root: [
        { id: "buy" as const, re: /^(kauf|kaufen)\b/i },
        { id: "call" as const, re: /^(anrufen|ruf)\b/i },
        { id: "pay" as const, re: /^(zahlen|bezahlen)\b/i },
        { id: "birthday" as const, re: /^(geburtstag)\b/i },
        { id: "appointment" as const, re: /^(termin|meeting)\b/i },
        { id: "idea" as const, re: /^(idee)\b/i },
      ],
      scheduleTokens: [/\bam\b/i, /\bjeden\b/i, /\bvor\b/i, /\bheute\b/i, /\bmorgen\b/i],
      timeTokens: [/\bum\b/i, /\b\d{1,2}:\d{2}\b/],
      reminderTokens: [/\berinner\b/i, /\bbenachrichtig\b/i],
    };

    const map: Record<UiLang, typeof es> = { es, en: en as any, de: de as any };
    return map[lower(uiLang) as UiLang] ?? es;
  }, [uiLang]);

  // ✅ ROOT chips: label (UI) + word (lo que se inserta)
  const rootChips = useMemo(
    () =>
      [
        {
          id: "buy" as const,
          label: t("capture.chip.buy", "Comprar"),
          word: t("capture.chip.buyWord", "Comprar"),
        },
        {
          id: "call" as const,
          label: t("capture.chip.call", "Llamar"),
          word: t("capture.chip.callWord", "Llamar"),
        },
        {
          id: "pay" as const,
          label: t("capture.chip.pay", "Pagar"),
          word: t("capture.chip.payWord", "Pagar"),
        },
        {
          id: "birthday" as const,
          label: t("capture.chip.birthday", "Cumpleaños"),
          word: t("capture.chip.birthdayWord", "Cumpleaños"),
        },
        {
          id: "appointment" as const,
          label: t("capture.chip.appt", "Cita"),
          word: t("capture.chip.apptWord", "Cita"),
        },
        {
          id: "idea" as const,
          label: t("capture.chip.idea", "Idea"),
          word: t("capture.chip.ideaWord", "Idea:"),
        },
      ] as const,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uiLang]
  );

  const scheduleChips = useMemo(() => {
    if (uiLang === "en") {
      return [
        { id: "on", label: t("capture.chip.schedule.on", "on"), insert: withGap(t("capture.chip.schedule.on", "on")) },
        { id: "every", label: t("capture.chip.schedule.every", "every"), insert: withGap(t("capture.chip.schedule.every", "every")) },
        { id: "before", label: t("capture.chip.schedule.before", "before"), insert: withGap(t("capture.chip.schedule.before", "before")) },
        { id: "today", label: t("capture.chip.schedule.today", "today"), insert: withGap(t("capture.chip.schedule.today", "today")) },
        { id: "tomorrow", label: t("capture.chip.schedule.tomorrow", "tomorrow"), insert: withGap(t("capture.chip.schedule.tomorrow", "tomorrow")) },
      ];
    }
    if (uiLang === "de") {
      return [
        { id: "am", label: t("capture.chip.schedule.am", "am"), insert: withGap(t("capture.chip.schedule.am", "am")) },
        { id: "jeden", label: t("capture.chip.schedule.jeden", "jeden"), insert: withGap(t("capture.chip.schedule.jeden", "jeden")) },
        { id: "vor", label: t("capture.chip.schedule.vor", "vor"), insert: withGap(t("capture.chip.schedule.vor", "vor")) },
        { id: "heute", label: t("capture.chip.schedule.heute", "heute"), insert: withGap(t("capture.chip.schedule.heute", "heute")) },
        { id: "morgen", label: t("capture.chip.schedule.morgen", "morgen"), insert: withGap(t("capture.chip.schedule.morgen", "morgen")) },
      ];
    }
    return [
      { id: "el", label: t("capture.chip.schedule.el", "el"), insert: withGap(t("capture.chip.schedule.el", "el")) },
      { id: "cada", label: t("capture.chip.schedule.cada", "cada"), insert: withGap(t("capture.chip.schedule.cada", "cada")) },
      { id: "antesDel", label: t("capture.chip.schedule.antesDel", "antes del"), insert: withGap(t("capture.chip.schedule.antesDel", "antes del")) },
      { id: "hoy", label: t("capture.chip.schedule.hoy", "hoy"), insert: withGap(t("capture.chip.schedule.hoy", "hoy")) },
      { id: "manana", label: t("capture.chip.schedule.manana", "mañana"), insert: withGap(t("capture.chip.schedule.manana", "mañana")) },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeChips = useMemo(() => {
    const defaultPrefix = uiLang === "en" ? "at" : uiLang === "de" ? "um" : "a las";
    const default0900 = uiLang === "en" ? "9:00" : "09:00";

    return [
      {
        id: "prefix",
        label: t("capture.chip.time.prefix", defaultPrefix),
        insert: withGap(t("capture.chip.time.prefix", defaultPrefix)),
      },
      {
        id: "9",
        label: t("capture.chip.time.t0900", default0900),
        insert: withGap(t("capture.chip.time.t0900", default0900)),
      },
      {
        id: "18",
        label: t("capture.chip.time.t1800", "18:00"),
        insert: withGap(t("capture.chip.time.t1800", "18:00")),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const reminderChips = useMemo(() => {
    const fallbackDailyLabel = uiLang === "en" ? "every day" : uiLang === "de" ? "jeden Tag" : "cada día";
    const fallbackDayBeforeLabel = uiLang === "en" ? "day before" : uiLang === "de" ? "Vortag" : "día de antes";

    const fallbackDailyInsert = uiLang === "en" ? "standard reminder" : uiLang === "de" ? "Standard-Erinnerung" : "recordatorio estándar";
    const fallbackDayBeforeInsert =
      uiLang === "en" ? "remind the day before" : uiLang === "de" ? "am Vortag erinnern" : "recordar el día de antes";

    return [
      {
        id: "daily",
        label: t("capture.chip.reminder.dailyLabel", fallbackDailyLabel),
        insert: withGap(t("capture.chip.reminder.dailyInsert", fallbackDailyInsert)),
      },
      {
        id: "dayBefore",
        label: t("capture.chip.reminder.dayBeforeLabel", fallbackDayBeforeLabel),
        insert: withGap(t("capture.chip.reminder.dayBeforeInsert", fallbackDayBeforeInsert)),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ auto: detecta acción/estado según la LÍNEA actual
  useEffect(() => {
    if (!open) return;

    const caret = caretRef.current ?? 0;
    const { line } = getCurrentLineInfo(text, caret);

    const foundRoot = detection.root.find((r) => r.re.test(line));
    const nextRoot: RootChipId | null = (foundRoot?.id as any) ?? null;

    if (!nextRoot) {
      if (activeRootChip !== null) setActiveRootChip(null);
      if (chipStage !== "ROOT") setChipStage("ROOT");
      return;
    }

    const hasSchedule = detection.scheduleTokens.some((re) => re.test(line));
    const hasTime = detection.timeTokens.some((re) => re.test(line));
    const hasReminder = detection.reminderTokens.some((re) => re.test(line));

    let nextStage: ChipStage = "SCHEDULE";
    if (hasTime || hasReminder) nextStage = "REMINDER";
    else if (hasSchedule) nextStage = "TIME";
    else nextStage = "SCHEDULE";

    if (activeRootChip !== nextRoot) setActiveRootChip(nextRoot);
    if (chipStage !== nextStage) setChipStage(nextStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, caretTick, open, detection]);

  const handleRootChip = (id: RootChipId) => {
    hapticTick(12);

    const word =
      rootChips.find((c) => c.id === id)?.word ??
      (id === "buy" ? "Comprar" : id === "call" ? "Llamar" : id === "pay" ? "Pagar" : id);

    insertAtCursor(withGap(word));
  };

  const handleScheduleChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const handleTimeChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const handleReminderChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const resetChips = () => {
    hapticTick(10);
    setChipStage("ROOT");
    setActiveRootChip(null);
  };

  /* ───────────────────────────────
     Render gating (después de hooks)
  ──────────────────────────────── */
  if (!open) return null;

  const langLabel = uiLang.toUpperCase();

  const isKeyboardOpen = isFocused && kbdOffset > 80;
  const showSaveFab = isKeyboardOpen;
  const showInlineSave = !showSaveFab;

  const saveFabBottomPx = Math.max(14, kbdOffset + 14);

  const showTalkActiveRing = listening;
  const showTalkRipple = talkPressed || listening;

  const chipTitle =
    chipStage === "ROOT"
      ? t("capture.chips.title", "Atajos inteligentes")
      : chipStage === "SCHEDULE"
      ? t("capture.chips.title2", "Fecha / hábito")
      : chipStage === "TIME"
      ? t("capture.chips.title3", "Hora")
      : t("capture.chips.title4", "Recordatorio");

  return (
    <div className="fixed inset-0 z-[1000]" onContextMenu={(e) => e.preventDefault()}>
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
        .remi-chipRow {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .remi-chipRow::-webkit-scrollbar {
          display: none;
          width: 0; height: 0;
        }
      `}</style>

      <div className="absolute inset-0" style={{ background: "#ffffff" }} />

      <div className="absolute inset-0">
        {/* Header */}
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
                {t("capture.title", "Vacía tu mente")}
              </div>

              <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.88)" }}>
                {t("capture.subtitle", "Habla, escribe o pega texto. Remi se encarga.")}
              </div>

              {showTalkButton && listening && (
                <div className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {t("capture.listening", "Escuchando…")}{" "}
                  {interim ? (
                    <span style={{ color: "rgba(255,255,255,0.70)" }}>{interim}</span>
                  ) : null}
                </div>
              )}
            </div>

            <button
              data-no-focus
              onClick={handleClose}
              aria-label={t("common.close", "Cerrar")}
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

          {/* ✅ Smart chips bar (AUTO) */}
          <div style={{ padding: "0 20px 14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>
                {chipTitle}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {chipStage !== "ROOT" && (
                  <button
                    type="button"
                    onClick={resetChips}
                    style={{
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.28)",
                      background: "rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.95)",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    title={t("capture.chips.backHint", "Volver a atajos")}
                    aria-label={t("capture.chips.backHint", "Volver a atajos")}
                  >
                    <Sparkles size={14} style={{ display: "inline-block", marginRight: 6 }} />
                    {t("capture.chips.back", "Atajos")}
                  </button>
                )}
              </div>
            </div>

            <div
              className="remi-chipRow"
              style={{
                marginTop: 10,
                display: "flex",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                gap: 8,
                paddingBottom: 2,
              }}
            >
              {chipStage === "ROOT" && (
                <>
                  {rootChips.map((c) => (
                    <Chip key={c.id} label={c.label} onClick={() => handleRootChip(c.id)} />
                  ))}
                </>
              )}

              {chipStage === "SCHEDULE" && (
                <>
                  {scheduleChips.map((c) => (
                    <Chip key={c.id} label={c.label} onClick={() => handleScheduleChip(c.insert)} />
                  ))}
                </>
              )}

              {chipStage === "TIME" && (
                <>
                  {timeChips.map((c) => (
                    <Chip key={c.id} label={c.label} onClick={() => handleTimeChip(c.insert)} />
                  ))}
                </>
              )}

              {chipStage === "REMINDER" && (
                <>
                  {reminderChips.map((c) => (
                    <Chip key={c.id} label={c.label} onClick={() => handleReminderChip(c.insert)} />
                  ))}
                </>
              )}

              <Chip label="↵" onClick={() => insertAtCursor("\n")} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-5 pb-44">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              requestAnimationFrame(updateCaret);
            }}
            onKeyUp={() => updateCaret()}
            onClick={() => updateCaret()}
            onSelect={() => updateCaret()}
            onFocus={() => {
              setIsFocused(true);
              requestAnimationFrame(updateCaret);
            }}
            onBlur={() => setIsFocused(false)}
            onPaste={(e) => {
              const pasted = e.clipboardData?.getData("text") ?? "";
              const normalized = normalizeIncomingText(pasted);
              if (!normalized) return;

              e.preventDefault();

              const el = e.currentTarget as HTMLTextAreaElement | null;
              const startRaw = el?.selectionStart;
              const endRaw = el?.selectionEnd;

              setText((prev) => {
                const current = String(prev ?? "");
                const start =
                  typeof startRaw === "number"
                    ? Math.min(startRaw, current.length)
                    : current.length;
                const end =
                  typeof endRaw === "number" ? Math.min(endRaw, current.length) : start;

                const next = current.slice(0, start) + normalized + current.slice(end);

                requestAnimationFrame(() => {
                  const node = textareaRef.current;
                  if (!node) return;
                  try {
                    const pos = Math.min(start + normalized.length, node.value.length);
                    node.selectionStart = node.selectionEnd = pos;
                    caretRef.current = pos;
                    setCaretTick((n) => n + 1);
                  } catch {
                    // ignore
                  }
                });

                return next;
              });
            }}
            placeholder={t("capture.placeholder", "Vacía tu mente aquí… (habla, escribe o pega)")}
            className="w-full resize-none outline-none text-[18px] leading-7"
            style={{ minHeight: "70vh", color: REMI_TEXT, background: "transparent" }}
            inputMode="text"
          />

          {ios && (
            <div className="mt-3 text-xs" style={{ color: REMI_SUB }}>
              {t("capture.iosKeyboardMicHint", "En iPhone: usa el micrófono del teclado para dictar.")}
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
                    {t("common.paste", "Pegar")}
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
                        title={t("capture.speakHold", "Mantén pulsado para hablar")}
                        aria-label={t("capture.speakHold", "Mantén pulsado para hablar")}
                      >
                        {showTalkActiveRing && <span className="remi-ring" />}
                        {showTalkRipple && <span key={rippleTick} className="remi-ripple" />}

                        <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
                          <Mic className="h-5 w-5" />
                        </span>
                      </button>

                      <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                        {t("common.speak", "Hablar")}
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
                        {t("common.save", "Guardar")}
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
            aria-label={t("common.save", "Guardar")}
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

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        height: 30,
        padding: "0 12px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.30)",
        background: "rgba(255,255,255,0.16)",
        color: "rgba(255,255,255,0.95)",
        fontSize: 11,
        fontWeight: 900,
        cursor: "pointer",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
    >
      {label}
    </button>
  );
}
