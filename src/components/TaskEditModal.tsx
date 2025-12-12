// src/components/TaskEditModal.tsx
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  type BrainItem,
  type ReminderMode,
  type RepeatType,
  updateTask,
} from "@/lib/brainItemsApi";
import { parseDateTimeFromText } from "@/lib/parseDateTimeFromText";

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

  // ✅ Hooks SIEMPRE arriba (antes de cualquier early return)
  const hoursOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutesOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  const weekdayLabels = useMemo(() => {
    const raw = t("tasks.weekdayLabels");
    if (typeof raw === "string" && raw.includes("|")) {
      const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 7) return parts;
    }
    return ["L", "M", "X", "J", "V", "S", "D"];
  }, [t]);

  const [title, setTitle] = useState("");

  // Due / Reminder / Repeat
  const [dueOption, setDueOption] = useState<DueOption>("CUSTOM");
  const [dueDateTime, setDueDateTime] = useState<string>(""); // datetime-local string
  const [reminderMode, setReminderMode] = useState<ReminderMode>("NONE");

  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("none");

  const [loading, setLoading] = useState(false);

  // Date/time picker (estilo CaptureModal)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(20);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);

  // Flags para no pisar decisiones manuales del usuario
  const [manualDateOverride, setManualDateOverride] = useState(false);
  const [manualRepeatOverride, setManualRepeatOverride] = useState(false);

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
      setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      setDueDateTime(formatDateTimeLocal(d));
      setDueOption(option);
    },
    [formatDateTimeLocal]
  );

  const applyDateTimeManual = useCallback(
    (dateBase: Date, hour: number, minute: number, option: DueOption = "CUSTOM") => {
      setManualDateOverride(true);
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
      setDueOption("CUSTOM");
      setDueDateTime("");
      setReminderMode("NONE");
      setRepeatEnabled(false);
      setRepeatType("none");
      setLoading(false);

      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      const d = new Date();
      d.setDate(1);
      setCalendarMonth(d);

      setIsDateTimePickerOpen(false);
      setManualDateOverride(false);
      setManualRepeatOverride(false);
      return;
    }

    setTitle(task.title ?? "");

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
        setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    } else {
      setDueOption("NONE");
      setDueDateTime("");
      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      const d = new Date();
      d.setDate(1);
      setCalendarMonth(d);
      setReminderMode("NONE");
    }

    setIsDateTimePickerOpen(false);
    setManualDateOverride(false);
    setManualRepeatOverride(false);
    setLoading(false);
  }, [open, task, isoToLocalDateTimeInput]);

  // Si no hay fecha, algunos reminders no aplican
  useEffect(() => {
    const hasDue = dueOption !== "NONE" && !!(dueDateTime || selectedDate);
    if (!hasDue && reminderMode !== "NONE") setReminderMode("NONE");
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
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [dueDateTime]);

  // Detectar fecha/hora + hábito desde el texto (como CaptureModal)
  useEffect(() => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const { dueDateISO, repeatHint } = parseDateTimeFromText(trimmed, lang);

    if (dueDateISO && !manualDateOverride) {
      const d = new Date(dueDateISO);
      if (!Number.isNaN(d.getTime())) {
        applyDateTime(d, d.getHours(), d.getMinutes(), "CUSTOM");
      }
    }

    if (!manualRepeatOverride) {
      if (repeatHint) {
        setRepeatEnabled(true);
        setRepeatType(repeatHint as RepeatType);
        setReminderMode("NONE");
      } else {
        setRepeatEnabled(false);
        setRepeatType("none");
      }
    }
  }, [
    title,
    lang,
    manualDateOverride,
    manualRepeatOverride,
    applyDateTime,
  ]);

  // ✅ Early return DESPUÉS de todos los hooks
  if (!open || !task) return null;
  if (task.type !== "task") return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleClearDueDate = () => {
    setManualDateOverride(true);
    setDueOption("NONE");
    setDueDateTime("");
    setSelectedDate(null);
    setReminderMode("NONE");
    setRepeatEnabled(false);
    setRepeatType("none");
    setIsDateTimePickerOpen(false);
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

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const dueISO =
        dueOption === "NONE"
          ? null
          : (localDateTimeInputToISO(dueDateTime) ?? getDueDateFromOption());

      const finalRepeatType: RepeatType = repeatEnabled ? repeatType : "none";
      const finalReminderMode: ReminderMode =
        repeatEnabled || !dueISO ? "NONE" : reminderMode;

      const updated = await updateTask(
        task.id,
        title.trim(),
        dueISO,
        finalReminderMode,
        finalRepeatType
      );

      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error("Error updating task", err);
      alert(t("tasks.updateError") || "Error updating task");
    } finally {
      setLoading(false);
    }
  };

  const Separator = () => <div className="mt-3 mb-2 h-px bg-slate-200" />;

  // -------- calendario helpers ----------
  const buildCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startWeekDay = firstOfMonth.getDay();
    startWeekDay = (startWeekDay + 6) % 7; // lunes = 0

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startWeekDay; i++) {
      const d = new Date(year, month, 1 - (startWeekDay - i));
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({ date: d, isCurrentMonth: true });
    }

    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = buildCalendarDays(calendarMonth);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const handleSelectDay = (d: Date) => {
    const merged = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      selectedHour,
      selectedMinute,
      0,
      0
    );
    applyDateTimeManual(merged, merged.getHours(), merged.getMinutes(), "CUSTOM");
  };

  const handleHourChange = (h: number) => {
    const base = selectedDate ?? new Date();
    applyDateTimeManual(base, h, selectedMinute, "CUSTOM");
  };

  const handleMinuteChange = (m: number) => {
    const base = selectedDate ?? new Date();
    applyDateTimeManual(base, selectedHour, m, "CUSTOM");
  };

  const hasDue = dueOption !== "NONE" && !!(dueDateTime || selectedDate);

  const dateTimePreview =
    hasDue && selectedDate
      ? selectedDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : (t("capture.dateTimeNoneShort") ?? t("tasks.clearDueDate") ?? "—");

  const remindersDisabled = repeatEnabled || !hasDue;

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
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("tasks.fieldTitlePlaceholder") || "Write your task..."}
          />
        </div>

        {/* Opciones */}
        <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {t("tasks.optionsTitle") || "Options"}
          </p>

          {/* Fecha y hora */}
          <div className="mt-2">
            <div className="flex items-center justify-between gap-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("tasks.dueDateLabel") || "Date & time"}
              </label>

              <button
                type="button"
                onClick={handleClearDueDate}
                disabled={loading}
                className="text-[11px] text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
              >
                {t("tasks.clearDueDate") || "Clear"}
              </button>
            </div>

            {/* Chips */}
            <div className="remi-chip-row" style={{ marginTop: 8, flexWrap: "wrap", rowGap: 8 }}>
              <Chip
                label={t("capture.dueToday") || "Today"}
                active={dueOption === "TODAY"}
                onClick={() => {
                  const d = new Date();
                  d.setHours(20, 0, 0, 0);
                  applyDateFromChip(d, "TODAY");
                }}
              />
              <Chip
                label={t("capture.dueTomorrow") || "Tomorrow"}
                active={dueOption === "TOMORROW"}
                onClick={() => {
                  const now = new Date();
                  const d = new Date();
                  d.setDate(now.getDate() + 1);
                  d.setHours(9, 0, 0, 0);
                  applyDateFromChip(d, "TOMORROW");
                }}
              />
              <Chip
                label={t("capture.dueWeek") || "In a week"}
                active={dueOption === "WEEK"}
                onClick={() => {
                  const now = new Date();
                  const d = new Date();
                  d.setDate(now.getDate() + 7);
                  d.setHours(9, 0, 0, 0);
                  applyDateFromChip(d, "WEEK");
                }}
              />
              <Chip
                label={t("capture.dueNone") || "No date"}
                active={dueOption === "NONE"}
                disabled={repeatEnabled}
                onClick={handleClearDueDate}
              />
            </div>

            {/* Preview + desplegable */}
            <button
              type="button"
              onClick={() => {
                if (dueOption === "NONE") return;
                setIsDateTimePickerOpen((p) => !p);
              }}
              disabled={dueOption === "NONE"}
              style={{
                marginTop: 10,
                width: "100%",
                borderRadius: 14,
                border: "1px solid rgba(226,232,240,0.9)",
                background: "#ffffff",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: dueOption === "NONE" ? "not-allowed" : "pointer",
                opacity: dueOption === "NONE" ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.04,
                    color: "#9ca3af",
                  }}
                >
                  {t("capture.dateTimeLabel") ?? t("tasks.dueDateLabel") ?? "Date & time"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: hasDue ? "#111827" : "#9ca3af",
                  }}
                >
                  {dateTimePreview}
                </span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  color: "#6b7280",
                  transform: isDateTimePickerOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease-out",
                }}
              >
                ▾
              </span>
            </button>

            {isDateTimePickerOpen && dueOption !== "NONE" && (
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  border: "1px solid rgba(226,232,240,0.9)",
                  background: "#f9fafb",
                  padding: 12,
                }}
              >
                {/* Header calendario */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    {calendarMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(calendarMonth);
                        d.setMonth(d.getMonth() - 1);
                        setCalendarMonth(d);
                      }}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        border: "none",
                        background: "#e5e7eb",
                        fontSize: 14,
                        color: "#4b5563",
                      }}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(calendarMonth);
                        d.setMonth(d.getMonth() + 1);
                        setCalendarMonth(d);
                      }}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        border: "none",
                        background: "#e5e7eb",
                        fontSize: 14,
                        color: "#4b5563",
                      }}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Labels */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    color: "#9ca3af",
                    marginBottom: 4,
                    gap: 2,
                  }}
                >
                  {weekdayLabels.map((w) => (
                    <div key={w} style={{ textAlign: "center", paddingBottom: 2 }}>
                      {w}
                    </div>
                  ))}
                </div>

                {/* Días */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 2,
                    marginBottom: 10,
                  }}
                >
                  {calendarDays.map((cell, idx) => {
                    const isSelected = !!(selectedDate && isSameDay(cell.date, selectedDate));
                    const isToday = isSameDay(cell.date, new Date());
                    const isCurrent = cell.isCurrentMonth;

                    let bg = "transparent";
                    let color = "#64748b";
                    let fontWeight = 400;
                    let border = "none";

                    if (!isCurrent) color = "#cbd5f5";
                    if (isToday && !isSelected) border = "1px solid rgba(125,89,201,0.35)";
                    if (isSelected) {
                      bg = "#7d59c9";
                      color = "#ffffff";
                      fontWeight = 600;
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDay(cell.date)}
                        style={{
                          width: "100%",
                          height: 32,
                          borderRadius: 999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          background: bg,
                          color,
                          fontWeight,
                          border,
                        }}
                      >
                        {cell.date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Time wheels */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "16px 24px",
                      borderRadius: 24,
                      background: "#ffffff",
                      boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        {t("capture.timeHour") ?? "Hour"}
                      </div>
                      <TimeWheel values={hoursOptions} selected={selectedHour} onChange={handleHourChange} />
                    </div>

                    <div style={{ fontSize: 22, fontWeight: 500, color: "#64748b", marginTop: 18 }}>
                      :
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        {t("capture.timeMinute") ?? "Min"}
                      </div>
                      <TimeWheel values={minutesOptions} selected={selectedMinute} onChange={handleMinuteChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Recordatorios */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {t("tasks.reminderLabel") || "Reminders"}
            </label>

            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
              value={reminderMode}
              disabled={remindersDisabled}
              onChange={(e) => setReminderMode(e.target.value as ReminderMode)}
              style={{
                opacity: remindersDisabled ? 0.6 : 1,
                cursor: remindersDisabled ? "not-allowed" : "pointer",
              }}
            >
              <option value="NONE">{t("tasks.reminder.none") || "None"}</option>
              <option value="ON_DUE_DATE">{t("tasks.reminder.onDue") || "On due date"}</option>
              <option value="DAY_BEFORE_AND_DUE">
                {t("tasks.reminder.dayBeforeAndDue") || "Day before + due date"}
              </option>
              <option value="DAILY_UNTIL_DUE">
                {t("tasks.reminder.dailyUntilDue") || "Daily until due"}
              </option>
            </select>
          </div>

          <Separator />

          {/* Repetir */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-700">
                  {t("repeat.label") || "Repeat"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t("repeat.help") || ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !repeatEnabled;
                    setManualRepeatOverride(true);

                    if (!next) {
                      setRepeatType("none");
                    } else {
                      // si no hay fecha, ponemos una base consistente
                      if (dueOption === "NONE" || !selectedDate) {
                        const base = new Date();
                        base.setHours(selectedHour, selectedMinute, 0, 0);
                        applyDateFromChip(base, "TODAY");
                      }
                      setReminderMode("NONE");
                      if (repeatType === "none") setRepeatType("daily");
                    }

                    setRepeatEnabled(next);
                  }}
                  className={`flex h-6 w-12 items-center rounded-full border px-[3px] transition-colors ${
                    repeatEnabled
                      ? "justify-end border-emerald-400 bg-emerald-100"
                      : "justify-start border-slate-300 bg-slate-200"
                  }`}
                >
                  <div
                    className={`h-[18px] w-[18px] rounded-full shadow-sm transition-colors ${
                      repeatEnabled ? "bg-emerald-500" : "bg-white"
                    }`}
                  />
                </button>
              </div>
            </div>

            {repeatEnabled && (
              <div className="mt-2 flex flex-wrap gap-2">
                <RepeatChip
                  label={t("repeat.options.daily") || "Daily"}
                  active={repeatType === "daily"}
                  onClick={() => {
                    setRepeatType("daily");
                    setManualRepeatOverride(true);
                  }}
                />
                <RepeatChip
                  label={t("repeat.options.weekly") || "Weekly"}
                  active={repeatType === "weekly"}
                  onClick={() => {
                    setRepeatType("weekly");
                    setManualRepeatOverride(true);
                  }}
                />
                <RepeatChip
                  label={t("repeat.options.monthly") || "Monthly"}
                  active={repeatType === "monthly"}
                  onClick={() => {
                    setRepeatType("monthly");
                    setManualRepeatOverride(true);
                  }}
                />
                <RepeatChip
                  label={t("repeat.options.yearly") || "Yearly"}
                  active={repeatType === "yearly"}
                  onClick={() => {
                    setRepeatType("yearly");
                    setManualRepeatOverride(true);
                  }}
                />
              </div>
            )}
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

/* ------------ Chips ------------ */

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function Chip({ label, active, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      className={`remi-chip ${active ? "remi-chip--active" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

interface RepeatChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function RepeatChip({ label, active, onClick }: RepeatChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`remi-chip text-[11px] ${active ? "remi-chip--active" : ""}`}
    >
      {label}
    </button>
  );
}

/* ------------ TimeWheel ------------ */

interface TimeWheelProps {
  values: number[];
  selected: number;
  onChange: (value: number) => void;
}

function TimeWheel({ values, selected, onChange }: TimeWheelProps) {
  const itemHeight = 32;
  const visibleItems = 3;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const idx = values.indexOf(selected);
    if (idx === -1 || !ref.current) return;
    const target = idx * itemHeight;
    ref.current.scrollTo({ top: target, behavior: "smooth" });
  }, [selected, values]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const idx = Math.round(scrollTop / itemHeight);
    const clamped = Math.min(Math.max(idx, 0), values.length - 1);
    const value = values[clamped];
    if (value !== selected) onChange(value);
  };

  return (
    <div
      style={{
        position: "relative",
        width: 96,
        height: itemHeight * visibleItems,
        borderRadius: 999,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: itemHeight,
          transform: "translateY(-50%)",
          borderTop: "1px solid rgba(148,163,184,0.35)",
          borderBottom: "1px solid rgba(148,163,184,0.35)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="remi-timewheel-scroll"
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          paddingTop: ((visibleItems - 1) / 2) * itemHeight,
          paddingBottom: ((visibleItems - 1) / 2) * itemHeight,
        }}
      >
        {values.map((v) => {
          const isActive = v === selected;
          return (
            <div
              key={v}
              style={{
                height: itemHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                fontSize: isActive ? 22 : 16,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#111827" : "#9ca3af",
              }}
            >
              {String(v).padStart(2, "0")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
