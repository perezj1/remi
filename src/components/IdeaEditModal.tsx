// src/components/IdeaEditModal.tsx
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  type BrainItem,
  type ReminderMode,
  type RepeatType,
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
  const [dueDateTime, setDueDateTime] = useState<string>("");
  const [reminderMode, setReminderMode] =
    useState<ReminderMode>("NONE");
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Repetición
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("none");

  // --- Date / Time picker estilo CaptureModal ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(20);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const applyDateTime = (dateBase: Date, hour: number, minute: number) => {
    const d = new Date(dateBase);
    d.setHours(hour, minute, 0, 0);
    setSelectedDate(d);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setDueDateTime(formatDateTimeLocal(d));
  };

  const applyDateFromCalendar = (d: Date) => {
    const baseHour = selectedHour ?? 20;
    const baseMinute = selectedMinute ?? 0;
    applyDateTime(d, baseHour, baseMinute);
  };

  // Helpers ISO <-> datetime-local
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

  // Resetear estado al abrir/cerrar o cambiar idea
  useEffect(() => {
    if (!open || !idea) {
      setTitle("");
      setDueDateTime("");
      setReminderMode("NONE");
      setShowTaskOptions(false);
      setRepeatEnabled(false);
      setRepeatType("none");
      setLoading(false);
      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      const d = new Date();
      d.setDate(1);
      setCalendarMonth(d);
      return;
    }

    setTitle(idea.title ?? "");
    setReminderMode(idea.reminder_mode || "NONE");

    if (idea.due_date) {
      const local = isoToLocalDateTimeInput(idea.due_date);
      setDueDateTime(local);

      const d = new Date(local);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setSelectedHour(d.getHours());
        setSelectedMinute(d.getMinutes());
        const m = new Date(d);
        m.setDate(1);
        setCalendarMonth(m);
      }
    } else {
      setDueDateTime("");
      setSelectedDate(null);
      setSelectedHour(20);
      setSelectedMinute(0);
      const d = new Date();
      d.setDate(1);
      setCalendarMonth(d);
    }

    setRepeatEnabled(false);
    setRepeatType("none");
    setShowTaskOptions(false);
    setLoading(false);
  }, [open, idea]);

  // Ajustar reminder cuando no hay fecha
  useEffect(() => {
    const hasDue = !!dueDateTime;
    if (
      !hasDue &&
      (reminderMode === "ON_DUE_DATE" ||
        reminderMode === "DAY_BEFORE_AND_DUE")
    ) {
      setReminderMode("NONE");
    }
  }, [dueDateTime, reminderMode]);

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
    // Primer clic: mostrar opciones
    if (!showTaskOptions) {
      setShowTaskOptions(true);
      return;
    }

    if (!title.trim()) return;

    try {
      setLoading(true);
      const dueISO = localDateTimeInputToISO(dueDateTime);
      const finalRepeatType: RepeatType = repeatEnabled
        ? repeatType
        : "none";

      const converted = await convertIdeaToTask(
        idea.id,
        title.trim(),
        dueISO,
        reminderMode,
        finalRepeatType
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

  const hasDueDate = !!dueDateTime;

  const Separator = () => (
    <div className="mt-3 mb-2 h-px bg-slate-200" />
  );

  // --- helpers calendario ---
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

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
    applyDateFromCalendar(d);
  };

  const handleHourChange = (h: number) => {
    const base = selectedDate ?? new Date();
    applyDateTime(base, h, selectedMinute);
  };

  const handleMinuteChange = (m: number) => {
    const base = selectedDate ?? new Date();
    applyDateTime(base, selectedHour, m);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/35 px-4 py-4 flex items-center justify-center">
      {/* modal más pequeño con scroll interno */}
      <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
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

            {/* Fecha y hora límite (calendario + ruedas) */}
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("ideas.dueDateLabel")}
              </label>

              <div
                style={{
                  marginTop: 6,
                  borderRadius: 16,
                  border: "1px solid rgba(226,232,240,0.9)",
                  background: "#f9fafb",
                  padding: 10,
                }}
              >
                {/* Cabecera calendario */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#64748b",
                    }}
                  >
                    {calendarMonth.toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
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
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Días semana */}
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
                    <div
                      key={w}
                      style={{ textAlign: "center", paddingBottom: 2 }}
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* Celdas calendario */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 2,
                    marginBottom: 8,
                  }}
                >
                  {calendarDays.map((cell, idx) => {
                    const isSelected =
                      selectedDate && isSameDay(cell.date, selectedDate);
                    const isToday = isSameDay(cell.date, new Date());
                    const isCurrent = cell.isCurrentMonth;

                    let bg = "transparent";
                    let color = "#64748b";
                    let fontWeight = 400;
                    let border = "none";

                    if (!isCurrent) {
                      color = "#cbd5f5";
                    }
                    if (isToday && !isSelected) {
                      border = "1px solid rgba(125,89,201,0.35)";
                    }
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
                          height: 30,
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

                {/* Time picker estilo rueda dentro de un bloque blanco */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: "12px 18px",
                      borderRadius: 20,
                      background: "#ffffff",
                      boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  >
                    {/* Horas */}
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        {t("capture.timeHour") ?? "Hora"}
                      </div>
                      <TimeWheel
                        values={hoursOptions}
                        selected={selectedHour}
                        onChange={handleHourChange}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: "#64748b",
                        marginTop: 14,
                      }}
                    >
                      :
                    </div>

                    {/* Minutos */}
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
                      <TimeWheel
                        values={minutesOptions}
                        selected={selectedMinute}
                        onChange={handleMinuteChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador entre FECHA y RECORDATORIOS */}
            <Separator />

            {/* Modo de recordatorio */}
            <div>
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
                {hasDueDate ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <option value="NONE">
                      {t("ideas.reminder.none")}
                    </option>
                    <option value="DAILY_UNTIL_DUE">
                      {t("ideas.reminder.dailyUntilDue")}
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* Separador entre RECORDATORIOS y REPETIR */}
            <Separator />

            {/* Repetir */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {t("repeat.label")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !repeatEnabled;
                      setRepeatEnabled(next);
                      if (!next) {
                        setRepeatType("none");
                      } else if (repeatType === "none") {
                        setRepeatType("daily");
                      }
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
                    label={t("repeat.options.daily")}
                    active={repeatType === "daily"}
                    onClick={() => setRepeatType("daily")}
                  />
                  <RepeatChip
                    label={t("repeat.options.weekly")}
                    active={repeatType === "weekly"}
                    onClick={() => setRepeatType("weekly")}
                  />
                  <RepeatChip
                    label={t("repeat.options.monthly")}
                    active={repeatType === "monthly"}
                    onClick={() => setRepeatType("monthly")}
                  />
                  <RepeatChip
                    label={t("repeat.options.yearly")}
                    active={repeatType === "yearly"}
                    onClick={() => setRepeatType("yearly")}
                  />
                </div>
              )}
              
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

        <p className="mt-3 text-[10px] text-slate-400">
          {t("ideas.footerHint")}
        </p>
      </div>
    </div>
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
      className={`remi-chip text-[11px] ${
        active ? "remi-chip--active" : ""
      }`}
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
    if (value !== selected) {
      onChange(value);
    }
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
      {/* banda central */}
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
