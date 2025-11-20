// src/pages/Index.tsx
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  BrainItem,
  ReminderMode,
  createIdea,
  createTask,
  fetchActiveIdeas,
  fetchActiveTasks,
  setTaskStatus,
  postponeTask,
  fetchRemiStatusSummary,
  type RemiStatusSummary,
} from "@/lib/brainItemsApi";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/registerPush";
import CaptureModal from "@/components/CaptureModal";
import { ListTodo, Check, SkipForward } from "lucide-react";

const AVATAR_KEY = "remi_avatar";

// (ahora mismo no se usa, si algún día lo usas, pásale t() para traducir los textos)
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

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const { t } = useI18n();

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] =
    useState<RemiStatusSummary | null>(null);

  // popup para activar notificaciones push
  const [showPushModal, setShowPushModal] = useState(false);
  const [registeringPush, setRegisteringPush] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // ---------- Cargar tareas, ideas y resumen de estado ----------
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const [tks, ids, summaryData] = await Promise.all([
          fetchActiveTasks(user.id),
          fetchActiveIdeas(user.id),
          fetchRemiStatusSummary(user.id),
        ]);
        setTasks(tks);
        setIdeas(ids);
        setStatusSummary(summaryData);
      } catch (err) {
        console.error(err);
        alert(t("today.errorLoadingTasks"));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t]);

  // ---------- Porcentaje de "Mente despejada" (tareas + ideas) ----------
  const mindClearPercent = useMemo(() => {
    if (!statusSummary) return 10;
    const totalItems =
      statusSummary.totalItemsStored ??
      statusSummary.totalTasksStored + statusSummary.totalIdeasStored;
    if (totalItems <= 0) return 10;

    return Math.min(
      100,
      30 + Math.round(Math.log10(totalItems + 1) * 35)
    );
  }, [statusSummary]);

  // ---------- Comprobar si ya tiene suscripción push ----------
  useEffect(() => {
    if (
      !user ||
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    // Si el usuario ya bloqueó notificaciones, no insistimos
    if (Notification.permission === "denied") {
      return;
    }

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("remi_push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking push subscription", error);
          return;
        }

        // Si no hay fila, mostramos el popup para activar notificaciones
        if (!data) {
          setShowPushModal(true);
        }
      } catch (err) {
        console.error("Unexpected error checking push subscription", err);
      }
    };

    void checkSubscription();
  }, [user?.id]);

  // ---------- Avatar desde profiles + fallback localStorage/metadata ----------
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    let finalUrl: string | null = profile?.avatar_url ?? null;

    if (!finalUrl && typeof window !== "undefined") {
      const stored = window.localStorage.getItem(AVATAR_KEY);
      if (stored && stored !== "null" && stored !== "undefined") {
        finalUrl = stored;
      }
    }

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

  const todayCount = tasks.length;

  // ---------- Agrupar tareas por fecha (Hoy, Mañana, otras fechas, Sin fecha) ----------
  const dateGroups: DateGroup[] = useMemo(() => {
    if (tasks.length === 0) return [];

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayGroup: DateGroup = {
      key: "TODAY",
      label: t("inbox.sectionToday"),
      items: [],
    };
    const tomorrowGroup: DateGroup = {
      key: "TOMORROW",
      label: t("inbox.sectionTomorrow"),
      items: [],
    };
    const noDateGroup: DateGroup = {
      key: "NO_DATE",
      label: t("inbox.sectionNoDate"),
      items: [],
    };

    const otherDateGroupsMap = new Map<
      string,
      { group: DateGroup; dateMs: number }
    >();

    for (const task of tasks) {
      if (task.due_date) {
        const d = new Date(task.due_date);
        const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (isSameDay(dMid, todayMid)) {
          todayGroup.items.push(task);
        } else if (isSameDay(dMid, tomorrowMid)) {
          tomorrowGroup.items.push(task);
        } else {
          const key = dMid.toISOString().slice(0, 10);
          let stored = otherDateGroupsMap.get(key);
          if (!stored) {
            const label = d.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            stored = {
              group: {
                key,
                label,
                items: [],
              },
              dateMs: dMid.getTime(),
            };
            otherDateGroupsMap.set(key, stored);
          }
          stored.group.items.push(task);
        }
      } else {
        noDateGroup.items.push(task);
      }
    }

    const groups: DateGroup[] = [];
    if (todayGroup.items.length > 0) groups.push(todayGroup);
    if (tomorrowGroup.items.length > 0) groups.push(tomorrowGroup);

    const otherDateGroups = Array.from(otherDateGroupsMap.values())
      .sort((a, b) => a.dateMs - b.dateMs)
      .map((x) => x.group);

    groups.push(...otherDateGroups);

    if (noDateGroup.items.length > 0) groups.push(noDateGroup);

    return groups;
  }, [tasks, t]);

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

     // 👉 Toast al posponer
  if (option === "DAY") {
    toast.success(t("today.postponeDayToast"));
  } else {
    toast.success(t("today.postponeDayToast"));
  }
  };

  // ---------- activar notificaciones push ----------
  const handleEnablePush = async () => {
    if (!user) return;

    setRegisteringPush(true);
    try {
      await registerPushSubscription(user.id);
      setShowPushModal(false);
      toast.success(t("today.pushEnabledToast"));
    } catch (err) {
      console.error("Error registering push subscription", err);
      toast.error(t("today.pushErrorToast"));
    } finally {
      setRegisteringPush(false);
    }
  };

  const handleLater = () => {
    setShowPushModal(false);
  };

  // ---------- datos de usuario / perfil para UI ----------
  const displayName =
    (profile?.display_name && profile.display_name.trim() !== ""
      ? profile.display_name
      : user?.email
      ? user.email.split("@")[0]
      : t("today.defaultUserName")) ?? t("today.defaultUserName");

  const initial = displayName.charAt(0).toUpperCase();

  const handleOpenProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleShareApp = async () => {
    setProfileOpen(false);
    const url = window.location.origin;
    const text = t("today.shareText");

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert(t("today.shareCopied"));
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
      {/* CABECERA CON DEGRADADO + barra "Mente despejada" */}
      <div
        style={{
          padding: "16px 20px 56px",
          background: "linear-gradient(#7d59c9, #7d59c9)",
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
              {t("today.greeting", { name: displayName })}
            </p>
            <h1
              style={{
                fontSize: 20,
                margin: "4px 0 2px",
                fontWeight: 600,
              }}
            >
              {t("today.tasksToday", { count: todayCount })}
            </h1>
            <p style={{ fontSize: 11, opacity: 0.85 }}>
              {t("today.prioritize")}
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
                  {t("today.profileLoggedInAs", { name: displayName })}
                </div>

                <button
                  type="button"
                  onClick={handleOpenProfile}
                  style={menuButtonStyle}
                >
                  {t("today.menuProfile")}
                </button>
                <button
                  type="button"
                  onClick={handleShareApp}
                  style={menuButtonStyle}
                >
                  {t("today.menuShareApp")}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ ...menuButtonStyle, color: "#e74c3c" }}
                >
                  {t("today.menuLogout")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra "Mente despejada" en la cabecera */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              opacity: 0.9,
            }}
          >
            <span>{t("index.clearMind")}</span>
            <span>{mindClearPercent}%</span>
          </div>
          <div
            style={{
              marginTop: 6,
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.28)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${mindClearPercent}%`,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #ffffff, #FDE68A, #FDBA74)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO BLANCO SUPERPUESTO */}
      <div style={{ padding: "0 18px 18px" }}>
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

        {/* pill "Próximas tareas" (mismo estilo que tabs, pero solo texto) */}
        <div
          style={{
            marginTop: 20,
            marginBottom: 8,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div className="remi-tabs">
            <button
              className="remi-tab remi-tab"
              type="button"
              style={{ cursor: "default" }}
            >
              {t("today.tabsNext")}
            </button>
          </div>
        </div>

        {/* lista de tareas agrupadas por fecha */}
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">
                {t("today.loadingTasks")}
              </span>
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">
                  {t("today.noUrgentTitle")}
                </p>
                <p className="remi-task-sub">
                  {t("today.noUrgentSubtitle")}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            dateGroups.map((group) => (
              <div key={group.key}>
                {/* Cabecera de fecha (Hoy, Mañana, Di., fecha…) */}
                <p className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>

                {group.items.map((task) => {
                  const hasDue = !!task.due_date;
                  const dueStr = hasDue
                    ? new Date(task.due_date as string).toLocaleString()
                    : t("today.dueNoDate");

                  return (
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
                          minWidth: 0,
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
                            marginTop: 2,
                            background: "rgba(143,49,243,0.08)",
                            color: "#7d59c9",
                            flexShrink: 0, // el icono no se deforma
                          }}
                        >
                          <ListTodo size={16} />
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <p
                            className="remi-task-title"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {task.title}
                          </p>
                          <div className="remi-task-sub">
                            {hasDue ? t("today.dueLabel") : ""}
                            {dueStr}
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
                              color: "rgba(237, 104, 104, 1)",
                              fontSize: 15,
                              cursor: "pointer",
                              width: 30,
                              height: 30,
                              borderRadius: "999px",
                              border: "1px solid rgba(237, 104, 104, 1)",
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
                  );
                })}
              </div>
            ))}
        </div>
      </div>

      {/* POPUP para activar notificaciones push */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {t("today.pushTitle")}
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              {t("today.pushBody")}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={registeringPush}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md disabled:opacity-70"
              >
                {registeringPush
                  ? t("today.pushEnabling")
                  : t("today.pushEnable")}
              </button>

              <button
                type="button"
                onClick={handleLater}
                className="w-full rounded-full border border-slate-200 text-xs py-2.5 text-slate-600"
              >
                {t("today.pushLater")}
              </button>
            </div>
          </div>
        </div>
      )}

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
