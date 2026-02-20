import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { celebrateCreation } from "@/lib/creationCelebration";
import { computeMindClearPercent } from "@/lib/mindClear";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  BrainItem,
  ReminderMode,
  RepeatType,
  createTask,
  createIdea,
  fetchActiveIdeas,
  fetchActiveTasks,
  setTaskStatus,
  postponeTask,
  fetchRemiStatusSummary,
  type RemiStatusSummary,
} from "@/lib/brainItemsApi";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/registerPush";
import {
  createShareInviteCached,
  prefetchShareInvite,
  shareTextOrCopy,
} from "@/lib/shareInvitesApi";
import { useSnapTipDeck } from "@/hooks/useSnapTipDeck";
import FeedbackSurveyModal from "@/components/FeedbackSurveyModal";
import {
  flushPendingFeedback,
  initFeedbackTracker,
  markFeedbackDismissed,
  markFeedbackSubmitted,
  shouldShowAutoFeedbackSurvey,
  submitFeedbackSurvey,
} from "@/lib/feedbackSurvey";

import {
  CalendarClock,
  Check,
  User,
  Users,
  Share2,
  Smartphone,
  CalendarPlus,
  Sparkles,
  ClipboardPaste,
  CalendarDays,
  HeartPulse,
  Flame,
  LayoutGrid,
  Bell,
  ChevronDown,
  Keyboard,
  Download,
  Search,
  Plus,
} from "lucide-react";

import { useModalUi } from "@/contexts/ModalUiContext";
import MindDumpModal from "@/components/MindDumpModal";
import MindRelaxSurface from "@/components/MindRelaxSurface";

const AVATAR_KEY = "remi_avatar";

const TIP_DISMISS_KEY = "remi_tip_dismissed_v1";

const SHARE_TO_REMI_DISMISS_KEY = "share-to-remi-help";

const SHARE_REMINDERS_TIP_KEY = "share-reminders";


const MULTI_DEVICE_TIP_KEY = "multi-device";

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
  dateMs?: number;
};

type FilterMode = "TODAY" | "WEEK" | "NO_DATE";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKeyLocal(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type TipCardItem = {
  id: string;
  title: string;
  body: string;
  cta?: string;
  icon: ReactNode;
  bg: string;
  border: string;
  onClick?: () => void;
};
const TIP_EMOJI_BY_ID: Record<string, string> = {
  install: "📲",
  push: "🔔",
  "ios-dictation": "🎙️",
  "multi-device": "💻",
  "share-app": "📣",
  "share-reminders": "🔗",
  shortcuts: "⚡",
  "day-close": "🌙",
  paste: "📋",
  natural: "✍️",
  "remi-language": "🌍",
  "no-date": "🗂️",
  week: "📅",
  mental: "🫶",
  birthday: "🎂",
  "clean-no-date": "✅",
  "improve-remi": "💬",
  "shared-lists": "🤝",
};

const NO_DATE_GROUP_KEY = "__NO_DATE__";
const EMPTY_CARD_CLASS =
  "rounded-3xl bg-slate-50 border border-slate-200 shadow-[0_8px_18px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3";
const TASK_CARD_CLASS =
  "rounded-3xl bg-[#fcfbff] border border-violet-100 shadow-[0_10px_22px_rgba(125,89,201,0.08)] px-4 py-3.5 flex items-center gap-3";
const ITEM_ICON_CLASS =
  "w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0";
const ACTION_BTN_CLASS =
  "w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center";
const DONE_BTN_CLASS =
  "w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center";
const RIGHT_RAIL_WIDTH_PX = 0;
const NOTE_PAGE_BG =
  "linear-gradient(180deg, #f1eff7 0%, #fafafe 42%, #fafafe 100%)";
const MODAL_OVERLAY_STYLE: CSSProperties = {
  paddingLeft: "calc(8px + env(safe-area-inset-left))",
  paddingRight: `calc(${RIGHT_RAIL_WIDTH_PX + 8}px + env(safe-area-inset-right))`,
  paddingTop: "max(8px, env(safe-area-inset-top))",
  paddingBottom: "max(8px, env(safe-area-inset-bottom))",
};
const REMINDER_DECK_CARD_WIDTH = "clamp(280px, 54vw, 640px)";
const REMINDER_DECK_SIDE_PADDING = "calc(50% - clamp(140px, 27vw, 320px))";
const REMINDER_DECK_OVERLAP = 14;

export default function TodayPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, lang } = useI18n();
  const uiLocale = useMemo(() => {
    if (lang === "de") return "de-DE";
    if (lang === "en") return "en-US";
    return "es-ES";
  }, [lang]);

  const { setModalOpen } = useModalUi();

  const safeT = useCallback(
    (key: string, fallback: string, vars?: Record<string, any>) => {
      const v = t(key as any, vars as any);
      if (!v || v === key) return fallback;
      return v;
    },
    [t],
  );

  const shouldShowSentIndicator = useCallback((task: BrainItem) => {
  const sharedCount = (task as any)?.shared_count ?? 0;
  const receivedFromShare = !!(task as any)?.received_from_share;

  return !receivedFromShare && Number(sharedCount) > 0;
}, []);

  const [tasks, setTasks] = useState<BrainItem[]>([]);
  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] = useState<RemiStatusSummary | null>(
    null,
  );

  const [showPushModal, setShowPushModal] = useState(false);
  const [registeringPush, setRegisteringPush] = useState(false);

  const [hasPushSubscription, setHasPushSubscription] = useState<
    boolean | null
  >(null);

  const [dismissedTips, setDismissedTips] = useState<Record<string, boolean>>(
    {},
  );

  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  const [showIosDictationHelp, setShowIosDictationHelp] = useState(false);

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const [showShareToRemiHelp, setShowShareToRemiHelp] = useState(false);

  const [showMultiDeviceHelp, setShowMultiDeviceHelp] = useState(false);

  const [showShareRemindersHelp, setShowShareRemindersHelp] = useState(false);
  const [showFeedbackSurvey, setShowFeedbackSurvey] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [mindDumpResetNonce, setMindDumpResetNonce] = useState(0);
  const [relaxOpen, setRelaxOpen] = useState(false);

  const [nowTick, setNowTick] = useState(0);

const anyModalOpen =
    showPushModal ||
  showShortcutsModal ||
  showIosDictationHelp ||
  showShareToRemiHelp ||
  showMultiDeviceHelp ||
  showShareRemindersHelp ||
  showFeedbackSurvey;

 useEffect(() => {
    setModalOpen(anyModalOpen);
  }, [anyModalOpen, setModalOpen]);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  

  const [filter, setFilter] = useState<FilterMode>("TODAY");

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const isCollapsed = (key: string) => !!collapsedGroups[key];
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeTasksCount = tasks.length;
  const dismissTip = (id: string) => {
    setDismissedTips((prev) => {
      const next = { ...prev, [id]: true };
      try {
        localStorage.setItem(TIP_DISMISS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNowTick((x) => x + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const openCapture = useCallback((prefill?: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("remi-open-capture", {
        detail: { initialText: prefill ?? "" },
      }),
    );
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

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
  }, [safeT, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user) return;
    const onChanged = () => void loadData();
    window.addEventListener("remi-items-changed", onChanged);
    return () => window.removeEventListener("remi-items-changed", onChanged);
  }, [loadData, user]);

  useEffect(() => {
    if (!user) return;
    initFeedbackTracker();
    void flushPendingFeedback();
    if (shouldShowAutoFeedbackSurvey()) {
      setShowFeedbackSurvey(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const onFeedbackUpdated = () => {
      if (shouldShowAutoFeedbackSurvey()) setShowFeedbackSurvey(true);
    };
    window.addEventListener("remi-feedback-updated", onFeedbackUpdated);
    return () => {
      window.removeEventListener("remi-feedback-updated", onFeedbackUpdated);
    };
  }, [user?.id]);

  const mindClearPercent = useMemo(() => {
    return computeMindClearPercent(statusSummary);
  }, [statusSummary]);

  useEffect(() => {
    if (!user || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "denied") {
      setHasPushSubscription(true);
      setShowPushModal(false);
      return;
    }

    const checkThisDeviceSubscription = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          setHasPushSubscription(true);
          setShowPushModal(false);
          return;
        }

        if (Notification.permission !== "granted") {
          setHasPushSubscription(false);
          setShowPushModal(true);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
          setHasPushSubscription(false);
          setShowPushModal(true);
          return;
        }

        const endpoint = sub.endpoint;

        const { data, error } = await supabase
          .from("remi_push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .eq("endpoint", endpoint)
          .eq("status", "ACTIVE")
          .maybeSingle();

        if (error) {
          console.error("Error checking push subscription (device)", error);
          setHasPushSubscription(false);
          setShowPushModal(true);
          return;
        }

        if (data) {
          setHasPushSubscription(true);
          setShowPushModal(false);
          return;
        }

        try {
          await registerPushSubscription(user.id);
          setHasPushSubscription(true);
          setShowPushModal(false);
        } catch (e) {
          console.error("Error auto-registering push subscription", e);
          setHasPushSubscription(false);
          setShowPushModal(true);
        }
      } catch (err) {
        console.error("Unexpected error checking push subscription", err);
      }
    };

    void checkThisDeviceSubscription();
  }, [user?.id]);

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
      today.getDate(),
    );
    const tomorrowMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const todayIso = toDateKeyLocal(todayMid);

    const groupsMap = new Map<string, DateGroup>();
    const noDate: BrainItem[] = [];

    const addTaskToDate = (dateMid: Date, task: BrainItem) => {
      const dMid = new Date(
        dateMid.getFullYear(),
        dateMid.getMonth(),
        dateMid.getDate(),
      );
      const iso = toDateKeyLocal(dMid);

      let group = groupsMap.get(iso);
      if (!group) {
        let label: string;
        if (iso === todayIso) label = safeT("inbox.sectionToday", "Hoy");
        else if (isSameDay(dMid, tomorrowMid))
          label = safeT("inbox.sectionTomorrow", "Mañana");
        else {
          label = dMid.toLocaleDateString(uiLocale, {
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
    const addTaskRangeInclusive = (
      startDateMid: Date,
      endDateMid: Date,
      task: BrainItem,
    ) => {
      let cursor = new Date(
        startDateMid.getFullYear(),
        startDateMid.getMonth(),
        startDateMid.getDate(),
      );
      const end = new Date(
        endDateMid.getFullYear(),
        endDateMid.getMonth(),
        endDateMid.getDate(),
      );
      while (cursor.getTime() <= end.getTime()) {
        addTaskToDate(cursor, task);
        cursor = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate() + 1,
        );
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
              cursor.getDate() + 1,
            );
          }
        }
      }

      if (mode === "WEEK_BEFORE_AND_DUE") {
        const weekBefore = new Date(dueMid);
        weekBefore.setDate(weekBefore.getDate() - 7);
        addTaskRangeInclusive(weekBefore, dueMid, task);
      }

    }

    const dateGroupsArr = Array.from(groupsMap.values())
      .filter((g) => g.items.length > 0)
      .sort((a, b) => (a.dateMs ?? 0) - (b.dateMs ?? 0));

    return { dateGroups: dateGroupsArr, noDateTasks: noDate };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, safeT, uiLocale]);

  const filteredDateGroups = useMemo(() => {
    if (filter === "NO_DATE") return [];

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const weekEndMid = new Date(
      todayMid.getFullYear(),
      todayMid.getMonth(),
      todayMid.getDate() + 7,
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

  const handleDone = async (task: BrainItem) => {
    const updated = await setTaskStatus(task.id, "DONE");
    setTasks((prev) => prev.filter((tt) => tt.id !== updated.id));
  };

  const formatDueLabel = useCallback(
    (dueDate?: string | null) => {
      if (!dueDate) return safeT("today.dueNoDate", "Sin fecha");
      const d = new Date(dueDate);
      const datePart = d.toLocaleDateString(uiLocale, {
        day: "numeric",
        month: "short",
      });
      const timePart = d.toLocaleTimeString(uiLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${datePart} ${timePart}`;
    },
    [safeT, uiLocale],
  );

  const handleShareTask = async (task: BrainItem) => {
  try {
    const res = await createShareInviteCached(task.id);
    await shareTextOrCopy(res.shareMessage);
    alert(safeT("shareInvite.sharedOk", "Listo. Enlace copiado/compartido."));
  } catch (e) {
    console.error(e);
    alert(
      safeT(
        "shareInvite.sharedError",
        "No se pudo compartir. Inténtalo de nuevo.",
      ),
    );
  }
};

  const handleCreateTaskFromMindDump = useCallback(
    async (
      title: string,
      dueDateISO: string | null,
      reminderMode: ReminderMode,
      repeatType: RepeatType,
    ) => {
      if (!user) return;
      const before = computeMindClearPercent(statusSummary);
      await createTask(user.id, title, dueDateISO, reminderMode, repeatType);
      const updatedSummary = await fetchRemiStatusSummary(user.id);
      const after = computeMindClearPercent(updatedSummary);
      celebrateCreation(after - before);
      await loadData();
    },
    [loadData, statusSummary, user],
  );

  const handleCreateIdeaFromMindDump = useCallback(
    async (title: string) => {
      if (!user) return;
      const before = computeMindClearPercent(statusSummary);
      await createIdea(user.id, title);
      const updatedSummary = await fetchRemiStatusSummary(user.id);
      const after = computeMindClearPercent(updatedSummary);
      celebrateCreation(after - before);
      await loadData();
    },
    [loadData, statusSummary, user],
  );

  const handleSubmitFeedbackSurvey = useCallback(
    async (payload: { score: number; improvement: string; liked: string }) => {
      if (!user) return;
      setSavingFeedback(true);
      try {
        await submitFeedbackSurvey({
          userId: user.id,
          lang,
          score: payload.score,
          liked: payload.liked,
          improvement: payload.improvement,
          source: "auto",
        });
        markFeedbackSubmitted();
        setShowFeedbackSurvey(false);
        toast.success(safeT("feedback.thanks", "Gracias por tu opinión sobre Remi."));
      } finally {
        setSavingFeedback(false);
      }
    },
    [lang, safeT, user],
  );

  const handlePostpone = async (task: BrainItem, option: "DAY" | "WEEK") => {
    const base = task.due_date ? new Date(task.due_date) : new Date();
    if (option === "DAY") base.setDate(base.getDate() + 1);
    if (option === "WEEK") base.setDate(base.getDate() + 7);

    const updated = await postponeTask(task.id, base.toISOString());
    setTasks((prev) =>
      prev.map((tt) => (tt.id === updated.id ? updated : tt)),
    );

    toast.success(safeT("today.postponeDayToast", "Aplazado"));
  };

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

  const handleOpenLists = () => {
    setProfileOpen(false);
    navigate("/lists");
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
    const isTodayActive = active && mode === "TODAY";
    const isWeekActive = active && mode === "WEEK";
    const isNoDateActive = active && mode === "NO_DATE";
    const activeBg = isTodayActive
      ? "rgba(201,89,109,0.18)"
      : isWeekActive
        ? "rgba(89,165,201,0.18)"
        : isNoDateActive
          ? "rgba(201,125,89,0.18)"
          : "rgba(125,89,201,0.16)";
    const activeColor = isTodayActive
      ? "#c9596d"
      : isWeekActive
        ? "#59a5c9"
        : isNoDateActive
          ? "#c97d59"
          : "#7d59c9";

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
          padding: "8px 16px",
          borderRadius: 999,
          background: active ? activeBg : "transparent",
          color: active ? activeColor : "#64748b",
          fontSize: 13,
          fontWeight: active ? 700 : 600,
          lineHeight: 1,
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </button>
    );
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!("clipboard" in navigator) || !navigator.clipboard?.readText) {
        toast.error("El portapapeles no está disponible aquí.");
        openCapture("");
        return;
      }

      const txt = (await navigator.clipboard.readText())?.trim?.() ?? "";
      if (!txt) {
        toast.message(
          "Portapapeles vacío (o sin permiso). Abro Remi igualmente.",
        );
        openCapture("");
        return;
      }
      openCapture(txt);
    } catch (e) {
      console.error(e);
      toast.error(
        "No pude leer el portapapeles (permiso). Abro Remi igualmente.",
      );
      openCapture("");
    }
  };

  const shouldShowDayCloseTip = useMemo(() => {
    const hour = new Date().getHours(); // local hour
    const isEvening = hour >= 17; // evening/night
    const daysSince = statusSummary?.daysSinceLastActivity;

    const inactive = daysSince == null ? true : daysSince > 0;

    return isEvening && inactive;
  }, [statusSummary?.daysSinceLastActivity, nowTick]);

  const shouldShowPushTip = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;

    return Notification.permission !== "granted" && hasPushSubscription === false;
  }, [hasPushSubscription]);

  const tipCards: TipCardItem[] = useMemo(() => {
    const noDateCount = noDateTasks.length;
    const cards: TipCardItem[] = [];

    if (!isStandalone) {
      cards.push({
        id: "install",
        title: safeT("today.tip.install.title", "Instala Remi como app"),
        body: safeT(
          "today.tip.install.body",
          "Ábrela en 1 toque y funciona más fluida como una app.",
        ),
        cta: safeT("today.tip.install.cta", "Instalar"),
        icon: <Download size={18} />,
        bg: "",
        border: "rgba(125,89,201,0.70)",
        onClick: () => handleInstallApp(),
      });
    }

    if (shouldShowPushTip) {
      cards.push({
        id: "push",
        title: safeT("today.tip.push.title", "Que Remi te avise por ti"),
        body: safeT(
          "today.tip.push.body",
          "Activa notificaciones y suelta la carga mental. Remi te toca el hombro cuando toca.",
        ),
        cta: safeT("today.tip.push.cta", "Activar"),
        icon: <Bell size={18} />,
        bg: "",
        border: "rgba(99,102,241,0.65)",
        onClick: () => setShowPushModal(true),
      });
    }

    if (isIOSDevice && !dismissedTips["ios-dictation"]) {
      cards.push({
        id: "ios-dictation",
        title: safeT(
          "today.tip.iosDict.title",
          "Habla con Remi",
        ),
        body: safeT(
          "today.tip.iosDict.body",
          "Si no ves el micro en el teclado, actívalo en Ajustes y dicta más rápido.",
        ),
        cta: safeT("today.tip.iosDict.cta", "Ver cómo"),
        icon: <Keyboard size={18} />,
        bg: "",
        border: "rgba(59,130,246,0.65)",
        onClick: () => setShowIosDictationHelp(true),
      });
    }

    if (!dismissedTips[MULTI_DEVICE_TIP_KEY]) {
      cards.push({
        id: MULTI_DEVICE_TIP_KEY,
        title: safeT(
          "today.tip.multidevice.title",
          "Remi siempre contigo",
        ),
        body: safeT(
          "today.tip.multidevice.body",
          "Vacía tu cabeza donde estés. Todo se sincroniza y tú eliges en qué dispositivo quieres notificaciones.",
        ),
        cta: safeT("today.tip.multidevice.cta", "Ver cómo funciona"),
        icon: <Smartphone size={18} />,
        bg: "",
        border: "rgba(16,185,129,0.65)",
        onClick: () => setShowMultiDeviceHelp(true),
      });
    }

    cards.push({
      id: "shortcuts",
      title: safeT("today.tip.shortcuts.title", "Palabras que ahorran tiempo"),
      body: safeT(
        "today.tip.shortcuts.body",
        "Una idea empieza con \"Idea: ...\". Una tarea empieza con un verbo.",
      ),
      cta: safeT("today.tip.shortcuts.cta", "Ver ejemplos"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => setShowShortcutsModal(true),
    });

    if (shouldShowDayCloseTip) {
      cards.push({
        id: "day-close",
        title: safeT("today.tip.dayClose.title", "Cierre de 60 segundos"),
        body: safeT(
          "today.tip.dayClose.body",
          "¿Qué te preocupa para mañana? Suéltalo y listo.",
        ),
        cta: safeT("today.tip.dayClose.cta", "Soltar"),
        icon: <HeartPulse size={18} />,
        bg: "",
        border: "rgba(244,63,94,0.60)",
        onClick: () => openCapture(""),
      });
    }

    cards.push({
      id: "improve-remi",
      title: safeT("today.tip.feedback.title", "Mejora Remi"),
      body: safeT(
        "today.tip.feedback.body",
        "Cuéntanos en 20 segundos qué te está ayudando y qué mejorarías.",
      ),
      cta: safeT("today.tip.feedback.cta", "Dar opinión"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => setShowFeedbackSurvey(true),
    });

    if (!dismissedTips[SHARE_REMINDERS_TIP_KEY]) {
      cards.push({
        id: SHARE_REMINDERS_TIP_KEY,
          title: safeT(
            "today.tip.shareReminders.title",
            "Comparte recordatorios con alguien",
          ),
          body: safeT(
            "today.tip.shareReminders.body",
            "Envía una tarea o idea por enlace. La otra persona la añade a su Remi en 1 toque.",
          ),
          cta: safeT("today.tip.shareReminders.cta", "Ver cómo"),
          icon: <Share2 size={18} />,
          bg: "",
          border: "rgba(125,89,201,0.70)",
          onClick: () => setShowShareRemindersHelp(true),
      });
    }

    cards.push({
      id: "shared-lists",
      title: safeT("today.tip.sharedLists.title", "Listas compartidas"),
      body: safeT(
        "today.tip.sharedLists.body",
        "Crea una lista con otra persona y actualizad puntos en tiempo real.",
      ),
      cta: safeT("today.tip.sharedLists.cta", "Abrir listas"),
      icon: <Share2 size={18} />,
      bg: "",
      border: "rgba(14,165,164,0.65)",
      onClick: () => navigate("/lists"),
    });

    cards.push({
      id: "share-app",
      title: safeT("today.tip.shareApp.title", "Compartir Remi"),
      body: safeT(
        "today.tip.shareApp.body",
        "Invita a alguien a probar Remi en un toque.",
      ),
      cta: safeT("today.tip.shareApp.cta", "Compartir"),
      icon: <Share2 size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => void handleShareApp(),
    });


    cards.push({
      id: "natural",
      title: safeT("today.tip.natural.title", "Escribe como hablas"),
      body: safeT(
        "today.tip.natural.body",
        "Ej: \"Pagar la luz mañana a las 18:00\". Remi lo ordena y tú te olvidas.",
      ),
      cta: safeT("today.tip.natural.cta", "Probar ejemplo"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(16,185,129,0.65)",
      onClick: () =>
        openCapture(
          safeT("today.tip.natural.prefill", "Pagar la luz mañana 18:00"),
        ),
    });

    cards.push({
      id: "paste",
      title: safeT("today.tip.paste.title", "Pegar texto"),
      body: safeT(
        "today.tip.paste.body",
        "Copia cualquier cosa (WhatsApp, Mail, Notas) y deja que Remi lo ordene.",
      ),
      cta: safeT("today.tip.paste.cta", "Pegar ahora"),
      icon: <ClipboardPaste size={18} />,
      bg: "",
      border: "rgba(59,130,246,0.65)",
      onClick: () => void handlePasteFromClipboard(),
    });

    cards.push({
      id: "remi-language",
      title: safeT("today.tip.language.title", "Remi en tu idioma"),
      body: safeT(
        "today.tip.language.body",
        "Cambia el idioma de Remi en cualquier momento desde tu perfil.",
      ),
      cta: safeT("today.tip.language.cta", "Cambiar idioma"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(59,130,246,0.65)",
      onClick: () => navigate("/profile"),
    });

    cards.push({
      id: "mental",
      title: safeT("today.tip.mental.title", "Mini pausa"),
      body: safeT(
        "today.tip.mental.body",
        "Respira 4s, suelta 6s. Tu mente no necesita hacerlo todo hoy.",
      ),
      cta: safeT("today.tip.mental.cta", "Vaciar mente"),
      icon: <HeartPulse size={18} />,
      bg: "",
      border: "rgba(244,63,94,0.60)",
      onClick: () => setRelaxOpen(true),
    });

    cards.push({
      id: "birthday",
      title: safeT("today.tip.birthday.title", "¿Cumpleaños cerca?"),
      body: safeT(
        "today.tip.birthday.body",
        "Escríbelo en 5 segundos y Remi te lo recordará cuando toque.",
      ),
      cta: safeT("today.tip.birthday.cta", "Añadir"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(253,186,116,0.85)",
      onClick: () =>
        openCapture(
          safeT("today.tip.birthday.prefill", "Cumpleaños de ___ el ___"),
        ),
    });

    if (noDateCount === 0) {
      cards.push({
        id: "clean-no-date",
        title: safeT("today.tip.cleanNoDate.title", "Sin tareas sin fecha"),
        body: safeT(
          "today.tip.cleanNoDate.body",
          "Perfecto. Ahora es fácil priorizar.",
        ),
        cta: safeT("today.tip.cleanNoDate.cta", "Ver hoy"),
        icon: <Sparkles size={18} />,
        bg: "",
        border: "rgba(125,89,201,0.70)",
        onClick: () => setFilter("TODAY"),
      });
    }

    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    noDateTasks.length,
    safeT,
    isStandalone,
    isIOSDevice,
    dismissedTips,
    shouldShowPushTip,
    shouldShowDayCloseTip,
    openCapture,
  ]);
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = useMemo(
    () => searchValue.trim().toLowerCase(),
    [searchValue],
  );
  const matchesTask = useCallback(
    (task: BrainItem) => {
      if (!normalizedSearch) return true;
      const title = (task.title ?? "").toLowerCase();
      const due = formatDueLabel(task.due_date as string | null).toLowerCase();
      return title.includes(normalizedSearch) || due.includes(normalizedSearch);
    },
    [formatDueLabel, normalizedSearch],
  );
  const visibleDateGroups = useMemo(() => {
    if (!normalizedSearch) return filteredDateGroups;
    return filteredDateGroups
      .map((group) => ({ ...group, items: group.items.filter(matchesTask) }))
      .filter((group) => group.items.length > 0);
  }, [filteredDateGroups, matchesTask, normalizedSearch]);
  const visibleNoDateTasks = useMemo(
    () => noDateTasks.filter(matchesTask),
    [noDateTasks, matchesTask],
  );
  const todayDateKey = useMemo(() => {
    const now = new Date();
    return toDateKeyLocal(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);
  const tipsScrollRef = useRef<HTMLDivElement | null>(null);
  const reminderDeckRef = useRef<HTMLDivElement | null>(null);
  const [tipsScrollMetrics, setTipsScrollMetrics] = useState({
    progress: 0,
    visibleRatio: 1,
  });
  const selectedDayTasks = useMemo(
    () => dateGroups.find((group) => group.key === todayDateKey)?.items ?? [],
    [dateGroups, todayDateKey],
  );
  const nextWeekGroups = useMemo(() => {
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEndMid = new Date(
      todayMid.getFullYear(),
      todayMid.getMonth(),
      todayMid.getDate() + 7,
    );

    const out: Array<{ key: string; label: string; items: BrainItem[] }> = [];
    for (const group of dateGroups) {
      if (!group.dateMs) continue;
      const time = group.dateMs;
      if (time <= todayMid.getTime() || time > weekEndMid.getTime()) continue;
      out.push({
        key: group.key,
        label: group.label,
        items: group.items,
      });
    }
    return out;
  }, [dateGroups]);
  const {
    activeIndex: activeSlideIndex,
    scrollToIndex: scrollToReminderSlide,
    bind: reminderDeckBind,
  } = useSnapTipDeck(reminderDeckRef, selectedDayTasks.length, {
    maxStep: 1,
    settleMs: 120,
  });
  const sliderThemes = useMemo(() => {
    const themes = [
      {
        bg: "#EDE4FB",
        border: "#DECCF7",
        shadow: "0 10px 20px rgba(100, 41, 218, 0.10)",
      },
      {
        bg: "#F8E6DC",
        border: "#F0D5C7",
        shadow: "0 10px 20px rgba(212, 114, 64, 0.10)",
      },
      {
        bg: "#DDF6E6",
        border: "#CBEED9",
        shadow: "0 10px 20px rgba(60, 199, 97, 0.10)",
      },
      {
        bg: "#F4DEEE",
        border: "#EBCFE1",
        shadow: "0 10px 20px rgba(190, 116, 176, 0.10)",
      },
      {
        bg: "#DFF0F8",
        border: "#CEE5F1",
        shadow: "0 10px 20px rgba(65, 140, 179, 0.10)",
      },
    ] as const;

    if (selectedDayTasks.length === 0) return [];
    const out: Array<(typeof themes)[number]> = [];
    let prevThemeIndex = -1;

    for (let i = 0; i < selectedDayTasks.length; i += 1) {
      const task = selectedDayTasks[i];
      const hash = task.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      let themeIndex = hash % themes.length;
      if (themeIndex === prevThemeIndex) {
        themeIndex = (themeIndex + 1) % themes.length;
      }
      out.push(themes[themeIndex]);
      prevThemeIndex = themeIndex;
    }
    return out;
  }, [selectedDayTasks]);
  const searchVisibleTasksCount = useMemo(() => {
    if (filter === "NO_DATE") return visibleNoDateTasks.length;
    return visibleDateGroups.reduce((acc, group) => acc + group.items.length, 0);
  }, [filter, visibleDateGroups, visibleNoDateTasks.length]);
  const hasSearchVisibleDatedTasks = visibleDateGroups.some(
    (group) => group.items.length > 0,
  );
  const hasSearchNoDateTasks =
    filter === "NO_DATE" && visibleNoDateTasks.length > 0;
  const updateTipsScrollMetrics = useCallback(() => {
    const el = tipsScrollRef.current;
    if (!el) return;

    const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);
    const progress = maxScrollLeft > 0 ? el.scrollLeft / maxScrollLeft : 0;
    const visibleRatio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;

    setTipsScrollMetrics({
      progress: Math.max(0, Math.min(1, progress)),
      visibleRatio: Math.max(0, Math.min(1, visibleRatio)),
    });
  }, []);

  useEffect(() => {
    updateTipsScrollMetrics();
    window.addEventListener("resize", updateTipsScrollMetrics);
    return () => window.removeEventListener("resize", updateTipsScrollMetrics);
  }, [tipCards.length, updateTipsScrollMetrics]);

  const tipsHasOverflow = tipsScrollMetrics.visibleRatio < 0.999;
  const tipsThumbWidthPct = tipsHasOverflow
    ? Math.max(tipsScrollMetrics.visibleRatio * 100, 20)
    : 24;
  const tipsThumbLeftPct = tipsHasOverflow
    ? tipsScrollMetrics.progress * (100 - tipsThumbWidthPct)
    : 38;
  return (
    <div
      className="remi-page"
      style={{
        minHeight: "100dvh",
        background: NOTE_PAGE_BG,
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
        paddingLeft: 0,
        paddingRight: RIGHT_RAIL_WIDTH_PX,
      }}
    >
      <div
        style={{
          width: "100%",
          margin: 0,
          minHeight: "100dvh",
          background: NOTE_PAGE_BG,
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
      <div
        className="relative overflow-visible"
        style={{
          zIndex: anyModalOpen ? 20 : 60,
          paddingTop: "calc(20px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto w-full relative z-[1]" style={{ maxWidth: "min(96vw, 1440px)" }}>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="leading-tight font-semibold text-slate-500"
              style={{ fontSize: "clamp(14px, 0.9vw, 18px)" }}
            >
              {safeT("today.greetingHello", "Hello,")}
            </p>
            <p
              className="leading-tight font-extrabold text-slate-900"
              style={{ fontSize: "clamp(21px, 1.45vw, 31px)", marginTop: 4 }}
            >
              {displayName} <span aria-hidden="true">👋</span>
            </p>
          </div>

          <div style={{ position: "relative" }} ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "999px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#334155",
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
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
                  color: "#1e293b",
                  borderRadius: 16,
                  boxShadow: "0 18px 40px rgba(15,23,42,0.2)",
                  padding: "8px 10px",
                  minWidth: 170,
                  maxWidth: "min(280px, calc(100vw - 24px))",
                  zIndex: 5000,
                }}
              >
                <div
                  style={{
                    padding: "6px 8px 8px",
                    borderBottom: "1px solid rgba(226,232,240,0.9)",
                    marginBottom: 4,
                    fontSize: 11,
                    color: "#64748b",
                  }}
                >
                  {safeT(
                    "today.profileLoggedInAs",
                    `Conectado como ${displayName}`,
                    { name: displayName },
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
                  onClick={handleOpenLists}
                  style={menuButtonStyle}
                >
                  <Users size={16} style={{ marginRight: 8 }} />
                  <span>{safeT("today.menuLists", "Listas compartidas")}</span>
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
        <div className="mt-2" style={{ width: "calc(100% - 56px)" }}>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-semibold text-slate-600" style={{ fontSize: "clamp(13px, 0.9vw, 19px)" }}>
              {safeT("index.clearMind", "Mente despejada")}
            </p>
            <p className="font-extrabold text-slate-800" style={{ fontSize: "clamp(13px, 0.9vw, 19px)" }}>
              {mindClearPercent}%
            </p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${mindClearPercent}%`,
                background:
                  "linear-gradient(90deg, #59a5c9 0%, #5989c9 12.5%, #596dc9 25%, #6b63c9 37.5%, #7d59c9 50%, #9959c9 62.5%, #b559c9 75%, #bf59b7 87.5%, #c959a5 100%)",
              }}
            />
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={handleOpenLists}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users size={14} />
              {safeT("today.openLists", "Abrir listas compartidas")}
            </button>
          </div>
        </div>
        </div>
      </div>

      <div className="mx-auto mt-6 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
        <p className="leading-none font-extrabold text-slate-900" style={{ fontSize: "clamp(18px, 1.1vw, 24px)" }}>
          {safeT("today.captureSectionTitle", "Vacia tu mente")}
        </p>
        <div className="mt-3 px-1">
          <MindDumpModal
            open={true}
            embedded
            onClose={() => setMindDumpResetNonce((n) => n + 1)}
            onCreateTask={handleCreateTaskFromMindDump}
            onCreateIdea={async (title) => {
              await handleCreateIdeaFromMindDump(title);
            }}
            initialTextNonce={mindDumpResetNonce}
          />
        </div>
      </div>

      {tipCards.length > 0 && (
        <div className="mx-auto mt-7 mb-2 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
          <div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: "clamp(16px, 1vw, 22px)" }}>
              {safeT("today.tipsTitle", "Acciones")}
            </p>
          </div>
          <div
            ref={tipsScrollRef}
            onScroll={updateTipsScrollMetrics}
            className="mt-2 remi-scroll flex gap-2.5 overflow-x-auto pb-1 px-1"
          >
            {tipCards.map((tip) => (
              <button
                key={tip.id}
                type="button"
                onClick={tip.onClick}
                className="shrink-0 rounded-2xl border border-slate-200 bg-white shadow-[0_6px_14px_rgba(15,23,42,0.05)] hover:bg-slate-50 flex flex-col items-center"
                style={{
                  width: "clamp(98px, 22vw, 132px)",
                  padding: "10px 8px 9px",
                  minHeight: "110px",
                }}
                title={tip.title}
                aria-label={tip.title}
              >
                <div
                  className="mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center"
                  style={{ width: 38, height: 38 }}
                >
                  <span className="leading-none" style={{ fontSize: "clamp(20px, 1.2vw, 28px)" }}>
                    {TIP_EMOJI_BY_ID[tip.id] ?? "✨"}
                  </span>
                </div>
                <p
                  className="mt-2 leading-snug font-medium text-slate-800 line-clamp-2 text-center"
                  style={{
                    fontSize: "clamp(11px, 0.72vw, 13px)",
                    minHeight: "2.55em",
                  }}
                >
                  {tip.title}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-2.5 px-1">
            <div className="relative h-1.5 w-full rounded-full bg-slate-200/90 overflow-hidden">
              <span
                className="absolute top-0 h-full rounded-full bg-violet-500 transition-all duration-150"
                style={{
                  width: `${tipsThumbWidthPct}%`,
                  left: `${tipsThumbLeftPct}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-7 mb-2 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
        <div className="mt-2">
          <div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: "clamp(15px, 0.9vw, 20px)" }}>
              {safeT("inbox.tasksTab", "Recordatorios")}
            </p>
          </div>

          <div className="mt-2.5 px-1 flex justify-center">
            <div
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5"
              style={{ minHeight: 46 }}
            >
              {renderFilterButton("TODAY", safeT("inbox.sectionToday", "Hoy"))}
              {renderFilterButton("WEEK", safeT("inbox.sectionWeek", "Semana"))}
              {renderFilterButton("NO_DATE", safeT("inbox.sectionNoDate", "Sin fecha"))}
            </div>
          </div>

          {searchVisibleTasksCount > 0 ? (
            <div className="mt-2.5 rounded-3xl border border-transparent bg-transparent p-1.5">
              <div className="max-h-[460px] overflow-y-auto remi-scroll pr-1">
                {filter === "NO_DATE" ? (
                  <div className="space-y-2 pt-2">
                    {visibleNoDateTasks.map((task) => (
                      <div
                        key={`today-nodate-${task.id}`}
                        className="rounded-3xl bg-white border border-[#7d59c9] shadow-[0_6px_14px_rgba(15,23,42,0.05)] px-4 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 relative">
                            <CalendarClock size={18} />
                            {shouldShowSentIndicator(task) && (
                              <span
                                className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                                aria-label={safeT("shareInvite.sentIndicator", "Compartido por ti")}
                                title={safeT("shareInvite.sentIndicator", "Compartido por ti")}
                              >
                                <Share2 size={10} className="text-slate-500" />
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-slate-900 leading-snug"
                              style={{ fontSize: "clamp(16px, 1.1vw, 26px)" }}
                            >
                              {safeT("pill.type.task", "Recordatorio")}
                            </p>
                            <p
                              className="mt-1 text-slate-700"
                              style={{
                                fontSize: "clamp(13px, 0.86vw, 17px)",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                maxHeight: 96,
                                overflow: "hidden",
                              }}
                            >
                              {task.title}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-px bg-slate-100" />

                        <div className="mt-3 flex items-center gap-3">
                          <div
                            className="inline-flex items-center gap-1 text-slate-500"
                            style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}
                          >
                            <CalendarDays size={13} className="text-slate-400" />
                            <span className="truncate max-w-[120px]">
                              {safeT("today.dueNoDate", "Sin fecha")}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onPointerDown={() => prefetchShareInvite(task.id)}
                            onClick={() => handleShareTask(task)}
                            className="h-9 w-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center md:h-10 md:w-10 lg:h-11 lg:w-11"
                            aria-label={safeT("shareInvite.share", "Compartir")}
                            title={safeT("shareInvite.share", "Compartir")}
                          >
                            <Share2 size={15} color="#94A3B8" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDone(task)}
                            className="h-9 w-9 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center md:h-10 md:w-10 lg:h-11 lg:w-11"
                            aria-label={safeT("today.done", "Hecho")}
                            title={safeT("today.done", "Hecho")}
                          >
                            <Check size={15} color="#10B981" />
                          </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleDateGroups.map((group) => (
                      <div key={`today-${group.key}`} className="pt-2">
                        <div className="w-full flex items-center gap-2 mb-2 text-left">
                          <ChevronDown size={16} className="text-slate-500" />
                          <p className="font-semibold uppercase tracking-widest text-slate-600" style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}>
                            {group.label}
                          </p>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <div className="space-y-2">
                          {group.items.map((task) => (
                            <div
                              key={`today-${task.id}-${group.key}`}
                              className="rounded-3xl bg-white border border-[#7d59c9] shadow-[0_6px_14px_rgba(15,23,42,0.05)] px-4 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 relative">
                                  <CalendarClock size={18} />
                                  {shouldShowSentIndicator(task) && (
                                    <span
                                      className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                                      aria-label={safeT("shareInvite.sentIndicator", "Compartido por ti")}
                                      title={safeT("shareInvite.sentIndicator", "Compartido por ti")}
                                    >
                                      <Share2 size={10} className="text-slate-500" />
                                    </span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-semibold text-slate-900 leading-snug"
                                    style={{ fontSize: "clamp(16px, 1.1vw, 26px)" }}
                                  >
                                    {safeT("pill.type.task", "Recordatorio")}
                                  </p>
                                  <p
                                    className="mt-1 text-slate-700"
                                    style={{
                                      fontSize: "clamp(13px, 0.86vw, 17px)",
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                      overflowWrap: "anywhere",
                                      maxHeight: 96,
                                      overflow: "hidden",
                                    }}
                                  >
                                    {task.title}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 h-px bg-slate-100" />

                              <div className="mt-3 flex items-center gap-3">
                                <div
                                  className="inline-flex items-center gap-1 text-slate-500"
                                  style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}
                                >
                                  <CalendarDays size={13} className="text-slate-400" />
                                  <span className="truncate max-w-[120px]">
                                    {formatDueLabel(task.due_date as string | null)}
                                  </span>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                <button
                                  type="button"
                                  onPointerDown={() => prefetchShareInvite(task.id)}
                                  onClick={() => handleShareTask(task)}
                                  className="h-9 w-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center md:h-10 md:w-10 lg:h-11 lg:w-11"
                                  aria-label={safeT("shareInvite.share", "Compartir")}
                                  title={safeT("shareInvite.share", "Compartir")}
                                >
                                  <Share2 size={15} color="#94A3B8" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDone(task)}
                                  className="h-9 w-9 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center md:h-10 md:w-10 lg:h-11 lg:w-11"
                                  aria-label={safeT("today.done", "Hecho")}
                                  title={safeT("today.done", "Hecho")}
                                >
                                  <Check size={15} color="#10B981" />
                                </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
              {safeT("today.noUrgentTitle", "Todo bajo control")}
            </div>
          )}
        </div>

      </div>
      </div>
      {/* MODAL: shortcuts examples */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.shortcutsModal.title", "Ver ejemplos")}
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              {safeT(
                "today.shortcutsModal.body",
                "Toca un ejemplo para abrir Remi con ese texto.",
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
                    openCapture(ex);
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
                  openCapture("");
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

      {/* HELP iOS: enable keyboard dictation */}
      {showIosDictationHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.iosDict.helpTitle", "Activa Dictado en iPhone")}
            </h2>

            <p className="text-xs text-slate-600 mb-3">
              {safeT(
                "today.iosDict.helpBody",
                "En iOS suele estar en: Ajustes -> General -> Teclado -> Activar Dictado.",
              )}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.iosDict.helpStepsTitle", "Pasos rápidos")}

              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>{safeT("today.iosDict.step1", "Abre Ajustes")}</li>
                <li>{safeT("today.iosDict.step2", "General -> Teclado")}</li>
                <li>{safeT("today.iosDict.step3", "Activa \"Activar Dictado\"")}</li>
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

      {/* HELP: multi-device */}
      {showMultiDeviceHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT(
                "today.multideviceHelp.title",
                "Multidispositivo: no olvides nada, estés donde estés",
              )}
            </h2>

            <p className="text-xs text-slate-600 mb-3">
              {safeT(
                "today.multideviceHelp.p1",
                "Remi está en móvil, iPad y PC. Captura en cualquier sitio y todo se sincroniza.",
              )}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.multideviceHelp.stepsTitle", "Cómo usarlo (rápido)")}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  {safeT(
                    "today.multideviceHelp.step1",
                    "Captura donde te pille: móvil, tablet o PC.",
                  )}
                </li>
                <li>
                  {safeT(
                    "today.multideviceHelp.step2",
                    "Todo se sincroniza: lo que guardas en un dispositivo aparece en los demás.",
                  )}
                </li>
                <li>
                  {safeT(
                    "today.multideviceHelp.step3",
                    "Notificaciones por dispositivo: activa avisos solo en los que quieras (ej: móvil).",
                  )}
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.multideviceHelp.examplesTitle", "Ejemplos que funcionan")}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>
                {safeT(
                  "today.multideviceHelp.examplesBody",
                  "Idea: comprar regalo\\nTarea: cita del médico\\nTarea: traer cargador",
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {safeT(
                "today.multideviceHelp.footer",
                "Tú sueltas la carga mental en el momento. Remi se encarga de recordártelo cuando toque.",
              )}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowMultiDeviceHelp(false)}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md"
              >
                {safeT("today.multideviceHelp.ok", "Entendido")}
              </button>

              <button
                type="button"
                onClick={() => {
                  dismissTip(MULTI_DEVICE_TIP_KEY);
                  setShowMultiDeviceHelp(false);
                }}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.multideviceHelp.hideForever", "No mostrar más")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AYUDA: "Compartir -> Remi" */}
      {showShareToRemiHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.shareToRemiModal.title", "Compartir a Remi")}
            </h2>

            ...
          </div>
        </div>
      )}

      {/* HELP: share reminders */}
      {showShareRemindersHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT(
                "today.shareRemindersModal.title",
                "Compartir recordatorios con otras personas",
              )}
            </h2>

            <p className="text-xs text-slate-600 mb-3">
              {safeT(
                "today.shareRemindersModal.body",
                "Envía una tarea o idea por enlace para que otra persona la añada a su Remi en 1 toque.",
              )}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.shareRemindersModal.stepsTitle", "Cómo funciona (rápido)")}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>{safeT("today.shareRemindersModal.step1", "Abre una tarea/idea y toca el icono de Compartir.")}</li>
                <li>{safeT("today.shareRemindersModal.step2", "Se genera un enlace. Envíalo por WhatsApp, Mail, etc.")}</li>
                <li>{safeT("today.shareRemindersModal.step3", "La otra persona abre el enlace y toca \"Añadir a Remi\".")}</li>
              </ul>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.shareRemindersModal.examplesTitle", "Ejemplos que van genial")}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>
                {safeT(
                  "today.shareRemindersModal.examplesBody",
                  "Ej: \"Traer cargador\" y se lo envías a un familiar o compañero para que lo añada en un toque.",
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {safeT(
                "today.shareRemindersModal.footer",
                "Esto es para compartir con otras personas. \"Enviar a Remi\" es para guardar cosas desde otras apps en tu propio Remi.",
              )}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowShareRemindersHelp(false)}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md"
              >
                {safeT("today.shareRemindersModal.ok", "Entendido")}
              </button>

              <button
                type="button"
                onClick={() => {
                  dismissTip(SHARE_REMINDERS_TIP_KEY);
                  setShowShareRemindersHelp(false);
                }}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.shareRemindersModal.hideForever", "No volver mostrar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP push */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
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
                  ? safeT("today.pushEnabling", "Activando...")
                  : safeT("today.pushEnable", "Activar")}
              </button>

              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.pushLater", "Ahora no")}
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackSurveyModal
        open={showFeedbackSurvey}
        loading={savingFeedback}
        title={safeT("feedback.title", "Tu opinión sobre Remi")}
        questionScore={safeT("feedback.q1", "¿Te está ayudando Remi?")}
        questionLike={safeT("feedback.q3", "¿Qué es lo que más te gusta?")}
        placeholderLike={safeT("feedback.placeholderLike", "Escribe lo que más te gusta...")}
        questionImprove={safeT("feedback.q2", "¿Qué mejorarías?")}
        placeholderImprove={safeT("feedback.placeholder", "Escribe una sugerencia breve...")}
        submitLabel={safeT("feedback.send", "Enviar opinión")}
        laterLabel={safeT("feedback.later", "Ahora no")}
        scoreHintLow={safeT("feedback.low", "Nada")}
        scoreHintHigh={safeT("feedback.high", "Mucho")}
        onClose={() => {
          markFeedbackDismissed();
          setShowFeedbackSurvey(false);
        }}
        onSubmit={handleSubmitFeedbackSurvey}
      />

      <MindRelaxSurface
        open={relaxOpen}
        onClose={() => setRelaxOpen(false)}
        onCapture={() => {
          setRelaxOpen(false);
          openCapture("");
        }}
        labels={{
          sound: safeT("status.relaxSound", "Sonido"),
          soundOff: safeT("status.relaxSoundOff", "Sonido apagado"),
          pops: safeT("status.relaxPops", "Pops"),
          modeTitle: safeT("status.relaxModeTitle", "Bubble Pop Zen"),
          modeCalm: safeT("status.relaxModeCalm", "Calma"),
          modeEnergy: safeT("status.relaxModeEnergy", "Energía"),
          resetDoneTitle: safeT("status.relaxDoneTitle", "Reset hecho"),
          resetDoneSubtitle: safeT(
            "status.relaxDoneSubtitle",
            "Descarga tensión con toques simples. Sin pensar.",
          ),
          capture: safeT("status.relaxCapture", "Capturar"),
          viewCanvas: safeT("status.relaxViewCanvas", "Ver lienzo"),
          tapToReturn: safeT("status.relaxTapToReturn", "Toca para volver"),
          close: safeT("common.close", "Cerrar"),
        }}
      />
    </div>
  );
}

function EmptyStateCard({ title, subtitle }: { title: string; subtitle: string }) {
  const subtitleParts = subtitle.split("+");
  const hasInlinePlus = subtitleParts.length > 1;

  return (
    <div className="mt-4 relative h-[312px] overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-[58%] min-w-[210px] max-w-[260px] h-[250px] rounded-[26px] border border-slate-300 bg-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.08)] px-3.5 py-3 flex flex-col">
        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
          <CalendarClock size={16} />
        </div>
        <div className="mt-4">
          <p className="text-[20px] font-extrabold leading-snug text-slate-900">{title}</p>
          <p className="mt-2 text-[13px] leading-snug text-slate-600">
            {hasInlinePlus
              ? subtitleParts.map((part, idx) => (
                  <span key={`subtitle-part-${idx}`}>
                    {idx > 0 && (
                      <span className="mx-1.5 inline-flex h-5 w-5 translate-y-[3px] items-center justify-center rounded-full border border-white bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.22)]">
                        <Plus size={12} strokeWidth={2.2} />
                      </span>
                    )}
                    {part}
                  </span>
                ))
              : subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskRowCard({
  task,
  dueLabel,
  showSentIndicator,
  sentIndicatorLabel,
  shareLabel,
  doneLabel,
  onShare,
  onDone,
}: {
  task: BrainItem;
  dueLabel: string;
  showSentIndicator: boolean;
  sentIndicatorLabel: string;
  shareLabel: string;
  doneLabel: string;
  onShare: (task: BrainItem) => void;
  onDone: (task: BrainItem) => void;
}) {
  return (
    <div className={TASK_CARD_CLASS}>
      <div className={`${ITEM_ICON_CLASS} relative`}>
        <CalendarClock size={18} />
        {showSentIndicator && (
          <span
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
            title={sentIndicatorLabel}
            aria-label={sentIndicatorLabel}
          >
            <Share2 size={10} className="text-slate-500" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-normal text-slate-900 leading-snug"
          style={{
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
          }}
        >
          {task.title}
        </p>

        <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
          <CalendarDays size={14} className="text-slate-400" />
          <span className="truncate">{dueLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={() => prefetchShareInvite(task.id)}
          onClick={() => onShare(task)}
          title={shareLabel}
          aria-label={shareLabel}
          className={ACTION_BTN_CLASS}
        >
          <Share2 size={16} color="#94A3B8" />
        </button>

        <button
          type="button"
          onClick={() => onDone(task)}
          title={doneLabel}
          aria-label={doneLabel}
          className={DONE_BTN_CLASS}
        >
          <Check size={16} color="#10B981" />
        </button>
      </div>
    </div>
  );
}

const menuButtonStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  padding: "7px 9px",
  fontSize: 13,
  cursor: "pointer",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  color: "#0f172a",
};





