import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import type { AppNotification } from "@/lib/notificationCenter";
import { queryKeys } from "@/lib/queryKeys";
import {
  fetchReceivedShareNotifications,
  fetchShareInviteNotifications,
  subscribeToReceivedShareNotifications,
  subscribeToShareInviteNotifications,
  type ReceivedShareNotification,
  type ShareInviteNotification,
} from "@/lib/shareInvitesApi";
import {
  fetchSharedListNotifications,
  fetchSharedLists,
  markSharedListNotificationsSeen,
  subscribeToSharedListNotifications,
  type SharedListNotification,
} from "@/lib/sharedListsApi";

type NotificationCenterState = {
  clearedAtMs: number;
  shareActivitySeenAtMs: number;
};

type NotificationsCenterContextValue = {
  appNotifications: AppNotification[];
  loading: boolean;
  sharedListNotifications: SharedListNotification[];
  shareInviteNotifications: ShareInviteNotification[];
  receivedShareNotifications: ReceivedShareNotification[];
  notificationListIds: string[];
  unreadNotificationsCount: number;
  unreadSharedListNotificationsCount: number;
  unreadShareActivityCount: number;
  notificationCenterState: NotificationCenterState;
  clearNotifications: () => void;
  closeShareActivityGap: () => void;
  markSharedListNotificationsAsSeen: () => void;
  refreshNotifications: () => Promise<void>;
};

const EMPTY_NOTIFICATION_CENTER_STATE: NotificationCenterState = {
  clearedAtMs: 0,
  shareActivitySeenAtMs: 0,
};

const NotificationsCenterContext =
  createContext<NotificationsCenterContextValue | undefined>(undefined);

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

function buildAppNotifications(
  sharedListNotifications: SharedListNotification[],
  shareInviteNotifications: ShareInviteNotification[],
  receivedShareNotifications: ReceivedShareNotification[],
  notificationCenterState: NotificationCenterState,
): AppNotification[] {
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
}

export function NotificationsCenterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notificationCenterState, setNotificationCenterState] =
    useState<NotificationCenterState>(EMPTY_NOTIFICATION_CENTER_STATE);

  useEffect(() => {
    if (!user) {
      setNotificationCenterState(EMPTY_NOTIFICATION_CENTER_STATE);
      return;
    }
    setNotificationCenterState(readNotificationCenterState(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== getNotificationCenterStorageKey(user.id)) return;
      setNotificationCenterState(readNotificationCenterState(user.id));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

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

  const sharedListsQuery = useQuery({
    queryKey: user ? queryKeys.sharedLists(user.id) : ["shared", "lists", "anonymous"],
    queryFn: () => fetchSharedLists(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  const sharedListNotificationsQuery = useQuery({
    queryKey: user
      ? queryKeys.sharedListNotifications(user.id)
      : ["notifications", "shared-lists", "anonymous"],
    queryFn: () => fetchSharedListNotifications(user!.id, 40),
    enabled: !!user,
    staleTime: 15_000,
  });

  const shareInviteNotificationsQuery = useQuery({
    queryKey: user
      ? queryKeys.shareInviteNotifications(user.id)
      : ["notifications", "share-invites", "anonymous"],
    queryFn: () => fetchShareInviteNotifications(user!.id, 40),
    enabled: !!user,
    staleTime: 15_000,
  });

  const receivedShareNotificationsQuery = useQuery({
    queryKey: user
      ? queryKeys.receivedShareNotifications(user.id)
      : ["notifications", "received-shares", "anonymous"],
    queryFn: () => fetchReceivedShareNotifications(user!.id, 40),
    enabled: !!user,
    staleTime: 15_000,
  });

  const notificationListIds = useMemo(
    () => (sharedListsQuery.data ?? []).map((list) => list.id),
    [sharedListsQuery.data],
  );

  const sharedListNotifications = sharedListNotificationsQuery.data ?? [];
  const shareInviteNotifications = shareInviteNotificationsQuery.data ?? [];
  const receivedShareNotifications = receivedShareNotificationsQuery.data ?? [];

  const appNotifications = useMemo(
    () =>
      buildAppNotifications(
        sharedListNotifications,
        shareInviteNotifications,
        receivedShareNotifications,
        notificationCenterState,
      ),
    [
      notificationCenterState,
      receivedShareNotifications,
      shareInviteNotifications,
      sharedListNotifications,
    ],
  );

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

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedLists(user.id) }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.sharedListNotifications(user.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.shareInviteNotifications(user.id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.receivedShareNotifications(user.id),
      }),
    ]);
  }, [queryClient, user]);

  const markSharedListNotificationsAsSeen = useCallback(() => {
    if (!user || notificationListIds.length === 0) return;

    queryClient.setQueryData<SharedListNotification[]>(
      queryKeys.sharedListNotifications(user.id),
      (current = []) =>
        current.map((notification) => ({ ...notification, unread: false })),
    );

    void markSharedListNotificationsSeen(user.id, notificationListIds).catch((error) => {
      console.error("Error marking shared list notifications as seen", error);
    });
  }, [notificationListIds, queryClient, user]);

  const clearNotifications = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    persistNotificationCenterState({
      clearedAtMs: now,
      shareActivitySeenAtMs: now,
    });
    markSharedListNotificationsAsSeen();
  }, [markSharedListNotificationsAsSeen, persistNotificationCenterState, user]);

  const closeShareActivityGap = useCallback(() => {
    if (!user) return;
    const now = Date.now();
    persistNotificationCenterState({
      ...notificationCenterState,
      shareActivitySeenAtMs: Math.max(notificationCenterState.shareActivitySeenAtMs, now),
    });
  }, [notificationCenterState, persistNotificationCenterState, user]);

  useEffect(() => {
    if (!user || notificationListIds.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const onRealtimeChange = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        void sharedListNotificationsQuery.refetch();
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
  }, [notificationListIds, sharedListNotificationsQuery, user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeInviteNotifications = subscribeToShareInviteNotifications(
      user.id,
      () => {
        void shareInviteNotificationsQuery.refetch();
      },
    );
    const unsubscribeReceivedShareNotifications = subscribeToReceivedShareNotifications(
      user.id,
      () => {
        void receivedShareNotificationsQuery.refetch();
      },
    );

    return () => {
      unsubscribeInviteNotifications();
      unsubscribeReceivedShareNotifications();
    };
  }, [receivedShareNotificationsQuery, shareInviteNotificationsQuery, user]);

  useEffect(() => {
    if (!user) return;

    const refreshOnVisibility = () => {
      if (document.visibilityState === "hidden") return;
      void refreshNotifications().catch((error) => {
        console.error("Error refreshing notifications on visibility", error);
      });
    };

    window.addEventListener("focus", refreshOnVisibility);
    document.addEventListener("visibilitychange", refreshOnVisibility);

    return () => {
      window.removeEventListener("focus", refreshOnVisibility);
      document.removeEventListener("visibilitychange", refreshOnVisibility);
    };
  }, [refreshNotifications, user]);

  const value = useMemo<NotificationsCenterContextValue>(
    () => ({
      appNotifications,
      loading:
        sharedListsQuery.isLoading ||
        sharedListNotificationsQuery.isLoading ||
        shareInviteNotificationsQuery.isLoading ||
        receivedShareNotificationsQuery.isLoading,
      sharedListNotifications,
      shareInviteNotifications,
      receivedShareNotifications,
      notificationListIds,
      unreadNotificationsCount,
      unreadSharedListNotificationsCount,
      unreadShareActivityCount,
      notificationCenterState,
      clearNotifications,
      closeShareActivityGap,
      markSharedListNotificationsAsSeen,
      refreshNotifications,
    }),
    [
      appNotifications,
      clearNotifications,
      closeShareActivityGap,
      markSharedListNotificationsAsSeen,
      notificationCenterState,
      notificationListIds,
      receivedShareNotifications,
      receivedShareNotificationsQuery.isLoading,
      refreshNotifications,
      shareInviteNotifications,
      shareInviteNotificationsQuery.isLoading,
      sharedListNotifications,
      sharedListNotificationsQuery.isLoading,
      sharedListsQuery.isLoading,
      unreadNotificationsCount,
      unreadShareActivityCount,
      unreadSharedListNotificationsCount,
    ],
  );

  return (
    <NotificationsCenterContext.Provider value={value}>
      {children}
    </NotificationsCenterContext.Provider>
  );
}

export function useNotificationsCenter() {
  const context = useContext(NotificationsCenterContext);
  if (!context) {
    throw new Error(
      "useNotificationsCenter must be used within a NotificationsCenterProvider",
    );
  }
  return context;
}
