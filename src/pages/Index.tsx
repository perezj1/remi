// src/pages/Index.tsx
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
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  BrainItem,
  ReminderMode,
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


// ✅ HOOK deck (snap 1 tarjeta por gesto)
import { useSnapTipDeck } from "@/hooks/useSnapTipDeck";

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
} from "lucide-react";

// ✅ NUEVO: para ocultar BottomNav cuando hay modales abiertos (App.tsx lo usa)
import { useModalUi } from "@/contexts/ModalUiContext";

const AVATAR_KEY = "remi_avatar";

// ✅ persistir “no mostrar más” para tips
const TIP_DISMISS_KEY = "remi_tip_dismissed_v1";

// ✅ key NUEVA para que vuelva a aparecer el tip “Compartir → Remi”
const SHARE_TO_REMI_DISMISS_KEY = "share-to-remi-help";

// ✅ Añade esto arriba con las otras keys (Index.tsx)
const SHARE_REMINDERS_TIP_KEY = "share-reminders";


// ✅ NUEVO: key tip multi-dispositivo
const MULTI_DEVICE_TIP_KEY = "multi-device";

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
  const { user, profile } = useAuth();
  const { t } = useI18n();

  // ✅ registrar modales para ocultar BottomNav
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

  // Solo lo que tú has compartido (no lo recibido)
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

  // ✅ estado de push real (para ocultar la tarjeta si ya está activado)
  const [hasPushSubscription, setHasPushSubscription] = useState<
    boolean | null
  >(null);

  // ✅ dismiss de tips
  const [dismissedTips, setDismissedTips] = useState<Record<string, boolean>>(
    {},
  );

  // ✅ detectar PWA/standalone e iOS (para tips)
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // ✅ modal ayuda dictado iOS
  const [showIosDictationHelp, setShowIosDictationHelp] = useState(false);

  // ✅ modal: ejemplos “Atajos”
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // ✅ modal ayuda: “Compartir → Remi” (iOS/Android)
  const [showShareToRemiHelp, setShowShareToRemiHelp] = useState(false);

  // ✅ modal ayuda: multi-dispositivo
  const [showMultiDeviceHelp, setShowMultiDeviceHelp] = useState(false);

  // ✅ modal ayuda: compartir recordatorios (entre usuarios)
  const [showShareRemindersHelp, setShowShareRemindersHelp] = useState(false);

  // ✅ tick para re-evaluar “Cierre del día” sin recargar
  const [nowTick, setNowTick] = useState(0);

const anyModalOpen =
    showPushModal ||
  showShortcutsModal ||
  showIosDictationHelp ||
  showShareToRemiHelp ||
  showMultiDeviceHelp ||
  showShareRemindersHelp;

 useEffect(() => {
    setModalOpen(anyModalOpen);
  }, [anyModalOpen, setModalOpen]);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  

  // ✅ Ahora: Hoy (default), Semana, Sin fecha
  const [filter, setFilter] = useState<FilterMode>("TODAY");

  // ✅ plegar/desplegar por grupo (por defecto TODO abierto)
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const isCollapsed = (key: string) => !!collapsedGroups[key];
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeTasksCount = tasks.length;

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

  // ✅ Abrir el capture global desde cualquier página
  const openCapture = useCallback((prefill?: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("remi-open-capture", {
        detail: { initialText: prefill ?? "" },
      }),
    );
  }, []);

  // ---------- Cargar tareas, ideas y resumen ----------
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

  // ✅ cuando se crea algo desde el modal global, recargamos
  useEffect(() => {
    if (!user) return;
    const onChanged = () => void loadData();
    window.addEventListener("remi-items-changed", onChanged);
    return () => window.removeEventListener("remi-items-changed", onChanged);
  }, [loadData, user]);

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

  // ---------- comprobar push (MULTI-DISPOSITIVO) ----------
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

    const checkThisDeviceSubscription = async () => {
      try {
        // Si el navegador no soporta push, no enseñamos el tip
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          setHasPushSubscription(true);
          setShowPushModal(false);
          return;
        }

        // Si todavía no está concedido, este dispositivo no puede tener sub activa
        if (Notification.permission !== "granted") {
          setHasPushSubscription(false);
          setShowPushModal(true);
          return;
        }

        // 1) Miramos si ESTE dispositivo tiene suscripción local
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
          setHasPushSubscription(false);
          setShowPushModal(true);
          return;
        }

        // 2) Verificamos si esa sub (endpoint) está guardada en DB para este usuario
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

        // 3) Permiso granted + hay sub local, pero falta en DB => registramos silenciosamente
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
      today.getDate(),
    );
    const tomorrowMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const todayIso = todayMid.toISOString().slice(0, 10);

    const groupsMap = new Map<string, DateGroup>();
    const noDate: BrainItem[] = [];

    const addTaskToDate = (dateMid: Date, task: BrainItem) => {
      const dMid = new Date(
        dateMid.getFullYear(),
        dateMid.getMonth(),
        dateMid.getDate(),
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
              cursor.getDate() + 1,
            );
          }
        }
      }

      if (mode === "WEEK_BEFORE_AND_DUE") {
  const weekBefore = new Date(dueMid);
  weekBefore.setDate(weekBefore.getDate() - 7);
  addTaskToDate(weekBefore, task);
}

    }

    const dateGroupsArr = Array.from(groupsMap.values())
      .filter((g) => g.items.length > 0)
      .sort((a, b) => (a.dateMs ?? 0) - (b.dateMs ?? 0));

    return { dateGroups: dateGroupsArr, noDateTasks: noDate };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, safeT]);

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

  const hasVisibleDatedTasks = filteredDateGroups.some(
    (g) => g.items.length > 0,
  );
  const hasNoDateTasks = filter === "NO_DATE" && noDateTasks.length > 0;

  const handleDone = async (task: BrainItem) => {
    const updated = await setTaskStatus(task.id, "DONE");
    setTasks((prev) => prev.filter((tt) => tt.id !== updated.id));
  };

    const handleShareTask = async (task: BrainItem) => {
  try {
    // ✅ usa la promesa cacheada (si ya empezó en pointerdown, aquí casi “vuela”)
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

  const handlePasteFromClipboard = async () => {
    try {
      if (!("clipboard" in navigator) || !navigator.clipboard?.readText) {
        toast.error("El portapapeles no está disponible aquí");
        openCapture("");
        return;
      }

      const txt = (await navigator.clipboard.readText())?.trim?.() ?? "";
      if (!txt) {
        toast.message(
          "Portapapeles vacío (o sin permiso). Abro Remi igualmente 🙂",
        );
        openCapture("");
        return;
      }
      openCapture(txt);
    } catch (e) {
      console.error(e);
      toast.error(
        "No pude leer el portapapeles (permiso). Abro Remi igualmente 🙂",
      );
      openCapture("");
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

  // ✅ Condición: tip push (solo si permission !== granted y ESTE DISPOSITIVO no está registrado)
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
          "Ábrela en 1 toque y funciona más fluida como una app.",
        ),
        cta: safeT("today.tip.install.cta", "Instalar"),
        icon: <Download size={18} />,
        bg: "",
        border: "rgba(125,89,201,0.70)",
        onClick: () => handleInstallApp(),
      });
    }

    // 2) Activar notificaciones
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

    // 3) Activar micrófono (iOS dictado)
    if (isIOSDevice && !dismissedTips["ios-dictation"]) {
      cards.push({
        id: "ios-dictation",
        title: safeT(
          "today.tip.iosDict.title",
          "Activa el micrófono del teclado",
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

    // ✅ Multi-dispositivo
    if (!dismissedTips[MULTI_DEVICE_TIP_KEY]) {
      cards.push({
        id: MULTI_DEVICE_TIP_KEY,
        title: safeT(
          "today.tip.multidevice.title",
          "Remi contigo en móvil, iPad y PC",
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

    // 5) Palabras que ahorran tiempo (abre modal ejemplos)
    cards.push({
      id: "shortcuts",
      title: safeT("today.tip.shortcuts.title", "Palabras que ahorran tiempo"),
      body: safeT(
        "today.tip.shortcuts.body",
        "Una idea = empieza con ‘Idea: …’. Una tarea = empieza con un verbo.",
      ),
      cta: safeT("today.tip.shortcuts.cta", "Ver ejemplos"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => setShowShortcutsModal(true),
    });

    // 6) Cierre del día
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

    // 7) Pegar texto
    cards.push({
      id: "paste",
      title: safeT("today.tip.paste.title", "¿Has probado a pegar texto?"),
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

      // ✅ 8) “Compartir recordatorios con otras personas” (entre usuarios)
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


    // 9) Escribir como hablas
    cards.push({
      id: "natural",
      title: safeT("today.tip.natural.title", "Escribe como hablas"),
      body: safeT(
        "today.tip.natural.body",
        "Ej: “Pagar la luz mañana a las 6 de la tarde”. Remi lo ordena y tú te olvidas.",
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

    // 10) ✅ Atajos inteligentes
    cards.push({
      id: "smart-shortcuts",
      title: safeT(
        "today.tip.smartShortcuts.title",
        "Atajos inteligentes (ahorran 10s)",
      ),
      body: safeT(
        "today.tip.smartShortcuts.body",
        "Agrega palabras con 1 toque. Ej: Idea / Comprar / a las 18:00.",
      ),
      cta: safeT("today.tip.smartShortcuts.cta", "Probar ahora"),
      icon: <Sparkles size={18} />,
      bg: "",
      border: "rgba(125,89,201,0.70)",
      onClick: () => openCapture(""),
    });

    // 4) ✅ Tareas sin fecha (si existen)
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
          { count: noDateCount },
        ),
        body: safeT(
          "today.tip.noDate.body",
          "¿Las ordenamos? En 30s te dejo la lista limpia.",
        ),
        cta: safeT("today.tip.noDate.cta", "Ver sin fecha"),
        icon: <CalendarDays size={18} />,
        bg: "",
        border: "rgba(16,185,129,0.65)",
        onClick: () => setFilter("NO_DATE"),
      });
    }

    // 11) Semana
    cards.push({
      id: "week",
      title: safeT("today.tip.week.title", "Plan rápido"),
      body: safeT(
        "today.tip.week.body",
        "Mira tu semana en 1 gesto. Lo urgente primero, lo demás fuera de la cabeza.",
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
        "Respira 4s, suelta 6s. Tu mente no necesita hacerlo todo hoy.",
      ),
      cta: safeT("today.tip.mental.cta", "Vaciar mente"),
      icon: <HeartPulse size={18} />,
      bg: "",
      border: "rgba(244,63,94,0.60)",
      onClick: () => openCapture(""),
    });

    // 13) Cumpleaños
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

    // ✅ “sin tareas sin fecha”
    if (noDateCount === 0) {
      cards.push({
        id: "clean-no-date",
        title: safeT("today.tip.cleanNoDate.title", "✅ Sin tareas sin fecha"),
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

  // ✅ Deck: ahora con hook
  const deckRef = useRef<HTMLDivElement | null>(null);
  const {
    activeIndex: activeTipIndex,
    scrollToIndex: scrollToTip,
    bind: deckBind,
  } = useSnapTipDeck(deckRef, tipCards.length, {
    maxStep: 1,
    settleMs: 120,
  });

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
            // ⬇️ deja espacio para la BottomNav + safe area iPhone
      paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
        `}
      </style>

      {/* CABECERA */}
      <div
  style={{
    // ⬇️ antes: padding: "16px 20px 18px",
    paddingTop: "calc(16px + env(safe-area-inset-top))",
    paddingBottom: 18,
    paddingLeft: "calc(20px + env(safe-area-inset-left))",
    paddingRight: "calc(20px + env(safe-area-inset-right))",

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
          {...deckBind}
          className="remi-tipDeck"
          style={{
            display: "flex",
            alignItems: "stretch",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            overscrollBehaviorX: "contain",
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
              style={{ marginLeft: idx === 0 ? 0 : -DECK_OVERLAP }}
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
              safeT("today.tabsNoDate", "Sin fecha"),
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
                    "No hay nada urgente ahora mismo",
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
                    "No hay nada urgente ahora mismo",
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

                {/* ✅ Contenido plegable */}
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
                          <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0 relative">
                            <List size={18} />

                            {shouldShowSentIndicator(task) && (
                              <span
                                className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                                title={safeT("shareInvite.sentIndicator", "Compartida por ti")}
                                aria-label={safeT("shareInvite.sentIndicator", "Compartida por ti")}
                              >
                                <Share2 size={10} className="text-slate-500" />
                              </span>
                            )}
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
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />
                              <span className="truncate">{dueStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onPointerDown={() => prefetchShareInvite(task.id)}
                              onClick={() => handleShareTask(task)}
                              title={safeT("shareInvite.share", "Compartir")}
                              aria-label={safeT("shareInvite.share", "Compartir")}
                              className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center"
                            >
                              <Share2 size={16} color="#94A3B8" />
                            </button>



                            <button
                              type="button"
                              onClick={() => handleDone(task)}
                              title={safeT(
                                "today.actionDoneTitle",
                                "Marcar como completada",
                              )}
                              aria-label={safeT(
                                "today.actionDoneTitle",
                                "Marcar como completada",
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
                      <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0 relative">
                        <List size={18} />

                        {shouldShowSentIndicator(task) && (
                          <span
                            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                            title={safeT("shareInvite.sentIndicator", "Compartida por ti")}
                            aria-label={safeT("shareInvite.sentIndicator", "Compartida por ti")}
                          >
                            <Share2 size={10} className="text-slate-500" />
                          </span>
                        )}
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
                          <CalendarDays
                            size={14}
                            className="text-slate-400"
                          />
                          <span className="truncate">
                            {safeT("today.dueNoDate", "Sin fecha")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onPointerDown={() => prefetchShareInvite(task.id)}
                          onClick={() => handleShareTask(task)}
                          title={safeT("shareInvite.share", "Compartir")}
                          aria-label={safeT("shareInvite.share", "Compartir")}
                          className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center"
                        >
                          <Share2 size={16} color="#94A3B8" />
                        </button>


                        <button
                          type="button"
                          onClick={() => handleDone(task)}
                          title={safeT("today.actionDoneTitle", "Marcar como completada")}
                          aria-label={safeT("today.actionDoneTitle", "Marcar como completada")}
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

      {/* ✅ MODAL: ejemplos “Atajos que ahorran 10s” */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
                "En iOS suele estar en: Ajustes → General → Teclado → Activar Dictado.",
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

      {/* ✅ AYUDA Multi-dispositivo */}
      {showMultiDeviceHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
                "Remi está pensado para que puedas soltar cosas en 5 segundos, desde cualquier dispositivo.",
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
                    "Captura donde te pille: móvil, iPad/tablet o PC. Escribe, habla o pega texto.",
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
                    "Notificaciones por dispositivo: activa avisos solo en los que quieras (ej: móvil ON, PC OFF).",
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
                  "• Móvil ON → recordatorios cuando estás fuera\n• PC OFF → cero interrupciones trabajando\n• iPad ON → revisión tranquila al final del día",
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

      {/* ✅ AYUDA: “Compartir → Remi” */}
      {showShareToRemiHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-base font-semibold mb-1">
              {safeT("today.shareToRemiModal.title", "Compartir a Remi")}
            </h2>

            ...
          </div>
        </div>
      )}

      {/* ✅ AYUDA: “Compartir recordatorios” */}
      {showShareRemindersHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
                <li>{safeT("today.shareRemindersModal.step3", "La otra persona abre el enlace y toca “Añadir a Remi”.")}</li>
              </ul>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-[12px] text-slate-700 mb-4">
              <div className="font-semibold mb-1">
                {safeT("today.shareRemindersModal.examplesTitle", "Ejemplos que van genial")}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>
                {safeT(
                  "today.shareRemindersModal.examplesBody",
                  "• “Compra pan mañana” → se lo envío a mi pareja\n• “Cita del médico” → se lo envío a mi madre\n• “Traer cargador” → se lo envío al compañero",
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {safeT(
                "today.shareRemindersModal.footer",
                "Esto es para compartir con otras personas. “Enviar a Remi” es para guardar cosas desde otras apps en tu propio Remi.",
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
                {safeT("today.pushLater", "Ahora no")}
              </button>
            </div>
          </div>
        </div>
      )}
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
        scrollSnapStop: "always",
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
            whiteSpace: "pre-line",
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
