import type { ReceivedShareNotification, ShareInviteNotification } from "@/lib/shareInvitesApi";
import type { SharedListNotification } from "@/lib/sharedListsApi";

export type NotificationTarget =
  | { kind: "list"; listId: string }
  | { kind: "route"; href: string }
  | { kind: "none" };

type AppNotificationBase = {
  id: string;
  created_at: string;
  unread: boolean;
  target: NotificationTarget;
};

export type AppNotification =
  | (AppNotificationBase & {
      source: "shared_list";
      notification: SharedListNotification;
    })
  | (AppNotificationBase & {
      source: "share_invite";
      notification: ShareInviteNotification;
    })
  | (AppNotificationBase & {
      source: "received_share";
      notification: ReceivedShareNotification;
    });
