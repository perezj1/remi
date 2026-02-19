// src/lib/brainItemsApi.ts
import { supabase } from "@/integrations/supabase/client";
import { queueAdd, makeOpId, makeTempItemId } from "@/lib/offlineQueue";
import {
  loadCachedTasks,
  saveCachedTasks,
  loadCachedIdeas,
  saveCachedIdeas,
  loadCachedInbox,
  saveCachedInbox,
} from "@/lib/localBrainCache";
import { registerFeedbackUse } from "@/lib/feedbackSurvey";

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode =
  | "NONE"
  | "ON_DUE_DATE"
  | "DAY_BEFORE_AND_DUE"
  | "DAILY_UNTIL_DUE"
  | "WEEK_BEFORE_AND_DUE";

export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

const DEFAULT_HABIT_OFFSET_MINUTES = 0;

export interface BrainItem {
  id: string;
  user_id: string;
  type: BrainItemType;
  title: string;
  due_date: string | null;
  reminder_mode: ReminderMode;
  status: BrainItemStatus;
  created_at: string;
  updated_at: string;
  last_notified_at: string | null;

  repeat_type: RepeatType;
  next_reminder_at: string | null;
  is_habit?: boolean;
  habit_offset_minutes?: number;
  next_notification_at?: string | null;

  // ✅ NUEVO (share markers)
  shared_count?: number;
  last_shared_at?: string | null;
  received_from_share?: boolean;
  sent_via_share?: boolean;
}

function isOffline(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.onLine === false;
}

/** cache helpers (sin romper tu estructura) */
function cacheUpsertTask(userId: string, item: BrainItem) {
  const list = loadCachedTasks(userId);
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);

  // orden similar al fetchActiveTasks
  list.sort((a, b) => {
    const ad = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    if (ad !== bd) return ad - bd;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  saveCachedTasks(userId, list);

  // inbox también (si lo usas)
  const inbox = loadCachedInbox(userId);
  const i2 = inbox.findIndex((x) => x.id === item.id);
  if (i2 >= 0) inbox[i2] = item;
  else inbox.unshift(item);
  saveCachedInbox(userId, inbox);
}

function cacheUpsertIdea(userId: string, item: BrainItem) {
  const list = loadCachedIdeas(userId);
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  saveCachedIdeas(userId, list);

  const inbox = loadCachedInbox(userId);
  const i2 = inbox.findIndex((x) => x.id === item.id);
  if (i2 >= 0) inbox[i2] = item;
  else inbox.unshift(item);
  saveCachedInbox(userId, inbox);
}

function cacheRemoveTask(userId: string, taskId: string) {
  saveCachedTasks(userId, loadCachedTasks(userId).filter((x) => x.id !== taskId));
  saveCachedInbox(userId, loadCachedInbox(userId).filter((x) => x.id !== taskId));
}

function getTodayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeHabitNotificationTime(
  dueDateIso: string | null,
  offsetMinutes: number
): string | null {
  if (!dueDateIso) return null;
  const base = new Date(dueDateIso);
  if (Number.isNaN(base.getTime())) return null;

  base.setMinutes(base.getMinutes() - offsetMinutes);
  return base.toISOString();
}

function normalizeItemTitleKey(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export async function fetchActiveTasks(userId: string): Promise<BrainItem[]> {
  const todayStart = getTodayStart();
  const todayIso = todayStart.toISOString();

  try {
    const { data, error } = await supabase
      .from("brain_items")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "task")
      .eq("status", "ACTIVE")
      .or(`due_date.is.null,due_date.gte.${todayIso}`)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const tasks = (data ?? []) as BrainItem[];
    saveCachedTasks(userId, tasks);
    return tasks;
  } catch (e) {
    if (isOffline()) return loadCachedTasks(userId);
    throw e;
  }
}

export async function fetchInboxItems(userId: string): Promise<BrainItem[]> {
  try {
    const { data, error } = await supabase
      .from("brain_items")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = (data ?? []) as BrainItem[];
    const todayStart = getTodayStart();

    const filtered = items.filter((item) => {
      if (item.type === "idea") return true;
      if (item.type === "task") {
        if (!item.due_date) return true;
        const due = new Date(item.due_date);
        return due >= todayStart;
      }
      return true;
    });

    saveCachedInbox(userId, filtered);
    return filtered;
  } catch (e) {
    if (isOffline()) return loadCachedInbox(userId);
    throw e;
  }
}

export async function fetchActiveIdeas(userId: string): Promise<BrainItem[]> {
  try {
    const { data, error } = await supabase
      .from("brain_items")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "idea")
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const ideas = (data ?? []) as BrainItem[];
    saveCachedIdeas(userId, ideas);
    return ideas;
  } catch (e) {
    if (isOffline()) return loadCachedIdeas(userId);
    throw e;
  }
}

export async function createTask(
  userId: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode,
  repeatType: RepeatType = "none"
): Promise<BrainItem> {
  const hasHabit = repeatType !== "none";
  const habitOffsetMinutes = hasHabit ? DEFAULT_HABIT_OFFSET_MINUTES : 0;

  const habitNotification =
    hasHabit && dueDate
      ? computeHabitNotificationTime(dueDate, habitOffsetMinutes)
      : null;

  const nextReminderAt = habitNotification;
  const nextNotificationAt = habitNotification;

  try {
    if (isOffline()) throw new Error("offline");

    const { data, error } = await supabase
      .from("brain_items")
      .insert({
        user_id: userId,
        type: "task",
        title,
        due_date: dueDate,
        reminder_mode: reminderMode,
        repeat_type: repeatType,
        next_reminder_at: nextReminderAt,
        is_habit: hasHabit,
        habit_offset_minutes: habitOffsetMinutes,
        next_notification_at: nextNotificationAt,

        // ✅ NUEVO: por defecto NO es recibido, NO está marcado como enviado aún
        received_from_share: false,
        sent_via_share: false,
        shared_count: 0,
        last_shared_at: null,
      })
      .select()
      .single();

    if (error) throw error;

    const created = data as BrainItem;
    cacheUpsertTask(userId, created);
    registerFeedbackUse();
    return created;
  } catch (e) {
    // ✅ OFFLINE: optimistic create + cola
    const nowIso = new Date().toISOString();
    const tempId = makeTempItemId();

    const localItem: BrainItem = {
      id: tempId,
      user_id: userId,
      type: "task",
      title,
      due_date: dueDate,
      reminder_mode: reminderMode,
      status: "ACTIVE",
      created_at: nowIso,
      updated_at: nowIso,
      last_notified_at: null,
      repeat_type: repeatType,
      next_reminder_at: nextReminderAt,
      is_habit: hasHabit,
      habit_offset_minutes: habitOffsetMinutes,
      next_notification_at: nextNotificationAt,

      // ✅ NUEVO (offline defaults)
      received_from_share: false,
      sent_via_share: false,
      shared_count: 0,
      last_shared_at: null,
    };

    cacheUpsertTask(userId, localItem);
    registerFeedbackUse();

    queueAdd({
      id: makeOpId(),
      type: "CREATE_TASK",
      createdAt: Date.now(),
      userId,
      clientTempId: tempId,
      title,
      dueDate,
      reminderMode,
      repeatType,
    });

    return localItem;
  }
}

export async function createIdea(userId: string, title: string): Promise<BrainItem> {
  try {
    if (isOffline()) throw new Error("offline");

    const { data, error } = await supabase
      .from("brain_items")
      .insert({
        user_id: userId,
        type: "idea",
        title,
        repeat_type: "none",
        next_reminder_at: null,
        is_habit: false,
        habit_offset_minutes: 0,
        next_notification_at: null,

        // ✅ NUEVO defaults
        received_from_share: false,
        sent_via_share: false,
        shared_count: 0,
        last_shared_at: null,
      })
      .select()
      .single();

    if (error) throw error;

    const created = data as BrainItem;
    cacheUpsertIdea(userId, created);
    registerFeedbackUse();
    return created;
  } catch (e) {
    const nowIso = new Date().toISOString();
    const tempId = makeTempItemId();

    const localItem: BrainItem = {
      id: tempId,
      user_id: userId,
      type: "idea",
      title,
      due_date: null,
      reminder_mode: "NONE",
      status: "ACTIVE",
      created_at: nowIso,
      updated_at: nowIso,
      last_notified_at: null,
      repeat_type: "none",
      next_reminder_at: null,
      is_habit: false,
      habit_offset_minutes: 0,
      next_notification_at: null,

      // ✅ NUEVO
      received_from_share: false,
      sent_via_share: false,
      shared_count: 0,
      last_shared_at: null,
    };

    cacheUpsertIdea(userId, localItem);
    registerFeedbackUse();

    queueAdd({
      id: makeOpId(),
      type: "CREATE_IDEA",
      createdAt: Date.now(),
      userId,
      clientTempId: tempId,
      title,
    });

    return localItem;
  }
}

export async function updateIdeaTitle(id: string, title: string): Promise<BrainItem> {
  const { data, error } = await supabase
    .from("brain_items")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("type", "idea")
    .select()
    .single();

  if (error) throw error;
  return data as BrainItem;
}

export async function updateTask(
  id: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode,
  repeatType: RepeatType = "none"
): Promise<BrainItem> {
  const hasHabit = repeatType !== "none";
  const habitOffsetMinutes = hasHabit ? DEFAULT_HABIT_OFFSET_MINUTES : 0;

  const safeReminderMode: ReminderMode =
    !dueDate &&
    (
      reminderMode === "ON_DUE_DATE" ||
      reminderMode === "DAY_BEFORE_AND_DUE" ||
      reminderMode === "WEEK_BEFORE_AND_DUE"
    )
      ? "NONE"
      : reminderMode;

  const habitNotification =
    hasHabit && dueDate
      ? computeHabitNotificationTime(dueDate, habitOffsetMinutes)
      : null;

  const nextReminderAt = hasHabit ? habitNotification : dueDate;
  const nextNotificationAt = hasHabit ? habitNotification : dueDate;

  try {
    if (isOffline()) throw new Error("offline");

    const { data, error } = await supabase
      .from("brain_items")
      .update({
        title,
        due_date: dueDate,
        reminder_mode: safeReminderMode,
        repeat_type: repeatType,
        next_reminder_at: nextReminderAt,
        is_habit: hasHabit,
        habit_offset_minutes: habitOffsetMinutes,
        next_notification_at: nextNotificationAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("type", "task")
      .select()
      .single();

    if (error) throw error;

    const updated = data as BrainItem;
    cacheUpsertTask(updated.user_id, updated);
    return updated;
  } catch (e) {
    // Mantengo tu comportamiento (no cambio offline update aquí para no romper nada)
    throw e;
  }
}

/**
 * ConvertIdeaToTask se mantiene online por ahora.
 */
export async function convertIdeaToTask(
  id: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode,
  repeatType: RepeatType = "none"
): Promise<BrainItem> {
  const hasHabit = repeatType !== "none";
  const habitOffsetMinutes = hasHabit ? DEFAULT_HABIT_OFFSET_MINUTES : 0;

  const habitNotification =
    hasHabit && dueDate
      ? computeHabitNotificationTime(dueDate, habitOffsetMinutes)
      : null;

  const nextReminderAt = habitNotification;
  const nextNotificationAt = habitNotification;

  const { data, error } = await supabase
    .from("brain_items")
    .update({
      type: "task",
      title,
      due_date: dueDate,
      reminder_mode: reminderMode,
      repeat_type: repeatType,
      next_reminder_at: nextReminderAt,
      is_habit: hasHabit,
      habit_offset_minutes: habitOffsetMinutes,
      next_notification_at: nextNotificationAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("type", "idea")
    .select()
    .single();

  if (error) throw error;

  const converted = data as BrainItem;
  cacheUpsertTask(converted.user_id, converted);
  return converted;
}

/**
 * ConvertTaskToIdea se mantiene online por ahora.
 */
export async function convertTaskToIdea(
  id: string,
  title: string
): Promise<BrainItem> {
  const { data, error } = await supabase
    .from("brain_items")
    .update({
      type: "idea",
      title,
      due_date: null,
      reminder_mode: "NONE",
      repeat_type: "none",
      next_reminder_at: null,
      is_habit: false,
      habit_offset_minutes: 0,
      next_notification_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("type", "task")
    .select()
    .single();

  if (error) throw error;

  const converted = data as BrainItem;
  cacheRemoveTask(converted.user_id, converted.id);
  cacheUpsertIdea(converted.user_id, converted);
  return converted;
}

export async function setTaskStatus(
  id: string,
  status: BrainItemStatus
): Promise<BrainItem> {
  try {
    if (isOffline()) throw new Error("offline");

    const { data, error } = await supabase
      .from("brain_items")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const updated = data as BrainItem;

    // si se marca DONE, tu UI suele removerlo de lista ACTIVE
    if (status === "DONE") cacheRemoveTask(updated.user_id, updated.id);
    else cacheUpsertTask(updated.user_id, updated);

    return updated;
  } catch (e) {
    throw e;
  }
}

export async function postponeTask(
  id: string,
  newDueDate: string | null
): Promise<BrainItem> {
  try {
    if (isOffline()) throw new Error("offline");

    const { data, error } = await supabase
      .from("brain_items")
      .update({
        due_date: newDueDate,
        next_reminder_at: newDueDate,
        next_notification_at: newDueDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const updated = data as BrainItem;
    cacheUpsertTask(updated.user_id, updated);
    return updated;
  } catch (e) {
    throw e;
  }
}

export async function deleteBrainItem(id: string): Promise<void> {
  const { error } = await supabase.from("brain_items").delete().eq("id", id);
  if (error) throw error;
}

export type RemiStatusSummary = {
  todayTotal: number;
  todayDone: number;
  weekActiveDays: number;
  weekActivitySlots: boolean[];
  totalTasksStored: number;
  totalIdeasStored: number;
  totalItemsStored: number;
  streakDays: number;
  daysSinceLastActivity: number | null;
};

export type RemiStatusInsights = {
  weekDateLabels: string[];
  capturedSeries: number[];
  resolvedSeries: number[];
  capturedHeatmap: number[][];
  resolvedHeatmap: number[][];
  capturedLast30Count: number;
  ideasLast30Count: number;
  activeDueTasksCount: number;
  overdueUnfinishedCount: number;
  completedWithDueCount: number;
};

export async function fetchRemiUsersCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from("remi_user_settings")
    .select("user_id", { count: "exact", head: true });

  if (error) {
    console.warn("Could not fetch Remi users count", error);
    return null;
  }

  return typeof count === "number" ? count : null;
}

export async function fetchRemiStatusSummary(userId: string): Promise<RemiStatusSummary> {
  const now = new Date();

  const startOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const endOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy;
  };

  const formatLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const MAX_STREAK_DAYS = 60;
  const streakWindowStart = new Date(todayStart);
  streakWindowStart.setDate(streakWindowStart.getDate() - (MAX_STREAK_DAYS - 1));

  const { data: todayTasksRaw, error: todayError } = await supabase
    .from("brain_items")
    .select("id, status")
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED")
    .gte("due_date", todayStart.toISOString())
    .lte("due_date", todayEnd.toISOString());

  if (todayError) throw todayError;

  const todayTasks = (todayTasksRaw ?? []) as Pick<BrainItem, "id" | "status">[];

  const todayTotal = todayTasks.length;
  const { data: completedTodayRaw, error: completedTodayError } = await supabase
    .from("brain_items")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "DONE")
    .gte("updated_at", todayStart.toISOString())
    .lte("updated_at", todayEnd.toISOString());

  if (completedTodayError) throw completedTodayError;

  const todayDone = (completedTodayRaw ?? []).length;

  const { data: activeTasksRaw, error: activeTasksError } = await supabase
    .from("brain_items")
    .select("title")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .eq("type", "task")
    .or(`due_date.is.null,due_date.gte.${todayStart.toISOString()}`);

  if (activeTasksError) throw activeTasksError;

  const { data: activeIdeasRaw, error: activeIdeasError } = await supabase
    .from("brain_items")
    .select("title")
    .eq("user_id", userId)
    .eq("type", "idea")
    .neq("status", "ARCHIVED");

  if (activeIdeasError) throw activeIdeasError;

  const taskKeys = new Set<string>();
  const ideaKeys = new Set<string>();
  const activeTasks = (activeTasksRaw ?? []) as Array<{ title: string | null }>;
  const activeIdeas = (activeIdeasRaw ?? []) as Array<{ title: string | null }>;

  for (const item of activeTasks) {
    const key = normalizeItemTitleKey(item.title);
    if (!key) continue;
    taskKeys.add(key);
  }

  for (const item of activeIdeas) {
    const key = normalizeItemTitleKey(item.title);
    if (!key) continue;
    ideaKeys.add(key);
  }

  const totalTasks = taskKeys.size;
  const totalIdeas = ideaKeys.size;
  const totalItemsStored = totalTasks + totalIdeas;

  const startDateKey = formatLocalDateKey(streakWindowStart);
  const endDateKey = formatLocalDateKey(todayStart);

  const { data: activityRows, error: activityError } = await supabase
    .from("brain_activity_days")
    .select("day, completed_tasks")
    .eq("user_id", userId)
    .gte("day", startDateKey)
    .lte("day", endDateKey);

  if (activityError) throw activityError;

  type ActivityRow = { day: string; completed_tasks: number };
  const activity = (activityRows ?? []) as ActivityRow[];

  const activityDays = new Set<string>();
  for (const row of activity) activityDays.add(row.day);

  let streakDays = 0;
  for (let offset = 0; offset < MAX_STREAK_DAYS; offset++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - offset);
    const key = formatLocalDateKey(d);
    if (activityDays.has(key)) streakDays += 1;
    else break;
  }

  let weekActiveDays = 0;
  const weekActivitySlots: boolean[] = [];

  const todayLocal = new Date(todayStart);
  const jsDay = todayLocal.getDay();
  const diffToMonday = (jsDay + 6) % 7;

  const mondayStart = new Date(todayLocal);
  mondayStart.setDate(mondayStart.getDate() - diffToMonday);

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(mondayStart);
    d.setDate(mondayStart.getDate() + offset);

    const key = formatLocalDateKey(d);
    const hasActivity = activityDays.has(key);

    weekActivitySlots.push(hasActivity);
    if (hasActivity) weekActiveDays += 1;
  }

  let daysSinceLastActivity: number | null = null;
  if (activity.length > 0) {
    let lastDate: Date | null = null;

    for (const row of activity) {
      const d = new Date(row.day + "T00:00:00Z");
      if (!lastDate || d > lastDate) lastDate = d;
    }

    if (lastDate) {
      const diffMs = todayStart.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      daysSinceLastActivity = diffDays < 0 ? 0 : diffDays;
    }
  }

  return {
    todayTotal,
    todayDone,
    weekActiveDays,
    weekActivitySlots,
    totalTasksStored: totalTasks,
    totalIdeasStored: totalIdeas,
    totalItemsStored,
    streakDays,
    daysSinceLastActivity,
  };
}

export async function fetchRemiStatusInsights(userId: string): Promise<RemiStatusInsights> {
  const now = new Date();

  const startOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const endOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy;
  };

  const formatLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const lookbackStart = new Date(todayStart);
  lookbackStart.setDate(lookbackStart.getDate() - 29);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const weekDays: Date[] = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    return d;
  });

  const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];
  const weekDateLabels = weekDays.map((d) => dayLabels[(d.getDay() + 6) % 7] ?? "");
  const weekDateKeys = weekDays.map(formatLocalDateKey);
  const keyToIndex = new Map<string, number>();
  weekDateKeys.forEach((key, idx) => keyToIndex.set(key, idx));
  const last30Days: Date[] = Array.from({ length: 30 }).map((_, index) => {
    const d = new Date(lookbackStart);
    d.setDate(lookbackStart.getDate() + index);
    return d;
  });
  const last30DateKeys = last30Days.map(formatLocalDateKey);
  const keyToLast30Index = new Map<string, number>();
  last30DateKeys.forEach((key, idx) => keyToLast30Index.set(key, idx));

  const { data: capturedRows, error: capturedError } = await supabase
    .from("brain_items")
    .select("created_at")
    .eq("user_id", userId)
    .neq("status", "ARCHIVED")
    .gte("created_at", lookbackStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  if (capturedError) throw capturedError;

  const { data: resolvedRows, error: resolvedError } = await supabase
    .from("brain_items")
    .select("updated_at")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "DONE")
    .gte("updated_at", lookbackStart.toISOString())
    .lte("updated_at", todayEnd.toISOString());

  if (resolvedError) throw resolvedError;

  const { data: capturedTaskRows, error: capturedTaskError } = await supabase
    .from("brain_items")
    .select("created_at")
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED")
    .gte("created_at", lookbackStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  if (capturedTaskError) throw capturedTaskError;

  const { data: capturedIdeaRows, error: capturedIdeaError } = await supabase
    .from("brain_items")
    .select("created_at")
    .eq("user_id", userId)
    .eq("type", "idea")
    .neq("status", "ARCHIVED")
    .gte("created_at", lookbackStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  if (capturedIdeaError) throw capturedIdeaError;

  const capturedSeries = new Array<number>(7).fill(0);
  const resolvedSeries = new Array<number>(7).fill(0);
  const capturedHeatmap = Array.from({ length: 30 }).map(() => new Array<number>(24).fill(0));
  const resolvedHeatmap = Array.from({ length: 30 }).map(() => new Array<number>(24).fill(0));

  for (const row of (capturedRows ?? []) as Array<{ created_at: string }>) {
    const idx = keyToIndex.get(formatLocalDateKey(new Date(row.created_at)));
    if (idx != null) capturedSeries[idx] += 1;
  }

  for (const row of (capturedTaskRows ?? []) as Array<{ created_at: string }>) {
    const createdAt = new Date(row.created_at);
    const rowIdx = keyToLast30Index.get(formatLocalDateKey(createdAt));
    const hour = createdAt.getHours();
    if (rowIdx != null && hour >= 0 && hour <= 23) {
      capturedHeatmap[rowIdx][hour] += 1;
    }
  }

  for (const row of (resolvedRows ?? []) as Array<{ updated_at: string }>) {
    const updatedAt = new Date(row.updated_at);
    const idx = keyToIndex.get(formatLocalDateKey(updatedAt));
    if (idx != null) resolvedSeries[idx] += 1;
    const rowIdx = keyToLast30Index.get(formatLocalDateKey(updatedAt));
    const hour = updatedAt.getHours();
    if (rowIdx != null && hour >= 0 && hour <= 23) {
      resolvedHeatmap[rowIdx][hour] += 1;
    }
  }

  const { data: activeDueRows, error: activeDueError } = await supabase
    .from("brain_items")
    .select("due_date")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "ACTIVE")
    .not("due_date", "is", null);

  if (activeDueError) throw activeDueError;

  let activeDueTasksCount = 0;
  let overdueUnfinishedCount = 0;

  for (const row of (activeDueRows ?? []) as Array<{ due_date: string | null }>) {
    if (!row.due_date) continue;
    const due = new Date(row.due_date);
    if (Number.isNaN(due.getTime())) continue;
    activeDueTasksCount += 1;
    if (due.getTime() < now.getTime()) {
      overdueUnfinishedCount += 1;
    }
  }

  const { data: overdueRows, error: overdueRowsError } = await supabase
    .from("brain_items")
    .select("due_date")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "ACTIVE")
    .not("due_date", "is", null)
    .gte("due_date", lookbackStart.toISOString())
    .lte("due_date", todayEnd.toISOString());

  if (overdueRowsError) throw overdueRowsError;

  let overdueInLast30Count = 0;
  for (const row of (overdueRows ?? []) as Array<{ due_date: string | null }>) {
    if (!row.due_date) continue;
    const due = new Date(row.due_date);
    if (Number.isNaN(due.getTime())) continue;
    if (due.getTime() < now.getTime()) overdueInLast30Count += 1;
  }

  const { data: doneRows, error: doneError } = await supabase
    .from("brain_items")
    .select("due_date, updated_at")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "DONE")
    .not("due_date", "is", null)
    .gte("updated_at", lookbackStart.toISOString())
    .lte("updated_at", todayEnd.toISOString());

  if (doneError) throw doneError;

  let doneWithDueCount = 0;

  for (const row of (doneRows ?? []) as Array<{ due_date: string | null; updated_at: string }>) {
    if (!row.due_date) continue;
    const doneAt = new Date(row.updated_at);
    if (Number.isNaN(doneAt.getTime())) continue;
    doneWithDueCount += 1;
  }

  return {
    weekDateLabels,
    capturedSeries,
    resolvedSeries,
    capturedHeatmap,
    resolvedHeatmap,
    capturedLast30Count: (capturedRows ?? []).length,
    ideasLast30Count: (capturedIdeaRows ?? []).length,
    activeDueTasksCount,
    overdueUnfinishedCount: overdueInLast30Count,
    completedWithDueCount: doneWithDueCount,
  };
}
