// src/components/CaptureModal.tsx
import { useState } from "react";
import { ClipboardList, Lightbulb, ListTodo } from "lucide-react";
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
  /** Cuando es true, se usa como card embebida en Index (sin backdrop) */
  embedded?: boolean;
}

type Mode = "choose" | "task" | "idea";

export default function CaptureModal({
  open,
  onClose,
  onCreateTask,
  onCreateIdea,
  embedded = false,
}: CaptureModalProps) {
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

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div className="remi-modal-title">Vaciar la cabeza</div>
        <div className="remi-modal-sub">
          Escribe lo que tengas en mente y decide si es tarea o idea.
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
        placeholder="Ej: Enviar el email, preguntar receta a mamá..."
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
          <button
            className="remi-btn-ghost"
            onClick={() => setMode("idea")}
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
            <span>Es una idea</span>
          </button>
          <button
            className="remi-btn-primary"
            onClick={() => setMode("task")}
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
            <span>Es una tarea</span>
          </button>
          
        </div>
      )}

      {/* Paso 2: configuración de tarea */}
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
                onClick={() => {
                  const d = new Date();
                  d.setHours(20, 0, 0, 0);
                  setDueOption("TODAY");
                  setCustomDue(formatDateTimeLocal(d));
                }}
              />
              <Chip
                label="Mañana"
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
                label="1 semana"
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
                label="Sin fecha"
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
                Puedes ajustar la fecha y hora manualmente.
              </p>
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

      {/* Paso 2: guardar idea */}
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
