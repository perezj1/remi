import type { QueryClient } from "@tanstack/react-query";

import type { BrainItem, RemiStatusSummary } from "@/lib/brainItemsApi";
import { queryKeys } from "@/lib/queryKeys";

function getTodayStartIso(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function sortActiveTasks(items: BrainItem[]): BrainItem[] {
  return [...items].sort((a, b) => {
    const aDue = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function sortIdeas(items: BrainItem[]): BrainItem[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function sortInbox(items: BrainItem[]): BrainItem[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function shouldAppearInActiveTasks(item: BrainItem): boolean {
  if (item.type !== "task") return false;
  if (item.status !== "ACTIVE") return false;
  if (!item.due_date) return true;
  return item.due_date >= getTodayStartIso();
}

function shouldAppearInActiveIdeas(item: BrainItem): boolean {
  return item.type === "idea" && item.status !== "ARCHIVED";
}

function shouldAppearInInbox(item: BrainItem): boolean {
  if (item.status === "ARCHIVED") return false;
  if (item.type === "idea") return true;
  if (!item.due_date) return true;
  return item.due_date >= getTodayStartIso();
}

function upsertItem(items: BrainItem[], item: BrainItem): BrainItem[] {
  const next = [...items];
  const index = next.findIndex((entry) => entry.id === item.id);
  if (index >= 0) next[index] = item;
  else next.unshift(item);
  return next;
}

function removeItem(items: BrainItem[], itemId: string): BrainItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function applyBrainItemToQueryCaches(
  queryClient: QueryClient,
  userId: string,
  item: BrainItem,
) {
  queryClient.setQueryData<BrainItem[]>(
    queryKeys.activeTasks(userId),
    (current = []) => {
      const base = shouldAppearInActiveTasks(item)
        ? upsertItem(current, item)
        : removeItem(current, item.id);
      return sortActiveTasks(base);
    },
  );

  queryClient.setQueryData<BrainItem[]>(
    queryKeys.activeIdeas(userId),
    (current = []) => {
      const base = shouldAppearInActiveIdeas(item)
        ? upsertItem(current, item)
        : removeItem(current, item.id);
      return sortIdeas(base);
    },
  );

  queryClient.setQueryData<BrainItem[]>(
    queryKeys.inboxItems(userId),
    (current = []) => {
      const base = shouldAppearInInbox(item)
        ? upsertItem(current, item)
        : removeItem(current, item.id);
      return sortInbox(base);
    },
  );
}

export function removeBrainItemFromQueryCaches(
  queryClient: QueryClient,
  userId: string,
  itemId: string,
) {
  queryClient.setQueryData<BrainItem[]>(
    queryKeys.activeTasks(userId),
    (current = []) => removeItem(current, itemId),
  );
  queryClient.setQueryData<BrainItem[]>(
    queryKeys.activeIdeas(userId),
    (current = []) => removeItem(current, itemId),
  );
  queryClient.setQueryData<BrainItem[]>(
    queryKeys.inboxItems(userId),
    (current = []) => removeItem(current, itemId),
  );
}

export function setStatusSummaryCache(
  queryClient: QueryClient,
  userId: string,
  summary: RemiStatusSummary,
) {
  queryClient.setQueryData(queryKeys.statusSummary(userId), summary);
}

export async function invalidateBrainItemQueries(queryClient: QueryClient, userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.inboxItems(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activeTasks(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activeIdeas(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.statusSummary(userId) }),
  ]);
}
