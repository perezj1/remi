// src/pages/Index.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); // si en tu contexto se llama distinto, cámbialo aquí
  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"TODAY" | "WEEK" | "MONTH">("TODAY");
  const [profileOpen, setProfileOpen] = useState(false);

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

  // ---- acciones del menú de perfil ----
  const username = user?.email ? user.email.split("@")[0] : "User";
  const initial = username.charAt(0).toUpperCase();

  const handleOpenProfile = () => {
    setProfileOpen(false);
    // de momento esto lleva a 404 porque aún no tenemos /profile;
    // puedes comentarlo si quieres evitar el 404:
    // navigate("/profile");
  };

  const handleShareApp = async () => {
    setProfileOpen(false);
    const url = window.location.origin;
    const text = "Estoy probando REMI para organizar mis tareas diarias 🙂";

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado al portapapeles");
      } else {
        alert(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
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
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Hola, {username} 👋
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

          {/* BOTÓN PERFIL + MENÚ DESPLEGABLE */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                border: "none",
                background: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                backdropFilter: "blur(6px)",
                cursor: "pointer",
              }}
            >
              {initial}
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  background: "#ffffff",
                  color: "#2d3142",
                  borderRadius: 16,
                  boxShadow: "0 18px 40px rgba(35,18,90,0.35)",
                  padding: "8px 10px",
                  minWidth: 170,
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: "6px 8px 8px",
                    borderBottom: "1px solid rgba(236,235,253,0.9)",
                    marginBottom: 4,
                    fontSize: 11,
                    color: "#8b8fa6",
                  }}
                >
                  Sesión iniciada como{" "}
                  <span style={{ color: "#6c5ce7" }}>{username}</span>
                </div>

                <button type="button" onClick={handleOpenProfile} style={menuButtonStyle}>
                  Perfil
                </button>
                <button type="button" onClick={handleShareApp} style={menuButtonStyle}>
                  Compartir app
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ ...menuButtonStyle, color: "#e74c3c" }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* buscador */}
        <div style={{ marginTop: 16 }}>
          <input
            className="remi-input"
            placeholder="Buscar tarea…"
            onChange={() => {}}
          />
        </div>
      </div>

      {/* CONTENIDO BLANCO SUPERPUESTO */}
      <div style={{ marginTop: -40, padding: "0 18px 18px" }}>
        {/* sección proyectos fake por ahora */}
        <div>
          <p className="remi-section-title">Project</p>
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

const menuButtonStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  padding: "6px 8px",
  fontSize: 13,
  cursor: "pointer",
  borderRadius: 10,
};
