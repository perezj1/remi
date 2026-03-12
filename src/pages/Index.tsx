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
import {
  answerMemoryQuestion,
  type MemoryRecallAnswer,
  type MemoryRecallItem,
} from "@/lib/memoryRecallApi";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/registerPush";
import {
  createShareInviteCached,
  fetchReceivedShareNotifications,
  fetchShareInviteNotifications,
  prefetchShareInvite,
  shareTextOrCopy,
  subscribeToReceivedShareNotifications,
  subscribeToShareInviteNotifications,
  type ReceivedShareNotification,
  type ShareInviteNotification,
} from "@/lib/shareInvitesApi";
import type { AppNotification } from "@/lib/notificationCenter";
import {
  createSharedList,
  createSharedListInviteShare,
  createSharedListItem,
  fetchSharedListNotifications,
  fetchSharedListItems,
  markSharedListNotificationsSeen,
  subscribeToSharedListNotifications,
  type SharedList,
  type SharedListMemberPreview,
  type SharedListNotification,
  fetchSharedLists,
  updateSharedListItem,
  updateSharedListIcon,
} from "@/lib/sharedListsApi";
import { useSnapTipDeck } from "@/hooks/useSnapTipDeck";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
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
  Bell,
  Check,
  Users,
  Share2,
  Smartphone,
  CalendarPlus,
  Sparkles,
  ClipboardPaste,
  CalendarDays,
  HeartPulse,
  ChevronDown,
  Keyboard,
  Download,
  Search,
  Plus,
  Mic,
  SendHorizontal,
  X,
} from "lucide-react";

import { useModalUi } from "@/contexts/ModalUiContext";
import MindDumpModal from "@/components/MindDumpModal";
import MindRelaxSurface from "@/components/MindRelaxSurface";
import RemiAvatar from "@/components/RemiAvatar";
import RemiShareLoader from "@/components/RemiShareLoader";
import SharedListNotificationsPanel from "@/components/SharedListNotificationsPanel";

const TIP_DISMISS_KEY = "remi_tip_dismissed_v1";

const SHARE_TO_REMI_DISMISS_KEY = "share-to-remi-help";

const SHARE_REMINDERS_TIP_KEY = "share-reminders";


const MULTI_DEVICE_TIP_KEY = "multi-device";
const OPEN_NOTIFICATIONS_EVENT = "remi-open-notifications";

type NotificationCenterState = {
  clearedAtMs: number;
  shareActivitySeenAtMs: number;
};

const EMPTY_NOTIFICATION_CENTER_STATE: NotificationCenterState = {
  clearedAtMs: 0,
  shareActivitySeenAtMs: 0,
};

function getNotificationCenterStorageKey(userId: string) {
  return `remi-notification-center:${userId}`;
}

function readNotificationCenterState(userId: string): NotificationCenterState {
  if (typeof window === "undefined") return EMPTY_NOTIFICATION_CENTER_STATE;

  try {
    const raw = localStorage.getItem(getNotificationCenterStorageKey(userId));
    if (!raw) return EMPTY_NOTIFICATION_CENTER_STATE;
    const parsed = JSON.parse(raw) as Partial<NotificationCenterState>;
    return {
      clearedAtMs:
        typeof parsed.clearedAtMs === "number" && Number.isFinite(parsed.clearedAtMs)
          ? parsed.clearedAtMs
          : 0,
      shareActivitySeenAtMs:
        typeof parsed.shareActivitySeenAtMs === "number" &&
        Number.isFinite(parsed.shareActivitySeenAtMs)
          ? parsed.shareActivitySeenAtMs
          : 0,
    };
  } catch {
    return EMPTY_NOTIFICATION_CENTER_STATE;
  }
}

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

function renderMemoryActionRow(
  item: MemoryRecallItem,
  kind: "list" | "related",
  onMarkDone: (item: MemoryRecallItem) => void,
): ReactNode {
  return (
    <div
      key={`${kind}-${item.source}-${item.id}`}
      className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5"
    >
      {kind === "list" ? (
        <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#59a5c9]" />
      ) : (
        <span className="pt-[2px] text-[14px] font-semibold text-slate-500">-</span>
      )}
      <p className="min-w-0 flex-1 text-[14px] leading-6 text-slate-800">
        {item.text}
      </p>
      <button
        type="button"
        onClick={() => onMarkDone(item)}
        disabled={item.done}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          item.done
            ? "border-[#cfd8c7] bg-[#eef5e8] text-[#4f6b3d]"
            : "border-[#cfc9e7] bg-[#f7f6fc] text-slate-500"
        } disabled:cursor-default`}
        aria-label="Hecha"
        title="Hecha"
      >
        <Check className={`h-4 w-4 ${item.done ? "" : "opacity-70"}`} />
      </button>
    </div>
  );
}

function renderMemoryAnswerContent(
  memoryAnswer: MemoryRecallAnswer,
  onMarkDone: (item: MemoryRecallItem) => void,
): ReactNode {
  const hasListItems = (memoryAnswer.listItems?.length ?? 0) > 0;
  const hasRelatedItems = (memoryAnswer.relatedItems?.length ?? 0) > 0;

  if (hasListItems || hasRelatedItems) {
    return (
      <div className="mt-2 space-y-2.5">
        {memoryAnswer.introText ? (
          <p className="text-[15px] font-medium leading-7 text-slate-800">
            {memoryAnswer.introText}
          </p>
        ) : null}

        {(memoryAnswer.listItems ?? []).map((item) =>
          renderMemoryActionRow(item, "list", onMarkDone),
        )}

        {hasRelatedItems ? (
          <>
            {hasListItems ? (
              <div className="mx-1 my-2 h-px rounded-full bg-slate-300/80" />
            ) : null}
            <div className="space-y-2.5">
              {memoryAnswer.relatedItems?.map((item) =>
                renderMemoryActionRow(item, "related", onMarkDone),
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  const lines = memoryAnswer.answer.split("\n");

  return (
    <div className="mt-2 space-y-2.5">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) return <div key={`memory-gap-${index}`} className="h-1" />;

        if (line === "__REMI_SECTION_SEPARATOR__") {
          return (
            <div
              key={`memory-separator-${index}`}
              className="mx-1 my-2 h-px rounded-full bg-slate-300/80"
            />
          );
        }

        if (line === "...") {
          return (
            <p
              key={`memory-ellipsis-${index}`}
              className="pl-6 text-[12px] font-semibold tracking-[0.16em] text-slate-400"
            >
              ...
            </p>
          );
        }

        if (line.startsWith("• ") || line.startsWith(". ")) {
          const text = line.slice(2).trim();
          return (
            <div
              key={`memory-bullet-${index}`}
              className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-2"
            >
              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#59a5c9]" />
              <p className="text-[14px] leading-6 text-slate-800">{text}</p>
            </div>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div key={`memory-note-${index}`} className="flex items-start gap-2 px-1">
              <span className="pt-[2px] text-[14px] font-semibold text-slate-500">-</span>
              <p className="text-[14px] leading-6 text-slate-700">{line.slice(2).trim()}</p>
            </div>
          );
        }

        return (
          <p
            key={`memory-text-${index}`}
            className="text-[15px] font-medium leading-7 text-slate-800"
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

const TIP_EMOJI_BY_ID: Record<string, string> = {
  install: "📲",
  push: "🔔",
  "ios-dictation": "🎙️",
  "multi-device": "💻",
  "share-app": "📣",
  "share-reminders": "🔗",
  shortcuts: "⚡",
  "day-close": "🌙",
  paste: "📥",
  natural: "✍️",
  "remi-language": "🌍",
  "no-date": "🗂️",
  week: "📅",
  mental: "🫶",
  birthday: "🎂",
  "clean-no-date": "✅",
  "improve-remi": "💬",
  "shared-lists": "📋",
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
const MEMORY_PLACEHOLDER_ROTATION_MS = 15000;

export default function TodayPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, lang } = useI18n();
  const uiLocale = useMemo(() => {
    if (lang === "de") return "de-DE";
    if (lang === "en") return "en-US";
    return "es-ES";
  }, [lang]);
  const speechLocale = useMemo(() => {
    if (lang === "de") return "de-DE";
    if (lang === "en") return "en-US";
    return "es-ES";
  }, [lang]);
  const isAndroid = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent || "");
  }, []);

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

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sharedListNotifications, setSharedListNotifications] = useState<SharedListNotification[]>([]);
  const [shareInviteNotifications, setShareInviteNotifications] = useState<ShareInviteNotification[]>([]);
  const [receivedShareNotifications, setReceivedShareNotifications] = useState<ReceivedShareNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationListIds, setNotificationListIds] = useState<string[]>([]);
  const [notificationCenterState, setNotificationCenterState] = useState<NotificationCenterState>(
    EMPTY_NOTIFICATION_CENTER_STATE,
  );
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
  const [showNaturalHelp, setShowNaturalHelp] = useState(false);
  const [showFeedbackSurvey, setShowFeedbackSurvey] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [mindDumpResetNonce, setMindDumpResetNonce] = useState(0);
  const [relaxOpen, setRelaxOpen] = useState(false);
  const [recentLists, setRecentLists] = useState<SharedList[]>([]);
  const [recentListsProgress, setRecentListsProgress] = useState<Record<string, { done: number; total: number }>>({});
  const [memoryQuestion, setMemoryQuestion] = useState("");
  const memoryPlaceholderExamples = useMemo(
    () => [
      safeT("today.memoryAskExample1", "Where are the keys?"),
      safeT("today.memoryAskExample2", "When do I need to go to the dentist?"),
      safeT("today.memoryAskExample3", "What is on the shopping list?"),
      safeT("today.memoryAskExample4", "What should I buy?"),
      safeT("today.memoryAskExample5", "Which series did I want to watch?"),
      safeT("today.memoryAskExample6", "What do I need to do today?"),
    ],
    [safeT],
  );
  const [memoryPlaceholderIndex, setMemoryPlaceholderIndex] = useState(0);
  const [memoryAnswer, setMemoryAnswer] = useState<MemoryRecallAnswer | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [memoryInterim, setMemoryInterim] = useState("");

  const [nowTick, setNowTick] = useState(0);

  const { isSupported: dictationSupported, status: dictationStatus, error: dictationError, start: startDictation, stop: stopDictation } =
    useSpeechDictation({
      lang: speechLocale,
      continuous: true,
      interimResults: true,
    });
  const dictationListening = dictationStatus === "listening";

const anyModalOpen =
    notificationsOpen ||
    showPushModal ||
  showShortcutsModal ||
  showIosDictationHelp ||
  showShareToRemiHelp ||
  showMultiDeviceHelp ||
  showShareRemindersHelp ||
  showNaturalHelp ||
  showFeedbackSurvey;

 useEffect(() => {
    setModalOpen(anyModalOpen);
  }, [anyModalOpen, setModalOpen]);

  const notificationListIdsSignature = useMemo(
    () => notificationListIds.join("|"),
    [notificationListIds],
  );
  const persistNotificationCenterState = useCallback(
    (nextState: NotificationCenterState) => {
      setNotificationCenterState(nextState);
      if (!user || typeof window === "undefined") return;
      try {
        localStorage.setItem(
          getNotificationCenterStorageKey(user.id),
          JSON.stringify(nextState),
        );
      } catch {}
    },
    [user],
  );

  const appNotifications = useMemo<AppNotification[]>(() => {
    const clearedAtMs = notificationCenterState.clearedAtMs;
    const shareSeenAtMs = Math.max(
      notificationCenterState.shareActivitySeenAtMs,
      clearedAtMs,
    );

    const sharedListRows = sharedListNotifications
      .filter((notification) => {
        const createdAtMs = Date.parse(notification.created_at);
        return !Number.isFinite(createdAtMs) || createdAtMs > clearedAtMs;
      })
      .map((notification) => ({
        id: `shared-list-${notification.id}`,
        source: "shared_list",
        created_at: notification.created_at,
        unread: notification.unread,
        target: { kind: "list", listId: notification.list_id } as const,
        notification,
      }));

    const shareInviteRows = shareInviteNotifications
      .filter((notification) => notification.kind !== "share_sent")
      .filter((notification) => {
        const createdAtMs = Date.parse(notification.created_at);
        return !Number.isFinite(createdAtMs) || createdAtMs > clearedAtMs;
      })
      .map((notification) => ({
        id: `share-invite-${notification.id}`,
        source: "share_invite",
        created_at: notification.created_at,
        unread: Date.parse(notification.created_at) > shareSeenAtMs,
        target: { kind: "none" } as const,
        notification,
      }));

    const receivedShareRows = receivedShareNotifications
      .filter((notification) => {
        const createdAtMs = Date.parse(notification.created_at);
        return !Number.isFinite(createdAtMs) || createdAtMs > clearedAtMs;
      })
      .map((notification) => ({
        id: notification.id,
        source: "received_share",
        created_at: notification.created_at,
        unread: Date.parse(notification.created_at) > shareSeenAtMs,
        target:
          notification.item_type === "idea"
            ? ({ kind: "route", href: "/ideas" } as const)
            : notification.item_type === "task"
              ? ({ kind: "route", href: "/tasks" } as const)
              : ({ kind: "none" } as const),
        notification,
      }));

    return [...sharedListRows, ...shareInviteRows, ...receivedShareRows].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
    );
  }, [
    notificationCenterState.clearedAtMs,
    notificationCenterState.shareActivitySeenAtMs,
    receivedShareNotifications,
    shareInviteNotifications,
    sharedListNotifications,
  ]);

  const unreadNotificationsCount = useMemo(
    () => appNotifications.filter((notification) => notification.unread).length,
    [appNotifications],
  );

  const unreadSharedListNotificationsCount = useMemo(
    () =>
      appNotifications.filter(
        (notification) => notification.source === "shared_list" && notification.unread,
      ).length,
    [appNotifications],
  );

  const unreadShareActivityCount = useMemo(
    () =>
      appNotifications.filter(
        (notification) => notification.source !== "shared_list" && notification.unread,
      ).length,
    [appNotifications],
  );

  

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

  const loadSharedListNotifications = useCallback(async () => {
    if (!user) {
      setSharedListNotifications([]);
      return;
    }
    const next = await fetchSharedListNotifications(user.id, 40);
    setSharedListNotifications(next);
  }, [user]);

  const loadShareInviteNotifications = useCallback(async () => {
    if (!user) {
      setShareInviteNotifications([]);
      return;
    }
    const next = await fetchShareInviteNotifications(user.id, 40);
    setShareInviteNotifications(next);
  }, [user]);

  const loadReceivedShareNotifications = useCallback(async () => {
    if (!user) {
      setReceivedShareNotifications([]);
      return;
    }
    const next = await fetchReceivedShareNotifications(user.id, 40);
    setReceivedShareNotifications(next);
  }, [user]);

  const loadNotifications = useCallback(
    async (showLoader = false) => {
      if (!user) {
        setSharedListNotifications([]);
        setShareInviteNotifications([]);
        setReceivedShareNotifications([]);
        setNotificationsLoading(false);
        return;
      }

      if (showLoader) setNotificationsLoading(true);

      try {
        await Promise.all([
          loadSharedListNotifications(),
          loadShareInviteNotifications(),
          loadReceivedShareNotifications(),
        ]);
      } catch (err) {
        console.error("Error loading notifications", err);
      } finally {
        if (showLoader) setNotificationsLoading(false);
      }
    },
    [
      loadReceivedShareNotifications,
      loadShareInviteNotifications,
      loadSharedListNotifications,
      user,
    ],
  );

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [tks, ids, summaryData, sharedLists] = await Promise.all([
        fetchActiveTasks(user.id),
        fetchActiveIdeas(user.id),
        fetchRemiStatusSummary(user.id),
        fetchSharedLists(user.id),
      ]);
      setTasks(tks);
      setIdeas(ids);
      setStatusSummary(summaryData);
      setNotificationListIds(sharedLists.map((list) => list.id));
      const listRows = await Promise.all(
        sharedLists.map(async (list) => {
          const listItems = await fetchSharedListItems(list.id);
          const total = listItems.length;
          const done = listItems.reduce((acc, item) => acc + (item.done ? 1 : 0), 0);
          const listMs = Math.max(
            Number.isFinite(Date.parse(list.updated_at || "")) ? Date.parse(list.updated_at || "") : 0,
            Number.isFinite(Date.parse(list.created_at || "")) ? Date.parse(list.created_at || "") : 0,
          );
          const itemsMs = listItems.reduce((max, item) => {
            const created = Number.isFinite(Date.parse(item.created_at || "")) ? Date.parse(item.created_at || "") : 0;
            const updated = Number.isFinite(Date.parse(item.updated_at || "")) ? Date.parse(item.updated_at || "") : 0;
            return Math.max(max, created, updated);
          }, 0);
          const activityMs = Math.max(listMs, itemsMs);
          return { list, progress: { done, total }, activityMs };
        }),
      );

      const latestRows = listRows
        .sort((a, b) => b.activityMs - a.activityMs)
        .slice(0, 5);

      setRecentLists(latestRows.map((row) => row.list));
      setRecentListsProgress(
        Object.fromEntries(latestRows.map((row) => [row.list.id, row.progress] as const)),
      );
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
    if (!user) {
      setNotificationCenterState(EMPTY_NOTIFICATION_CENTER_STATE);
      return;
    }
    setNotificationCenterState(readNotificationCenterState(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSharedListNotifications([]);
      setShareInviteNotifications([]);
      setReceivedShareNotifications([]);
      setNotificationListIds([]);
      setNotificationsLoading(false);
      return;
    }
    void loadNotifications(true);
  }, [loadNotifications, user]);

  useEffect(() => {
    if (!user) return;
    const onChanged = () => void loadData();
    window.addEventListener("remi-items-changed", onChanged);
    return () => window.removeEventListener("remi-items-changed", onChanged);
  }, [loadData, user]);

  useEffect(() => {
    if (!user || notificationListIds.length === 0) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const onRealtimeChange = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        void loadSharedListNotifications().catch((err) => {
          console.error("Error refreshing shared-list notifications", err);
        });
      }, 120);
    };
    const unsubscribe = subscribeToSharedListNotifications(
      notificationListIds,
      onRealtimeChange,
    );
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [loadSharedListNotifications, notificationListIds, notificationListIdsSignature, user]);

  useEffect(() => {
    if (notificationListIds.length > 0 || !user) return;
    setSharedListNotifications([]);
  }, [notificationListIds.length, user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToShareInviteNotifications(user.id, () => {
      void loadShareInviteNotifications().catch((err) => {
        console.error("Error refreshing share-invite notifications", err);
      });
    });
    return unsubscribe;
  }, [loadShareInviteNotifications, user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToReceivedShareNotifications(user.id, () => {
      void loadReceivedShareNotifications().catch((err) => {
        console.error("Error refreshing received-share notifications", err);
      });
    });
    return unsubscribe;
  }, [loadReceivedShareNotifications, user]);

  useEffect(() => {
    if (!user) return;
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void Promise.all([
        loadSharedListNotifications(),
        loadShareInviteNotifications(),
        loadReceivedShareNotifications(),
      ]).catch((err) => {
        console.error("Error polling notifications", err);
      });
    }, 4_000);
    return () => window.clearInterval(intervalId);
  }, [
    loadReceivedShareNotifications,
    loadShareInviteNotifications,
    loadSharedListNotifications,
    user,
  ]);

  useEffect(() => {
    if (
      !notificationsOpen ||
      !user ||
      notificationListIds.length === 0 ||
      unreadSharedListNotificationsCount === 0
    ) {
      return;
    }

    setSharedListNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false })),
    );

    void markSharedListNotificationsSeen(user.id, notificationListIds).catch((err) => {
      console.error("Error marking shared list notifications as seen", err);
    });
  }, [notificationListIds, notificationsOpen, unreadSharedListNotificationsCount, user]);

  useEffect(() => {
    if (!notificationsOpen || !user || unreadShareActivityCount === 0) return;
    const now = Date.now();
    persistNotificationCenterState({
      ...notificationCenterState,
      shareActivitySeenAtMs: Math.max(notificationCenterState.shareActivitySeenAtMs, now),
    });
  }, [
    notificationCenterState,
    notificationsOpen,
    persistNotificationCenterState,
    unreadShareActivityCount,
    user,
  ]);

  useEffect(() => {
    if (memoryPlaceholderExamples.length === 0) return;
    setMemoryPlaceholderIndex(
      Math.floor(Math.random() * memoryPlaceholderExamples.length),
    );
  }, [memoryPlaceholderExamples]);

  useEffect(() => {
    if (memoryPlaceholderExamples.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setMemoryPlaceholderIndex((prev) => {
        const next = prev + 1;
        return next >= memoryPlaceholderExamples.length ? 0 : next;
      });
    }, MEMORY_PLACEHOLDER_ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [memoryPlaceholderExamples.length]);

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
  if (shareLoading) return;
  try {
    setShareLoading(true);
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
  } finally {
    setShareLoading(false);
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

  const handleCreateListFromMindDump = useCallback(
    async (title: string, items: string[], iconEmoji?: string | null) => {
      if (!user) return;
      const cleanTitle = title.trim();
      if (!cleanTitle) return;
      const normalizeItemKey = (value: string) =>
        String(value ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      const lists = await fetchSharedLists(user.id);
      const existing = lists.find(
        (list) => list.title.trim().toLocaleLowerCase() === cleanTitle.toLocaleLowerCase(),
      );
      const targetList = existing ?? (await createSharedList(user.id, cleanTitle));
      const listWasCreated = !existing;

      const existingItems = existing ? await fetchSharedListItems(existing.id) : [];
      const existingCount = existingItems.length;
      const existingKeys = new Set(existingItems.map((item) => normalizeItemKey(item.text)));
      let addedCount = 0;
      let iconChanged = false;

      let nextPosition = existingCount;
      for (let i = 0; i < items.length; i += 1) {
        const text = items[i]?.trim();
        if (!text) continue;

        const key = normalizeItemKey(text);
        const isDuplicate = existingKeys.has(key);
        if (isDuplicate) {
          const shouldAddDuplicate = window.confirm(
            safeT(
              "lists.duplicateConfirmDetailed",
              `Punto duplicado. "${text}" ya existe en la lista "${targetList.title}". ¿Agregar de todos modos?`,
              { item: text, list: targetList.title },
            ),
          );
          if (!shouldAddDuplicate) continue;
        }

        nextPosition += 1;
        await createSharedListItem(targetList.id, text, user.id, nextPosition);
        existingKeys.add(key);
        addedCount += 1;
      }

      if (typeof iconEmoji === "string") {
        const cleanEmoji = iconEmoji.trim();
        const nextEmoji = cleanEmoji.length > 0 ? cleanEmoji : null;
        if ((targetList.icon_emoji ?? null) !== nextEmoji) {
          await updateSharedListIcon(targetList.id, nextEmoji);
          iconChanged = true;
        }
      }
      const didChange = listWasCreated || addedCount > 0 || iconChanged;
      if (didChange) {
        toast.success(
          existing ? safeT("lists.updated", "Lista actualizada.") : safeT("lists.created", "Lista creada."),
        );
      }
    },
    [safeT, user],
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
  const profileInitial = displayName.charAt(0).toUpperCase();
  const profileAvatarUrl = useMemo(() => {
    const profileAvatar = profile?.avatar_url ?? null;
    if (profileAvatar) return profileAvatar;
    const meta = (user as { user_metadata?: Record<string, unknown> } | null)?.user_metadata;
    const metaAvatar =
      typeof meta?.avatar_url === "string"
        ? meta.avatar_url
        : typeof meta?.picture === "string"
          ? meta.picture
          : null;
    return metaAvatar;
  }, [profile?.avatar_url, user]);

  const handleOpenProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleOpenNotifications = () => {
    setNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setNotificationsOpen(false);
  };

  const handleClearNotifications = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    persistNotificationCenterState({
      clearedAtMs: now,
      shareActivitySeenAtMs: now,
    });
    setSharedListNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false })),
    );

    if (notificationListIds.length > 0) {
      void markSharedListNotificationsSeen(user.id, notificationListIds).catch((err) => {
        console.error("Error clearing shared list notifications", err);
      });
    }
  }, [notificationListIds, persistNotificationCenterState, user]);

  const handleOpenLists = () => {
    navigate("/lists");
  };

  const handleOpenListById = useCallback(
    (listId: string) => {
      navigate(`/lists?list=${encodeURIComponent(listId)}`);
    },
    [navigate],
  );

  const handleOpenNotification = useCallback(
    (notification: AppNotification) => {
      setNotificationsOpen(false);

      if (notification.target.kind === "list") {
        handleOpenListById(notification.target.listId);
        return;
      }

      if (notification.target.kind === "route") {
        navigate(notification.target.href);
      }
    },
    [handleOpenListById, navigate],
  );

  const handleShareListById = useCallback(
    async (list: SharedList) => {
      if (shareLoading) return;
      try {
        setShareLoading(true);
        const invite = await createSharedListInviteShare(list.id, "editor", lang);
        const result = await shareTextOrCopy(invite.shareMessage);
        if (result === "shared") {
          toast.success(safeT("shareInvite.sharedOk", "Listo. Enlace copiado/compartido."));
        } else {
          toast.success(safeT("lists.linkCopied", "Enlace copiado."));
        }
      } catch (err) {
        console.error(err);
        toast.error(safeT("lists.shareError", "No se pudo crear el enlace."));
      } finally {
        setShareLoading(false);
      }
    },
    [lang, safeT, shareLoading],
  );

  const renderMemberAvatar = useCallback((member: SharedListMemberPreview) => {
    const label =
      member.display_name?.trim()?.slice(0, 1)?.toUpperCase() ||
      member.user_id?.slice(0, 1)?.toUpperCase() ||
      "U";
    return (
      <span
        key={member.user_id}
        className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white bg-[#ece9f6] text-[10px] font-semibold text-[#4f4a69]"
        title={member.display_name ?? undefined}
      >
        <RemiAvatar avatarUrl={member.avatar_url} fallback={label} />
      </span>
    );
  }, []);

  const handleShareApp = async () => {
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

  const handleMemoryQuestionSubmit = useCallback(async () => {
    const cleanQuestion = memoryQuestion.trim();
    if (!user || !cleanQuestion || memoryLoading) return;
    if (dictationListening) stopDictation();
    setMemoryQuestion("");
    setMemoryInterim("");

    try {
      setMemoryLoading(true);
      const answer = await answerMemoryQuestion(
        user.id,
        cleanQuestion,
        lang === "en" || lang === "de" ? lang : "es",
      );
      setMemoryAnswer(answer);
    } catch (error) {
      console.error("Error answering memory question", error);
      setMemoryAnswer({
        ok: false,
        answer:
          lang === "en"
            ? "I couldn't review your saved memory right now."
            : lang === "de"
              ? "Ich konnte deine gespeicherte Erinnerung gerade nicht prüfen."
              : "No pude revisar tu memoria guardada ahora mismo.",
        source: null,
        matchedLabel: null,
        confidence: 0,
      });
    } finally {
      setMemoryLoading(false);
    }
  }, [dictationListening, lang, memoryLoading, memoryQuestion, stopDictation, user]);

  const memoryPlaceholder = useMemo(() => {
    const currentExample =
      memoryPlaceholderExamples[memoryPlaceholderIndex] ??
      memoryPlaceholderExamples[0] ??
      safeT("today.memoryAskPlaceholder", 'Ex: "Where are the keys?"');

    const formattedPlaceholder = safeT(
      "today.memoryAskPlaceholderFormat",
      'Ex: "{{example}}"',
      { example: currentExample },
    );

    return formattedPlaceholder.replace("{{example}}", currentExample);
  }, [memoryPlaceholderExamples, memoryPlaceholderIndex, safeT]);

  const handleMemoryAnswerDone = useCallback(
    async (item: MemoryRecallItem) => {
      if (!user) return;

      try {
        if (item.source === "list_item") {
          await updateSharedListItem(item.id, { done: true }, user.id);
        } else {
          await setTaskStatus(item.id, "DONE");
          setTasks((prev) => prev.filter((task) => task.id !== item.id));
          setIdeas((prev) => prev.filter((idea) => idea.id !== item.id));
        }

        setMemoryAnswer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            listItems: prev.listItems?.filter((entry) => entry.id !== item.id) ?? [],
            relatedItems: prev.relatedItems?.filter((entry) => entry.id !== item.id) ?? [],
          };
        });
      } catch (error) {
        console.error("Error marking memory answer item as done", error);
        toast.error(
          lang === "en"
            ? "I couldn't mark it as done right now."
            : lang === "de"
              ? "Ich konnte es gerade nicht als erledigt markieren."
              : "No pude marcarlo como hecho ahora mismo.",
        );
      }
    },
    [lang, user],
  );

  useEffect(() => {
    if (!dictationListening) setMemoryInterim("");
  }, [dictationListening]);

  useEffect(() => {
    if (!dictationError) return;
    if (dictationError === "not-allowed" || dictationError === "service-not-allowed") {
      toast.error(safeT("capture.toast.micDenied", "Permiso de micrófono denegado."));
      return;
    }
    if (dictationError === "no-speech") {
      toast.message(safeT("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo."));
      return;
    }
    toast.error(safeT("capture.toast.dictationError", "Error de dictado."));
  }, [dictationError, safeT]);

  useEffect(() => {
    const onOpenNotifications = () => {
      setNotificationsOpen(true);
    };

    window.addEventListener(OPEN_NOTIFICATIONS_EVENT, onOpenNotifications);
    return () => {
      window.removeEventListener(OPEN_NOTIFICATIONS_EVENT, onOpenNotifications);
    };
  }, []);

  const handleMemoryMic = useCallback(() => {
    if (!dictationSupported) return;
    setMemoryAnswer(null);
    setMemoryInterim("");
    startDictation(({ finalText, interimText }) => {
      if (finalText) {
        setMemoryQuestion((prev) => {
          const needsSpace = prev.trim().length > 0 && !prev.endsWith(" ");
          return `${prev}${needsSpace ? " " : ""}${finalText}`.trim();
        });
        setMemoryInterim("");
      } else {
        setMemoryInterim(interimText);
      }
    }, speechLocale);
  }, [dictationSupported, speechLocale, startDictation]);

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
      id: "natural",
      title: safeT("today.tip.natural.title", "Escribe como hablas"),
      body: safeT(
        "today.tip.natural.body",
        "Ej: \"Pagar la luz mañana a las 18:00\". Remi lo ordena y tú te olvidas.",
      ),
      cta: safeT("today.tip.natural.cta", "Ver ejemplos"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(16,185,129,0.65)",
      onClick: () => setShowNaturalHelp(true),
    });

    // Hidden by request: day-close mini card.

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

    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
  const memorySection = (
    <div className="mx-auto mt-5 mb-2 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
      <div>
        <p className="font-extrabold text-slate-900" style={{ fontSize: "clamp(16px, 1vw, 22px)" }}>
          {safeT("today.memorySectionTitle", "Recuerda")}
        </p>
      </div>
      <div className="mt-2 px-1">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500">
            <Search size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <input
              value={memoryQuestion}
              onChange={(e) => setMemoryQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleMemoryQuestionSubmit();
                }
              }}
              placeholder={memoryPlaceholder}
              className="h-8 w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
            />
            {memoryInterim ? (
              <p className="truncate text-[11px] text-slate-400">{memoryInterim}</p>
            ) : null}
          </div>

          {isAndroid && memoryQuestion.trim().length === 0 ? (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!dictationListening) handleMemoryMic();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopDictation();
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopDictation();
              }}
              onPointerLeave={(e) => {
                if (!dictationListening) return;
                e.preventDefault();
                e.stopPropagation();
                stopDictation();
              }}
              disabled={!dictationSupported}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={dictationListening ? safeT("bottomNav.listening", "Escuchando…") : safeT("common.speak", "Hablar")}
              title={dictationListening ? safeT("bottomNav.listening", "Escuchando…") : safeT("common.speak", "Hablar")}
            >
              <Mic size={17} className={dictationListening ? "text-violet-600" : ""} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleMemoryQuestionSubmit()}
              disabled={memoryLoading || memoryQuestion.trim().length === 0}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={safeT("today.memoryAskButton", "Preguntar")}
              title={safeT("today.memoryAskButton", "Preguntar")}
            >
              {memoryLoading ? (
                safeT("today.memoryAskLoading", "Buscando...")
              ) : (
                <SendHorizontal size={15} />
              )}
            </button>
          )}
        </div>
      </div>

      {memoryAnswer && (
        <div className="mt-2 px-1">
          <div
            className={`relative overflow-hidden rounded-[20px] border px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
              memoryAnswer.ok
                ? "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.92),rgba(244,250,248,0.96))]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <button
              type="button"
              onClick={() => setMemoryAnswer(null)}
              className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white/70 hover:text-slate-600"
              aria-label={safeT("common.close", "Cerrar")}
              title={safeT("common.close", "Cerrar")}
            >
              <X size={14} />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {safeT("today.memoryAskAnswerLabel", "Respuesta")}
            </p>
            {memoryAnswer.ok ? (
              renderMemoryAnswerContent(memoryAnswer, handleMemoryAnswerDone)
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-[14px] leading-6 text-slate-800">
                {memoryAnswer.answer}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
  const listsSection = (
    <div className="mx-auto mt-5 mb-2 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
      <div>
        <p className="font-extrabold text-slate-900" style={{ fontSize: "clamp(16px, 1vw, 22px)" }}>
          {safeT("today.listsTitle", "Listas")}
        </p>
      </div>
      <div className="mt-2 remi-scroll flex gap-2.5 overflow-x-auto pb-1 px-1">
        {recentLists.length === 0 ? (
          <button
            type="button"
            onClick={handleOpenLists}
            className="relative w-full shrink-0 overflow-hidden rounded-[20px] border border-[#59a5c9] bg-white p-3 text-left transition hover:border-[#4b95b8]"
            aria-label={safeT("today.listsEmptyTitle", "Crea tu primera lista")}
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-2xl leading-none">
                <span role="img" aria-label="lista">
                  📋
                </span>
              </div>
              <p className="text-base font-semibold text-[#2f3240]">
                {safeT("today.listsEmptyTitle", "Crea tu primera lista")}
              </p>
            </div>
          </button>
        ) : (
          recentLists.map((list) => (
            (() => {
              const stats = recentListsProgress[list.id] ?? { done: 0, total: 0 };
              const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
              return (
                <div
                  key={list.id}
                  onClick={() => handleOpenListById(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenListById(list.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative shrink-0 overflow-hidden rounded-[20px] border border-[#59a5c9] bg-white p-3 text-left transition hover:border-[#4b95b8]"
                  style={{
                    width: "clamp(280px, 36vw, 360px)",
                  }}
                  title={list.title}
                  aria-label={list.title}
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold uppercase text-[#3f7f99]">
                      {list.icon_emoji ? (
                        <span className="text-2xl leading-none">{list.icon_emoji}</span>
                      ) : (
                        list.title.slice(0, 1)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="line-clamp-2 break-words text-base font-semibold leading-tight text-[#2f3240]"
                        style={{ minHeight: "2.2em" }}
                      >
                        {list.title}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-[#8b8fa6]">
                        {list.my_role === "owner"
                          ? safeT("lists.roleOwner", "Owner")
                          : list.my_role === "editor"
                            ? safeT("lists.roleEditor", "Editor")
                            : safeT("lists.roleViewer", "Viewer")}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {(list.member_previews ?? []).slice(0, 3).map((member) => renderMemberAvatar(member))}
                        </div>
                        <p className="inline-flex items-center gap-1 text-xs text-[#8b8fa6]">
                          <Users className="h-3.5 w-3.5" />
                          {list.members_count}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-[#5c6073]">
                      {safeT("lists.learnedTo", "Completado")} <span className="text-[#59a5c9]">{percent}%</span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleShareListById(list);
                      }}
                      className="inline-flex shrink-0 items-center gap-1 self-baseline rounded-full border border-[#d9d4eb] bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#f6f4fc]"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {safeT("lists.share", "Compartir")}
                    </button>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#dbeef6]">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${percent}%`, background: "#59a5c9" }}
                    />
                  </div>
                </div>
              );
            })()
          ))
        )}
      </div>
    </div>
  );
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
          paddingTop: "calc(16px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(15px + env(safe-area-inset-left))",
          paddingRight: "calc(15px + env(safe-area-inset-right))",
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full relative z-[1]" style={{ maxWidth: "min(96vw, 1440px)" }}>
          <div className="bg-white py-1.5" style={{ minHeight: 72 }}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className="leading-tight font-extrabold text-slate-900"
                  style={{ fontSize: "clamp(20px, 1.5vw, 28px)" }}
                >
                  {safeT("today.greetingHello", "Hello")} {displayName}! <span aria-hidden="true">👋</span>
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  {mindClearPercent}% {safeT("today.clearMindBadge", "mente más ligera")}
                </span>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                  aria-label={safeT("nav.profile", "Perfil")}
                  title={safeT("nav.profile", "Perfil")}
                >
                  <RemiAvatar
                    avatarUrl={profileAvatarUrl}
                    fallback={profileInitial}
                    alt={safeT("nav.profile", "Perfil")}
                    className="h-full w-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 w-full" style={{ maxWidth: "min(96vw, 1440px)", padding: "0 16px" }}>
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
            onCreateList={async (title, items, iconEmoji) => {
              await handleCreateListFromMindDump(title, items, iconEmoji);
            }}
            initialTextNonce={mindDumpResetNonce}
          />
        </div>
      </div>

      {memorySection}

      {listsSection}

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
      </div>
      <SharedListNotificationsPanel
        open={notificationsOpen}
        loading={notificationsLoading}
        notifications={appNotifications}
        unreadCount={unreadNotificationsCount}
        onClose={handleCloseNotifications}
        onClear={handleClearNotifications}
        onOpenNotification={handleOpenNotification}
      />
      <RemiShareLoader
        active={shareLoading}
        label={safeT("common.preparingLink", "Preparando enlace...")}
      />
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

      {/* MODAL: natural language guide */}
      {showNaturalHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={MODAL_OVERLAY_STYLE}>
          <div className="bg-white rounded-2xl p-5 w-[92%] max-w-md shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.naturalModal.title", "Escribe como hablas")}
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              {safeT(
                "today.naturalModal.body",
                "Remi detecta el tipo automáticamente: recordatorio, nota o lista.",
              )}
            </p>

            <div className="space-y-2.5 mb-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {safeT("today.naturalModal.reminderTitle", "Recordatorio con aviso previo")}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {safeT(
                    "today.naturalModal.reminderBody",
                    "Crea un recordatorio para una fecha y hora, y puede avisarte antes (1 día o 1 semana).",
                  )}
                </p>
                <p className="text-[12px] text-slate-800 mt-1">
                  {safeT(
                    "today.naturalModal.reminderExample",
                    'Ej: "Recuérdame llamar al dentista el martes a las 14:00, recuérdamelo un día antes".',
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {safeT("today.naturalModal.repeatTitle", "Frecuencia")}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {safeT(
                    "today.naturalModal.repeatBody",
                    "Programa una alarma diaria, semanal, mensual o anual a una hora aproximada.",
                  )}
                </p>
                <p className="text-[12px] text-slate-800 mt-1">
                  {safeT(
                    "today.naturalModal.repeatExample",
                    'Ej: "Recuérdame todos los lunes comprar pan a las 09:00".',
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {safeT("today.naturalModal.noteTitle", "Nota")}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {safeT("today.naturalModal.noteBody", "Guarda texto libre sin fecha.")}
                </p>
                <p className="text-[12px] text-slate-800 mt-1">
                  {safeT(
                    "today.naturalModal.noteExample",
                    'Ej: "Nota: en la calle X hay un nuevo mercado".',
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {safeT("today.naturalModal.listUpdateTitle", "Actualizar lista existente")}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {safeT(
                    "today.naturalModal.listUpdateBody",
                    "Añade puntos a una lista que ya existe por su nombre.",
                  )}
                </p>
                <p className="text-[12px] text-slate-800 mt-1">
                  {safeT(
                    "today.naturalModal.listUpdateExample",
                    'Ej: "Agrega X, Y y Z a la lista 1".',
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {safeT("today.naturalModal.listCreateTitle", "Crear lista nueva")}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {safeT(
                    "today.naturalModal.listCreateBody",
                    "Crea una lista nueva y separa los puntos por comas o saltos de línea.",
                  )}
                </p>
                <p className="text-[12px] text-slate-800 mt-1">
                  {safeT(
                    "today.naturalModal.listCreateExample",
                    'Ej: "Crea la lista X que tenga 1, 2 y 3".',
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNaturalHelp(false);
                  openCapture("");
                }}
                className="w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md"
              >
                {safeT("today.naturalModal.openRemi", "Abrir Remi")}
              </button>

              <button
                type="button"
                onClick={() => setShowNaturalHelp(false)}
                className="w-full rounded-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5"
              >
                {safeT("today.naturalModal.close", "Cerrar")}
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


