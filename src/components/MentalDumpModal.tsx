// src/components/MentalDumpModal.tsx
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, ListTodo, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { ReminderMode, RepeatType } from "@/lib/brainItemsApi";
import { useI18n } from "@/contexts/I18nContext";
import { parseDateTimeFromText } from "@/lib/parseDateTimeFromText";

// ✅ NUEVO
import { useModalUi } from "@/contexts/ModalUiContext";

export interface MentalDumpModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode,
    repeatType: RepeatType
  ) => Promise<void>;
  onCreateIdea: (title: string) => Promise<void>;

  /** ✅ NUEVO: texto para prefijar */
  initialText?: string;

  /** ✅ NUEVO: para forzar re-aplicar el texto aunque sea igual */
  initialTextNonce?: number;

  /** ✅ NUEVO: si true, abre directamente en preview */
  autoPreview?: boolean;
}

// Verbos de acción para clasificar como "tarea" (de momento en ES)
const ACTION_VERBS = [
  "llamar",
  "escribir",
  "enviar",
  "responder",
  "comprar",
  "pagar",
  "organizar",
  "limpiar",
  "arreglar",
  "pedir",
  "reservar",
  "revisar",
  "estudiar",
  "hacer",
  "terminar",
  "entregar",
  "preparar",
  "actualizar",
  "ir",
  "volver",
];

const IDEA_PREFIXES = ["idea", "pensar", "quizá", "quizás", "tal vez", "talvez"];

// Solo las keys; los textos vienen de i18n
const HINT_KEYS = [
  "mentalDump.hints.0",
  "mentalDump.hints.1",
  "mentalDump.hints.2",
  "mentalDump.hints.3",
  "mentalDump.hints.4",
  "mentalDump.hints.5",
  "mentalDump.hints.6",
  "mentalDump.hints.7",
  "mentalDump.hints.8",
];

type PreviewKind = "task" | "idea";

type WhyKey =
  | "mentalDump.why.verbTask"
  | "mentalDump.why.prefixIdea"
  | "mentalDump.why.projectIdea"
  | "mentalDump.why.defaultTask"
  | "mentalDump.why.defaultIdea"
  | "mentalDump.why.manualTask"
  | "mentalDump.why.manualIdea";

interface PreviewItem {
  id: number;
  kind: PreviewKind;
  original: string;
  title: string;

  dueDate: string | null;
  reminderMode: ReminderMode;
  repeatType: RepeatType;

  selected: boolean;

  // “Por qué”
  whyKey: WhyKey;
  whyVars?: Record<string, any>;
  whyLocked: boolean;

  // “Detectado” (fecha / hora / recordatorio / hábito)
  detectedDateText: string | null;
  detectedTimeText: string | null;
  detectedReminderText: string | null;
  detectedHabitText: string | null;

  // locks
  reminderLocked: boolean;
  habitLocked: boolean;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalHHMM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function buildISOFromLocalParts(dateYYYYMMDD: string, timeHHMM: string) {
  const [yy, mm, dd] = dateYYYYMMDD.split("-").map((x) => parseInt(x, 10));
  const [hh, mi] = timeHHMM.split(":").map((x) => parseInt(x, 10));
  const dt = new Date(yy, (mm ?? 1) - 1, dd ?? 1, hh ?? 18, mi ?? 0, 0, 0);
  return dt.toISOString();
}

function normalizeFirstWord(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-záéíóúüñ]/g, "");
}

function interpolateFallback(text: string, vars?: Record<string, any>) {
  if (!vars) return text;
  let out = text;
  for (const [k, v] of Object.entries(vars)) {
    const value = String(v);
    out = out
      .split(`{${k}}`)
      .join(value)
      .split(`(${k})`)
      .join(value)
      .split(`"${k}"`)
      .join(value);
  }
  return out;
}

/** ✅ Toggle reutilizable (tipo iOS) */
type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  stopPropagation?: boolean;
};

function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
  size = "sm",
  stopPropagation = true,
}: ToggleSwitchProps) {
  const h = size === "md" ? "h-6" : "h-5";
  const w = size === "md" ? "w-11" : "w-9";
  const dot = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const translate = size === "md" ? "translate-x-5" : "translate-x-4";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={[
        "inline-flex items-center gap-2 select-none",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {label ? <span className="text-[11px] text-slate-500">{label}</span> : null}

      <span
        className={[
          "relative inline-flex items-center rounded-full transition-colors",
          h,
          w,
          checked ? "bg-[#8F31F3]" : "bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "absolute left-0.5 top-0.5 rounded-full bg-white shadow transition-transform",
            dot,
            checked ? translate : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

/** Señales detectadas (date/time/habit/reminder) */
function detectDateSignal(text: string): string | null {
  const s = text.toLowerCase();

  const kw =
    s.match(
      /\b(hoy|mañana|pasado\s+mañana|este\s+finde|este\s+fin\s+de\s+semana|today|tomorrow|this\s+weekend|heute|morgen|dieses\s+wochenende)\b/i
    )?.[0] ?? null;
  if (kw) return kw;

  const weekday =
    s.match(
      /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[áa]bado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i
    )?.[0] ?? null;
  if (weekday) return weekday;

  const numeric =
    s.match(
      /\b(\d{1,2}[\/.\-]\d{1,2}([\/.\-]\d{2,4})?|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})\b/
    )?.[0] ?? null;
  if (numeric) return numeric;

  const esLong =
    s.match(
      /\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/i
    )?.[0] ?? null;
  if (esLong) return esLong;

  const otherLong =
    s.match(
      /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december|januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/i
    )?.[0] ?? null;
  if (otherLong) return otherLong;

  return null;
}

function detectTimeSignal(text: string): string | null {
  const s = text.toLowerCase();

  const hhmm = s.match(/\b\d{1,2}:\d{2}\b/)?.[0] ?? null;
  if (hhmm) return hhmm;

  const spoken =
    s.match(/\b(a\s+las|um|at)\s+\d{1,2}(:\d{2})?\b/i)?.[0] ?? null;
  if (spoken) return spoken;

  const h = s.match(/\b\d{1,2}\s*h\b/i)?.[0] ?? null;
  if (h) return h;

  const ampm = s.match(/\b\d{1,2}\s*(am|pm)\b/i)?.[0] ?? null;
  if (ampm) return ampm;

  return null;
}

function detectHabitSignal(text: string): string | null {
  const s = text.toLowerCase();

  const daily =
    s.match(
      /\b(cada\s+d[ií]a|todos\s+los\s+d[ií]as|a\s+diario|daily|every\s+day|täglich|jeden\s+tag)\b/i
    )?.[0] ?? null;
  if (daily) return daily;

  const weekly =
    s.match(
      /\b(cada\s+semana|semanal(mente)?|weekly|every\s+week|wöchentlich|jede\s+woche)\b/i
    )?.[0] ?? null;
  if (weekly) return weekly;

  const monthly =
    s.match(
      /\b(cada\s+mes|mensual(mente)?|monthly|every\s+month|monatlich|jeden\s+monat)\b/i
    )?.[0] ?? null;
  if (monthly) return monthly;

  const yearly =
    s.match(
      /\b(cada\s+año|anual(mente)?|yearly|every\s+year|jährlich|jedes\s+jahr)\b/i
    )?.[0] ?? null;
  if (yearly) return yearly;

  const eachWeekday =
    s.match(
      /\b(cada\s+(lunes|martes|mi[eé]rcoles|jueves|viernes|s[áa]bado|domingo)|every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|jeden\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag))\b/i
    )?.[0] ?? null;
  if (eachWeekday) return eachWeekday;

  return null;
}

function detectReminderSignal(
  text: string,
  reminderHint: string | null | undefined
): string | null {
  const s = text.toLowerCase();

  if (reminderHint === "DAY_BEFORE_AND_DUE") {
    const before =
      s.match(
        /\b(antes\s+de|un\s+d[ií]a\s+antes|day\s+before|the\s+day\s+before|vorher|einen\s+tag\s+vorher)\b/i
      )?.[0] ?? null;
    if (before) return before;
    return reminderHint;
  }

  if (reminderHint === "DAILY_UNTIL_DUE") {
    const daily =
      s.match(
        /\b(cada\s+d[ií]a|a\s+diario|daily|every\s+day|täglich|jeden\s+tag)\b/i
      )?.[0] ?? null;
    if (daily) return daily;
    return reminderHint;
  }

  return null;
}

function detectWhyForText(text: string): {
  kind: PreviewKind;
  whyKey: WhyKey;
  whyVars?: any;
} {
  const lower = text.toLowerCase().trim();

  for (const prefix of IDEA_PREFIXES) {
    if (lower.startsWith(prefix + " ") || lower === prefix) {
      return {
        kind: "idea",
        whyKey: "mentalDump.why.prefixIdea",
        whyVars: { word: prefix },
      };
    }
  }

  const firstWord = normalizeFirstWord(lower);
  if (ACTION_VERBS.includes(firstWord)) {
    return {
      kind: "task",
      whyKey: "mentalDump.why.verbTask",
      whyVars: { word: firstWord },
    };
  }

  if (
    lower.startsWith("proyecto") ||
    lower.startsWith("plan") ||
    lower.includes("algún día") ||
    lower.includes("me gustaría")
  ) {
    return { kind: "idea", whyKey: "mentalDump.why.projectIdea" };
  }

  return { kind: "task", whyKey: "mentalDump.why.defaultTask" };
}

function detectWhyForKind(
  text: string,
  kind: PreviewKind
): { whyKey: WhyKey; whyVars?: any } {
  const lower = text.toLowerCase().trim();
  const firstWord = normalizeFirstWord(lower);

  if (kind === "task") {
    if (ACTION_VERBS.includes(firstWord)) {
      return { whyKey: "mentalDump.why.verbTask", whyVars: { word: firstWord } };
    }
    return { whyKey: "mentalDump.why.defaultTask" };
  }

  for (const prefix of IDEA_PREFIXES) {
    if (lower.startsWith(prefix + " ") || lower === prefix) {
      return { whyKey: "mentalDump.why.prefixIdea", whyVars: { word: prefix } };
    }
  }
  if (
    lower.startsWith("proyecto") ||
    lower.startsWith("plan") ||
    lower.includes("algún día") ||
    lower.includes("me gustaría")
  ) {
    return { whyKey: "mentalDump.why.projectIdea" };
  }
  return { whyKey: "mentalDump.why.defaultIdea" };
}

export default function MentalDumpModal({
  open,
  onClose,
  onCreateTask,
  onCreateIdea,
  initialText,
  initialTextNonce,
  autoPreview,
}: MentalDumpModalProps) {
  const { t, lang } = useI18n();

  const { setModalOpen } = useModalUi();

  useEffect(() => {
    setModalOpen(open);
    return () => setModalOpen(false);
  }, [open, setModalOpen]);

  const [dumpText, setDumpText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [previewItems, setPreviewItems] = useState<PreviewItem[] | null>(null);

  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const hints = HINT_KEYS.map((key) => t(key));

  // ✅ para no re-aplicar el mismo texto si re-renderiza
  const lastAppliedTextRef = useRef<string>("");
  const lastAppliedNonceRef = useRef<number>(-1);

  useEffect(() => {
    if (!open) return;

    setHintIndex(0);
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [open, hints.length]);

  useEffect(() => {
    if (!open) {
      setDumpText("");
      setPreviewItems(null);
      setIsSubmitting(false);
      setExpandedIds({});
    }
  }, [open]);

  const splitItems = (text: string) => {
    if (!text.trim()) return [];
    return text
      .split(/\n|,/g)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  };

  const items = useMemo(() => splitItems(dumpText), [dumpText]);

  const handleInternalClose = () => {
    setDumpText("");
    setPreviewItems(null);
    setIsSubmitting(false);
    setExpandedIds({});
    setModalOpen(false);
    onClose();
  };

  function formatDateTime(due: string | null): string {
    if (!due) return t("today.dueNoDate");
    const d = new Date(due);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatHabit(rt: RepeatType): string {
    switch (rt) {
      case "daily":
        return t("mentalDump.habitDaily");
      case "weekly":
        return t("mentalDump.habitWeekly");
      case "monthly":
        return t("mentalDump.habitMonthly");
      case "yearly":
        return t("mentalDump.habitYearly");
      default:
        return t("mentalDump.habitNone");
    }
  }

  function formatReminderMode(mode: ReminderMode): string {
    switch (mode) {
      case "DAY_BEFORE_AND_DUE":
        return t("mentalDump.reminderDayBeforeAndDue");
      case "DAILY_UNTIL_DUE":
        return t("mentalDump.reminderDailyUntilDue");
      default:
        return t("mentalDump.reminderOff");
    }
  }

  function computeTaskFieldsFromText(
    text: string
  ): Pick<
    PreviewItem,
    | "dueDate"
    | "reminderMode"
    | "repeatType"
    | "detectedDateText"
    | "detectedTimeText"
    | "detectedReminderText"
    | "detectedHabitText"
  > {
    const parsed = parseDateTimeFromText(text, lang as any, new Date()) as any;
    const { dueDateISO, repeatHint, reminderHint } = parsed;

    const dueDate = dueDateISO ?? null;

    let repeatType: RepeatType = "none";
    if (repeatHint === "daily") repeatType = "daily";
    else if (repeatHint === "weekly") repeatType = "weekly";
    else if (repeatHint === "monthly") repeatType = "monthly";
    else if (repeatHint === "yearly") repeatType = "yearly";

    let reminderMode: ReminderMode = "NONE";
    if (dueDate) {
      if (reminderHint === "DAY_BEFORE_AND_DUE") reminderMode = "DAY_BEFORE_AND_DUE";
      else if (reminderHint === "DAILY_UNTIL_DUE") reminderMode = "DAILY_UNTIL_DUE";
      else reminderMode = "DAILY_UNTIL_DUE";
    }

    const detectedDateText = detectDateSignal(text);
    const detectedTimeText = detectTimeSignal(text);

    const reminderDetectedFromText = detectReminderSignal(text, reminderHint);
    const detectedReminderText = dueDate
      ? reminderDetectedFromText ?? t("mentalDump.detectedDefault")
      : null;

    const detectedHabitText = detectHabitSignal(text);

    return {
      dueDate,
      reminderMode,
      repeatType,
      detectedDateText,
      detectedTimeText,
      detectedReminderText,
      detectedHabitText,
    };
  }

  function buildPreviewFromText(fullText: string): PreviewItem[] {
    const parts = splitItems(fullText);
    const next: PreviewItem[] = [];
    let idCounter = 1;

    for (const raw of parts) {
      const original = raw.trim();
      if (!original) continue;

      const det = detectWhyForText(original);

      if (det.kind === "task") {
        const fields = computeTaskFieldsFromText(original);

        next.push({
          id: idCounter++,
          kind: "task",
          original,
          title: original,
          dueDate: fields.dueDate,
          reminderMode: fields.reminderMode,
          repeatType: fields.repeatType,
          selected: true,

          whyKey: det.whyKey,
          whyVars: det.whyVars,
          whyLocked: false,

          detectedDateText: fields.detectedDateText,
          detectedTimeText: fields.detectedTimeText,
          detectedReminderText: fields.detectedReminderText,
          detectedHabitText: fields.detectedHabitText,

          reminderLocked: false,
          habitLocked: false,
        });
      } else {
        next.push({
          id: idCounter++,
          kind: "idea",
          original,
          title: original,
          dueDate: null,
          reminderMode: "NONE",
          repeatType: "none",
          selected: true,

          whyKey: det.whyKey,
          whyVars: det.whyVars,
          whyLocked: false,

          detectedDateText: null,
          detectedTimeText: null,
          detectedReminderText: null,
          detectedHabitText: null,

          reminderLocked: false,
          habitLocked: false,
        });
      }
    }

    return next;
  }

  // ✅ NUEVO: al abrir, si llega initialText, precargarlo
  useEffect(() => {
    if (!open) return;

    const incoming = (initialText ?? "").trim();
    if (!incoming) return;

    const nonce = typeof initialTextNonce === "number" ? initialTextNonce : null;

    const shouldApply =
      nonce !== null
        ? nonce > lastAppliedNonceRef.current
        : incoming !== lastAppliedTextRef.current;

    if (!shouldApply) return;

    if (nonce !== null) lastAppliedNonceRef.current = nonce;
    lastAppliedTextRef.current = incoming;

    // aplicamos el texto
    setDumpText(incoming);

    // si queremos abrir en preview directamente
    if (autoPreview) {
      const built = buildPreviewFromText(incoming);
      setPreviewItems(built);
      setExpandedIds({});
    } else {
      setPreviewItems(null);
      setExpandedIds({});
    }
  }, [open, initialText, initialTextNonce, autoPreview]); // eslint-disable-line react-hooks/exhaustive-deps

  function updatePreviewItem(itemId: number, fn: (p: PreviewItem) => PreviewItem) {
    setPreviewItems((prev) => {
      if (!prev) return prev;
      return prev.map((p) => (p.id === itemId ? fn(p) : p));
    });
  }

  function toggleExpanded(itemId: number) {
    setExpandedIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function setItemKind(itemId: number, nextKind: PreviewKind) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind === nextKind) return p;

      if (nextKind === "idea") {
        return {
          ...p,
          kind: "idea",
          dueDate: null,
          reminderMode: "NONE",
          repeatType: "none",
          whyKey: "mentalDump.why.manualIdea",
          whyVars: undefined,
          whyLocked: true,

          detectedDateText: null,
          detectedTimeText: null,
          detectedReminderText: null,
          detectedHabitText: null,

          reminderLocked: false,
          habitLocked: false,
        };
      }

      const baseText = (p.title?.trim() || p.original).trim();
      const fields = computeTaskFieldsFromText(baseText);

      return {
        ...p,
        kind: "task",
        ...fields,
        whyKey: "mentalDump.why.manualTask",
        whyVars: undefined,
        whyLocked: true,
      };
    });
  }

  function setTaskDateFromPicker(itemId: number, yyyymmdd: string) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind !== "task") return p;

      const timeStr = p.dueDate ? toLocalHHMM(new Date(p.dueDate)) : "18:00";
      const iso = buildISOFromLocalParts(yyyymmdd, timeStr);

      const nextReminderMode = iso
        ? p.reminderMode === "NONE"
          ? "NONE"
          : p.reminderMode
        : "NONE";

      return {
        ...p,
        dueDate: iso,
        reminderMode: nextReminderMode,
        detectedDateText: t("mentalDump.detectedManual"),
        detectedReminderText: iso
          ? p.reminderLocked
            ? p.detectedReminderText
            : t("mentalDump.detectedDefault")
          : null,
      };
    });
  }

  function setTaskTimeFromPicker(itemId: number, hhmm: string) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind !== "task") return p;
      if (!p.dueDate) return p;

      const d = new Date(p.dueDate);
      const dateStr = toLocalYYYYMMDD(d);
      const iso = buildISOFromLocalParts(dateStr, hhmm);

      return {
        ...p,
        dueDate: iso,
        detectedTimeText: t("mentalDump.detectedManual"),
      };
    });
  }

  function setTaskReminder(itemId: number, next: ReminderMode) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind !== "task") return p;
      if (!p.dueDate) {
        return {
          ...p,
          reminderMode: "NONE",
          detectedReminderText: null,
          reminderLocked: true,
        };
      }
      return {
        ...p,
        reminderMode: next,
        detectedReminderText: t("mentalDump.detectedManual"),
        reminderLocked: true,
      };
    });
  }

  function setHabitEnabled(itemId: number, enabled: boolean) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind !== "task") return p;

      if (!enabled) {
        return {
          ...p,
          repeatType: "none",
          detectedHabitText: t("mentalDump.detectedManual"),
          habitLocked: true,
        };
      }

      const nextRepeat: RepeatType = p.repeatType === "none" ? "daily" : p.repeatType;

      return {
        ...p,
        repeatType: nextRepeat,
        detectedHabitText: t("mentalDump.detectedManual"),
        habitLocked: true,
      };
    });
  }

  function setHabitRepeatType(itemId: number, rt: RepeatType) {
    updatePreviewItem(itemId, (p) => {
      if (p.kind !== "task") return p;
      return {
        ...p,
        repeatType: rt,
        detectedHabitText: t("mentalDump.detectedManual"),
        habitLocked: true,
      };
    });
  }

  function shortDue(item: PreviewItem) {
    if (!item.dueDate) return t("today.dueNoDate");
    const d = new Date(item.dueDate);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  const hasSelected = previewItems?.some((item) => item.selected) ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (previewItems === null) {
      if (!items.length) {
        handleInternalClose();
        return;
      }

      const next = buildPreviewFromText(dumpText);
      setPreviewItems(next);
      setExpandedIds({});
      return;
    }

    if (!hasSelected) {
      handleInternalClose();
      return;
    }

    setIsSubmitting(true);
    try {
      for (const item of previewItems) {
        if (!item.selected) continue;

        if (item.kind === "task") {
          await onCreateTask(
            item.title.trim() || item.original,
            item.dueDate,
            item.reminderMode,
            item.repeatType
          );
        } else {
          await onCreateIdea(item.title.trim() || item.original);
        }
      }

      handleInternalClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  const primaryLabel = isSubmitting
    ? t("mentalDump.submitSaving")
    : previewItems === null
    ? t("mentalDump.submitToPreview")
    : t("mentalDump.submitConfirm");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
        <button
          type="button"
          onClick={handleInternalClose}
          className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4 pt-1">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {t("index.clearMind")}
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              {previewItems === null ? t("mentalDump.title") : t("mentalDump.previewTitle")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {previewItems === null
                ? t("mentalDump.description")
                : t("mentalDump.previewDescription")}
            </p>
          </div>

          {previewItems === null ? (
            <>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-600 border border-slate-100 min-h-[60px] sm:min-h-[72px] flex items-center">
                <p className="leading-snug">{hints[hintIndex]}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">
                    {t("mentalDump.inputLabel")}
                  </label>
                  <textarea
                    value={dumpText}
                    onChange={(e) => setDumpText(e.target.value)}
                    className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F31F3]/70"
                    placeholder={t("mentalDump.placeholder")}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  {items.length === 0
                    ? t("mentalDump.summaryNone")
                    : `${t("mentalDump.summaryPrefix")} ${items.length} ${t(
                        "mentalDump.summarySuffix"
                      )}`}
                </p>

                {/* ✅ sin “Cancelar” (solo X para cerrar) */}
                <button
  type="submit"
  className="w-full inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60"
  style={{ background: "#7d59c9" }}
  disabled={isSubmitting || items.length === 0}
>
  {primaryLabel}
</button>

              </form>
            </>
          ) : (
            <>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {previewItems.map((item) => {
                  const expanded = !!expandedIds[item.id];

                  const whyRaw = t(item.whyKey as any, item.whyVars);
                  const whyText = interpolateFallback(whyRaw, item.whyVars);

                  const detectedDate = item.detectedDateText ?? t("mentalDump.detectedDash");
                  const detectedTime = item.detectedTimeText ?? t("mentalDump.detectedDash");
                  const detectedReminder =
                    item.detectedReminderText ?? t("mentalDump.detectedDash");
                  const detectedHabit = item.detectedHabitText ?? t("mentalDump.detectedDash");

                  const kindLabel =
                    item.kind === "task"
                      ? t("mentalDump.previewTaskLabel")
                      : t("mentalDump.previewIdeaLabel");

                  const ideaBorder = "rgba(251,191,36,0.4)";
                  const ideaBg = "rgba(251,191,36,0.08)";
                  const ideaText = "#92400E";

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50"
                    >
                      {/* ✅ IMPORTANTE: ya no es <button> para poder meter toggles dentro sin HTML inválido */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expanded}
                        onClick={() => toggleExpanded(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleExpanded(item.id);
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-3"
                      >
                        <div
                          className={[
                            "mt-1 flex h-8 w-8 items-center justify-center rounded-full shadow-inner flex-shrink-0 border",
                            item.kind === "task"
                              ? "bg-white border-slate-200/60 text-[#8F31F3]"
                              : "",
                          ].join(" ")}
                          style={
                            item.kind === "idea"
                              ? {
                                  borderColor: ideaBorder,
                                  background: "#ffffff",
                                  color: ideaText,
                                }
                              : undefined
                          }
                        >
                          {item.kind === "task" ? (
                            <ListTodo className="h-4 w-4" />
                          ) : (
                            <Lightbulb className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={[
                                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                    item.kind === "task"
                                      ? "bg-white border-[#8F31F3]/25 text-[#8F31F3]"
                                      : "",
                                  ].join(" ")}
                                  style={
                                    item.kind === "idea"
                                      ? {
                                          borderColor: ideaBorder,
                                          background: "#ffffff",
                                          color: ideaText,
                                        }
                                      : undefined
                                  }
                                >
                                  {kindLabel}
                                </span>
                              </div>

                              <div className="mt-1 text-sm font-medium text-slate-900 truncate">
                                {item.title?.trim() || item.original}
                              </div>

                              {item.kind === "task" ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                                    {shortDue(item)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                                    {formatReminderMode(item.reminderMode)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                                    {formatHabit(item.repeatType)}
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-2 text-[11px] text-slate-500">
                                  {t("today.dueNoDate")}
                                </div>
                              )}
                            </div>

                            {/* ✅ DERECHA: toggle Guardar + chevron */}
                            <div className="mt-0.5 flex items-center gap-3 flex-shrink-0">
                              <ToggleSwitch
                                checked={item.selected}
                                disabled={isSubmitting}
                                label={t("mentalDump.previewInclude")}
                                onChange={() =>
                                  setPreviewItems((prev) =>
                                    prev
                                      ? prev.map((p) =>
                                          p.id === item.id
                                            ? { ...p, selected: !p.selected }
                                            : p
                                        )
                                      : prev
                                  )
                                }
                              />

                              <span className="text-slate-400">
                                {expanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <div className="px-3 pb-3">
                          <div className="border-t border-slate-200/70 pt-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className="inline-flex rounded-full border border-slate-200 bg-white p-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => setItemKind(item.id, "task")}
                                  className={[
                                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                                    item.kind === "task"
                                      ? "bg-[#8F31F3] text-white shadow-sm"
                                      : "text-slate-600 hover:bg-slate-50",
                                  ].join(" ")}
                                  aria-pressed={item.kind === "task"}
                                >
                                  {t("mentalDump.previewTaskLabel")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setItemKind(item.id, "idea")}
                                  className={[
                                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                                    item.kind === "idea"
                                      ? "shadow-sm"
                                      : "text-slate-600 hover:bg-slate-50",
                                  ].join(" ")}
                                  style={
                                    item.kind === "idea"
                                      ? { background: ideaBg, color: ideaText }
                                      : undefined
                                  }
                                  aria-pressed={item.kind === "idea"}
                                >
                                  {t("mentalDump.previewIdeaLabel")}
                                </button>
                              </div>

                              <button
                                type="button"
                                className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(item.id);
                                }}
                              >
                                {t("common.close")}
                              </button>
                            </div>

                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const value = e.target.value;

                                setPreviewItems((prev) => {
                                  if (!prev) return prev;

                                  return prev.map((p) => {
                                    if (p.id !== item.id) return p;

                                    if (p.kind === "task") {
                                      const fields = computeTaskFieldsFromText(value);

                                      const why = p.whyLocked
                                        ? { whyKey: p.whyKey, whyVars: p.whyVars }
                                        : detectWhyForKind(value, "task");

                                      const reminderMode = p.reminderLocked
                                        ? p.reminderMode
                                        : p.reminderMode === "NONE"
                                        ? "NONE"
                                        : fields.reminderMode;

                                      const detectedReminderText = p.reminderLocked
                                        ? p.detectedReminderText
                                        : fields.detectedReminderText;

                                      const repeatType = p.habitLocked
                                        ? p.repeatType
                                        : fields.repeatType;
                                      const detectedHabitText = p.habitLocked
                                        ? p.detectedHabitText
                                        : fields.detectedHabitText;

                                      return {
                                        ...p,
                                        title: value,

                                        dueDate: fields.dueDate,
                                        reminderMode,
                                        repeatType,

                                        whyKey: why.whyKey,
                                        whyVars: why.whyVars,

                                        detectedDateText: fields.detectedDateText,
                                        detectedTimeText: fields.detectedTimeText,
                                        detectedReminderText,
                                        detectedHabitText,
                                      };
                                    }

                                    const why = p.whyLocked
                                      ? { whyKey: p.whyKey, whyVars: p.whyVars }
                                      : detectWhyForKind(value, "idea");

                                    return {
                                      ...p,
                                      title: value,
                                      whyKey: why.whyKey,
                                      whyVars: why.whyVars,
                                    };
                                  });
                                });
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                            />

                            <div className="text-[11px] text-slate-500">
                              <span className="font-medium">{t("mentalDump.whyLabel")} </span>
                              <span>{whyText}</span>
                            </div>

                            {item.kind === "task" && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      {t("mentalDump.dateLabel")}
                                    </div>
                                    <input
                                      type="date"
                                      value={
                                        item.dueDate
                                          ? toLocalYYYYMMDD(new Date(item.dueDate))
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        if (!v) {
                                          updatePreviewItem(item.id, (p) => ({
                                            ...p,
                                            dueDate: null,
                                            reminderMode: "NONE",
                                            detectedDateText: null,
                                            detectedTimeText: null,
                                            detectedReminderText: null,
                                          }));
                                          return;
                                        }
                                        setTaskDateFromPicker(item.id, v);
                                      }}
                                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                                    />
                                    <div className="text-[11px] text-slate-500">
                                      <span className="font-medium">
                                        {t("mentalDump.detectedLabel")}{" "}
                                      </span>
                                      <span>{detectedDate}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      {t("mentalDump.timeLabel")}
                                    </div>
                                    <input
                                      type="time"
                                      value={item.dueDate ? toLocalHHMM(new Date(item.dueDate)) : ""}
                                      onChange={(e) =>
                                        setTaskTimeFromPicker(item.id, e.target.value)
                                      }
                                      disabled={!item.dueDate}
                                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                                    />
                                    <div className="text-[11px] text-slate-500">
                                      <span className="font-medium">
                                        {t("mentalDump.detectedLabel")}{" "}
                                      </span>
                                      <span>{detectedTime}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[11px] font-medium text-slate-500">
                                    {t("mentalDump.reminderLabel")}
                                  </div>
                                  <select
                                    value={item.dueDate ? item.reminderMode : "NONE"}
                                    onChange={(e) =>
                                      setTaskReminder(item.id, e.target.value as ReminderMode)
                                    }
                                    disabled={!item.dueDate}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                                  >
                                    <option value="NONE">{t("mentalDump.reminderOff")}</option>
                                    <option value="DAILY_UNTIL_DUE">
                                      {t("mentalDump.reminderDailyUntilDue")}
                                    </option>
                                    <option value="DAY_BEFORE_AND_DUE">
                                      {t("mentalDump.reminderDayBeforeAndDue")}
                                    </option>
                                  </select>

                                  <div className="text-[11px] text-slate-500">
                                    <span className="font-medium">
                                      {t("mentalDump.detectedLabel")}{" "}
                                    </span>
                                    <span>
                                      {item.dueDate
                                        ? detectedReminder
                                        : t("mentalDump.detectedDash")}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      {t("mentalDump.habitLabel")}
                                    </div>

                                    {/* ✅ Off/On como toggle */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <ToggleSwitch
                                        checked={item.repeatType !== "none"}
                                        disabled={isSubmitting}
                                        label={
                                          item.repeatType !== "none"
                                            ? t("mentalDump.habitOn")
                                            : t("mentalDump.habitOff")
                                        }
                                        onChange={(next) => setHabitEnabled(item.id, next)}
                                      />
                                    </div>
                                  </div>

                                  {item.repeatType !== "none" && (
                                    <select
                                      value={item.repeatType}
                                      onChange={(e) =>
                                        setHabitRepeatType(
                                          item.id,
                                          e.target.value as RepeatType
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                                    >
                                      <option value="daily">{t("mentalDump.habitDaily")}</option>
                                      <option value="weekly">{t("mentalDump.habitWeekly")}</option>
                                      <option value="monthly">{t("mentalDump.habitMonthly")}</option>
                                      <option value="yearly">{t("mentalDump.habitYearly")}</option>
                                    </select>
                                  )}

                                  <div className="text-[11px] text-slate-500">
                                    <span className="font-medium">
                                      {t("mentalDump.habitDetectedLabel")}{" "}
                                    </span>
                                    <span>{detectedHabit}</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-500">
                                  <span className="font-medium">{t("today.dueLabel")}</span>{" "}
                                  {formatDateTime(item.dueDate)}
                                  {" · "}
                                  <span className="font-medium">
                                    {t("mentalDump.reminderShortLabel")}
                                  </span>{" "}
                                  {formatReminderMode(item.reminderMode)}
                                  {" · "}
                                  <span className="font-medium">{formatHabit(item.repeatType)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  {/* ✅ BOTÓN PRINCIPAL GRANDE */}
                  <button
  type="submit"
  className="w-full inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60"
  style={{ background: "#7d59c9" }}
  disabled={isSubmitting || !hasSelected}
>
  {primaryLabel}
</button>

                  {/* ❌ Cancelar oculto (comentado a propósito) */}
                  {/*
                  <button
                    type="button"
                    onClick={handleInternalClose}
                    className="w-full inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </button>
                  */}

                  {/* ✅ DEBAJO: volver a editar */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewItems(null);
                      setExpandedIds({});
                    }}
                    className="w-full text-[11px] text-slate-500 underline-offset-2 hover:underline"
                    disabled={isSubmitting}
                  >
                    {t("mentalDump.previewBackToEdit")}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
