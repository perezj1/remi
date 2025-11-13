// src/components/CaptureModal.tsx
import { useState } from "react";
import type { ReminderMode } from "@/lib/brainItemsApi";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode
  ) => Promise<void>;
  onCreateIdea: (title: string) => Promise<void>;
}

type Mode = "choose" | "task" | "idea";

export default function CaptureModal({
  open,
  onClose,
  onCreateTask,
  onCreateIdea,
}: CaptureModalProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("choose");
  const [dueOption, setDueOption] = useState<
    "NONE" | "TODAY" | "TOMORROW" | "WEEK"
  >("TODAY");
  const [reminderMode, setReminderMode] =
    useState<ReminderMode>("ON_DUE_DATE");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setText("");
    setMode("choose");
    setDueOption("TODAY");
    setReminderMode("ON_DUE_DATE");
    setLoading(false);
    onClose();
  };

  const getDueDateFromOption = (): string | null => {
    const now = new Date();
    if (dueOption === "NONE") return null;

    const d = new Date();
    if (dueOption === "TODAY") {
      d.setHours(20, 0, 0, 0);
    } else if (dueOption === "TOMORROW") {
      d.setDate(now.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (dueOption === "WEEK") {
      d.setDate(now.getDate() + 7);
      d.setHours(9, 0, 0, 0);
    }
    return d.toISOString();
  };

  const handleConfirmTask = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const dueDate = getDueDateFromOption();
      await onCreateTask(text.trim(), dueDate, reminderMode);
      resetAndClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Error al crear la tarea");
    }
  };

  const handleConfirmIdea = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onCreateIdea(text.trim());
      resetAndClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Error al crear la idea");
    }
  };

  return (
    <div className="remi-modal-backdrop">
      <div className="remi-modal-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="remi-modal-title">Vaciar la cabeza</div>
            <div className="remi-modal-sub">
              Escribe lo que tengas en mente y decide si es tarea o idea.
            </div>
          </div>
          <button
            className="remi-btn-ghost"
            onClick={resetAndClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="remi-modal-body">
          <textarea
            className="remi-modal-textarea"
            placeholder="Ej: Llevar pan a la escuela el lunes, preguntar receta a mamá..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {mode === "choose" && (
            <div className="remi-modal-footer" style={{ marginTop: 14 }}>
              <button
                className="remi-btn-primary"
                onClick={() => setMode("task")}
              >
                Es una tarea
              </button>
              <button
                className="remi-btn-ghost"
                onClick={() => setMode("idea")}
              >
                Es una idea
              </button>
            </div>
          )}

          {mode === "task" && (
            <>
              <div style={{ marginTop: 10 }}>
                <p className="remi-modal-sub" style={{ marginBottom: 4 }}>
                  Fecha límite
                </p>
                <div className="remi-chip-row">
                  <Chip
                    label="Hoy"
                    active={dueOption === "TODAY"}
                    onClick={() => setDueOption("TODAY")}
                  />
                  <Chip
                    label="Mañana"
                    active={dueOption === "TOMORROW"}
                    onClick={() => setDueOption("TOMORROW")}
                  />
                  <Chip
                    label="1 semana"
                    active={dueOption === "WEEK"}
                    onClick={() => setDueOption("WEEK")}
                  />
                  <Chip
                    label="Sin fecha"
                    active={dueOption === "NONE"}
                    onClick={() => setDueOption("NONE")}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <p className="remi-modal-sub" style={{ marginBottom: 4 }}>
                  Recordatorios
                </p>
                <select
                  className="remi-input"
                  style={{ borderRadius: 14 }}
                  value={reminderMode}
                  onChange={(e) =>
                    setReminderMode(e.target.value as ReminderMode)
                  }
                >
                  <option value="NONE">Sin recordatorios</option>
                  <option value="ON_DUE_DATE">Solo el día límite</option>
                  <option value="DAY_BEFORE_AND_DUE">
                    Día antes y día límite
                  </option>
                  <option value="DAILY_UNTIL_DUE">
                    Cada día hasta la fecha límite
                  </option>
                </select>
              </div>

              <div className="remi-modal-footer">
                <button
                  className="remi-btn-ghost"
                  onClick={() => setMode("choose")}
                  disabled={loading}
                >
                  Atrás
                </button>
                <button
                  className="remi-btn-primary"
                  onClick={handleConfirmTask}
                  disabled={loading}
                >
                  Guardar tarea
                </button>
              </div>
            </>
          )}

          {mode === "idea" && (
            <div className="remi-modal-footer">
              <button
                className="remi-btn-ghost"
                onClick={() => setMode("choose")}
                disabled={loading}
              >
                Atrás
              </button>
              <button
                className="remi-btn-primary"
                onClick={handleConfirmIdea}
                disabled={loading}
              >
                Guardar idea
              </button>
            </div>
          )}
        </div>
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
