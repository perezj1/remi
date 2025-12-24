// src/components/MindDumpModal.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { X, ClipboardPaste, Mic, Check, ChevronDown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
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
   ✅ Normaliza texto entrante/pegado:
   - sustituye saltos de línea por espacio (para evitar crear items sin querer)
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

  // ✅ Smart chips (auto)
  const [chipStage, setChipStage] = useState<ChipStage>("ROOT");
  const [activeRootChip, setActiveRootChip] = useState<RootChipId | null>(null);

  // ✅ caret tracking (para detectar “línea actual”)
  const [caretTick, setCaretTick] = useState(0);
  const caretRef = useRef<number>(0);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);

  const safeT = (key: string, fallback: string, vars?: any) => {
    try {
      if (!t) return fallback;
      const value = t(key, vars);
      if (!value) return fallback;
      if (value === key) return fallback;
      return value;
    } catch {
      return fallback;
    }
  };

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

  // ✅ Hook robusto de dictado
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
      toast.error(safeT("capture.toast.micDenied", "Permiso de micrófono denegado."));
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
        toast.message(safeT("capture.toast.clipboardEmpty", "No hay texto en el portapapeles."));
        return;
      }
      setText((prev) => (prev ? `${prev} ${normalizedClip}` : normalizedClip));
    } catch {
      toast.error(
        safeT("capture.toast.pasteError", "No pude acceder al portapapeles. Mantén pulsado y pega.")
      );
    }
  };

  const handleSave = () => {
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

  // ✅ Propagar idioma a tu i18n si lo soporta
  useEffect(() => {
    const setLangFn = i18n?.setLang ?? i18n?.setUiLang ?? i18n?.setLanguage ?? null;
    if (typeof setLangFn === "function") {
      try {
        setLangFn(uiLang);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);

  // Cerrar dropdown idioma al click fuera
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

  // Teclado: visualViewport + focus/blur (evita FAB “pegado”)
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

  // línea actual = “tarea/idea actual”
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

  // Detectores (por idioma UI)
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

  // ✅ ROOT chips: label (UI) + word (lo que se inserta) desde i18n
  const rootChips = useMemo(
    () =>
      [
        {
          id: "buy" as const,
          label: safeT("capture.chip.buy", "Comprar"),
          word: safeT("capture.chip.buyWord", "Comprar"),
        },
        {
          id: "call" as const,
          label: safeT("capture.chip.call", "Llamar"),
          word: safeT("capture.chip.callWord", "Llamar"),
        },
        {
          id: "pay" as const,
          label: safeT("capture.chip.pay", "Pagar"),
          word: safeT("capture.chip.payWord", "Pagar"),
        },
        {
          id: "birthday" as const,
          label: safeT("capture.chip.birthday", "Cumpleaños"),
          word: safeT("capture.chip.birthdayWord", "Cumpleaños"),
        },
        {
          id: "appointment" as const,
          label: safeT("capture.chip.appt", "Cita"),
          word: safeT("capture.chip.apptWord", "Cita"),
        },
        {
          id: "idea" as const,
          label: safeT("capture.chip.idea", "Idea"),
          word: safeT("capture.chip.ideaWord", "Idea:"),
        },
      ] as const,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uiLang]
  );

  // ✅ SCHEDULE chips: label + insert desde capture.chip.schedule.*
  const scheduleChips = useMemo(() => {
    if (uiLang === "en") {
      return [
        {
          id: "on",
          label: safeT("capture.chip.schedule.on", "on"),
          insert: withGap(safeT("capture.chip.schedule.on", "on")),
        },
        {
          id: "every",
          label: safeT("capture.chip.schedule.every", "every"),
          insert: withGap(safeT("capture.chip.schedule.every", "every")),
        },
        {
          id: "before",
          label: safeT("capture.chip.schedule.before", "before"),
          insert: withGap(safeT("capture.chip.schedule.before", "before")),
        },
        {
          id: "today",
          label: safeT("capture.chip.schedule.today", "today"),
          insert: withGap(safeT("capture.chip.schedule.today", "today")),
        },
        {
          id: "tomorrow",
          label: safeT("capture.chip.schedule.tomorrow", "tomorrow"),
          insert: withGap(safeT("capture.chip.schedule.tomorrow", "tomorrow")),
        },
      ];
    }
    if (uiLang === "de") {
      return [
        {
          id: "am",
          label: safeT("capture.chip.schedule.am", "am"),
          insert: withGap(safeT("capture.chip.schedule.am", "am")),
        },
        {
          id: "jeden",
          label: safeT("capture.chip.schedule.jeden", "jeden"),
          insert: withGap(safeT("capture.chip.schedule.jeden", "jeden")),
        },
        {
          id: "vor",
          label: safeT("capture.chip.schedule.vor", "vor"),
          insert: withGap(safeT("capture.chip.schedule.vor", "vor")),
        },
        {
          id: "heute",
          label: safeT("capture.chip.schedule.heute", "heute"),
          insert: withGap(safeT("capture.chip.schedule.heute", "heute")),
        },
        {
          id: "morgen",
          label: safeT("capture.chip.schedule.morgen", "morgen"),
          insert: withGap(safeT("capture.chip.schedule.morgen", "morgen")),
        },
      ];
    }
    return [
      {
        id: "el",
        label: safeT("capture.chip.schedule.el", "el"),
        insert: withGap(safeT("capture.chip.schedule.el", "el")),
      },
      {
        id: "cada",
        label: safeT("capture.chip.schedule.cada", "cada"),
        insert: withGap(safeT("capture.chip.schedule.cada", "cada")),
      },
      {
        id: "antesDel",
        label: safeT("capture.chip.schedule.antesDel", "antes del"),
        insert: withGap(safeT("capture.chip.schedule.antesDel", "antes del")),
      },
      {
        id: "hoy",
        label: safeT("capture.chip.schedule.hoy", "hoy"),
        insert: withGap(safeT("capture.chip.schedule.hoy", "hoy")),
      },
      {
        id: "manana",
        label: safeT("capture.chip.schedule.manana", "mañana"),
        insert: withGap(safeT("capture.chip.schedule.manana", "mañana")),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ TIME chips: label + insert desde capture.chip.time.*
  const timeChips = useMemo(() => {
    // prefix cambia según idioma (en/de/es) pero va a la misma key en tu estructura: capture.chip.time.prefix
    const defaultPrefix = uiLang === "en" ? "at" : uiLang === "de" ? "um" : "a las";
    const default0900 = uiLang === "en" ? "9:00" : "09:00";

    return [
      {
        id: "prefix",
        label: safeT("capture.chip.time.prefix", defaultPrefix),
        insert: withGap(safeT("capture.chip.time.prefix", defaultPrefix)),
      },
      {
        id: "9",
        label: safeT("capture.chip.time.t0900", default0900),
        insert: withGap(safeT("capture.chip.time.t0900", default0900)),
      },
      {
        id: "18",
        label: safeT("capture.chip.time.t1800", "18:00"),
        insert: withGap(safeT("capture.chip.time.t1800", "18:00")),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ REMINDER chips: label + insert desde capture.chip.reminder.*
  const reminderChips = useMemo(() => {
    const fallbackDailyLabel = uiLang === "en" ? "every day" : uiLang === "de" ? "jeden Tag" : "cada día";
    const fallbackDayBeforeLabel = uiLang === "en" ? "day before" : uiLang === "de" ? "Vortag" : "día de antes";

    const fallbackDailyInsert = uiLang === "en" ? "standard reminder" : uiLang === "de" ? "Standard-Erinnerung" : "recordar cada día";
    const fallbackDayBeforeInsert =
      uiLang === "en" ? "remind the day before" : uiLang === "de" ? "erinner am Vortag" : "recordatorio estándar";

    return [
      {
        id: "daily",
        label: safeT("capture.chip.reminder.dailyLabel", fallbackDailyLabel),
        insert: withGap(safeT("capture.chip.reminder.dailyInsert", fallbackDailyInsert)),
      },
      {
        id: "dayBefore",
        label: safeT("capture.chip.reminder.dayBeforeLabel", fallbackDayBeforeLabel),
        insert: withGap(safeT("capture.chip.reminder.dayBeforeInsert", fallbackDayBeforeInsert)),
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
      ? safeT("capture.chips.title", "Atajos inteligentes")
      : chipStage === "SCHEDULE"
      ? safeT("capture.chips.title2", "Fecha / hábito")
      : chipStage === "TIME"
      ? safeT("capture.chips.title3", "Hora")
      : safeT("capture.chips.title4", "Recordatorio");

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
                    title={safeT("capture.chips.backHint", "Volver a atajos")}
                    aria-label={safeT("capture.chips.backHint", "Volver a atajos")}
                  >
                    <Sparkles size={14} style={{ display: "inline-block", marginRight: 6 }} />
                    {safeT("capture.chips.back", "Atajos")}
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
                    <Chip
                      key={c.id}
                      label={c.label}
                      onClick={() => handleReminderChip(c.insert)}
                    />
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
            placeholder={safeT("capture.placeholder", "Vacía tu mente aquí… (habla, escribe o pega)")}
            className="w-full resize-none outline-none text-[18px] leading-7"
            style={{ minHeight: "70vh", color: REMI_TEXT, background: "transparent" }}
            inputMode="text"
          />

          {ios && (
            <div className="mt-3 text-xs" style={{ color: REMI_SUB }}>
              {safeT("capture.iosKeyboardMicHint", "En iPhone: usa el micrófono del teclado para dictar.")}
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
