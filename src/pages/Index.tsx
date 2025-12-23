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

// ✅ modal de “Vacía tu mente”
import MindDumpModal from "@/components/MindDumpModal";

// ✅ modal de revisión/creación
import MentalDumpModal from "@/components/MentalDumpModal";

import { SHARE_DRAFT_KEY } from "@/pages/ShareTarget";
import {
  ListTodo,
  Check,
  User,
  Share2,
  Smartphone,
  CalendarPlus,
} from "lucide-react";

const AVATAR_KEY = "remi_avatar";

// ✅ debe coincidir con BottomNav.tsx (por si llega texto dictado desde otra pantalla)
const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
  dateMs?: number;
};

// ✅ Quitado ALL
type FilterMode = "TODAY" | "WEEK" | "NO_DATE";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isShareEntry(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    return params.get("shared") === "1";
  } catch {
    return false;
  }
}

export default function TodayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ modal inicial (MindDumpModal)
  const [mindDumpOpen, setMindDumpOpen] = useState(false);
  const [mindDumpInitialText, setMindDumpInitialText] = useState<string>("");
  const [mindDumpInitialNonce, setMindDumpInitialNonce] = useState(0);

  // ✅ modal de revisión
  const [mentalDumpOpen, setMentalDumpOpen] = useState(false);
  const [mentalDumpInitialText, setMentalDumpInitialText] = useState<string>("");
  const [mentalDumpInitialNonce, setMentalDumpInitialNonce] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] = useState<RemiStatusSummary | null>(
    null
  );

  const [showPushModal, setShowPushModal] = useState(false);
  const [registeringPush, setRegisteringPush] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // ✅ evita que el “auto-open” abra un modal vacío justo después de “share” (replace URL)
  const skipNextAutoOpenRef = useRef(false);

  // ✅ Ahora: Hoy (default), Semana, Sin fecha
  const [filter, setFilter] = useState<FilterMode>("TODAY");

  const activeTasksCount = tasks.length;

  // ✅ MindDump -> abre revisión (MentalDumpModal)
  const openReviewFromMindDump = (text: string) => {
    setMentalDumpInitialText(text);
    setMentalDumpInitialNonce((n) => n + 1);
    setMentalDumpOpen(true);
    setMindDumpOpen(false);
  };

  // ✅ Auto-open del MindDumpModal al entrar en "/"
  // - NO lo dispares si vienes de share (?shared=1) -> lo maneja el effect de share
  // - NO lo dispares si hay texto pendiente (share/dictado) -> lo maneja el handler específico
  // - NO lo dispares tras un replace provocado por share (skipNextAutoOpenRef)
  useEffect(() => {
    if (location.pathname !== "/") return;
    if (typeof window === "undefined") return;

    if (isShareEntry(location.search)) return;

    if (skipNextAutoOpenRef.current) {
      skipNextAutoOpenRef.current = false;
      return;
    }

    // Si hay texto pendiente (share/dictado), no abras vacío primero.
    try {
      const hasShareDraft = !!sessionStorage.getItem(SHARE_DRAFT_KEY);
      if (hasShareDraft) return;
    } catch {}
    try {
      const hasNavDictation = !!sessionStorage.getItem(NAV_DICTATION_KEY);
      if (hasNavDictation) return;
    } catch {}

    setMindDumpInitialText("");
    setMindDumpInitialNonce((n) => n + 1);
    setMindDumpOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.search]);

  // ---------- Leer draft compartido cuando llegamos desde /share-target ----------
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const hasSharedFlag = isShareEntry(location.search);

    const raw = sessionStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) {
      if (hasSharedFlag) {
        // Evita auto-open vacío tras el replace
        skipNextAutoOpenRef.current = true;
        navigate("/", { replace: true });
      }
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { text?: unknown; ts?: unknown };
      const text = String(parsed?.text ?? "").trim();

      sessionStorage.removeItem(SHARE_DRAFT_KEY);

      if (!text) {
        if (hasSharedFlag) {
          skipNextAutoOpenRef.current = true;
          navigate("/", { replace: true });
        }
        return;
      }

      // ✅ abrir el MindDumpModal con el texto compartido
      setMindDumpInitialText(text);
      setMindDumpInitialNonce((n) => n + 1);
      setMindDumpOpen(true);

      // ✅ limpiar el query param ?shared=1 sin disparar auto-open vacío
      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        navigate("/", { replace: true });
      }
    } catch (e) {
      console.error("Invalid share draft JSON", e);
      try {
        sessionStorage.removeItem(SHARE_DRAFT_KEY);
      } catch {}
      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        navigate("/", { replace: true });
      }
    }
  }, [user?.id, location.search, navigate]);

  // ---------- Cargar tareas, ideas y resumen ----------
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

  // ---------- mente despejada ----------
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

    const baseClear = (() => {
      if (items <= 0) return 10;

      if (items === 1) return 18;
      if (items === 2) return 26;
      if (items === 3) return 32;
      if (items === 4) return 38;
      if (items === 5) return 43;

      return Math.min(100, 30 + Math.round(Math.log10(items + 1) * 35));
    })();

    let multiplier: number;

    if (daysSince == null) multiplier = 0.5;
    else if (daysSince <= 0) multiplier = 1;
    else if (daysSince === 1) multiplier = 0.8;
    else if (daysSince === 2) multiplier = 0.7;
    else if (daysSince === 3) multiplier = 0.6;
    else multiplier = 0.5;

    const value = Math.round(baseClear * multiplier);
    return Math.max(10, Math.min(100, value));
  }, [statusSummary]);

  // ---------- comprobar push ----------
  useEffect(() => {
    if (!user || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "denied") return;

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

        if (!data) setShowPushModal(true);
      } catch (err) {
        console.error("Unexpected error checking push subscription", err);
      }
    };

    void checkSubscription();
  }, [user?.id]);

  // ---------- Avatar ----------
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

  // ✅ “remi-open-capture” ahora abre el MindDumpModal (y puede traer texto pendiente)
  useEffect(() => {
    const handler = (ev: Event) => {
      // 1) prioridad: texto pendiente (dictado desde otra pantalla)
      let pending: string | null = null;
      try {
        pending = sessionStorage.getItem(NAV_DICTATION_KEY);
      } catch {
        pending = null;
      }

      if (pending && pending.trim().length > 0) {
        const clean = pending.trim();
        try {
          sessionStorage.removeItem(NAV_DICTATION_KEY);
        } catch {
          // ignore
        }
        setMindDumpInitialText(clean);
        setMindDumpInitialNonce((n) => n + 1);
        setMindDumpOpen(true);
        return;
      }

      // 2) fallback: event.detail.initialText
      const ce = ev as CustomEvent<any>;
      const incomingText =
        typeof ce?.detail?.initialText === "string"
          ? ce.detail.initialText
          : null;

      if (incomingText && incomingText.trim().length > 0) {
        setMindDumpInitialText(incomingText.trim());
        setMindDumpInitialNonce((n) => n + 1);
      } else {
        setMindDumpInitialText("");
        setMindDumpInitialNonce((n) => n + 1);
      }

      setMindDumpOpen(true);
    };

    window.addEventListener("remi-open-capture", handler as EventListener);
    return () =>
      window.removeEventListener("remi-open-capture", handler as EventListener);
  }, []);

  // Descarga mental (manual) -> abre MindDumpModal también
  useEffect(() => {
    const handler = () => {
      setMindDumpInitialText("");
      setMindDumpInitialNonce((n) => n + 1);
      setMindDumpOpen(true);
    };
    window.addEventListener("remi-open-mental-dump", handler);
    return () => window.removeEventListener("remi-open-mental-dump", handler);
  }, []);

  // cerrar menú perfil al click fuera
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

  // ---------- Agrupar tareas ----------
  const { dateGroups, noDateTasks }: { dateGroups: DateGroup[]; noDateTasks: BrainItem[] } =
    useMemo(() => {
      if (tasks.length === 0) {
        return { dateGroups: [], noDateTasks: [] };
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
          if (iso === todayIso) label = t("inbox.sectionToday");
          else if (isSameDay(dMid, tomorrowMid))
            label = t("inbox.sectionTomorrow");
          else {
            label = dMid.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
          }

          group = { key: iso, label, items: [], dateMs: dMid.getTime() };
          groupsMap.set(iso, group);
        }

        if (!group.items.includes(task)) {
          group.items.push(task);
        }
      };

      for (const task of tasks) {
        const mode = (task as any).reminder_mode as ReminderMode | undefined;

        if (!task.due_date) {
          noDate.push(task);
          continue;
        }

        const due = new Date(task.due_date as string);
        const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());

        addTaskToDate(dueMid, task);

        if (mode === "DAY_BEFORE_AND_DUE") {
          const dayBefore = new Date(dueMid);
          dayBefore.setDate(dayBefore.getDate() - 1);
          addTaskToDate(dayBefore, task);
        }

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

      return { dateGroups: dateGroupsArr, noDateTasks: noDate };
    }, [tasks, t]);

  const filteredDateGroups = useMemo(() => {
    if (filter === "NO_DATE") return [];

    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekEndMid = new Date(
      todayMid.getFullYear(),
      todayMid.getMonth(),
      todayMid.getDate() + 7
    );

    return dateGroups.filter((group) => {
      if (!group.dateMs) return false;
      const time = group.dateMs;

      if (filter === "TODAY") return isSameDay(new Date(time), todayMid);
      if (filter === "WEEK")
        return time >= todayMid.getTime() && time <= weekEndMid.getTime();
      return false;
    });
  }, [dateGroups, filter]);

  const hasVisibleDatedTasks = filteredDateGroups.some((g) => g.items.length > 0);
  // ✅ Importante: “Sin fecha” SOLO cuenta si estás en NO_DATE
  const hasNoDateTasks = filter === "NO_DATE" && noDateTasks.length > 0;

  // ---------- crear ----------
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

  // ---------- push ----------
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

  const shouldAutoPreview = mentalDumpInitialText.trim().length > 0;

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
        {/* Filtros */}
        <div
          style={{
            marginTop: 16,
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
            {/* ✅ Sin "Todo". Hoy por defecto */}
            {renderFilterButton("TODAY", t("today.tabsToday") || "Hoy")}
            {renderFilterButton("WEEK", t("today.tabsWeek") || "Semana")}
            {renderFilterButton("NO_DATE", t("today.tabsNoDate") || "Sin fecha")}
          </div>
        </div>

        {/* lista */}
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">{t("today.loadingTasks")}</span>
            </div>
          )}

          {/* ✅ Empty state ajustado:
              - Si NO_DATE -> depende de noDateTasks
              - Si TODAY/WEEK -> depende de dated tasks visibles
          */}
          {!loading && filter !== "NO_DATE" && !hasVisibleDatedTasks && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">{t("today.noUrgentTitle")}</p>
                <p className="remi-task-sub">{t("today.noUrgentSubtitle")}</p>
              </div>
            </div>
          )}

          {!loading && filter === "NO_DATE" && !hasNoDateTasks && (
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
                          {hasDue && (
                            <button
                              type="button"
                              onClick={() => handlePostpone(task, "DAY")}
                              title={
                                t("today.actionPostpone1dTitle") ||
                                "Aplazar: añade 1 día a la fecha límite"
                              }
                              aria-label={
                                t("today.actionPostpone1dTitle") ||
                                "Aplazar: añade 1 día a la fecha límite"
                              }
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "999px",
                                border: "1px solid #C6CDD7",
                                background: "#FFFFFF",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <CalendarPlus size={16} color="#747B88" />
                            </button>
                          )}

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

          {/* ✅ SIN FECHA: solo en NO_DATE */}
          {!loading && filter === "NO_DATE" && noDateTasks.length > 0 && (
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

      {/* ✅ MODAL NUEVO */}
      <MindDumpModal
        open={mindDumpOpen}
        onClose={() => setMindDumpOpen(false)}
        onOpenReview={openReviewFromMindDump}
        initialText={mindDumpInitialText}
        initialTextNonce={mindDumpInitialNonce}
      />

      {/* ✅ MODAL DE REVISIÓN / CREACIÓN */}
      <MentalDumpModal
        open={mentalDumpOpen}
        onClose={() => setMentalDumpOpen(false)}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
        initialText={mentalDumpInitialText}
        initialTextNonce={mentalDumpInitialNonce}
        autoPreview={shouldAutoPreview}
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
