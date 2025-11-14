// src/pages/Index.tsx
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
} from "react";
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
import { ListTodo, Check, SkipForward } from "lucide-react";

const AVATAR_KEY = "remi_avatar";

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

  // 👇 ahora también recibimos profile desde el AuthContext “pro”
  const { user, signOut, profile } = useAuth();

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"TODAY" | "WEEK" | "MONTH">("TODAY");
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // ---------- Cargar tareas e ideas ----------
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

  // ---------- Avatar desde profiles + fallback localStorage/metadata ----------
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    // 1) fuente principal: tabla profiles (pro)
    let finalUrl: string | null = profile?.avatar_url ?? null;

    // 2) fallback: lo viejo que tuvieras en localStorage (base64)
    if (!finalUrl && typeof window !== "undefined") {
      const stored = window.localStorage.getItem(AVATAR_KEY);
      if (stored && stored !== "null" && stored !== "undefined") {
        finalUrl = stored;
      }
    }

    // 3) fallback extra: metadata del usuario (por si viene de otro proveedor)
    if (!finalUrl) {
      const meta = (user as any)?.user_metadata;
      finalUrl = meta?.avatar_url ?? meta?.picture ?? null;
    }

    setAvatarUrl(finalUrl ?? null);
  }, [user, profile]);

  // Escuchar el evento global del botón + de la BottomNav
  useEffect(() => {
    const handler = () => setCaptureOpen(true);
    window.addEventListener("remi-open-capture", handler);
    return () => window.removeEventListener("remi-open-capture", handler);
  }, []);

  // Cerrar el menú de perfil al hacer clic fuera
  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const topTasks = useMemo(() => {
    const now = new Date();

    const scored = tasks.map((t) => {
      const due = t.due_date ? new Date(t.due_date) : null;
      let score = Number.MAX_SAFE_INTEGER;
      if (due) {
        score = due.getTime() - now.getTime();
      }
      return { ...t, _score: score as number };
    });

    return scored.sort((a, b) => a._score - b._score).slice(0, 4);
  }, [tasks]);

  const todayCount = tasks.length;

  // ---------- creación / actualización de tareas / ideas ----------
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

  // ---------- datos de usuario / perfil para UI ----------
  const displayName =
    (profile?.display_name && profile.display_name.trim() !== ""
      ? profile.display_name
      : user?.email
      ? user.email.split("@")[0]
      : "User") ?? "User";

  const initial = displayName.charAt(0).toUpperCase();

  const handleOpenProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
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
      {/* CABECERA CON DEGRADADO (más pequeña) */}
      <div
        style={{
          padding: "16px 20px 56px",
          background: "linear-gradient(#8F31F3)",
          color: "white",
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
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
              Hola, {displayName} 👋
            </p>
            <h1
              style={{
                fontSize: 20,
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
          <div style={{ position: "relative" }} ref={profileMenuRef}>
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
                overflow: "hidden",
                padding: 0,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "999px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                initial
              )}
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
                  <span style={{ color: "#8F31F3" }}>{displayName}</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenProfile}
                  style={menuButtonStyle}
                >
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={handleShareApp}
                  style={menuButtonStyle}
                >
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
      </div>

      {/* CONTENIDO BLANCO SUPERPUESTO */}
      <div style={{ marginTop: -16, padding: "0 18px 18px" }}>
        {/* FORMULARIO EMBEBIDO: mismo componente que el modal */}
        <div style={{ marginTop: 18, marginBottom: 10 }}>
          <CaptureModal
            open={true}
            embedded
            onClose={() => {}}
            onCreateTask={handleCreateTask}
            onCreateIdea={handleCreateIdea}
          />
        </div>

        {/* pestañas Today/Week/Month debajo del formulario */}
        <div
          style={{
            marginTop: 10,
            marginBottom: 8,
            display: "flex",
            justifyContent: "flex-start",
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
                "remi-tab " +
                (activeTab === "MONTH" ? "remi-tab--active" : "")
              }
              onClick={() => setActiveTab("MONTH")}
            >
              Month
            </button>
          </div>
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
              <div
                key={task.id}
                className="remi-task-row"
                style={{
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 16,
                  background: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15,23,42,0.04)",
                  marginBottom: 8,
                }}
              >
                {/* izquierda: icono + texto */}
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "999px",
                      border: "2px solid #22c55e",
                      background: "rgba(34,197,94,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 4,
                      color: "#16a34a",
                    }}
                  >
                    <ListTodo size={16} />
                  </div>

                  <div>
                    <p
                      className="remi-task-title"
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {task.title}
                    </p>
                    <div className="remi-task-sub">
                      {task.due_date ? "Fecha límite · " : ""}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleString()
                        : "Sin fecha límite"}
                    </div>
                  </div>
                </div>

                {/* derecha: controles */}
                <div
                  style={{
                    textAlign: "right",
                    marginLeft: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      style={{
                        background: "transparent",
                        color: "rgba(245, 170, 39, 0.8)",
                        fontSize: 15,
                        cursor: "pointer",
                        width: 30,
                        height: 30,
                        borderRadius: "999px",
                        border: "1px solid rgba(245, 170, 39, 0.8)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      onClick={() => handlePostpone(task, "DAY")}
                    >
                      <SkipForward size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDone(task)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "999px",
                        border: "1px solid rgba(16,185,129,0.4)",
                        background: "rgba(16,185,129,0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Check size={16} color="#10B981" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal flotante del botón + (mismo componente, modo overlay) */}
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
