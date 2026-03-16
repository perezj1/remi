// src/components/TaskEditModal.tsx
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, CalendarClock, Clock, Repeat, X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  type BrainItem,
  type ReminderMode,
  type RepeatType,
  updateTask,
} from "@/lib/brainItemsApi";
import { parseDateTimeFromText } from "@/lib/parseDateTimeFromText";

// ✅ NUEVO
import { useModalUi } from "@/contexts/ModalUiContext";

// ✅ OFFLINE
import { toast } from "sonner";
import { makeOpId, queueAdd } from "@/lib/offlineQueue";

interface TaskEditModalProps {
  open: boolean;
  task: BrainItem | null; // debe ser type === "task"
  onClose: () => void;
  onUpdated: (updated: BrainItem) => void;
}

type DueOption = "NONE" | "TODAY" | "TOMORROW" | "WEEK" | "CUSTOM";

export default function TaskEditModal({
  open,
  task,
  onClose,
  onUpdated,
}: TaskEditModalProps) {
  const { t, lang } = useI18n();
  const i18nLocale = lang === "es" ? "es-ES" : lang === "de" ? "de-DE" : "en-US";

  // ✅ NUEVO
  const { setModalOpen } = useModalUi();

  // ✅ NUEVO: cuando el modal está abierto, ocultamos BottomNav
  useEffect(() => {
    setModalOpen(open);
    return () => setModalOpen(false);
  }, [open, setModalOpen]);

  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

  // Due / Reminder / Repeat
  const [dueOption, setDueOption] = useState<DueOption>("CUSTOM");
  const [dueDateTime, setDueDateTime] = useState<string>(""); // datetime-local string
  const [reminderMode, setReminderMode] = useState<ReminderMode>("NONE");

  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("none");

  const [loading, setLoading] = useState(false);

  // Date/time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(20);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const reminderMenuRef = useRef<HTMLDivElement | null>(null);
  const repeatMenuRef = useRef<HTMLDivElement | null>(null);
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);
  const [repeatMenuOpen, setRepeatMenuOpen] = useState(false);

  // -------- helpers fecha/hora ----------
  const formatDateTimeLocal = useCallback((d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }, []);

  const applyDateTime = useCallback(
    (dateBase: Date, hour: number, minute: number, option: DueOption = "CUSTOM") => {
      const d = new Date(dateBase);
      d.setHours(hour, minute, 0, 0);
      setSelectedDate(d);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setDueDateTime(formatDateTimeLocal(d));
      setDueOption(option);
    },
    [formatDateTimeLocal]
  );

  const applyDateTimeManual = useCallback(
    (dateBase: Date, hour: number, minute: number, option: DueOption = "CUSTOM") => {
      applyDateTime(dateBase, hour, minute, option);
    },
    [applyDateTime]
  );

  const applyDateFromChip = useCallback(
    (d: Date, option: DueOption) => {
      applyDateTimeManual(d, d.getHours(), d.getMinutes(), option);
    },
    [applyDateTimeManual]
  );

  const localDateTimeInputToISO = useCallback((value: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }, []);

  const isoToLocalDateTimeInput = useCallback((iso: string): string => {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  // -------- init/reset al abrir ----------
  useEffect(() => {
    if (!open || !task) {
      setTitle("");
      setTitleTouched(false);
      setDueOption("CUSTOM");
      setDueDateTime("");
      setReminderMode("NONE");
      setRepeatEnabled(false);
      setRepeatType("none");
      setLoading(false);

      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      setReminderMenuOpen(false);
      setRepeatMenuOpen(false);
      return;
    }

    setTitle(task.title ?? "");
    setTitleTouched(false);

    const rt = (task.repeat_type || "none") as RepeatType;
    setRepeatEnabled(rt !== "none");
    setRepeatType(rt);

    const rm = (task.reminder_mode || "NONE") as ReminderMode;
    setReminderMode(rm);

    if (task.due_date) {
      const local = isoToLocalDateTimeInput(task.due_date);
      setDueDateTime(local);
      setDueOption("CUSTOM");

      const d = new Date(local);
      if (!Number.isNaN(d.getTime())) {
        setSelectedDate(d);
        setSelectedHour(d.getHours());
        setSelectedMinute(d.getMinutes());
      }
    } else {
      setDueOption("NONE");
      setDueDateTime("");
      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      setReminderMode("NONE");
    }

    setReminderMenuOpen(false);
    setRepeatMenuOpen(false);
    setLoading(false);
  }, [open, task, isoToLocalDateTimeInput]);

  // Si no hay fecha, algunos reminders no aplican (excepto DAILY_UNTIL_DUE)
  useEffect(() => {
    const hasDue = dueOption !== "NONE" && !!(dueDateTime || selectedDate);
    if (!hasDue && reminderMode !== "NONE" && reminderMode !== "DAILY_UNTIL_DUE") {
      setReminderMode("NONE");
    }
  }, [dueDateTime, dueOption, reminderMode, selectedDate]);

  // Si se activa hábito, recordatorios a NONE
  useEffect(() => {
    if (repeatEnabled && reminderMode !== "NONE") setReminderMode("NONE");
  }, [repeatEnabled, reminderMode]);

  // Sync picker cuando cambie dueDateTime
  useEffect(() => {
    if (!dueDateTime) {
      setSelectedDate(null);
      return;
    }
    const d = new Date(dueDateTime);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDate(d);
    setSelectedHour(d.getHours());
    setSelectedMinute(d.getMinutes());
  }, [dueDateTime]);

  // Detectar fecha/hora + hábito desde el texto (como CaptureModal)
  useEffect(() => {
    if (!titleTouched) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setDueOption("NONE");
      setDueDateTime("");
      setSelectedDate(null);
      setReminderMode("NONE");
      setRepeatEnabled(false);
      setRepeatType("none");
      return;
    }

    const { dueDateISO, repeatHint, reminderHint } = parseDateTimeFromText(trimmed, lang);

    if (dueDateISO) {
      const d = new Date(dueDateISO);
      if (!Number.isNaN(d.getTime())) {
        applyDateTime(d, d.getHours(), d.getMinutes(), "CUSTOM");
      }
    } else {
      setDueOption("NONE");
      setDueDateTime("");
      setSelectedDate(null);
    }

    if (repeatHint) {
      setRepeatEnabled(true);
      setRepeatType(repeatHint as RepeatType);
      setReminderMode("NONE");
    } else if (reminderHint) {
      setRepeatEnabled(false);
      setRepeatType("none");
      setReminderMode(reminderHint as ReminderMode);
    } else if (dueDateISO) {
      setRepeatEnabled(false);
      setRepeatType("none");
      setReminderMode("ON_DUE_DATE");
    } else {
      setRepeatEnabled(false);
      setRepeatType("none");
      setReminderMode("NONE");
    }
  }, [title, lang, applyDateTime, titleTouched]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (reminderMenuRef.current && !reminderMenuRef.current.contains(target)) {
        setReminderMenuOpen(false);
      }
      if (repeatMenuRef.current && !repeatMenuRef.current.contains(target)) {
        setRepeatMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const openNativePicker = useCallback((ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // ignored: not supported by every browser
      }
    }
    input.click();
  }, []);

  // ✅ Early return DESPUÉS de todos los hooks
  if (!open || !task) return null;
  if (task.type !== "task") return null;

  const handleClose = () => {
    if (loading) return;
    // ✅ extra seguridad
    setModalOpen(false);
    onClose();
  };

  const handleClearDueDate = () => {
    setDueOption("NONE");
    setDueDateTime("");
    setSelectedDate(null);
    setReminderMode("NONE");
    setRepeatEnabled(false);
    setRepeatType("none");
    setReminderMenuOpen(false);
    setRepeatMenuOpen(false);
  };

  const getDueDateFromOption = (): string | null => {
    if (dueOption === "NONE" && !dueDateTime) return null;

    if (dueDateTime) {
      const d = new Date(dueDateTime);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }

    const now = new Date();
    const d = new Date();

    if (dueOption === "TODAY") {
      d.setHours(20, 0, 0, 0);
    } else if (dueOption === "TOMORROW") {
      d.setDate(now.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (dueOption === "WEEK") {
      d.setDate(now.getDate() + 7);
      d.setHours(9, 0, 0, 0);
    } else if (dueOption === "CUSTOM") {
      if (selectedDate) return selectedDate.toISOString();
      return null;
    } else if (dueOption === "NONE") {
      return null;
    }

    return d.toISOString();
  };

  const enqueueOfflineUpdate = (payload: {
    title: string;
    dueISO: string | null;
    finalReminderMode: ReminderMode;
    finalRepeatType: RepeatType;
  }) => {
    // 1) Guardar en cola
    queueAdd({
      id: makeOpId(),
      type: "UPDATE_TASK",
      createdAt: Date.now(),
      userId: task.user_id,
      taskId: task.id,
      title: payload.title,
      dueDate: payload.dueISO,
      reminderMode: payload.finalReminderMode,
      repeatType: payload.finalRepeatType,
    });

    // 2) UI optimista (para que “se vea” editado al instante)
    const optimistic: BrainItem = {
      ...task,
      title: payload.title,
      due_date: payload.dueISO,
      reminder_mode: payload.finalReminderMode,
      repeat_type: payload.finalRepeatType,
      updated_at: new Date().toISOString(),
    };

    onUpdated(optimistic);

    toast.success(
      t("offline.savedLocally") || "Guardado sin conexión. Se sincronizará al volver la señal."
    );

    // 3) Cerrar
    setModalOpen(false);
    onClose();
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const dueISO =
      dueOption === "NONE"
        ? null
        : localDateTimeInputToISO(dueDateTime) ?? getDueDateFromOption();

    const finalRepeatType: RepeatType = repeatEnabled ? repeatType : "none";
    const finalReminderMode: ReminderMode =
      repeatEnabled || (!dueISO && reminderMode !== "DAILY_UNTIL_DUE") ? "NONE" : reminderMode;

    // ✅ Si está offline, encolamos y hacemos UI optimista
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      enqueueOfflineUpdate({ title: trimmed, dueISO, finalReminderMode, finalRepeatType });
      return;
    }

    try {
      setLoading(true);

      const updated = await updateTask(
        task.id,
        trimmed,
        dueISO,
        finalReminderMode,
        finalRepeatType
      );

      onUpdated(updated);
      setModalOpen(false);
      onClose();
    } catch (err) {
      console.error("Error updating task", err);

      // ✅ Si falló por red (o te quedaste sin señal en medio), encolamos
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        enqueueOfflineUpdate({ title: trimmed, dueISO, finalReminderMode, finalRepeatType });
        return;
      }

      alert(t("tasks.updateError") || "Error updating task");
    } finally {
      setLoading(false);
    }
  };

  const hasDue = dueOption !== "NONE" && !!(dueDateTime || selectedDate);
  const hasSomeDate = hasDue && !!selectedDate;
  const remindersDisabled = repeatEnabled;

  const dateLabel =
    hasSomeDate && selectedDate
      ? (() => {
          const now = new Date();
          const isToday =
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate();
          if (isToday) return t("capture.dueToday") || "Hoy";

          const day = String(selectedDate.getDate());
          const monthRaw = new Intl.DateTimeFormat(i18nLocale, { month: "short" }).format(selectedDate);
          const monthClean = monthRaw.replace(/[.\s]+$/g, "");
          const month = monthClean ? monthClean[0].toUpperCase() + monthClean.slice(1) : monthRaw;
          return `${day} ${month}`;
        })()
      : t("capture.dueNone") || "Sin fecha";

  const timeLabel =
    hasSomeDate && selectedDate
      ? selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : t("capture.timeUnset") || "Sin hora";

  const reminderLabel = (() => {
    if (repeatEnabled) return t("pill.reminderNone") || "Sin recordatorio";
    if (reminderMode === "ON_DUE_DATE") return t("tasks.reminder.onDue") || "En la fecha";
    if (reminderMode === "DAY_BEFORE_AND_DUE") return t("pill.remDayBefore") || "1 día antes";
    if (reminderMode === "WEEK_BEFORE_AND_DUE") return t("pill.remWeekBefore") || "1 semana antes";
    if (reminderMode === "DAILY_UNTIL_DUE") return t("pill.remDaily") || "Diaria";
    return t("pill.reminderNone") || "Sin recordatorio";
  })();

  const repeatLabel = (() => {
    if (!repeatEnabled || repeatType === "none") return t("pill.repeatNone") || "Sin repetición";
    if (repeatType === "daily") return t("pill.habitDaily") || "Diaria";
    if (repeatType === "weekly") return t("pill.habitWeekly") || "Semanal";
    if (repeatType === "monthly") return t("pill.habitMonthly") || "Mensual";
    if (repeatType === "yearly") return t("pill.habitYearly") || "Anual";
    return t("pill.repeatNone") || "Sin repetición";
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black/35 px-4 py-4 flex items-center justify-center">
      <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
              {t("tasks.editLabel") || "Edit"}
            </p>
            <h2 className="text-base font-semibold text-slate-900">
              {t("tasks.editTitle") || "Edit task"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t("tasks.editSubtitle") || "Update text, date & time, reminders and repeat."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Texto */}
        <div className="mt-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            {t("tasks.fieldTitle") || "Task"}
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-violet-400 focus:bg-white focus:ring-1 focus:ring-violet-300"
            rows={3}
            value={title}
            onChange={(e) => {
              setTitleTouched(true);
              setTitle(e.target.value);
            }}
            placeholder={t("tasks.fieldTitlePlaceholder") || "Write your task..."}
          />
        </div>

        {/* Opciones */}
        <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {t("tasks.optionsTitle") || "Options"}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="relative">
              <SettingPill
                icon={<Calendar className="h-4 w-4 text-[#7d59c9]" />}
                text={dateLabel}
                onClick={() => openNativePicker(dateInputRef)}
              />
              <input
                ref={dateInputRef}
                type="date"
                value={hasSomeDate && selectedDate ? dueDateTime.split("T")[0] ?? "" : ""}
                onChange={(e) => {
                  const nextDate = e.target.value;
                  if (!nextDate) {
                    handleClearDueDate();
                    return;
                  }
                  const [year, month, day] = nextDate.split("-").map((n) => Number(n));
                  const base = hasSomeDate && selectedDate ? new Date(selectedDate) : new Date();
                  base.setFullYear(year, month - 1, day);
                  applyDateTimeManual(base, selectedHour, selectedMinute, "CUSTOM");
                }}
                className="absolute inset-0 opacity-0"
                style={{ pointerEvents: "none" }}
              />
            </div>

            <div className="relative">
              <SettingPill
                icon={<Clock className="h-4 w-4 text-[#7d59c9]" />}
                text={timeLabel}
                onClick={() => {
                  if (!hasSomeDate) {
                    const base = new Date();
                    base.setHours(selectedHour, selectedMinute, 0, 0);
                    applyDateFromChip(base, "TODAY");
                  }
                  openNativePicker(timeInputRef);
                }}
              />
              <input
                ref={timeInputRef}
                type="time"
                value={hasSomeDate && selectedDate ? dueDateTime.split("T")[1] ?? "" : ""}
                onChange={(e) => {
                  const nextTime = e.target.value;
                  if (!nextTime) return;
                  const [hour, minute] = nextTime.split(":").map((n) => Number(n));
                  const base = hasSomeDate && selectedDate ? new Date(selectedDate) : new Date();
                  applyDateTimeManual(base, hour, minute, "CUSTOM");
                }}
                className="absolute inset-0 opacity-0"
                style={{ pointerEvents: "none" }}
              />
            </div>

            <div className="relative" ref={reminderMenuRef}>
              <SettingPill
                icon={<CalendarClock className="h-4 w-4 text-[#7d59c9]" />}
                text={reminderLabel}
                disabled={remindersDisabled}
                onClick={() => {
                  if (remindersDisabled) return;
                  setRepeatMenuOpen(false);
                  setReminderMenuOpen((prev) => !prev);
                }}
              />
              {reminderMenuOpen && !remindersDisabled && (
                <MenuPanel direction="up">
                  <MenuItem
                    active={reminderMode === "NONE"}
                    onClick={() => {
                      setReminderMode("NONE");
                      setReminderMenuOpen(false);
                    }}
                  >
                    {t("pill.reminderNone") || "Sin recordatorio"}
                  </MenuItem>
                  <MenuItem
                    active={reminderMode === "ON_DUE_DATE"}
                    disabled={!hasSomeDate}
                    onClick={() => {
                      if (!hasSomeDate) return;
                      setReminderMode("ON_DUE_DATE");
                      setReminderMenuOpen(false);
                    }}
                  >
                    {t("tasks.reminder.onDue") || "En la fecha"}
                  </MenuItem>
                  <MenuItem
                    active={reminderMode === "DAY_BEFORE_AND_DUE"}
                    disabled={!hasSomeDate}
                    onClick={() => {
                      if (!hasSomeDate) return;
                      setReminderMode("DAY_BEFORE_AND_DUE");
                      setReminderMenuOpen(false);
                    }}
                  >
                    {t("pill.remDayBefore") || "1 día antes"}
                  </MenuItem>
                  <MenuItem
                    active={reminderMode === "WEEK_BEFORE_AND_DUE"}
                    disabled={!hasSomeDate}
                    onClick={() => {
                      if (!hasSomeDate) return;
                      setReminderMode("WEEK_BEFORE_AND_DUE");
                      setReminderMenuOpen(false);
                    }}
                  >
                    {t("pill.remWeekBefore") || "1 semana antes"}
                  </MenuItem>
                  <MenuItem
                    active={reminderMode === "DAILY_UNTIL_DUE"}
                    onClick={() => {
                      setReminderMode("DAILY_UNTIL_DUE");
                      setReminderMenuOpen(false);
                    }}
                  >
                    {t("pill.remDaily") || "Diaria"}
                  </MenuItem>
                </MenuPanel>
              )}
            </div>

            <div className="relative" ref={repeatMenuRef}>
              <SettingPill
                icon={<Repeat className="h-4 w-4 text-[#7d59c9]" />}
                text={repeatLabel}
                onClick={() => {
                  setReminderMenuOpen(false);
                  setRepeatMenuOpen((prev) => !prev);
                }}
              />
              {repeatMenuOpen && (
                <MenuPanel direction="up" align="end">
                  <MenuItem
                    active={!repeatEnabled || repeatType === "none"}
                    onClick={() => {
                      setRepeatEnabled(false);
                      setRepeatType("none");
                      setRepeatMenuOpen(false);
                    }}
                  >
                    {t("pill.repeatNone") || "Sin repetición"}
                  </MenuItem>
                  <MenuItem
                    active={repeatEnabled && repeatType === "daily"}
                    onClick={() => {
                      if (!hasSomeDate) {
                        const base = new Date();
                        base.setHours(selectedHour, selectedMinute, 0, 0);
                        applyDateFromChip(base, "TODAY");
                      }
                      setRepeatEnabled(true);
                      setRepeatType("daily");
                      setReminderMode("NONE");
                      setRepeatMenuOpen(false);
                    }}
                  >
                    {t("pill.habitDaily") || "Diaria"}
                  </MenuItem>
                  <MenuItem
                    active={repeatEnabled && repeatType === "weekly"}
                    onClick={() => {
                      if (!hasSomeDate) {
                        const base = new Date();
                        base.setHours(selectedHour, selectedMinute, 0, 0);
                        applyDateFromChip(base, "TODAY");
                      }
                      setRepeatEnabled(true);
                      setRepeatType("weekly");
                      setReminderMode("NONE");
                      setRepeatMenuOpen(false);
                    }}
                  >
                    {t("pill.habitWeekly") || "Semanal"}
                  </MenuItem>
                  <MenuItem
                    active={repeatEnabled && repeatType === "monthly"}
                    onClick={() => {
                      if (!hasSomeDate) {
                        const base = new Date();
                        base.setHours(selectedHour, selectedMinute, 0, 0);
                        applyDateFromChip(base, "TODAY");
                      }
                      setRepeatEnabled(true);
                      setRepeatType("monthly");
                      setReminderMode("NONE");
                      setRepeatMenuOpen(false);
                    }}
                  >
                    {t("pill.habitMonthly") || "Mensual"}
                  </MenuItem>
                  <MenuItem
                    active={repeatEnabled && repeatType === "yearly"}
                    onClick={() => {
                      if (!hasSomeDate) {
                        const base = new Date();
                        base.setHours(selectedHour, selectedMinute, 0, 0);
                        applyDateFromChip(base, "TODAY");
                      }
                      setRepeatEnabled(true);
                      setRepeatType("yearly");
                      setReminderMode("NONE");
                      setRepeatMenuOpen(false);
                    }}
                  >
                    {t("pill.habitYearly") || "Anual"}
                  </MenuItem>
                </MenuPanel>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-60"
          >
            {t("common.cancel") || "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="flex-1 rounded-full bg-[#7d59c9] px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-60"
          >
            {t("tasks.save") || "Save"}
          </button>
        </div>

        <p className="mt-3 text-[10px] text-slate-400">
          {t("tasks.footerHint") || "You can edit this anytime."}
        </p>
      </div>
    </div>
  );
}

function SettingPill({
  icon,
  text,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-left"
      style={{
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          {icon}
          <span className="truncate text-[12px] font-normal text-slate-700">{text}</span>
        </div>
        <CaretCircle />
      </div>
    </button>
  );
}

function CaretCircle() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] text-slate-500">
      ▼
    </span>
  );
}

function MenuPanel({
  children,
  direction = "down",
  align = "start",
}: {
  children: React.ReactNode;
  direction?: "down" | "up";
  align?: "start" | "end";
}) {
  const positionClass = direction === "up" ? "bottom-full mb-1" : "top-full mt-1";
  const alignClass = align === "end" ? "right-0" : "left-0";
  return (
    <div
      className={`absolute ${alignClass} z-20 min-w-[220px] max-w-[min(320px,calc(100vw-2rem))] max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg ${positionClass}`}
    >
      {children}
    </div>
  );
}

function MenuItem({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className="flex w-full items-start rounded-lg px-3 py-2 text-left text-[12px] leading-5 whitespace-normal break-words"
      style={{
        background: active ? "rgba(125,89,201,0.12)" : "transparent",
        color: disabled ? "#94a3b8" : active ? "#5b3ea5" : "#334155",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
