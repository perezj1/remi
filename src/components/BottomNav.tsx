// src/components/BottomNav.tsx
import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  CalendarClock,
  List,
  Plus,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { requestMicPermission } from "@/lib/micPermission";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSharedListNotifications,
  fetchSharedLists,
  subscribeToSharedListNotifications,
  type SharedListNotification,
} from "@/lib/sharedListsApi";
import {
  fetchReceivedShareNotifications,
  fetchShareInviteNotifications,
  subscribeToReceivedShareNotifications,
  subscribeToShareInviteNotifications,
  type ReceivedShareNotification,
  type ShareInviteNotification,
} from "@/lib/shareInvitesApi";

// ✅ NUEVO: para ocultar cuando hay modales
import { useModalUi } from "@/contexts/ModalUiContext";

type UiLang = "es" | "en" | "de";

const speechLangByUiLang: Record<UiLang, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
};

const CAPTURE_APPEND_EVENT = "remi-capture-append";
const OPEN_CAPTURE_EVENT = "remi-open-capture";
const OPEN_NOTIFICATIONS_EVENT = "remi-open-notifications";
const NOTIFICATION_CENTER_STATE_EVENT = "remi-notification-center-state";
const OPEN_CAPTURE_SOURCE = "bottom-nav-plus";

// ✅ evento global para indicar si el dictado está escuchando (por si vuelves a activarlo)
export const DICTATION_STATE_EVENT = "remi-dictation-state";

// ✅ texto pendiente cuando dictas desde otras páginas (por si vuelves a activarlo)
const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";

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

function detectIOS() {
  // iPhone/iPad/iPod + iPadOS (que a veces reporta MacIntel)
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS = platform === "MacIntel" && maxTouchPoints > 1;

  return isAppleMobile || isIpadOS;
}

// ✅ Helpers anti-long-press selection / callout (especialmente iOS)
const noSelectStyle: React.CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
  WebkitTapHighlightColor: "transparent",
};

// ✅ Evita warning: "Unable to preventDefault inside passive event listener"
const prevent = (e: any) => {
  if (e?.cancelable) e.preventDefault();
};

/**
 * Detecta teclado abierto (móvil) usando VisualViewport cuando existe.
 * - thresholdPx evita falsos positivos por barras pequeñas.
 */
function useKeyboardVisible(thresholdPx = 140) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;

    const computeDiff = () => {
      const vvHeight = vv?.height ?? window.innerHeight;
      return window.innerHeight - vvHeight;
    };

    const update = () => {
      const diff = computeDiff();
      setVisible(diff > thresholdPx);
    };

    update();

    if (!vv) {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [thresholdPx]);

  return visible;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { user } = useAuth();

  // ✅ NUEVO
  const { isAnyModalOpen } = useModalUi();

  const { pathname } = location;

  const isIOS = useMemo(() => detectIOS(), []);

  const activeUiLang: UiLang = useMemo(() => {
    const l = (lang as any) as string;
    return l === "de" || l === "en" || l === "es" ? (l as UiLang) : "es";
  }, [lang]);

  const activeSpeechLang = useMemo(() => {
    return speechLangByUiLang[activeUiLang] ?? "es-ES";
  }, [activeUiLang]);

  /**
   * ✅ IMPORTANTE:
   * El modal ya no se abre automáticamente en Index, así que el botón central
   * ahora debe ser "+" también en Android para abrir el nuevo modal.
   *
   * Dejamos el dictado COMENTADO (sin borrarlo) por si quieres reactivarlo
   * más adelante con otro flujo.
   */

  // // ✅ Dictado por voz (guardado para futuro)
  // const { isSupported, status, error, start, stop } = useSpeechDictation({
  //   lang: activeSpeechLang,
  //   continuous: false,
  //   interimResults: false,
  // });
  //
  // const dictationEnabled = !isIOS && isSupported;
  // const isListening = dictationEnabled && status === "listening";
  // const startedRef = useRef(false);
  //
  // const vibrateTiny = () => {
  //   try {
  //     if (navigator.vibrate) navigator.vibrate(18);
  //   } catch {
  //     // ignore
  //   }
  // };
  //
  // const emitAppend = (text: string) => {
  //   window.dispatchEvent(
  //     new CustomEvent(CAPTURE_APPEND_EVENT, { detail: { text } })
  //   );
  // };
  //
  // const emitDictationState = (listening: boolean) => {
  //   window.dispatchEvent(
  //     new CustomEvent(DICTATION_STATE_EVENT, { detail: { listening } })
  //   );
  // };
  //
  // // ✅ refleja estado listening hacia fuera (CaptureModal lo usará)
  // useEffect(() => {
  //   if (isIOS) return; // en iOS no dictamos por botón
  //   emitDictationState(isListening);
  // }, [isIOS, isListening]);
  //
  // // ✅ Manejo único del texto final (no perderlo al navegar)
  // const handleFinalText = (raw: string) => {
  //   const clean = raw.trim();
  //   if (!clean) return;
  //
  //   // Si estamos ya en Index, inyectamos directo al CaptureModal embebido
  //   if (pathname === "/") {
  //     emitAppend(clean);
  //     return;
  //   }
  //
  //   // En otras páginas: guardamos dictado pendiente para Index
  //   try {
  //     sessionStorage.setItem(NAV_DICTATION_KEY, clean);
  //   } catch {
  //     // fallback
  //     emitAppend(clean);
  //   }
  //
  //   // Navegamos a Index y abrimos modal flotante
  //   navigate("/");
  //
  //   setTimeout(() => {
  //     openCaptureModal();
  //   }, 120);
  // };
  //
  // const handleStart = async () => {
  //   if (!dictationEnabled) return;
  //   if (startedRef.current) return;
  //
  //   // ✅ pedir permiso SOLO al iniciar (gesto del usuario)
  //   const perm = await requestMicPermission();
  //
  //   if (!perm.ok) {
  //     startedRef.current = false;
  //     emitDictationState(false);
  //
  //     if (perm.reason === "no_https") {
  //       toast.error("El micrófono requiere HTTPS (o localhost).");
  //       return;
  //     }
  //     if (perm.reason === "not_supported") {
  //       toast.error("Este navegador no soporta micrófono.");
  //       return;
  //     }
  //
  //     toast.error(
  //       "No se pudo usar el micrófono. Activa el permiso del micrófono para este sitio en los ajustes del navegador."
  //     );
  //     return;
  //   }
  //
  //   startedRef.current = true;
  //   vibrateTiny();
  //
  //   start(
  //     ({ finalText }) => {
  //       if (finalText && finalText.trim()) {
  //         handleFinalText(finalText);
  //       }
  //     },
  //     activeSpeechLang
  //   );
  // };
  //
  // const handleStop = () => {
  //   startedRef.current = false;
  //   stop();
  //   emitDictationState(false); // ✅ aseguramos OFF al soltar
  // };

  const openCaptureModal = () => {
    window.dispatchEvent(
      new CustomEvent(OPEN_CAPTURE_EVENT, {
        detail: { source: OPEN_CAPTURE_SOURCE },
      }),
    );
  };

  const openCaptureFromNav = () => {
    // Abre el nuevo modal en Index siempre
    if (pathname !== "/") {
      navigate("/");
      setTimeout(() => openCaptureModal(), 120);
    } else {
      openCaptureModal();
    }
  };

  const openNotificationsFromNav = () => {
    if (pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new Event(OPEN_NOTIFICATIONS_EVENT));
      }, 120);
      return;
    }

    window.dispatchEvent(new Event(OPEN_NOTIFICATIONS_EVENT));
  };

  const isTasksActive = pathname === "/tasks" || pathname === "/ideas" || pathname === "/inbox";
  const isListsActive = pathname === "/lists";
  const notificationsLabel = t("sharedListNotifications.open") || "Notifications";
  const [notificationCenterState, setNotificationCenterState] = useState<NotificationCenterState>(
    EMPTY_NOTIFICATION_CENTER_STATE,
  );
  const [notificationListIds, setNotificationListIds] = useState<string[]>([]);
  const [sharedListNotifications, setSharedListNotifications] = useState<SharedListNotification[]>([]);
  const [shareInviteNotifications, setShareInviteNotifications] = useState<ShareInviteNotification[]>([]);
  const [receivedShareNotifications, setReceivedShareNotifications] = useState<ReceivedShareNotification[]>([]);
  const notificationListIdsSignature = useMemo(
    () => notificationListIds.join("|"),
    [notificationListIds],
  );
  const unreadNotificationsCount = useMemo(() => {
    const clearedAtMs = notificationCenterState.clearedAtMs;
    const shareSeenAtMs = Math.max(
      notificationCenterState.shareActivitySeenAtMs,
      clearedAtMs,
    );

    const unreadSharedListCount = sharedListNotifications.filter((notification) => {
      const createdAtMs = Date.parse(notification.created_at);
      return (
        notification.unread &&
        (!Number.isFinite(createdAtMs) || createdAtMs > clearedAtMs)
      );
    }).length;

    const unreadShareInviteCount = shareInviteNotifications.filter((notification) => {
      if (notification.kind === "share_sent") return false;
      const createdAtMs = Date.parse(notification.created_at);
      return !Number.isFinite(createdAtMs) || createdAtMs > shareSeenAtMs;
    }).length;

    const unreadReceivedShareCount = receivedShareNotifications.filter((notification) => {
      const createdAtMs = Date.parse(notification.created_at);
      return !Number.isFinite(createdAtMs) || createdAtMs > shareSeenAtMs;
    }).length;

    return unreadSharedListCount + unreadShareInviteCount + unreadReceivedShareCount;
  }, [
    notificationCenterState.clearedAtMs,
    notificationCenterState.shareActivitySeenAtMs,
    receivedShareNotifications,
    shareInviteNotifications,
    sharedListNotifications,
  ]);

  useEffect(() => {
    if (!user) {
      setNotificationCenterState(EMPTY_NOTIFICATION_CENTER_STATE);
      setNotificationListIds([]);
      setSharedListNotifications([]);
      setShareInviteNotifications([]);
      setReceivedShareNotifications([]);
      return;
    }

    let cancelled = false;

    const loadNotificationSources = async () => {
      try {
        const [lists, nextSharedListNotifications, nextShareInviteNotifications, nextReceivedShareNotifications] =
          await Promise.all([
            fetchSharedLists(user.id),
            fetchSharedListNotifications(user.id, 40),
            fetchShareInviteNotifications(user.id, 40),
            fetchReceivedShareNotifications(user.id, 40),
          ]);

        if (cancelled) return;

        setNotificationCenterState(readNotificationCenterState(user.id));
        setNotificationListIds(lists.map((list) => list.id));
        setSharedListNotifications(nextSharedListNotifications);
        setShareInviteNotifications(nextShareInviteNotifications);
        setReceivedShareNotifications(nextReceivedShareNotifications);
      } catch (error) {
        console.error("Error loading bottom-nav notifications", error);
      }
    };

    void loadNotificationSources();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const syncNotificationCenterState = () => {
      setNotificationCenterState(readNotificationCenterState(user.id));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== getNotificationCenterStorageKey(user.id)) return;
      syncNotificationCenterState();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(
      NOTIFICATION_CENTER_STATE_EVENT,
      syncNotificationCenterState as EventListener,
    );

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        NOTIFICATION_CENTER_STATE_EVENT,
        syncNotificationCenterState as EventListener,
      );
    };
  }, [user]);

  useEffect(() => {
    if (!user || notificationListIds.length === 0) return;

    const refreshSharedListNotifications = () => {
      void fetchSharedListNotifications(user.id, 40)
        .then((next) => setSharedListNotifications(next))
        .catch((error) => {
          console.error("Error refreshing shared-list notifications in bottom nav", error);
        });
    };

    const unsubscribe = subscribeToSharedListNotifications(
      notificationListIds,
      refreshSharedListNotifications,
    );

    return () => {
      unsubscribe();
    };
  }, [notificationListIds, notificationListIdsSignature, user]);

  useEffect(() => {
    if (!user) return;

    const refreshShareInviteNotifications = () => {
      void fetchShareInviteNotifications(user.id, 40)
        .then((next) => setShareInviteNotifications(next))
        .catch((error) => {
          console.error("Error refreshing share-invite notifications in bottom nav", error);
        });
    };

    const refreshReceivedShareNotifications = () => {
      void fetchReceivedShareNotifications(user.id, 40)
        .then((next) => setReceivedShareNotifications(next))
        .catch((error) => {
          console.error("Error refreshing received-share notifications in bottom nav", error);
        });
    };

    const unsubscribeInviteNotifications = subscribeToShareInviteNotifications(
      user.id,
      refreshShareInviteNotifications,
    );
    const unsubscribeReceivedShareNotifications = subscribeToReceivedShareNotifications(
      user.id,
      refreshReceivedShareNotifications,
    );

    return () => {
      unsubscribeInviteNotifications();
      unsubscribeReceivedShareNotifications();
    };
  }, [user]);

  /* ─────────────────────────────────────────────
     ✅ OCULTAR NAVBAR CUANDO HAY TECLADO + CAMPO ENFOCADO (INDEX)
  ───────────────────────────────────────────── */
  const keyboardVisible = useKeyboardVisible(140);
  const [fieldFocused, setFieldFocused] = useState(false);

  useEffect(() => {
    const isEditableEl = (el: Element | null) => {
      if (!el) return false;
      const node = el as HTMLElement;
      return !!node.closest("textarea, input, select, [contenteditable='true']");
    };

    const updateFromActive = () => {
      const ae = document.activeElement as Element | null;
      setFieldFocused(isEditableEl(ae));
    };

    const onFocusIn = () => updateFromActive();

    const onFocusOut = () => {
      // Espera al próximo tick por si el foco salta a otro input
      setTimeout(updateFromActive, 0);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // init
    updateFromActive();

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // ✅ NUEVO: esconder también si hay cualquier modal abierto
  const hideNav =
    isAnyModalOpen || (pathname === "/" && keyboardVisible && fieldFocused);

  return (
    <nav
      className={[
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2",
        "remi-bottomnav",
        hideNav ? "remi-bottomnav--hidden" : "",
      ].join(" ")}
      style={noSelectStyle}
      onContextMenu={prevent}
      aria-hidden={hideNav ? true : undefined}
    >
      <div
        className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)] lg:gap-6 lg:px-6 lg:py-3 xl:gap-7 xl:px-7 xl:py-3.5"
        style={noSelectStyle}
        onContextMenu={prevent}
      >
        <NavItem
          to="/"
          label={t("bottomNav.today")}
          icon={Home}
          active={pathname === "/"}
        />

        <NavItem
          to="/tasks"
          label={t("bottomNav.tasks")}
          icon={CalendarClock}
          active={isTasksActive}
        />

        {/* ✅ Botón central */}
        <div style={{ position: "relative", ...noSelectStyle }}>
          <button
            className="flex h-14 w-14 items-center justify-center rounded-full border-1 border-white bg-[#7d59c9] text-white shadow-[0_8px_20px_rgba(143,49,243,0.2)] -translate-y-0 lg:h-16 lg:w-16 xl:h-20 xl:w-20"
            type="button"
            onClick={(e) => {
              if (e.cancelable) e.preventDefault();
              openCaptureFromNav();
            }}
            onContextMenu={prevent}
            onPointerDown={prevent}
            onMouseDown={prevent}
            draggable={false}
            onDragStart={prevent}
            aria-label={t("bottomNav.add")}
            title={t("bottomNav.add")}
            style={{
              ...noSelectStyle,
              touchAction: "manipulation",
              transform: "scale(1)",
              transition: "transform 120ms ease, opacity 120ms ease",
            }}
          >
            <Plus className="h-7 w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
          </button>

          {/* ✅ Dejado como recordatorio visual del icono Mic (no usado ahora)
              <Mic className="w-7 h-7" />
          */}
        </div>

        <NavItem
          to="/lists"
          label={t("bottomNav.lists")}
          icon={List}
          active={isListsActive}
        />

        <button
          type="button"
          className="relative flex h-12 w-12 items-center justify-center rounded-full transition lg:h-14 lg:w-14 xl:h-16 xl:w-16"
          onClick={openNotificationsFromNav}
          onContextMenu={prevent}
          onPointerDown={prevent}
          onMouseDown={prevent}
          draggable={false}
          onDragStart={prevent}
          aria-label={notificationsLabel}
          title={notificationsLabel}
          style={{
            ...noSelectStyle,
            touchAction: "manipulation",
          }}
        >
          <Bell className="h-6 w-6 text-slate-700 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
          {unreadNotificationsCount > 0 ? (
            <span className="absolute right-[9px] top-[9px] inline-flex h-2.5 w-2.5 rounded-full bg-[#ef4444] lg:right-[11px] lg:top-[11px] xl:right-[13px] xl:top-[13px]" />
          ) : null}
          <span className="sr-only">{notificationsLabel}</span>
        </button>
      </div>

      <style>
        {`
          @keyframes remiPulse {
            0% { transform: scale(0.92); opacity: 0.9; }
            70% { transform: scale(1.25); opacity: 0.0; }
            100% { transform: scale(1.25); opacity: 0.0; }
          }

          /* ✅ Animación/ocultación de la barra inferior sin romper translate-x de Tailwind */
          .remi-bottomnav {
            transition: transform 180ms ease, opacity 180ms ease;
            will-change: transform, opacity;
          }
          .remi-bottomnav.remi-bottomnav--hidden {
            --tw-translate-y: 140%;
            opacity: 0;
            pointer-events: none;
          }
        `}
      </style>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
}

/**
 * ✅ IMPORTANTE:
 * Usamos <button> + navigate() (en vez de <a>/<Link>) para evitar
 * selección / callout / preview por pulsación larga en iOS.
 */
function NavItem({ to, label, active, icon: Icon }: NavItemProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-full transition lg:h-14 lg:w-14 xl:h-16 xl:w-16"
      onClick={() => navigate(to)}
      onContextMenu={prevent}
      onPointerDown={prevent}
      onMouseDown={prevent}
      draggable={false}
      onDragStart={prevent}
      aria-label={label}
      title={label}
      style={{
        ...noSelectStyle,
        touchAction: "manipulation",
      }}
    >
      <Icon
        className={`h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 ${active ? "text-[#7d59c9]" : "text-neutral-800"}`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

