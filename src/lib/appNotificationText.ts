import type { AppNotification } from "@/lib/notificationCenter";
import { type SharedListEventAction } from "@/lib/sharedListsApi";

type TranslateFn = (
  key: string,
  fallback: string,
  vars?: Record<string, unknown>,
) => string;

function resolveActorLabel(
  actorDisplayName: string | null | undefined,
  actorUserId: string | null | undefined,
  t: TranslateFn,
) {
  return (
    actorDisplayName?.trim() ||
    actorUserId?.trim()?.slice(0, 8) ||
    t("today.defaultUserName", "Usuario")
  );
}

function getNotificationAction(notification: AppNotification): SharedListEventAction | null {
  if (notification.source !== "shared_list") return null;

  const { notification: shared } = notification;
  if (shared.payload.action) return shared.payload.action;

  switch (shared.event_type) {
    case "item_deleted":
      return "item_deleted";
    case "item_done_toggled":
      return shared.payload.done === false ? "item_reopened" : "item_completed";
    case "member_joined":
      return "member_joined";
    case "item_created":
    default:
      return "item_added";
  }
}

function renderSharedListMessage(notification: AppNotification, t: TranslateFn) {
  if (notification.source !== "shared_list") return "";

  const action = getNotificationAction(notification);
  const shared = notification.notification;
  const actor = resolveActorLabel(
    shared.actor_display_name,
    shared.actor_user_id,
    t,
  );
  const item =
    shared.payload.item_text?.trim() ||
    shared.payload.next_text?.trim() ||
    shared.payload.previous_text?.trim() ||
    t("sharedListNotifications.itemFallback", "este elemento");
  const normalizedItem = item.trim().toLocaleLowerCase();
  const hasConcreteItem =
    normalizedItem.length > 0 &&
    normalizedItem !== "este elemento" &&
    normalizedItem !== "un elemento";
  const list =
    shared.list_title?.trim() ||
    shared.payload.list_title?.trim() ||
    t("sharedListNotifications.listFallback", "esta lista");

  switch (action) {
    case "item_added":
      return t(
        "sharedListNotifications.itemAdded",
        `${actor} agregó "${item}" a la lista "${list}".`,
        { actor, item, list },
      );
    case "item_deleted":
      if (!hasConcreteItem) {
        return t(
          "sharedListNotifications.itemDeletedUnknown",
          `${actor} eliminó un elemento de la lista "${list}".`,
          { actor, list },
        );
      }
      return t(
        "sharedListNotifications.itemDeleted",
        `${actor} eliminó "${item}" de la lista "${list}".`,
        { actor, item, list },
      );
    case "item_assigned": {
      const assignee =
        shared.payload.assigned_to_display_name?.trim() ||
        shared.payload.assigned_to_user_id?.slice(0, 8) ||
        "";
      if (shared.payload.assigned_to_user_id === shared.actor_user_id) {
        return t(
          "sharedListNotifications.itemAssignedSelf",
          `${actor} se asignó "${item}" de la lista "${list}".`,
          { actor, item, list },
        );
      }
      if (assignee) {
        return t(
          "sharedListNotifications.itemAssignedOther",
          `${actor} asignó "${item}" a ${assignee} en la lista "${list}".`,
          { actor, item, list, assignee },
        );
      }
      return t(
        "sharedListNotifications.itemAssigned",
        `${actor} asignó "${item}" en la lista "${list}".`,
        { actor, item, list },
      );
    }
    case "item_unassigned":
      return t(
        "sharedListNotifications.itemUnassigned",
        `${actor} quitó la asignación de "${item}" en la lista "${list}".`,
        { actor, item, list },
      );
    case "item_completed":
      return t(
        "sharedListNotifications.itemCompleted",
        `${actor} marcó "${item}" como hecho en la lista "${list}".`,
        { actor, item, list },
      );
    case "item_reopened":
      return t(
        "sharedListNotifications.itemReopened",
        `${actor} volvió a activar "${item}" en la lista "${list}".`,
        { actor, item, list },
      );
    case "item_renamed": {
      const previous =
        shared.payload.previous_text?.trim() ||
        t("sharedListNotifications.itemFallback", "este elemento");
      const next =
        shared.payload.next_text?.trim() ||
        shared.payload.item_text?.trim() ||
        t("sharedListNotifications.itemFallback", "este elemento");
      return t(
        "sharedListNotifications.itemRenamed",
        `${actor} renombró "${previous}" a "${next}" en la lista "${list}".`,
        { actor, previous, next, list },
      );
    }
    case "list_renamed": {
      const previous =
        shared.payload.previous_text?.trim() ||
        t("sharedListNotifications.listFallback", "esta lista");
      const next =
        shared.payload.next_text?.trim() ||
        shared.list_title?.trim() ||
        t("sharedListNotifications.listFallback", "esta lista");
      return t(
        "sharedListNotifications.listRenamed",
        `${actor} renombró la lista "${previous}" a "${next}".`,
        { actor, previous, next },
      );
    }
    case "member_joined":
      return t(
        "sharedListNotifications.memberJoined",
        `${actor} aceptó la lista "${list}".`,
        { actor, list },
      );
    default:
      return t(
        "sharedListNotifications.itemAdded",
        `${actor} agregó "${item}" a la lista "${list}".`,
        { actor, item, list },
      );
  }
}

export function renderAppNotificationMessage(notification: AppNotification, t: TranslateFn): string {
  if (notification.source === "shared_list") {
    return renderSharedListMessage(notification, t);
  }

  if (notification.source === "share_invite") {
    const item = notification.notification.item_title?.trim() ||
      t("sharedListNotifications.sharedItemFallback", "este elemento");
    const isIdea = notification.notification.item_type === "idea";
    const actor = resolveActorLabel(
      notification.notification.actor_display_name,
      notification.notification.actor_user_id,
      t,
    );

    switch (notification.notification.kind) {
      case "share_accepted":
        return t(
          isIdea
            ? "sharedListNotifications.shareAcceptedIdeaBy"
            : "sharedListNotifications.shareAcceptedTaskBy",
          isIdea
            ? `${actor} aceptó la nota "${item}".`
            : `${actor} aceptó el recordatorio "${item}".`,
          { actor, item },
        );
      case "share_rejected":
        return t(
          isIdea
            ? "sharedListNotifications.shareRejectedIdeaBy"
            : "sharedListNotifications.shareRejectedTaskBy",
          isIdea
            ? `${actor} rechazó la nota compartida "${item}".`
            : `${actor} rechazó el recordatorio compartido "${item}".`,
          { actor, item },
        );
      case "share_expired":
        return t(
          isIdea
            ? "sharedListNotifications.shareExpiredIdea"
            : "sharedListNotifications.shareExpiredTask",
          isIdea
            ? `La nota compartida "${item}" expiró.`
            : `El recordatorio compartido "${item}" expiró.`,
          { item },
        );
      case "share_sent":
      default:
        return t(
          isIdea
            ? "sharedListNotifications.shareSentIdea"
            : "sharedListNotifications.shareSentTask",
          isIdea
            ? `Compartiste la nota "${item}".`
            : `Compartiste el recordatorio "${item}".`,
          { item },
        );
    }
  }

  const item =
    notification.notification.item_title?.trim() ||
    t("sharedListNotifications.sharedItemFallback", "este elemento");
  const isIdea = notification.notification.item_type === "idea";
  const actor = resolveActorLabel(
    notification.notification.actor_display_name,
    notification.notification.actor_user_id,
    t,
  );

  return t(
    isIdea
      ? "sharedListNotifications.shareReceivedIdea"
      : "sharedListNotifications.shareReceivedTask",
    isIdea
      ? `${actor} te compartió la nota "${item}".`
      : `${actor} te compartió el recordatorio "${item}".`,
    { actor, item },
  );
}

export function getAppNotificationContextLabel(notification: AppNotification, t: TranslateFn): string {
  if (notification.source === "shared_list") {
    return notification.notification.list_title;
  }

  if (notification.source === "share_invite") {
    return notification.notification.item_type === "idea"
      ? t("sharedListNotifications.sharedNoteLabel", "Nota compartida")
      : t("sharedListNotifications.sharedReminderLabel", "Recordatorio compartido");
  }

  return notification.notification.item_type === "idea"
    ? t("sharedListNotifications.receivedNoteLabel", "Nota recibida")
    : t("sharedListNotifications.receivedReminderLabel", "Recordatorio recibido");
}
