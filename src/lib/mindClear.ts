import type { RemiStatusSummary } from "@/lib/brainItemsApi";

export function computeMindClearPercent(summary: RemiStatusSummary | null): number {
  if (!summary) return 10;

  const totalItems = summary.totalItemsStored ?? summary.totalTasksStored + summary.totalIdeasStored;
  const delegatedItems = totalItems;
  const completedToday = summary.todayDone ?? 0;
  const streakBonusDays = Math.min(summary.streakDays ?? 0, 14);
  const weeklyBonusDays = Math.min(summary.weekActiveDays ?? 0, 7);
  const inactiveDays = Math.max(0, summary.daysSinceLastActivity ?? 0);
  const inactivityPenalty = Math.min(40, inactiveDays * 4);

  const value =
    10 +
    delegatedItems * 4 +
    completedToday * 6 +
    streakBonusDays * 2 +
    weeklyBonusDays -
    inactivityPenalty;

  return Math.max(10, Math.min(100, Math.round(value)));
}

