// src/pages/Index.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  ReminderMode,
  createIdea,
  createTask,
  fetchActiveIdeas,
  fetchActiveTasks,
  setTaskStatus,
  postponeTask,
} from "@/lib/brainItemsApi";
import CaptureModal from "@/components/CaptureModal";

function formatDueDiff(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= -1) return "Vencida";
  if (diffHours < 0) return "Ahora";
  if (diffHours < 24) return `${Math.round(diffHours)} h`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d`;
}

export default function TodayPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"TODAY" | "WEEK" | "MONTH">("TODAY");

  // Cargar tareas e ideas
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const [t, i] = await Promise.all([
          fetchActiveTasks(user.id),
          fetchActiveIdeas(user.id),
        ]);
        setTasks(t);
        setIdeas(i);
      } catch (err) {
        console.error(err);
        alert("Error cargando tus tareas");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Escuchar el evento global del botón + de la BottomNav
  useEffect(() => {
    const handler = () => setCaptureOpen(true);
    window.addEventListener("remi-open-capture", handler);
    return () => window.removeEventListener("remi-open-capture", handler);
  }, []);

  const topTasks = useMemo(() => {
    const now = new Date();

    const scored = tasks.map((t) => {
      const due = t.due_date ? new Date(t.due_date) : null;
      let score = Number.MAX_SAFE_INTEGER;
      if (due) {
        score = due.getTime() - now.getTime();
      }
      return { ...t, _score: score };
    });

    return scored.sort((a, b) => a._score - b._score).slice(0, 4);
  }, [tasks]);

  const ideaOfTheDay = ideas[0] ?? null;
  const todayCount = tasks.length;

  const handleCreateTask = async (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode
  ) => {
    if (!user) return;
    const created = await createTask(user.id, title, dueDate, reminderMode);
    setTasks((prev) => [...prev, created]);
  };

  const handleCreateIdea = async (title: string) => {
    if (!user) return;
    const created = await createIdea(user.id, title);
    setIdeas((prev) => [created, ...prev]);
  };

  const handleDone = async (task: BrainItem) => {
    const updated = await setTaskStatus(task.id, "DONE");
    setTasks((prev) => prev.filter((t) => t.id !== updated.id));
  };

  const handlePostpone = async (task: BrainItem, option: "DAY" | "WEEK") => {
    const base = task.due_date ? new Date(task.due_date) : new Date();
    if (option === "DAY") base.setDate(base.getDate() + 1);
    if (option === "WEEK") base.setDate(base.getDate() + 7);
    const updated = await postponeTask(task.id, base.toISOString());
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="remi-page">
      {/* CABECERA CON DEGRADADO */}
      <div
        style={{
          padding: "20px 20px 80px",
          background:
            "linear-gradient(145deg, #6c5ce7 0%, #a66bff 45%, #ff6fd8 100%)",
          color: "white",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
        }}
      >
        <div
          className="flex justify-between items-start"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
            </p>
            <h1
              style={{
                fontSize: 22,
                margin: "4px 0 2px",
                fontWeight: 600,
              }}
            >
              Tienes {todayCount} tareas hoy
            </h1>
            <p style={{ fontSize: 11, opacity: 0.85 }}>
              Prioricemos solo lo importante.
            </p>
          </div>
          <button
            onClick={() => setCaptureOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              border: "none",
              background: "rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
          >
            +
          </button>
        </div>

        {/* buscador */}
        
      </div>

      {/* CONTENIDO BLANCO SUPERPUESTO */}
      <div style={{ marginTop: -40, padding: "0 18px 18px" }}>
        {/* sección proyectos fake por ahora */}
        <div>
          
          <div className="remi-project-row">
            <div
              className="remi-project-card"
              style={{
                background:
                  "linear-gradient(145deg, #6c5ce7 0%, #a66bff 70%)",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85 }}>24 tasks</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>App Design</div>
            </div>
            <div
              className="remi-project-card"
              style={{
                background:
                  "linear-gradient(145deg, #ff6f91 0%, #ff9671 70%)",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85 }}>8 tasks</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Personal</div>
            </div>
          </div>
        </div>

        {/* pestañas Today/Week/Month */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="remi-tabs">
            <button
              className={
                "remi-tab " + (activeTab === "TODAY" ? "remi-tab--active" : "")
              }
              onClick={() => setActiveTab("TODAY")}
            >
              Today
            </button>
            <button
              className={
                "remi-tab " + (activeTab === "WEEK" ? "remi-tab--active" : "")
              }
              onClick={() => setActiveTab("WEEK")}
            >
              Week
            </button>
            <button
              className={
                "remi-tab " + (activeTab === "MONTH" ? "remi-tab--active" : "")
              }
              onClick={() => setActiveTab("MONTH")}
            >
              Month
            </button>
          </div>

          {ideaOfTheDay && (
            <span style={{ fontSize: 11, color: "#8b8fa6" }}>
              Idea: {ideaOfTheDay.title.slice(0, 22)}
              {ideaOfTheDay.title.length > 22 ? "…" : ""}
            </span>
          )}
        </div>

        {/* lista de tareas */}
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">Cargando tareas…</span>
            </div>
          )}

          {!loading && topTasks.length === 0 && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">Nada urgente por hoy 🎉</p>
                <p className="remi-task-sub">
                  Usa el botón + para añadir tu primera tarea.
                </p>
              </div>
            </div>
          )}

          {!loading &&
            topTasks.map((task) => (
              <div key={task.id} className="remi-task-row">
                <div className="remi-task-dot" />
                <div>
                  <p className="remi-task-title">{task.title}</p>
                  <div className="remi-task-sub">
                    {task.due_date ? "Fecha límite · " : ""}
                    {task.due_date
                      ? new Date(task.due_date).toLocaleString()
                      : "Sin fecha límite"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="remi-task-time">
                    {formatDueDiff(task.due_date) ?? ""}
                  </div>
                  <button
                    className="text-[11px]"
                    style={{
                      marginTop: 4,
                      border: "none",
                      background: "transparent",
                      color: "#6c5ce7",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                    onClick={() => handleDone(task)}
                  >
                    Hecho
                  </button>
                  <button
                    className="text-[11px]"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#8b8fa6",
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                    onClick={() => handlePostpone(task, "DAY")}
                  >
                    Mañana
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <CaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
      />
    </div>
  );
}
