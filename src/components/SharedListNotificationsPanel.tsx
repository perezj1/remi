import { Bell, Trash2, X } from "lucide-react";
import { useMemo } from "react";

import RemiAvatar from "@/components/RemiAvatar";
import { useI18n } from "@/contexts/I18nContext";
import type { AppNotification } from "@/lib/notificationCenter";
import {
  getAppNotificationContextLabel,
  renderAppNotificationMessage,
} from "@/lib/appNotificationText";

type SharedListNotificationsPanelProps = {
  open: boolean;
  loading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  onClose: () => void;
  onClear: () => void;
  onOpenNotification: (notification: AppNotification) => void;
};

function getLocale(lang: "es" | "en" | "de") {
  if (lang === "en") return "en-US";
  if (lang === "de") return "de-DE";
  return "es-ES";
}

function formatRelativeTime(dateValue: string, locale: string, nowLabel: string) {
  const dateMs = Date.parse(dateValue);
  if (!Number.isFinite(dateMs)) return "";

  const diffMs = dateMs - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absMs < 60_000) return nowLabel;
  if (absMs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (absMs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  if (absMs < 7 * 86_400_000) return rtf.format(Math.round(diffMs / 86_400_000), "day");

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateMs));
}

export default function SharedListNotificationsPanel({
  open,
  loading,
  notifications,
  unreadCount,
  onClose,
  onClear,
  onOpenNotification,
}: SharedListNotificationsPanelProps) {
  const { t, lang } = useI18n();

  const safeT = (key: string, fallback: string, vars?: Record<string, unknown>) => {
    const value = t(key as never, vars as never);
    if (!value || value === key) return fallback;
    return value;
  };

  const locale = useMemo(() => getLocale(lang), [lang]);

  const renderMessage = (notification: AppNotification) =>
    renderAppNotificationMessage(notification, safeT);

  const getAvatarData = (notification: AppNotification) => {
    if (notification.source === "shared_list") {
      const actorLabel =
        notification.notification.actor_display_name?.trim()?.slice(0, 1)?.toUpperCase() ||
        notification.notification.actor_user_id.slice(0, 1).toUpperCase() ||
        "U";

      return {
        avatarUrl: notification.notification.actor_avatar_url,
        fallback: actorLabel,
      };
    }

    if (notification.source === "share_invite") {
      const actorLabel =
        notification.notification.actor_display_name?.trim()?.slice(0, 1)?.toUpperCase() ||
        notification.notification.actor_user_id?.slice(0, 1).toUpperCase() ||
        "T";

      return {
        avatarUrl: notification.notification.actor_avatar_url,
        fallback: actorLabel,
      };
    }

    return {
      avatarUrl: notification.notification.actor_avatar_url,
      fallback:
        notification.notification.actor_display_name?.trim()?.slice(0, 1)?.toUpperCase() ||
        notification.notification.actor_user_id?.slice(0, 1).toUpperCase() ||
        (notification.notification.item_type === "idea" ? "N" : "R"),
    };
  };

  const getContextLabel = (notification: AppNotification) =>
    getAppNotificationContextLabel(notification, safeT);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/35"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="absolute right-3 top-[calc(env(safe-area-inset-top)+72px)] flex w-[min(420px,calc(100vw-24px))] max-h-[min(72vh,620px)] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={safeT("sharedListNotifications.title", "Notificaciones")}
      >
        <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-4">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef6fb] text-[#3f7f99]">
            <Bell className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                {safeT("sharedListNotifications.title", "Notificaciones")}
              </h2>
              {unreadCount > 0 ? (
                <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#7d59c9] px-2 text-[11px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {safeT(
                "sharedListNotifications.subtitle",
                "Actividad reciente en listas, recordatorios y notas compartidas.",
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClear}
              disabled={loading || notifications.length === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-default disabled:opacity-35"
              aria-label={safeT("sharedListNotifications.clear", "Borrar")}
              title={safeT("sharedListNotifications.clear", "Borrar")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label={safeT("sharedListNotifications.close", "Cerrar")}
              title={safeT("sharedListNotifications.close", "Cerrar")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`notification-skeleton-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="h-3 w-24 rounded-full bg-slate-200" />
                  <div className="mt-3 h-3 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                <Bell className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                {safeT("sharedListNotifications.empty", "Aun no hay actividad compartida.")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const avatar = getAvatarData(notification);
                const relativeTime = formatRelativeTime(
                  notification.created_at,
                  locale,
                  safeT("sharedListNotifications.now", "Ahora"),
                );
                const contextLabel = getContextLabel(notification);
                const interactive = notification.target.kind !== "none";
                const Container = interactive ? "button" : "div";

                return (
                  <Container
                    key={notification.id}
                    {...(interactive
                      ? {
                          type: "button",
                          onClick: () => onOpenNotification(notification),
                        }
                      : {})}
                    className={`flex w-full items-start gap-3 rounded-[20px] border px-3 py-3 text-left transition ${
                      notification.unread
                        ? "border-[#d8c9f7] bg-[#faf7ff] hover:bg-[#f6f1ff]"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-[#ece9f6] text-xs font-semibold text-[#4f4a69] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                      <RemiAvatar
                        avatarUrl={avatar.avatarUrl}
                        fallback={avatar.fallback}
                      />
                      {notification.unread ? (
                        <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-5 text-slate-800">
                        {renderMessage(notification)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="truncate font-medium text-slate-600">
                          {contextLabel}
                        </span>
                        {relativeTime ? <span>&bull;</span> : null}
                        {relativeTime ? <span>{relativeTime}</span> : null}
                      </div>
                    </div>
                  </Container>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
