import type { RemiStatusSummary } from "@/lib/brainItemsApi";

export function computeMindClearPercent(summary: RemiStatusSummary | null): number {
  if (!summary) return 10;

  const totalItems = summary.totalItemsStored ?? summary.totalTasksStored + summary.totalIdeasStored;
  const todayDone = Math.max(0, summary.todayDone ?? 0);
  const streakDays = Math.max(0, summary.streakDays ?? 0);
  const weekActiveDays = Math.max(0, summary.weekActiveDays ?? 0);
  const inactiveDays = Math.max(0, summary.daysSinceLastActivity ?? 0);

  // Base calm state even with low/no data.
  const base = 12;

  // Delegation grows fast at first and then slows down (prevents jumping to 100 too early).
  const delegation = Math.min(35, Math.log2(Math.max(0, totalItems) + 1) * 9);

  // Daily resolution impact.
  const completion = Math.min(25, todayDone * 5);

  // Habit consistency (weekly rhythm + streak).
  const consistency = Math.min(20, streakDays * 0.7 + weekActiveDays * 1.2);

  // If user stops using the app, mind-clear confidence decays.
  const inactivityPenalty = Math.min(30, inactiveDays * 3);

  const value = base + delegation + completion + consistency - inactivityPenalty;
  return Math.max(10, Math.min(100, Math.round(value)));
}

