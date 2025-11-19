// src/components/IdeaEditModal.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  type BrainItem,
  type ReminderMode,
  updateIdeaTitle,
  convertIdeaToTask,
} from "@/lib/brainItemsApi";

interface IdeaEditModalProps {
  open: boolean;
  idea: BrainItem | null; // debe ser type === "idea"
  onClose: () => void;
  onUpdated: (updated: BrainItem) => void;
  onConverted: (convertedTask: BrainItem) => void;
}

export default function IdeaEditModal({
  open,
  idea,
  onClose,
  onUpdated,
  onConverted,
}: IdeaEditModalProps) {
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  // valor para <input type="datetime-local">, formato: YYYY-MM-DDTHH:MM
  const [dueDateTime, setDueDateTime] = useState<string>("");
  const [reminderMode, setReminderMode] =
    useState<ReminderMode>("NONE");
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helpers para convertir ISO <-> datetime-local
  const isoToLocalDateTimeInput = (iso: string): string => {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const localDateTimeInputToISO = (value: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  // Resetear estado cuando cambie la idea o se abra/cierre
  useEffect(() => {
    if (!open || !idea) {
      setTitle("");
      setDueDateTime("");
      setReminderMode("NONE");
      setShowTaskOptions(false);
      setLoading(false);
      return;
    }

    setTitle(idea.title ?? "");
    setReminderMode(idea.reminder_mode || "NONE");

    if (idea.due_date) {
      setDueDateTime(isoToLocalDateTimeInput(idea.due_date));
    } else {
      setDueDateTime("");
    }
    setShowTaskOptions(false);
    setLoading(false);
  }, [open, idea]);

  if (!open || !idea) return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSaveAsIdea = async () => {
    if (!title.trim()) return;
    try {
      setLoading(true);
      const updated = await updateIdeaTitle(idea.id, title.trim());
      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error("Error updating idea title", err);
      alert(t("ideas.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleConvertClick = async () => {
    // Primer clic: mostramos opciones de tarea (fecha/hora + recordatorio)
    if (!showTaskOptions) {
      setShowTaskOptions(true);
      return;
    }

    // Segundo clic: convertimos realmente
    if (!title.trim()) return;

    try {
      setLoading(true);
      const dueISO = localDateTimeInputToISO(dueDateTime);
      const converted = await convertIdeaToTask(
        idea.id,
        title.trim(),
        dueISO,
        reminderMode
      );
      onConverted(converted);
      onClose();
    } catch (err) {
      console.error("Error converting idea to task", err);
      alert(t("ideas.convertError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        {/* Cabecera */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
              {t("ideas.editLabel")}
            </p>
            <h2 className="text-base font-semibold text-slate-900">
              {t("ideas.editTitle")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t("ideas.editSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Campo de texto */}
        <div className="mt-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            {t("ideas.fieldTitle")}
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-violet-400 focus:bg-white focus:ring-1 focus:ring-violet-300"
            rows={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("ideas.fieldTitlePlaceholder")}
          />
        </div>

        {/* Opciones extra cuando queremos convertir en tarea */}
        {showTaskOptions && (
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("ideas.taskOptionsTitle")}
            </p>

            {/* Fecha y hora límite */}
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("ideas.dueDateLabel")}
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
              />
            </div>

            {/* Modo de recordatorio */}
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("ideas.reminderLabel")}
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                value={reminderMode}
                onChange={(e) =>
                  setReminderMode(e.target.value as ReminderMode)
                }
              >
                <option value="NONE">
                  {t("ideas.reminder.none")}
                </option>
                <option value="ON_DUE_DATE">
                  {t("ideas.reminder.onDue")}
                </option>
                <option value="DAY_BEFORE_AND_DUE">
                  {t("ideas.reminder.dayBeforeAndDue")}
                </option>
                <option value="DAILY_UNTIL_DUE">
                  {t("ideas.reminder.dailyUntilDue")}
                </option>
              </select>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSaveAsIdea}
            disabled={loading || !title.trim()}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-60"
          >
            {t("ideas.saveAsIdea")}
          </button>

          <button
            type="button"
            onClick={handleConvertClick}
            disabled={loading || !title.trim()}
            className="flex-1 rounded-full bg-[#7d59c9] px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-60"
          >
            {showTaskOptions
              ? t("ideas.confirmConvert")
              : t("ideas.convertToTask")}
          </button>
        </div>

        {/* Mensaje pequeño al pie */}
        <p className="mt-3 text-[10px] text-slate-400">
          {t("ideas.footerHint")}
        </p>
      </div>
    </div>
  );
}
