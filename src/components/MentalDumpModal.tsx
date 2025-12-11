// src/components/MentalDumpModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, ListTodo, Lightbulb } from "lucide-react";
import type { ReminderMode, RepeatType } from "@/lib/brainItemsApi";
import { useI18n } from "@/contexts/I18nContext";
import { parseDateTimeFromText } from "@/lib/parseDateTimeFromText";

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
];

type PreviewKind = "task" | "idea";

interface PreviewItem {
  id: number;
  kind: PreviewKind;
  original: string;
  title: string;
  dueDate: string | null;
  reminderMode: ReminderMode;
  repeatType: RepeatType;
  selected: boolean;
}

export default function MentalDumpModal({
  open,
  onClose,
  onCreateTask,
  onCreateIdea,
}: MentalDumpModalProps) {
  const { t, lang } = useI18n();

  const [dumpText, setDumpText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [previewItems, setPreviewItems] = useState<PreviewItem[] | null>(null);

  const hints = HINT_KEYS.map((key) => t(key));

  // Rotar las pistas cada 15s mientras el modal está abierto
  useEffect(() => {
    if (!open) return;

    setHintIndex(0); // reset al abrir
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [open, hints.length]);

  // Cuando se cierra desde fuera, reseteamos el estado
  useEffect(() => {
    if (!open) {
      setDumpText("");
      setPreviewItems(null);
      setIsSubmitting(false);
    }
  }, [open]);

  // Lista de líneas limpias (separar por saltos de línea o comas)
  const items = useMemo(() => {
    if (!dumpText.trim()) return [];

    const rawParts = dumpText
      .split(/\n|,/g)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    return rawParts;
  }, [dumpText]);

  function classifyItem(text: string): "task" | "idea" {
    const lower = text.toLowerCase().trim();

    // Si empieza por algo tipo "idea para...", "pensar en..."
    for (const prefix of IDEA_PREFIXES) {
      if (lower.startsWith(prefix + " ") || lower === prefix) {
        return "idea";
      }
    }

    // Tomar la primera palabra como posible verbo de acción
    const firstWord = lower
      .split(/\s+/)[0]
      .replace(/[^a-záéíóúüñ]/g, "");

    if (ACTION_VERBS.includes(firstWord)) {
      return "task";
    }

    // Por defecto, tarea salvo que suene a idea
    if (
      lower.startsWith("proyecto") ||
      lower.startsWith("plan") ||
      lower.includes("algún día") ||
      lower.includes("me gustaría")
    ) {
      return "idea";
    }

    return "task";
  }

  const handleInternalClose = () => {
    setDumpText("");
    setPreviewItems(null);
    setIsSubmitting(false);
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

  const hasSelected =
    previewItems?.some((item) => item.selected) ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (previewItems === null) {
      // FASE 1: construir vista previa
      if (!items.length) {
        handleInternalClose();
        return;
      }

      const next: PreviewItem[] = [];
      let idCounter = 1;

      for (const raw of items) {
        const original = raw.trim();
        if (!original) continue;

        const kind = classifyItem(original);

        if (kind === "task") {
          const parsed = parseDateTimeFromText(
            original,
            lang as any,
            new Date()
          );

          const { dueDateISO, repeatHint, reminderHint } = parsed;

          // Mantener SIEMPRE el texto original como título (no quitamos fecha/hora)
          const title = original;
          const dueDate = dueDateISO;

          // 1) Calcular tipo de hábito a partir de repeatHint,
          //    pero si el texto dice "every day until..." / "todos los días hasta..."
          //    lo tratamos como tarea única con recordatorios diarios (no hábito).
          let repeatType: RepeatType = "none";
          if (reminderHint === "DAILY_UNTIL_DUE") {
            // tarea única con recordatorio diario hasta fecha
            repeatType = "none";
          } else {
            if (repeatHint === "daily") repeatType = "daily";
            else if (repeatHint === "weekly") repeatType = "weekly";
            else if (repeatHint === "monthly") repeatType = "monthly";
            else if (repeatHint === "yearly") repeatType = "yearly";
          }

          // 2) Calcular reminderMode a partir de dueDate + reminderHint
          let reminderMode: ReminderMode = "NONE";

          if (dueDate) {
            if (reminderHint === "DAY_BEFORE_AND_DUE") {
              reminderMode = "DAY_BEFORE_AND_DUE";
            } else if (reminderHint === "DAILY_UNTIL_DUE") {
              reminderMode = "DAILY_UNTIL_DUE";
            } else {
              // Default para tareas con fecha: recordar todos los días hasta la fecha
              reminderMode = "DAILY_UNTIL_DUE";
            }
          }

          next.push({
            id: idCounter++,
            kind: "task",
            original,
            title,
            dueDate,
            reminderMode,
            repeatType,
            selected: true,
          });
        } else {
          // IDEA
          next.push({
            id: idCounter++,
            kind: "idea",
            original,
            title: original,
            dueDate: null,
            reminderMode: "NONE",
            repeatType: "none",
            selected: true,
          });
        }
      }

      setPreviewItems(next);
      return;
    }

    // FASE 2: crear en Remi lo que esté seleccionado
    if (!hasSelected) {
      // nada seleccionado → no hacemos nada
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
        {/* Cerrar */}
        <button
          type="button"
          onClick={handleInternalClose}
          className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Contenido */}
        <div className="space-y-4 pt-1">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {t("index.clearMind")}
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              {previewItems === null
                ? t("mentalDump.title")
                : t("mentalDump.previewTitle")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {previewItems === null
                ? t("mentalDump.description")
                : t("mentalDump.previewDescription")}
            </p>
          </div>

          {previewItems === null ? (
            <>
              {/* FASE 1: textarea + hint */}
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-600 border border-slate-100">
                {hints[hintIndex]}
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

                {/* Resumen de cuántos items se han detectado */}
                <p className="text-xs text-slate-500">
                  {items.length === 0
                    ? t("mentalDump.summaryNone")
                    : `${t("mentalDump.summaryPrefix")} ${items.length} ${t(
                        "mentalDump.summarySuffix"
                      )}`}
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleInternalClose}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white bg-gradient-to-tr from-[#8F31F3] to-[#b069ff] shadow-md hover:shadow-lg disabled:opacity-60"
                    disabled={isSubmitting || items.length === 0}
                  >
                    {primaryLabel}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* FASE 2: vista previa de items */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {previewItems.length === 0 && (
                  <p className="text-xs text-slate-500">
                    {t("mentalDump.previewNoneSelected")}
                  </p>
                )}

                {previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-inner text-[#8F31F3] flex-shrink-0">
                      {item.kind === "task" ? (
                        <ListTodo className="h-4 w-4" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {item.kind === "task"
                            ? t("mentalDump.previewTaskLabel")
                            : t("mentalDump.previewIdeaLabel")}
                        </span>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-[#8F31F3] focus:ring-[#8F31F3]"
                            checked={item.selected}
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
                          {t("mentalDump.previewInclude")}
                        </label>
                      </div>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPreviewItems((prev) =>
                            prev
                              ? prev.map((p) =>
                                  p.id === item.id
                                    ? { ...p, title: value }
                                    : p
                                )
                              : prev
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8F31F3]"
                      />

                      <p className="text-[11px] text-slate-500">
                        <span className="font-medium">
                          {t("today.dueLabel")}
                        </span>
                        {formatDateTime(item.dueDate)}
                        {item.kind === "task" && (
                          <>
                            {" · "}
                            <span className="font-medium">
                              {formatHabit(item.repeatType)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewItems(null)}
                  className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
                  disabled={isSubmitting}
                >
                  {t("mentalDump.previewBackToEdit")}
                </button>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleInternalClose}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white bg-gradient-to-tr from-[#8F31F3] to-[#b069ff] shadow-md hover:shadow-lg disabled:opacity-60"
                    disabled={isSubmitting || !hasSelected}
                  >
                    {primaryLabel}
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
