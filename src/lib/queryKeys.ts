export function createListIdsSignature(listIds: string[]): string {
  return [...new Set(listIds.map((value) => value.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

export const queryKeys = {
  inboxItems: (userId: string) => ["brain", "inbox", userId] as const,
  activeTasks: (userId: string) => ["brain", "tasks", userId] as const,
  activeIdeas: (userId: string) => ["brain", "ideas", userId] as const,
  statusSummary: (userId: string) => ["brain", "status-summary", userId] as const,
  sharedLists: (userId: string) => ["shared", "lists", userId] as const,
  sharedListItems: (listId: string) => ["shared", "list-items", listId] as const,
  sharedListItemStatsRoot: (userId: string) => ["shared", "list-item-stats", userId] as const,
  sharedListItemStats: (userId: string, listIds: string[]) =>
    ["shared", "list-item-stats", userId, createListIdsSignature(listIds)] as const,
  sharedListNotifications: (userId: string) => ["notifications", "shared-lists", userId] as const,
  shareInviteNotifications: (userId: string) => ["notifications", "share-invites", userId] as const,
  receivedShareNotifications: (userId: string) => ["notifications", "received-shares", userId] as const,
};
