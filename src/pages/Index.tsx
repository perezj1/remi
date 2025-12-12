// src/pages/Index.tsx
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  BrainItem,
  ReminderMode,
  RepeatType,
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
import MentalDumpModal from "@/components/MentalDumpModal";
import { SHARE_DRAFT_KEY } from "@/pages/ShareTarget";
import {
  ListTodo,
  Check,
  SkipForward,
  User,
  Share2,
  Smartphone,
  CalendarPlus,
} from "lucide-react";

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
  dateMs?: number;
};

type FilterMode = "TODAY" | "WEEK" | "ALL" | "NO_DATE";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type ActionPillProps = {
  label: string;
  title: string;
  icon: JSX.Element;
  onClick: () => void;
};

function ActionPill({ label, title, icon, onClick }: ActionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 30,
        padding: "0 10px",
        borderRadius: 999,
        border: "1px solid rgba(143,49,243,0.30)",
        background: "rgba(143,49,243,0.10)",
        color: "#7d59c9",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        transition: "transform 0.08s ease, box-shadow 0.15s ease",
        boxShadow: "0 6px 16px rgba(15,23,42,0.06)",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
      <span style={{ lineHeight: 1 }}>{label}</span>
    </button>
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [mentalDumpOpen, setMentalDumpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] =
    useState<RemiStatusSummary | null>(null);

  // ✅ Share draft -> prefill en CaptureModal
  const [shareDraftText, setShareDraftText] = useState<string | null>(null);
  const [shareDraftNonce, setShareDraftNonce] = useState(0);

  // popup para activar notificaciones push
  const [showPushModal, setShowPushModal] = useState(false);
  const [registeringPush, setRegisteringPush] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // filtro de lista (Hoy / Semana / Todo / Sin fecha)
  const [filter, setFilter] = useState<FilterMode>("TODAY");

  // 👉 contador total de tareas activas (para la cabecera)
  const activeTasksCount = tasks.length;

  // ---------- ✅ Leer draft compartido cuando llegamos desde /share-target ----------
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const params = new URLSearchParams(location.search);
    const hasSharedFlag = params.get("shared") === "1";

    const raw = sessionStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) {
      if (hasSharedFlag) navigate("/", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { text?: unknown; ts?: unknown };
      const text = String(parsed?.text ?? "").trim();

      if (!text) {
        sessionStorage.removeItem(SHARE_DRAFT_KEY);
        if (hasSharedFlag) navigate("/", { replace: true });
        return;
      }

      // Ponemos el texto como prefill (sin pisar lo que el usuario escriba después)
      setShareDraftText(text);
      setShareDraftNonce((n) => n + 1);

      // ✅ MICRO-FIX: borrar el draft tras leerlo (evita que se rellene al recargar)
      sessionStorage.removeItem(SHARE_DRAFT_KEY);

      // Limpiamos el ?shared=1
      if (hasSharedFlag) navigate("/", { replace: true });
    } catch (e) {
      console.error("Invalid share draft JSON", e);
      sessionStorage.removeItem(SHARE_DRAFT_KEY);
      if (hasSharedFlag) navigate("/", { replace: true });
    }
  }, [user?.id, location.search, navigate]);

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

  // ---------- Porcentaje de "Mente despejada" (mismas reglas que Status) ----------
  const mindClearPercent = useMemo(() => {
    if (!statusSummary) return 10;

    const totalItems =
      statusSummary.totalItemsStored ??
      statusSummary.totalTasksStored + statusSummary.totalIdeasStored;

    const items = totalItems;
    const daysSince =
      statusSummary.daysSinceLastActivity !== undefined
        ? statusSummary.daysSinceLastActivity
        : null;

    // 1) Base por cantidad de cosas delegadas en Remi
    const baseClear = (() => {
      if (items <= 0) return 10;

      if (items === 1) return 18;
      if (items === 2) return 26;
      if (items === 3) return 32;
      if (items === 4) return 38;
      if (items === 5) return 43;

      return Math.min(100, 30 + Math.round(Math.log10(items + 1) * 35));
    })();

    // 2) Ajuste por días desde la última actividad
    let multiplier: number;

    if (daysSince == null) {
      multiplier = 0.5;
    } else if (daysSince <= 0) {
      multiplier = 1;
    } else if (daysSince === 1) {
      multiplier = 0.8;
    } else if (daysSince === 2) {
      multiplier = 0.7;
    } else if (daysSince === 3) {
      multiplier = 0.6;
    } else {
      multiplier = 0.5;
    }

    const value = Math.round(baseClear * multiplier);

    return Math.max(10, Math.min(100, value));
  }, [statusSummary]);

  // ---------- Comprobar si ya tiene suscripción push ----------
  useEffect(() => {
    if (!user || typeof window === "undefined" || !("Notification" in window)) {
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

  // Escuchar el evento global del botón + de la BottomNav (Capture)
  useEffect(() => {
    const handler = () => setCaptureOpen(true);
    window.addEventListener("remi-open-capture", handler);
    return () => window.removeEventListener("remi-open-capture", handler);
  }, []);

  // escuchar el evento para la Descarga mental
  useEffect(() => {
    const handler = () => setMentalDumpOpen(true);
    window.addEventListener("remi-open-mental-dump", handler);
    return () => window.removeEventListener("remi-open-mental-dump", handler);
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

  // ---------- Agrupar tareas por fecha + separar "Sin fecha" ----------
  const {
    dateGroups,
    noDateTasks,
    todayCount,
  }: { dateGroups: DateGroup[]; noDateTasks: BrainItem[]; todayCount: number } =
    useMemo(() => {
      if (tasks.length === 0) {
        return { dateGroups: [], noDateTasks: [], todayCount: 0 };
      }

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

      const todayIso = todayMid.toISOString().slice(0, 10);

      const groupsMap = new Map<string, DateGroup>();
      const noDate: BrainItem[] = [];
      let todayCountLocal = 0;

      const addTaskToDate = (dateMid: Date, task: BrainItem) => {
        const dMid = new Date(
          dateMid.getFullYear(),
          dateMid.getMonth(),
          dateMid.getDate()
        );
        const iso = dMid.toISOString().slice(0, 10);

        let group = groupsMap.get(iso);
        if (!group) {
          let label: string;
          if (iso === todayIso) {
            label = t("inbox.sectionToday");
          } else if (isSameDay(dMid, tomorrowMid)) {
            label = t("inbox.sectionTomorrow");
          } else {
            label = dMid.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
          }

          group = {
            key: iso,
            label,
            items: [],
            dateMs: dMid.getTime(),
          };
          groupsMap.set(iso, group);
        }

        if (!group.items.includes(task)) {
          group.items.push(task);
          if (isSameDay(dMid, todayMid)) {
            todayCountLocal += 1;
          }
        }
      };

      for (const task of tasks) {
        const mode = (task as any).reminder_mode as ReminderMode | undefined;

        // --- TAREAS SIN FECHA ---
        if (!task.due_date) {
          noDate.push(task);
          continue;
        }

        // --- TAREAS CON FECHA LÍMITE ---
        const due = new Date(task.due_date as string);
        const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());

        // 1) Siempre se muestran el día de la fecha límite
        addTaskToDate(dueMid, task);

        // 2) Día antes + día de due date
        if (mode === "DAY_BEFORE_AND_DUE") {
          const dayBefore = new Date(dueMid);
          dayBefore.setDate(dayBefore.getDate() - 1);
          addTaskToDate(dayBefore, task);
        }

        // 3) Recordar a diario hasta due date (desde hoy hasta el día anterior)
        if (mode === "DAILY_UNTIL_DUE") {
          const todayMidTime = todayMid.getTime();
          const dueMidTime = dueMid.getTime();

          if (dueMidTime >= todayMidTime) {
            let cursor = new Date(todayMid);
            while (cursor.getTime() < dueMidTime) {
              addTaskToDate(cursor, task);
              cursor = new Date(
                cursor.getFullYear(),
                cursor.getMonth(),
                cursor.getDate() + 1
              );
            }
          }
        }
      }

      const dateGroupsArr = Array.from(groupsMap.values())
        .filter((g) => g.items.length > 0)
        .sort((a, b) => (a.dateMs ?? 0) - (b.dateMs ?? 0));

      return {
        dateGroups: dateGroupsArr,
        noDateTasks: noDate,
        todayCount: todayCountLocal,
      };
    }, [tasks, t]);

  // Grupos filtrados según el modo (Hoy / Semana / Todo / Sin fecha)
  const filteredDateGroups = useMemo(() => {
    if (filter === "NO_DATE") return [];

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const weekEndMid = new Date(
      todayMid.getFullYear(),
      todayMid.getMonth(),
      todayMid.getDate() + 7
    );

    return dateGroups.filter((group) => {
      if (!group.dateMs) return false;
      const time = group.dateMs;

      if (filter === "TODAY") {
        return isSameDay(new Date(time), todayMid);
      }

      if (filter === "WEEK") {
        return time >= todayMid.getTime() && time <= weekEndMid.getTime();
      }

      return true; // ALL
    });
  }, [dateGroups, filter]);

  const hasVisibleDatedTasks = filteredDateGroups.some((g) => g.items.length > 0);
  const hasNoDateTasks = noDateTasks.length > 0;

  // ---------- creación / actualización de tareas / ideas ----------
  const handleCreateTask = async (
    title: string,
    dueDate: string | null,
    reminderMode: ReminderMode,
    repeatType: RepeatType
  ) => {
    if (!user) return;
    const created = await createTask(
      user.id,
      title,
      dueDate,
      reminderMode,
      repeatType
    );
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

    toast.success(t("today.postponeDayToast"));
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
    const url = `${window.location.origin}/landing`;
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

  // reabrir el banner de instalación
  const handleInstallApp = () => {
    setProfileOpen(false);
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("remi-open-install"));
  };

  const renderFilterButton = (mode: FilterMode, label: string) => (
    <button
      key={mode}
      type="button"
      onClick={() => setFilter(mode)}
      className="remi-tab"
      style={{
        cursor: "pointer",
        fontSize: 11,
        padding: "6px 12px",
        borderRadius: 999,
        border: "none",
        background:
          filter === mode ? "rgba(143,49,243,0.18)" : "rgba(248,250,252,1)",
        color: filter === mode ? "#7d59c9" : "#64748b",
        fontWeight: filter === mode ? 600 : 500,
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="remi-page">
      {/* CABECERA */}
      <div
        style={{
          padding: "16px 20px 18px",
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
            <h1 style={{ fontSize: 20, margin: "4px 0 2px", fontWeight: 600 }}>
              {t("today.tasksToday", { count: activeTasksCount })}
            </h1>
            <p style={{ fontSize: 11, opacity: 0.85 }}>{t("today.prioritize")}</p>
          </div>

          {/* PERFIL */}
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

                <button type="button" onClick={handleOpenProfile} style={menuButtonStyle}>
                  <User size={16} style={{ marginRight: 8 }} />
                  <span>{t("today.menuProfile")}</span>
                </button>

                <button type="button" onClick={handleShareApp} style={menuButtonStyle}>
                  <Share2 size={16} style={{ marginRight: 8 }} />
                  <span>{t("today.menuShareApp")}</span>
                </button>

                <button type="button" onClick={handleInstallApp} style={menuButtonStyle}>
                  <Smartphone size={16} style={{ marginRight: 8 }} />
                  <span>{t("today.menuInstallApp")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra "Mente despejada" */}
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
                background: "linear-gradient(90deg, #ffffff, #FDE68A, #FDBA74)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: "0 18px 18px" }}>
        {/* FORMULARIO EMBEBIDO */}
        <div style={{ marginTop: 18, marginBottom: 10 }}>
          <CaptureModal
            open={true}
            embedded
            onClose={() => {}}
            onCreateTask={handleCreateTask}
            onCreateIdea={handleCreateIdea}
            initialText={shareDraftText}
            initialTextNonce={shareDraftNonce}
          />
        </div>

        {/* Filtros */}
        <div
          style={{
            marginTop: 20,
            marginBottom: 8,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div
            className="remi-tabs"
            style={{
              display: "flex",
              gap: 6,
              background: "#f9fafb",
              padding: 4,
              borderRadius: 999,
            }}
          >
            {renderFilterButton("TODAY", t("today.tabsToday") || "Hoy")}
            {renderFilterButton("WEEK", t("today.tabsWeek") || "Semana")}
            {renderFilterButton("ALL", t("today.tabsAll") || "Todo")}
            {renderFilterButton("NO_DATE", t("today.tabsNoDate") || "Sin fecha")}
          </div>
        </div>

        {/* lista de tareas agrupadas por fecha */}
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">{t("today.loadingTasks")}</span>
            </div>
          )}

          {!loading && !hasVisibleDatedTasks && !hasNoDateTasks && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">{t("today.noUrgentTitle")}</p>
                <p className="remi-task-sub">{t("today.noUrgentSubtitle")}</p>
              </div>
            </div>
          )}

          {!loading &&
            filteredDateGroups.map((group) => (
              <div key={group.key}>
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
                            flexShrink: 0,
                          }}
                        >
                          <ListTodo size={16} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* ✅ APLAZAR +1 DÍA (con texto explicativo) */}                          
                          <button
  type="button"
  onClick={() => handlePostpone(task, "DAY")}
  title={t("today.actionPostpone1dTitle") || "Aplazar: añade 1 día a la fecha límite"}
  aria-label={t("today.actionPostpone1dTitle") || "Aplazar: añade 1 día a la fecha límite"}
  style={{
    width: 30,
    height: 30,
    borderRadius: "999px",
    border: "1px solid #C6CDD7",   // borde (como la imagen)
    background: "#FFFFFF",         // fondo blanco (como la imagen)
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  }}
>
  <CalendarPlus size={16} color="#747B88" />  {/* icono (como la imagen) */}
</button>





                          {/* ✅ DONE igual que antes (sin texto) */}
                          <button
                            type="button"
                            onClick={() => handleDone(task)}
                            title={t("today.actionDoneTitle") || "Marcar como completada"}
                            aria-label={t("today.actionDoneTitle") || "Marcar como completada"}
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

          {!loading &&
            hasNoDateTasks &&
            (filter === "ALL" ||
              filter === "TODAY" ||
              filter === "WEEK" ||
              filter === "NO_DATE") && (
              <div>
                <p className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {t("inbox.sectionNoDate")}
                </p>

                {noDateTasks.map((task) => (
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
                          flexShrink: 0,
                        }}
                      >
                        <ListTodo size={16} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
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
                        <div className="remi-task-sub">{t("today.dueNoDate")}</div>
                      </div>
                    </div>

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
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* ✅ SIN FECHA: NO MOSTRAR APLAZAR +1 DÍA */}
                        <button
                          type="button"
                          onClick={() => handleDone(task)}
                          title={t("today.actionDoneTitle") || "Marcar como completada"}
                          aria-label={t("today.actionDoneTitle") || "Marcar como completada"}
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
            )}
        </div>
      </div>

      {/* POPUP push */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">{t("today.pushTitle")}</h2>
            <p className="text-xs text-slate-600 mb-4">{t("today.pushBody")}</p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={registeringPush}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md disabled:opacity-70"
              >
                {registeringPush ? t("today.pushEnabling") : t("today.pushEnable")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal flotante del botón + */}
      <CaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
        initialText={shareDraftText}
        initialTextNonce={shareDraftNonce}
      />

      {/* Modal Descarga mental */}
      <MentalDumpModal
        open={mentalDumpOpen}
        onClose={() => setMentalDumpOpen(false)}
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
  display: "flex",
  alignItems: "center",
};
