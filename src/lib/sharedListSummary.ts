import type { SharedList, SharedListItemStats } from "@/lib/sharedListsApi";

export type SharedListProgress = {
  done: number;
  total: number;
};

export type SharedListSummary = {
  list: SharedList;
  progress: SharedListProgress;
  activityMs: number;
};

function toMs(value?: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildSharedListSummaries(
  lists: SharedList[],
  statsByList: Record<string, SharedListItemStats>,
): SharedListSummary[] {
  return lists
    .map((list) => {
      const stats = statsByList[list.id] ?? {
        done: 0,
        total: 0,
        itemsActivityMs: 0,
      };
      const activityMs = Math.max(
        toMs(list.created_at),
        toMs(list.updated_at),
        stats.itemsActivityMs,
      );

      return {
        list,
        progress: {
          done: stats.done,
          total: stats.total,
        },
        activityMs,
      };
    })
    .sort((a, b) => b.activityMs - a.activityMs);
}
