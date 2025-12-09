// src/components/CaptureModal.tsx
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Lightbulb, ListTodo, X } from "lucide-react";
import type { ReminderMode, RepeatType } from "@/lib/brainItemsApi";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode,
    repeatType: RepeatType
  ) => Promise<void>;
  onCreateIdea: (title: string) => Promise<void>;
  /** Cuando es true, se usa como card embebida en Index (sin backdrop) */
  embedded?: boolean;
}

type Mode = "choose" | "task";

export default function CaptureModal({
  open,
  onClose,
  onCreateTask,
  onCreateIdea,
  embedded = false,
}: CaptureModalProps) {
  const { t } = useI18n();

  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("choose");
  const [dueOption, setDueOption] = useState<
    "NONE" | "TODAY" | "TOMORROW" | "WEEK"
  >("TODAY");
  const [customDue, setCustomDue] = useState<string>("");
  const [reminderMode, setReminderMode] =
    useState<ReminderMode>("ON_DUE_DATE");
  const [loading, setLoading] = useState(false);

  // Hábito/repetición
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("none");

  // Date/time picker
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(20);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Opciones de rueda
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  // ----------------- helpers fecha/hora -----------------
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
    setCustomDue(formatDateTimeLocal(d));
  };

  const applyDateFromChip = (d: Date) => {
    applyDateTime(d, d.getHours(), d.getMinutes());
  };

  // Si pasamos a "Sin fecha" y el modo de recordatorio no es válido ahí,
  // lo reseteamos a "NONE"
  useEffect(() => {
    if (
      dueOption === "NONE" &&
      (reminderMode === "ON_DUE_DATE" ||
        reminderMode === "DAY_BEFORE_AND_DUE")
    ) {
      setReminderMode("NONE");
    }
    if (dueOption === "NONE") {
      setCustomDue("");
      setSelectedDate(null);
    }
  }, [dueOption, reminderMode]);

  // Si se activa Hábito, forzamos recordatorios a NONE
  useEffect(() => {
    if (repeatEnabled && reminderMode !== "NONE") {
      setReminderMode("NONE");
    }
  }, [repeatEnabled, reminderMode]);

  // Sincronizar el date/time picker cuando cambie customDue
  useEffect(() => {
    if (!customDue) return;
    const d = new Date(customDue);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDate(d);
    setSelectedHour(d.getHours());
    setSelectedMinute(d.getMinutes());
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [customDue]);

  // Si hay fecha seleccionada, el calendario se mueve a ese mes
  useEffect(() => {
    if (selectedDate) {
      const m = new Date(selectedDate);
      m.setDate(1);
      setCalendarMonth(m);
    }
  }, [selectedDate]);

  // En modo modal respetamos "open". En modo embebido se muestra siempre.
  if (!embedded && !open) return null;

  const resetAndClose = () => {
    setText("");
    setMode("choose");
    setDueOption("TODAY");
    setCustomDue("");
    setReminderMode("ON_DUE_DATE");
    setRepeatEnabled(false);
    setRepeatType("none");
    setSelectedDate(null);
    setSelectedHour(20);
    setSelectedMinute(0);
    if (!embedded) onClose();
  };

  const getDueDateFromOption = (): string | null => {
    // Sin fecha y sin valor manual => null
    if (dueOption === "NONE" && !customDue) return null;

    // Custom picker tiene prioridad
    if (customDue) {
      const d = new Date(customDue);
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
    } else if (dueOption === "NONE") {
      return null;
    }

    return d.toISOString();
  };

  const handleConfirmTask = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const dueDate = getDueDateFromOption();
      const finalRepeatType: RepeatType = repeatEnabled ? repeatType : "none";

      await onCreateTask(
        text.trim(),
        dueDate,
        reminderMode,
        finalRepeatType
      );

      toast.success(t("capture.toastTaskSaved"));
      resetAndClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(t("capture.toastTaskError"));
    }
  };

  const handleConfirmIdea = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await onCreateIdea(text.trim());
      toast.success(t("capture.toastIdeaSaved"));
      resetAndClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(t("capture.toastIdeaError"));
    }
  };

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div className="remi-modal-title">{t("capture.title")}</div>
        <div className="remi-modal-sub">{t("capture.subtitle")}</div>
      </div>
      {!embedded && (
        <button
          type="button"
          onClick={resetAndClose}
          disabled={loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const Separator = () => (
    <div
      style={{
        marginTop: 14,
        marginBottom: 10,
        height: 1,
        background: "rgba(226,232,240,0.9)",
      }}
    />
  );

  const remindersDisabled = repeatEnabled;

  // --------- calendario helpers ----------
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  const buildCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 0 = domingo, 1 = lunes... → lunes = 0
    let startWeekDay = firstOfMonth.getDay();
    startWeekDay = (startWeekDay + 6) % 7;

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // días del mes anterior
    for (let i = 0; i < startWeekDay; i++) {
      const d = new Date(year, month, 1 - (startWeekDay - i));
      days.push({ date: d, isCurrentMonth: false });
    }

    // días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({ date: d, isCurrentMonth: true });
    }

    // días del siguiente mes
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
    if (dueOption === "NONE") return;
    const merged = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      selectedHour,
      selectedMinute,
      0,
      0
    );
    applyDateTime(merged, merged.getHours(), merged.getMinutes());
  };

  const handleHourChange = (h: number) => {
    const base = selectedDate ?? new Date();
    applyDateTime(base, h, selectedMinute);
  };

  const handleMinuteChange = (m: number) => {
    const base = selectedDate ?? new Date();
    applyDateTime(base, selectedHour, m);
  };

  const body = (
    <div className="remi-modal-body">
      <textarea
        className="remi-modal-textarea"
        placeholder={t("capture.textareaPlaceholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Paso 1: elegir tarea o idea */}
      {mode === "choose" && (
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {/* IDEA */}
          <button
            onClick={handleConfirmIdea}
            disabled={loading}
            type="button"
            style={{
              padding: "10px 10px",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 999,
              border: "1px solid rgba(251,191,36,0.4)",
              background: "rgba(251,191,36,0.08)",
              color: "#92400E",
              cursor: loading ? "default" : "pointer",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(251,191,36,0.15)",
                color: "#F59E0B",
              }}
            >
              <Lightbulb size={18} />
            </div>
            <span>{t("capture.ideaButton")}</span>
          </button>

          {/* TAREA */}
          <button
            onClick={() => setMode("task")}
            disabled={loading}
            type="button"
            style={{
              padding: "10px 10px",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 999,
              border: "1px solid rgba(143,49,243,0.5)",
              background: "rgba(143,49,243,0.08)",
              color: "#4C1D95",
              cursor: loading ? "default" : "pointer",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(143,49,243,0.08)",
                color: "#7d59c9",
              }}
            >
              <ListTodo size={18} />
            </div>
            <span>{t("capture.taskButton")}</span>
          </button>
        </div>
      )}

      {/* Paso 2: configuración de tarea */}
      {mode === "task" && (
        <>
          {/* FECHA LÍMITE */}
          <div style={{ marginTop: 10 }}>
            <p className="remi-modal-sub" style={{ marginBottom: 4 }}>
              {t("capture.dueLabel")}
            </p>
            <div className="remi-chip-row">
              <Chip
                label={t("capture.dueToday")}
                active={dueOption === "TODAY"}
                onClick={() => {
                  const d = new Date();
                  d.setHours(20, 0, 0, 0);
                  setDueOption("TODAY");
                  applyDateFromChip(d);
                }}
              />
              <Chip
                label={t("capture.dueTomorrow")}
                active={dueOption === "TOMORROW"}
                onClick={() => {
                  const now = new Date();
                  const d = new Date();
                  d.setDate(now.getDate() + 1);
                  d.setHours(9, 0, 0, 0);
                  setDueOption("TOMORROW");
                  applyDateFromChip(d);
                }}
              />
              <Chip
                label={t("capture.dueWeek")}
                active={dueOption === "WEEK"}
                onClick={() => {
                  const now = new Date();
                  const d = new Date();
                  d.setDate(now.getDate() + 7);
                  d.setHours(9, 0, 0, 0);
                  setDueOption("WEEK");
                  applyDateFromChip(d);
                }}
              />
              <Chip
                label={t("capture.dueNone")}
                active={dueOption === "NONE"}
                disabled={repeatEnabled}
                onClick={() => {
                  setDueOption("NONE");
                  setCustomDue("");
                  setSelectedDate(null);
                }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <p
                className="remi-modal-sub"
                style={{ fontSize: 11, marginTop: 4 }}
              >
                {t("capture.dueHint")}
              </p>

              {/* Picker fecha + hora */}
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  border: "1px solid rgba(226,232,240,0.9)",
                  background: "#f9fafb",
                  padding: 12,
                  opacity: dueOption === "NONE" ? 0.5 : 1,
                  pointerEvents: dueOption === "NONE" ? "none" : "auto",
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
                    marginBottom: 10,
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

                {/* Time picker estilo rueda dentro de un cuadrado blanco */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 4,
                  }}
                >
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
                        fontSize: 22,
                        fontWeight: 500,
                        color: "#64748b",
                        marginTop: 18,
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
          </div>

          {/* RECORDATORIOS */}
          <Separator />

          <div>
            <p className="remi-modal-sub" style={{ marginBottom: 4 }}>
              {t("capture.remindersLabel")}
            </p>
            {remindersDisabled && (
              <p
                className="remi-modal-sub"
                style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}
              >
                {t("capture.remindersDisabledByHabit") ?? ""}
              </p>
            )}
            <select
              className="remi-input"
              style={{
                borderRadius: 14,
                opacity: remindersDisabled ? 0.6 : 1,
                cursor: remindersDisabled ? "not-allowed" : "pointer",
              }}
              value={reminderMode}
              disabled={remindersDisabled}
              onChange={(e) =>
                setReminderMode(e.target.value as ReminderMode)
              }
            >
              {dueOption === "NONE" ? (
                <>
                  <option value="NONE">
                    {t("capture.remindersNone")}
                  </option>
                  <option value="DAILY_UNTIL_DUE">
                    {t("capture.remindersDailyUntilDue")}
                  </option>
                </>
              ) : (
                <>
                  <option value="NONE">
                    {t("capture.remindersNone")}
                  </option>
                  <option value="ON_DUE_DATE">
                    {t("capture.remindersOnDue")}
                  </option>
                  <option value="DAY_BEFORE_AND_DUE">
                    {t("capture.remindersDayBeforeAndDue")}
                  </option>
                  <option value="DAILY_UNTIL_DUE">
                    {t("capture.remindersDailyUntilDue")}
                  </option>
                </>
              )}
            </select>
          </div>

          {/* HÁBITO */}
          <Separator />

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <p className="remi-modal-sub" style={{ marginBottom: 2 }}>
                  {t("repeat.label")}
                </p>
                <p
                  className="remi-modal-sub"
                  style={{ fontSize: 11, opacity: 0.8 }}
                >
                  {t("repeat.help")}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = !repeatEnabled;

                    if (!next) {
                      // Desactivamos hábito
                      setRepeatType("none");
                    } else {
                      // Activamos hábito: si estaba en "Sin fecha" o sin fecha,
                      // forzamos "Hoy" con la hora actual del picker
                      if (dueOption === "NONE" || !selectedDate) {
                        const base = new Date();
                        base.setHours(
                          selectedHour,
                          selectedMinute,
                          0,
                          0
                        );
                        setDueOption("TODAY");
                        applyDateFromChip(base);
                      }
                      setReminderMode("NONE");
                      if (repeatType === "none") {
                        setRepeatType("daily");
                      }
                    }

                    setRepeatEnabled(next);
                  }}
                  style={{
                    width: 50,
                    height: 26,
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.8)",
                    backgroundColor: repeatEnabled
                      ? "rgba(34,197,94,0.18)"
                      : "#e5e7eb",
                    padding: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: repeatEnabled
                      ? "flex-end"
                      : "flex-start",
                    cursor: "pointer",
                    transition:
                      "background-color 0.18s ease, justify-content 0.18s ease",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      backgroundColor: repeatEnabled ? "#22c55e" : "#ffffff",
                      boxShadow:
                        "0 2px 4px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.35)",
                      transition: "background-color 0.18s ease",
                    }}
                  />
                </button>
              </div>
            </div>

            {repeatEnabled && (
              <div
                className="remi-chip-row"
                style={{ marginTop: 8, flexWrap: "wrap", rowGap: 8 }}
              >
                <Chip
                  label={t("repeat.options.daily")}
                  active={repeatType === "daily"}
                  onClick={() => setRepeatType("daily")}
                />
                <Chip
                  label={t("repeat.options.weekly")}
                  active={repeatType === "weekly"}
                  onClick={() => setRepeatType("weekly")}
                />
                <Chip
                  label={t("repeat.options.monthly")}
                  active={repeatType === "monthly"}
                  onClick={() => setRepeatType("monthly")}
                />
                <Chip
                  label={t("repeat.options.yearly")}
                  active={repeatType === "yearly"}
                  onClick={() => setRepeatType("yearly")}
                />
              </div>
            )}
          </div>

          {/* BOTONES FOOTER */}
          <Separator />

          <div
            className="remi-modal-footer"
            style={{
              display: "flex",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              className="remi-btn-ghost"
              style={{ flex: 1 }}
              onClick={() => setMode("choose")}
              disabled={loading}
            >
              {t("capture.back")}
            </button>
            <button
              className="remi-btn-primary"
              style={{ flex: 1 }}
              onClick={handleConfirmTask}
              disabled={loading}
            >
              {t("capture.saveTask")}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Versión card embebida para Index
  if (embedded) {
    return (
      <div
        className="remi-inline-card"
        style={{
          borderRadius: 18,
          background: "#ffffff",
          boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
          padding: "16px 16px 14px",
        }}
      >
        {header}
        {body}
      </div>
    );
  }

  // Versión modal flotante con backdrop
  return (
    <div className="remi-modal-backdrop">
      <div className="remi-modal-card">
        {header}
        {body}
      </div>
    </div>
  );
}

/* ------------ Chip ------------ */

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

  // Sincronizar scroll cuando cambia el valor seleccionado
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
