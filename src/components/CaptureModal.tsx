// src/components/CaptureModal.tsx
import { useState } from "react";
import { Lightbulb, ListTodo } from "lucide-react";
import type { ReminderMode } from "@/lib/brainItemsApi";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode
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

  // En modo modal respetamos "open". En modo embebido se muestra siempre.
  if (!embedded && !open) return null;

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const resetAndClose = () => {
    setText("");
    setMode("choose");
    setDueOption("TODAY");
    setCustomDue("");
    setReminderMode("ON_DUE_DATE");
    setLoading(false);
    if (!embedded) onClose();
  };

  const getDueDateFromOption = (): string | null => {
    // Sin fecha y sin valor manual => null
    if (dueOption === "NONE" && !customDue) return null;

    // Si el usuario ha elegido fecha/hora manual, tiene prioridad
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
      await onCreateTask(text.trim(), dueDate, reminderMode);

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
        <div className="remi-modal-sub">
          {t("capture.subtitle")}
        </div>
      </div>
      {!embedded && (
        <button
          className="remi-btn-ghost"
          onClick={resetAndClose}
          disabled={loading}
        >
          ✕
        </button>
      )}
    </div>
  );

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
          {/* “Es una idea” guarda directamente la idea y muestra el toast */}
          <button
            className="remi-btn-ghost"
            onClick={handleConfirmIdea}
            disabled={loading}
            style={{
              padding: "12px 0",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 999,
            }}
          >
            <Lightbulb size={18} />
            <span>{t("capture.ideaButton")}</span>
          </button>

          {/* “Es una tarea” pasa al paso de configuración de tarea */}
          <button
            className="remi-btn-primary"
            onClick={() => setMode("task")}
            disabled={loading}
            style={{
              padding: "12px 0",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 999,
            }}
          >
            <ListTodo size={18} />
            <span>{t("capture.taskButton")}</span>
          </button>
        </div>
      )}

      {/* Paso 2: configuración de tarea */}
      {mode === "task" && (
        <>
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
                  setCustomDue(formatDateTimeLocal(d));
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
                  setCustomDue(formatDateTimeLocal(d));
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
                  setCustomDue(formatDateTimeLocal(d));
                }}
              />
              <Chip
                label={t("capture.dueNone")}
                active={dueOption === "NONE"}
                onClick={() => {
                  setDueOption("NONE");
                  setCustomDue("");
                }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <input
                type="datetime-local"
                className="remi-input"
                style={{ borderRadius: 14 }}
                value={customDue}
                onChange={(e) => setCustomDue(e.target.value)}
                disabled={dueOption === "NONE"}
              />
              <p
                className="remi-modal-sub"
                style={{ fontSize: 11, marginTop: 4 }}
              >
                {t("capture.dueHint")}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <p className="remi-modal-sub" style={{ marginBottom: 4 }}>
              {t("capture.remindersLabel")}
            </p>
            <select
              className="remi-input"
              style={{ borderRadius: 14 }}
              value={reminderMode}
              onChange={(e) =>
                setReminderMode(e.target.value as ReminderMode)
              }
            >
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
            </select>
          </div>

          <div className="remi-modal-footer">
            <button
              className="remi-btn-ghost"
              onClick={() => setMode("choose")}
              disabled={loading}
            >
              {t("capture.back")}
            </button>
            <button
              className="remi-btn-primary"
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

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={`remi-chip ${active ? "remi-chip--active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
