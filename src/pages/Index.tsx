// src/pages/Index.tsx
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
  type ReactNode,
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
  List,
  Check,
  User,
  Share2,
  Smartphone,
  CalendarPlus,
  Sparkles,
  ClipboardPaste,
  CalendarDays,
  HeartPulse,
  Bell,
  ArrowRight,
  ChevronDown,
  Keyboard,
  Download,
  Lightbulb,
} from "lucide-react";

const AVATAR_KEY = "remi_avatar";

// ✅ debe coincidir con BottomNav.tsx (por si llega texto dictado desde otra pantalla)
const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";

// ✅ persistir “no mostrar más” para tips
const TIP_DISMISS_KEY = "remi_tip_dismissed_v1";

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

type TipCardItem = {
  id: string;
  title: string;
  body: string;
  cta?: string;
  icon: ReactNode;
  bg: string; // compatibilidad
  border: string; // compatibilidad
  onClick?: () => void;
};

const DECK_CARD_W = 260;
const DECK_CARD_H = 300;
const DECK_OVERLAP = -30;

// ✅ key fija para "Sin fecha"
const NO_DATE_GROUP_KEY = "__NO_DATE__";

export default function TodayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const safeT = (key: string, fallback: string, vars?: Record<string, any>) => {
    const v = t(key as any, vars as any);
    if (!v || v === key) return fallback;
    return v;
  };

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ modal inicial (MindDumpModal)
  const [mindDumpOpen, setMindDumpOpen] = useState(false);
  const [mindDumpInitialText, setMindDumpInitialText] = useState<string>("");
  const [mindDumpInitialNonce, setMindDumpInitialNonce] = useState(0);

  // ✅ modal de revisión
  const [mentalDumpOpen, setMentalDumpOpen] = useState(false);
  const [mentalDumpInitialText, setMentalDumpInitialText] =
    useState<string>("");
  const [mentalDumpInitialNonce, setMentalDumpInitialNonce] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] = useState<RemiStatusSummary | null>(
    null
  );

  const [showPushModal, setShowPushModal] = useState(false);
  const [registeringPush, setRegisteringPush] = useState(false);

  // ✅ estado de push real (para ocultar la tarjeta si ya está activado)
  const [hasPushSubscription, setHasPushSubscription] = useState<boolean | null>(
    null
  );

  // ✅ dismiss de tips
  const [dismissedTips, setDismissedTips] = useState<Record<string, boolean>>(
    {}
  );

  // ✅ detectar PWA/standalone e iOS (para tips)
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // ✅ modal ayuda dictado iOS
  const [showIosDictationHelp, setShowIosDictationHelp] = useState(false);

  // ✅ modal: ejemplos “Atajos”
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // ✅ tick para re-evaluar “Cierre del día” sin recargar
  const [nowTick, setNowTick] = useState(0);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // ✅ evita que el “auto-open” abra un modal vacío justo después de “share”
  const skipNextAutoOpenRef = useRef(false);

  // ✅ Ahora: Hoy (default), Semana, Sin fecha
  const [filter, setFilter] = useState<FilterMode>("TODAY");

  // ✅ plegar/desplegar por grupo (por defecto TODO abierto)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const isCollapsed = (key: string) => !!collapsedGroups[key];
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeTasksCount = tasks.length;

  // ✅ MindDump -> abre revisión (MentalDumpModal)
  const openReviewFromMindDump = (text: string) => {
    setMentalDumpInitialText(text);
    setMentalDumpInitialNonce((n) => n + 1);
    setMentalDumpOpen(true);
    setMindDumpOpen(false);
  };

  // ✅ helper: ocultar tips
  const dismissTip = (id: string) => {
    setDismissedTips((prev) => {
      const next = { ...prev, [id]: true };
      try {
        localStorage.setItem(TIP_DISMISS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // ✅ cargar dismiss de tips
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(TIP_DISMISS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setDismissedTips(parsed as Record<string, boolean>);
      }
    } catch {}
  }, []);

  // ✅ detectar iOS + standalone
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const iPadOS =
      ua.includes("Macintosh") && (navigator as any).maxTouchPoints > 1;

    setIsIOSDevice(iOS || iPadOS);

    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (navigator as any).standalone === true;

    setIsStandalone(!!standalone);
  }, []);

  // ✅ tick (cada minuto) para condiciones temporales (p.ej. “Cierre del día”)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNowTick((x) => x + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // ✅ Auto-open del MindDumpModal al entrar en "/"
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

      setMindDumpInitialText(text);
      setMindDumpInitialNonce((n) => n + 1);
      setMindDumpOpen(true);

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
        alert(safeT("today.errorLoadingTasks", "Error cargando tareas"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

    // si está denegado, no podemos pedir permiso -> ocultamos “activar” para no molestar
    if (Notification.permission === "denied") {
      setHasPushSubscription(true);
      setShowPushModal(false);
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

        const hasSub = !!data;
        setHasPushSubscription(hasSub);

        if (!hasSub) setShowPushModal(true);
        else setShowPushModal(false);
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
        } catch {}
        setMindDumpInitialText(clean);
        setMindDumpInitialNonce((n) => n + 1);
        setMindDumpOpen(true);
        return;
      }

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
  const {
    dateGroups,
    noDateTasks,
  }: { dateGroups: DateGroup[]; noDateTasks: BrainItem[] } = useMemo(() => {
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
        if (iso === todayIso) label = safeT("inbox.sectionToday", "Hoy");
        else if (isSameDay(dMid, tomorrowMid))
          label = safeT("inbox.sectionTomorrow", "Mañana");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, t]);

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

      if (filter === "TODAY") return isSameDay(new Date(time), todayMid);
      if (filter === "WEEK")
        return time >= todayMid.getTime() && time <= weekEndMid.getTime();
      return false;
    });
  }, [dateGroups, filter]);

  const hasVisibleDatedTasks = filteredDateGroups.some((g) => g.items.length > 0);
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
    setTasks((prev) => prev.filter((tt) => tt.id !== updated.id));
  };

  const handlePostpone = async (task: BrainItem, option: "DAY" | "WEEK") => {
    const base = task.due_date ? new Date(task.due_date) : new Date();
    if (option === "DAY") base.setDate(base.getDate() + 1);
    if (option === "WEEK") base.setDate(base.getDate() + 7);

    const updated = await postponeTask(task.id, base.toISOString());
    setTasks((prev) => prev.map((tt) => (tt.id === updated.id ? updated : tt)));

    toast.success(safeT("today.postponeDayToast", "Aplazado"));
  };

  // ---------- push ----------
  const handleEnablePush = async () => {
    if (!user) return;

    setRegisteringPush(true);
    try {
      await registerPushSubscription(user.id);
      setShowPushModal(false);
      setHasPushSubscription(true);
      toast.success(safeT("today.pushEnabledToast", "Notificaciones activadas"));
    } catch (err) {
      console.error("Error registering push subscription", err);
      toast.error(safeT("today.pushErrorToast", "No se pudo activar push"));
    } finally {
      setRegisteringPush(false);
    }
  };

  const displayName =
    (profile?.display_name && profile.display_name.trim() !== ""
      ? profile.display_name
      : user?.email
      ? user.email.split("@")[0]
      : safeT("today.defaultUserName", "Usuario")) ??
    safeT("today.defaultUserName", "Usuario");

  const initial = displayName.charAt(0).toUpperCase();

  const handleOpenProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleShareApp = async () => {
    setProfileOpen(false);
    const url = `${window.location.origin}/landing`;
    const text = safeT("today.shareText", "Prueba REMI");

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert(safeT("today.shareCopied", "Copiado"));
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

  const renderFilterButton = (mode: FilterMode, label: string) => {
    const active = filter === mode;

    return (
      <button
        key={mode}
        type="button"
        onClick={() => setFilter(mode)}
        className="remi-tab"
        style={{
          cursor: "pointer",
          border: "none",
          outline: "none",
          padding: "10px 16px",
          borderRadius: 999,
          background: active ? "rgba(125,89,201,0.14)" : "transparent",
          color: active ? "#7d59c9" : "rgba(100,116,139,0.95)",
          fontSize: 13,
          fontWeight: active ? 700 : 600,
          lineHeight: 1,
          transition: "background 0.18s ease, color 0.18s ease",
        }}
      >
        {label}
      </button>
    );
  };

  const shouldAutoPreview = mentalDumpInitialText.trim().length > 0;

  const handleOpenMindDump = (prefill?: string) => {
    setMindDumpInitialText(prefill ?? "");
    setMindDumpInitialNonce((n) => n + 1);
    setMindDumpOpen(true);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!("clipboard" in navigator) || !navigator.clipboard?.readText) {
        toast.error("El portapapeles no está disponible aquí");
        handleOpenMindDump("");
        return;
      }

      const txt = (await navigator.clipboard.readText())?.trim?.() ?? "";
      if (!txt) {
        toast.message("Portapapeles vacío (o sin permiso). Abro Remi igualmente 🙂");
        handleOpenMindDump("");
        return;
      }
      handleOpenMindDump(txt);
    } catch (e) {
      console.error(e);
      toast.error("No pude leer el portapapeles (permiso). Abro Remi igualmente 🙂");
      handleOpenMindDump("");
    }
  };

  // ✅ Condición: “Cierre del día”
  const shouldShowDayCloseTip = useMemo(() => {
    const hour = new Date().getHours(); // hora local
    const isEvening = hour >= 17; // tarde/noche
    const daysSince = statusSummary?.daysSinceLastActivity;

    // “daysSinceLastActivity > 0” (o desconocido)
    const inactive = daysSince == null ? true : daysSince > 0;

    return isEvening && inactive;
  }, [statusSummary?.daysSinceLastActivity, nowTick]);

  // ✅ Condición: tip push (solo si permission !== granted y NO hay fila en remi_push_subscriptions)
  const shouldShowPushTip = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;

    return Notification.permission !== "granted" && hasPushSubscription === false;
  }, [hasPushSubscription]);

  // ✅ Carrusel de tips (ordenado por importancia)
  const tipCards: TipCardItem[] = useMemo(() => {
    const noDateCount = noDateTasks.length;
    const cards: TipCardItem[] = [];

    // 1) Instalar como app
    if (!isStandalone) {
      cards.push({
        id: "install",
        title: safeT("today.tip.install.title", "Instala Remi como app"),
        body: safeT(
          "today.tip.install.body",
          "Ábrela en 1 toque y funciona más fluida como una app."
        ),
        cta: safeT("today.tip.install.cta", "Instalar"),
        icon: <Download size={18} />,
        bg: "",
        border: "rgba(125,89,201,0.70)",
        onClick: () => handleInstallApp(),
      });
    }

    // 2) Activar notificaciones (condición exacta que pediste)
    if (shouldShowPushTip) {
      cards.push({
        id: "push",
        title: safeT("today.tip.push.title", "Que Remi te avise por ti"),
        body: safeT(
          "today.tip.push.body",
          "Activa notificaciones y suelta la carga mental. Remi te toca el hombro cuando toca."
        ),
        cta: safeT("today.tip.push.cta", "Activar"),
        icon: <Bell size={18} />,
        bg: "",
        border: "rgba(99,102,241,0.65)",
        onClick: () => setShowPushModal(true),
      });
    }

    // 3) Activar micrófono (iOS dictado)
    if (isIOSDevice && !dismissedTips["ios-dictation"]) {
      cards.push({
        id: "ios-dictation",
        title: safeT(
          "today.tip.iosDict.title",
          "Activa el micrófono del teclado"
        ),
        body: safeT(
          "today.tip.iosDict.body",
          "Si no ves el micro en el teclado, actívalo en Ajustes y dicta más rápido."
        ),
        cta: safeT("today.tip.iosDict.cta", "Ver cómo"),
        icon: <Keyboard size={18} />,
        bg: "",
        border: "rgba(59,130,246,0.65)",
        onClick: () => setShowIosDictationHelp(true),
      });
    }

    // 4) Tareas sin fecha (si existen)
    if (noDateCount > 0) {
      const key =
        noDateCount === 1
          ? "today.tip.noDate.title_one"
          : "today.tip.noDate.title_other";

      cards.push({
        id: "no-date",
        title: safeT(
          key,
          `Tienes ${noDateCount} tarea${noDateCount === 1 ? "" : "s"} sin fecha`,
          { count: noDateCount }
        ),
        body: safeT(
          "today.tip.noDate.body",
          "¿Las ordenamos? En 30s te dejo la lista limpia."
        ),
        cta: safeT("today.tip.noDate.cta", "Ver sin fecha"),
        icon: <CalendarDays size={18} />,
        bg: "",
        border: "rgba(16,185,129,0.65)",
        onClick: () => setFilter("NO_DATE"),
      });
    }

    // 5) NUEVO: Palabras que ahorran tiempo (abre modal ejemplos, sin permisos)
    cards.push({
      id: "shortcuts",
      title: safeT("today.tip.shortcuts.title", "Palabras que ahorran tiempo"),
      body: safeT(
        "today.tip.shortcuts.body",
        "Una idea = empieza con ‘Idea: …’. Una tarea = empieza con un verbo."
      ),
      cta: safeT("today.tip.shortcuts.cta", "Ver ejemplos"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => setShowShortcutsModal(true),
    });

    // 6) NUEVO: Cierre del día (condición tarde/noche + inactividad)
    if (shouldShowDayCloseTip) {
      cards.push({
        id: "day-close",
        title: safeT("today.tip.dayClose.title", "Cierre de 60 segundos"),
        body: safeT(
          "today.tip.dayClose.body",
          "¿Qué te preocupa para mañana? Suéltalo y listo."
        ),
        cta: safeT("today.tip.dayClose.cta", "Soltar"),
        icon: <HeartPulse size={18} />,
        bg: "",
        border: "rgba(244,63,94,0.60)",
        onClick: () => handleOpenMindDump(""),
      });
    }

    // 7) Pegar texto
    cards.push({
      id: "paste",
      title: safeT("today.tip.paste.title", "¿Has probado a pegar texto?"),
      body: safeT(
        "today.tip.paste.body",
        "Copia cualquier cosa (WhatsApp, Mail, Notas) y deja que Remi lo ordene."
      ),
      cta: safeT("today.tip.paste.cta", "Pegar ahora"),
      icon: <ClipboardPaste size={18} />,
      bg: "",
      border: "rgba(59,130,246,0.65)",
      onClick: () => void handlePasteFromClipboard(),
    });

    // 8) Compartir a Remi (flujo)
    if (!dismissedTips["share-to-remi"]) {
      cards.push({
        id: "share-to-remi",
        title: safeT("today.tip.shareToRemi.title", "Guarda cosas con “Compartir”"),
        body: safeT(
          "today.tip.shareToRemi.body",
          "Desde WhatsApp/Correo/Notas: Compartir → Remi. Se abre listo para ordenar."
        ),
        cta: safeT("today.tip.shareToRemi.cta", "Entendido"),
        icon: <Share2 size={18} />,
        bg: "",
        border: "rgba(14,165,233,0.65)",
        onClick: () => {
          toast.message(
            safeT(
              "today.tip.shareToRemi.toast",
              "Tip: en otra app pulsa “Compartir” → “Remi” para mandarlo directo 🙂"
            )
          );
          dismissTip("share-to-remi");
        },
      });
    }

    // 9) Escribir como hablas
    cards.push({
      id: "natural",
      title: safeT("today.tip.natural.title", "Escribe como hablas"),
      body: safeT(
        "today.tip.natural.body",
        "Ej: “Pagar la luz mañana a las 6 de la tarde”. Remi lo ordena y tú te olvidas."
      ),
      cta: safeT("today.tip.natural.cta", "Probar ejemplo"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(16,185,129,0.65)",
      onClick: () =>
        handleOpenMindDump(
          safeT("today.tip.natural.prefill", "Pagar la luz mañana 18:00")
        ),
    });

    
    // 10) atajos inteligentes
cards.push({
  id: "smart-shortcuts",
  title: safeT("today.tip.shortcuts.title", "Atajos inteligentes (ahorran 10s)"),
  body: safeT(
    "today.tip.shortcuts.body",
    "Usa los atajos como Comprar/Llamar/Pagar para empezar en 1 toque."
  ),
  cta: safeT("today.tip.shortcuts.cta", "Probar ahora"),
  icon: <Sparkles size={18} />,
  bg: "",
  border: "rgba(125,89,201,0.70)",
  onClick: () =>
    handleOpenMindDump(
      
    ),
});




    // 11) Semana
    cards.push({
      id: "week",
      title: safeT("today.tip.week.title", "Plan rápido"),
      body: safeT(
        "today.tip.week.body",
        "Mira tu semana en 1 gesto. Lo urgente primero, lo demás fuera de la cabeza."
      ),
      cta: safeT("today.tip.week.cta", "Ver semana"),
      icon: <CalendarDays size={18} />,
      bg: "",
      border: "rgba(14,165,233,0.65)",
      onClick: () => setFilter("WEEK"),
    });

    // 12) Mini pausa
    cards.push({
      id: "mental",
      title: safeT("today.tip.mental.title", "Mini pausa"),
      body: safeT(
        "today.tip.mental.body",
        "Respira 4s, suelta 6s. Tu mente no necesita hacerlo todo hoy."
      ),
      cta: safeT("today.tip.mental.cta", "Vaciar mente"),
      icon: <HeartPulse size={18} />,
      bg: "",
      border: "rgba(244,63,94,0.60)",
      onClick: () => handleOpenMindDump(""),
    });

    // 13) Cumpleaños
    cards.push({
      id: "birthday",
      title: safeT("today.tip.birthday.title", "¿Cumpleaños cerca?"),
      body: safeT(
        "today.tip.birthday.body",
        "Escríbelo en 5 segundos y Remi te lo recordará cuando toque."
      ),
      cta: safeT("today.tip.birthday.cta", "Añadir"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(253,186,116,0.85)",
      onClick: () =>
        handleOpenMindDump(
          safeT("today.tip.birthday.prefill", "Cumpleaños de ___ el ___")
        ),
    });

    // ✅ “sin tareas sin fecha” (solo si NO hay tareas sin fecha)
    if (noDateCount === 0) {
      cards.push({
        id: "clean-no-date",
        title: safeT("today.tip.cleanNoDate.title", "✅ Sin tareas sin fecha"),
        body: safeT(
          "today.tip.cleanNoDate.body",
          "Perfecto. Ahora es fácil priorizar."
        ),
        cta: safeT("today.tip.cleanNoDate.cta", "Ver hoy"),
        icon: <Sparkles size={18} />,
        bg: "",
        border: "rgba(125,89,201,0.70)",
        onClick: () => setFilter("TODAY"),
      });
    }

    // ✅ IMPORTANTE: eliminado el tip “clear-mind” (Mente despejada %)
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    noDateTasks.length,
    t,
    isStandalone,
    isIOSDevice,
    dismissedTips,
    shouldShowPushTip,
    shouldShowDayCloseTip,
  ]);

  // ✅ Deck: índice activo para los “puntitos”
  const deckRef = useRef<HTMLDivElement | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const computeActiveTipIndex = () => {
    const el = deckRef.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const centerX = el.scrollLeft + el.clientWidth / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(nodeCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    setActiveTipIndex(bestIdx);
  };

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        computeActiveTipIndex();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    computeActiveTipIndex();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipCards.length]);

  useEffect(() => {
    setActiveTipIndex((i) => Math.max(0, Math.min(i, tipCards.length - 1)));
  }, [tipCards.length]);

  const scrollToTip = (index: number) => {
    const el = deckRef.current;
    if (!el) return;

    const child = el.querySelector(
      `[data-tip-index="${index}"]`
    ) as HTMLElement | null;

    if (!child) return;

    const target =
      child.offsetLeft - (el.clientWidth / 2 - child.clientWidth / 2);

    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="remi-page">
      {/* ✅ CSS local para ocultar scrollbars del deck */}
      <style>
        {`
          .remi-tipDeck {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .remi-tipDeck::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}
      </style>

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
              {safeT("today.greeting", `Hola, ${displayName}`, {
                name: displayName,
              })}
            </p>
            <h1 style={{ fontSize: 20, margin: "4px 0 2px", fontWeight: 600 }}>
              {safeT("today.tasksToday", `Tienes ${activeTasksCount} tareas`, {
                count: activeTasksCount,
              })}
            </h1>
            <p style={{ fontSize: 11, opacity: 0.85 }}>
              {safeT("today.prioritize", "Prioriza lo importante")}
            </p>
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
                  zIndex: 1000,
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
                  {safeT(
                    "today.profileLoggedInAs",
                    `Conectado como ${displayName}`,
                    { name: displayName }
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenProfile}
                  style={menuButtonStyle}
                >
                  <User size={16} style={{ marginRight: 8 }} />
                  <span>{safeT("today.menuProfile", "Perfil")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareApp}
                  style={menuButtonStyle}
                >
                  <Share2 size={16} style={{ marginRight: 8 }} />
                  <span>{safeT("today.menuShareApp", "Compartir app")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleInstallApp}
                  style={menuButtonStyle}
                >
                  <Smartphone size={16} style={{ marginRight: 8 }} />
                  <span>{safeT("today.menuInstallApp", "Instalar app")}</span>
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
            <span>{safeT("index.clearMind", "Mente despejada")}</span>
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

      {/* ✅ DECK DE TIPS */}
      <div style={{ padding: "0 18px", marginTop: 14, marginBottom: 10 }}>
        <div
          ref={deckRef}
          className="remi-tipDeck"
          style={{
            display: "flex",
            alignItems: "stretch",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            paddingLeft: `calc(50% - ${DECK_CARD_W / 2}px)`,
            paddingRight: `calc(50% - ${DECK_CARD_W / 2}px)`,
            paddingTop: 6,
            paddingBottom: 8,
            gap: 0,
          }}
        >
          {tipCards.map((card, idx) => (
            <TipCard
              key={card.id}
              item={card}
              index={idx}
              active={idx === activeTipIndex}
              style={{
                marginLeft: idx === 0 ? 0 : -DECK_OVERLAP,
              }}
              dataTipIndex={idx}
            />
          ))}
        </div>

        {/* puntitos */}
        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
          }}
        >
          {tipCards.map((_, i) => {
            const isActive = i === activeTipIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToTip(i)}
                aria-label={`Ir a la tarjeta ${i + 1}`}
                style={{
                  width: isActive ? 18 : 7,
                  height: 7,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: isActive
                    ? "rgba(125,89,201,0.95)"
                    : "rgba(148,163,184,0.55)",
                  transition: "width 0.18s ease, background 0.18s ease",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: "0 18px 18px" }}>
        {/* Filtros */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="remi-tabs"
            style={{
              display: "inline-flex",
              gap: 6,
              padding: 6,
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid rgba(226,232,240,0.95)",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            }}
          >
            {renderFilterButton("TODAY", safeT("today.tabsToday", "Hoy"))}
            {renderFilterButton("WEEK", safeT("today.tabsWeek", "Semana"))}
            {renderFilterButton(
              "NO_DATE",
              safeT("today.tabsNoDate", "Sin fecha")
            )}
          </div>
        </div>

        {/* ✅ lista */}
        <div className="space-y-3">
          {loading && (
            <div className="rounded-2xl bg-white/70 border border-slate-100 px-4 py-3 text-[13px] text-slate-500">
              {safeT("today.loadingTasks", "Cargando…")}
            </div>
          )}

          {!loading && filter !== "NO_DATE" && !hasVisibleDatedTasks && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0">
                <List size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {safeT("today.noUrgentTitle", "Todo bajo control")}
                </p>
                <p className="text-[12px] text-slate-500">
                  {safeT(
                    "today.noUrgentSubtitle",
                    "No hay nada urgente ahora mismo"
                  )}
                </p>
              </div>
            </div>
          )}

          {!loading && filter === "NO_DATE" && !hasNoDateTasks && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0">
                <List size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {safeT("today.noUrgentTitle", "Todo bajo control")}
                </p>
                <p className="text-[12px] text-slate-500">
                  {safeT(
                    "today.noUrgentSubtitle",
                    "No hay nada urgente ahora mismo"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Grupos con fecha */}
          {!loading &&
            filteredDateGroups.map((group) => (
              <div key={group.key} className="pt-2">
                {/* ✅ Separador plegable */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={!isCollapsed(group.key)}
                  className="w-full flex items-center gap-2 mb-2 select-none"
                  style={{ cursor: "pointer" }}
                >
                  <ChevronDown
                    size={16}
                    className="text-slate-500 transition-transform"
                    style={{
                      transform: isCollapsed(group.key)
                        ? "rotate(-90deg)"
                        : "rotate(0deg)",
                    }}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {group.label}
                  </p>
                  <div className="flex-1 h-px bg-slate-300/70" />
                </button>

                {/* ✅ Contenido plegable (por defecto abierto) */}
                {!isCollapsed(group.key) && (
                  <div className="space-y-2">
                    {group.items.map((task) => {
                      const hasDue = !!task.due_date;
                      const dueStr = hasDue
                        ? new Date(task.due_date as string).toLocaleString()
                        : safeT("today.dueNoDate", "Sin fecha");

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-3 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0">
                            <List size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[14px] font-semibold text-slate-900 leading-snug"
                              style={{
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                whiteSpace: "normal",
                              }}
                            >
                              {task.title}
                            </p>

                            <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                              <CalendarDays size={14} className="text-slate-400" />
                              <span className="truncate">{dueStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasDue && (
                              <button
                                type="button"
                                onClick={() => handlePostpone(task, "DAY")}
                                title={safeT(
                                  "today.actionPostpone1dTitle",
                                  "Aplazar: añade 1 día a la fecha límite"
                                )}
                                aria-label={safeT(
                                  "today.actionPostpone1dTitle",
                                  "Aplazar: añade 1 día a la fecha límite"
                                )}
                                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center"
                              >
                                <CalendarPlus size={16} color="#94A3B8" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDone(task)}
                              title={safeT(
                                "today.actionDoneTitle",
                                "Marcar como completada"
                              )}
                              aria-label={safeT(
                                "today.actionDoneTitle",
                                "Marcar como completada"
                              )}
                              className="w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center"
                            >
                              <Check size={16} color="#10B981" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

          {/* ✅ SIN FECHA: solo en NO_DATE */}
          {!loading && filter === "NO_DATE" && noDateTasks.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleGroup(NO_DATE_GROUP_KEY)}
                aria-expanded={!isCollapsed(NO_DATE_GROUP_KEY)}
                className="w-full flex items-center gap-2 mb-2 select-none"
                style={{ cursor: "pointer" }}
              >
                <ChevronDown
                  size={16}
                  className="text-slate-500 transition-transform"
                  style={{
                    transform: isCollapsed(NO_DATE_GROUP_KEY)
                      ? "rotate(-90deg)"
                      : "rotate(0deg)",
                  }}
                />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {safeT("inbox.sectionNoDate", "Sin fecha")}
                </p>
                <div className="flex-1 h-px bg-slate-300/70" />
              </button>

              {!isCollapsed(NO_DATE_GROUP_KEY) && (
                <div className="space-y-2">
                  {noDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0">
                        <List size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[14px] font-semibold text-slate-900 leading-snug"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "normal",
                          }}
                        >
                          {task.title}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                          <CalendarDays size={14} className="text-slate-400" />
                          <span className="truncate">
                            {safeT("today.dueNoDate", "Sin fecha")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDone(task)}
                          title={safeT(
                            "today.actionDoneTitle",
                            "Marcar como completada"
                          )}
                          aria-label={safeT(
                            "today.actionDoneTitle",
                            "Marcar como completada"
                          )}
                          className="w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center"
                        >
                          <Check size={16} color="#10B981" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL: ejemplos “Atajos que ahorran 10s” (sin permisos) */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.shortcutsModal.title", "Ver ejemplos")}
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              {safeT(
                "today.shortcutsModal.body",
                "Toca un ejemplo para abrir Remi con ese texto."
              )}
            </p>

            <div className="space-y-2 mb-4">
              {[
                safeT("today.shortcutsModal.ex1", "Idea: Viaje a Japón en primavera"),
                safeT("today.shortcutsModal.ex2", "Idea: Regalo para ___"),
                safeT("today.shortcutsModal.ex3", "Llamar al seguro mañana 10:00"),
                safeT("today.shortcutsModal.ex4", "Pagar la luz mañana 18:00"),
                safeT("today.shortcutsModal.ex5", "Enviar correo a ___ hoy"),
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setShowShortcutsModal(false);
                    handleOpenMindDump(ex);
                  }}
                  className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-[12px] text-slate-800"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowShortcutsModal(false);
                  handleOpenMindDump("");
                }}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md"
              >
                {safeT("today.shortcutsModal.openEmpty", "Abrir Remi")}
              </button>

              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.shortcutsModal.close", "Cerrar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ AYUDA iOS: activar dictado del teclado */}
      {showIosDictationHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.iosDict.helpTitle", "Activa Dictado en iPhone")}
            </h2>

            <p className="text-xs text-slate-600 mb-3">
              {safeT(
                "today.iosDict.helpBody",
                "En iOS suele estar en: Ajustes → General → Teclado → Activar Dictado."
              )}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.iosDict.helpStepsTitle", "Pasos rápidos")}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>{safeT("today.iosDict.step1", "Abre Ajustes")}</li>
                <li>{safeT("today.iosDict.step2", "General → Teclado")}</li>
                <li>{safeT("today.iosDict.step3", "Activa “Activar Dictado”")}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowIosDictationHelp(false)}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md"
              >
                {safeT("today.iosDict.ok", "Entendido")}
              </button>

              <button
                type="button"
                onClick={() => {
                  dismissTip("ios-dictation");
                  setShowIosDictationHelp(false);
                }}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.iosDict.hideForever", "No mostrar más")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP push */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.pushTitle", "Activa notificaciones")}
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              {safeT("today.pushBody", "Para recordatorios en el momento justo.")}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={registeringPush}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md disabled:opacity-70"
              >
                {registeringPush
                  ? safeT("today.pushEnabling", "Activando…")
                  : safeT("today.pushEnable", "Activar")}
              </button>

              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                Ahora no
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

function TipCard({
  item,
  index,
  active,
  style,
  dataTipIndex,
}: {
  item: TipCardItem;
  index: number;
  active: boolean;
  style?: CSSProperties;
  dataTipIndex: number;
}) {
  return (
    <button
      type="button"
      onClick={item.onClick}
      data-tip-index={dataTipIndex}
      style={{
        scrollSnapAlign: "center",
        flex: `0 0 ${DECK_CARD_W}px`,
        width: DECK_CARD_W,
        height: DECK_CARD_H,
        borderRadius: 36,
        background: "#ffffff",
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 10px 10px rgba(15,23,42,0.10)",
        padding: 26,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        textAlign: "center",
        cursor: item.onClick ? "pointer" : "default",
        position: "relative",
        zIndex: active ? 50 : 10 + index,
        transform: active ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.18s ease",
        ...style,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(125,89,201,0.10)",
          border: "1px solid rgba(125,89,201,0.18)",
          boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
        }}
      >
        <div style={{ transform: "scale(1.7)", color: "#7d59c9" }}>
          {item.icon}
        </div>
      </div>

      <div style={{ padding: "6px 6px 0" }}>
        <div
          style={{
            fontSize: 12.5,
            lineHeight: 1.35,
            color: "rgba(15,23,42,0.78)",
            fontWeight: 700,
          }}
        >
          {item.title}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 11.5,
            lineHeight: 1.35,
            color: "rgba(15,23,42,0.55)",
            fontWeight: 500,
            whiteSpace: "pre-line", // ✅ respeta \n como salto de línea
          }}
        >
          {item.body}
        </div>
      </div>

      {item.cta ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingBottom: 2,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 26px",
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid rgba(125,89,201,0.25)",
              color: "#7d59c9",
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 14px 26px rgba(125,89,201,0.10)",
            }}
          >
            <span>{item.cta}</span>
            <ArrowRight size={16} />
          </div>
        </div>
      ) : (
        <div style={{ height: 36 }} />
      )}
    </button>
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
