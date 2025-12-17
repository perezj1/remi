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

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode =
  | "NONE"
  | "ON_DUE_DATE"
  | "DAY_BEFORE_AND_DUE"
  | "DAILY_UNTIL_DUE";

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
      })
      .select()
      .single();

    if (error) throw error;

    const created = data as BrainItem;
    cacheUpsertTask(userId, created);
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
    };

    cacheUpsertTask(userId, localItem);

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
      })
      .select()
      .single();

    if (error) throw error;

    const created = data as BrainItem;
    cacheUpsertIdea(userId, created);
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
    };

    cacheUpsertIdea(userId, localItem);

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
    (reminderMode === "ON_DUE_DATE" || reminderMode === "DAY_BEFORE_AND_DUE")
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
    // ✅ OFFLINE: actualizar cache + encolar
    // Intentamos encontrar el userId desde cache; si no, asumimos que viene del caller (no lo tenemos aquí).
    // Como mínimo, actualizamos donde esté.
    const allUsersGuess = (typeof window !== "undefined") ? [/* no conocemos userId aquí */] : [];
    // Mejor: buscamos en cache de inbox para encontrar el user.
    let userId = "";
    try {
      // si está en inbox de algún user, no podemos saberlo. En tu app siempre hay un user activo:
      // => encolamos igual con userId vacío no sirve. Así que: guardamos userId en op desde el caller
      // Pero tu caller no lo pasa.
      // SOLUCIÓN práctica: tomamos userId del item cacheado en tasks si existe.
      // (tu app guarda cache por userId, pero aquí no lo sabemos). Por eso: usamos el userId del item si viene del backend,
      // y si es tempId, normalmente lo has creado con userId y está en cache del usuario activo.
    } catch {}

    // ✅ En tu app, updateTask se llama desde UI ya teniendo el user actual.
    // La forma más estable: el UI debe seguir usando los estados en memoria.
    // Para no romper nada: encolamos con userId del item cacheado en "inbox" del usuario activo (si existe).
    // Aquí no podemos acceder al user activo. Así que: el fix real es encolar con userId desde donde lo llamas.
    // PERO tú ya estás usando estas funciones en Index con user.id, y updateTask normalmente se usa en TaskEditModal
    // que también tiene user en contexto. Si me pasas ese archivo, lo ajusto.
    //
    // Mientras tanto: hacemos un fallback seguro -> NO encolamos si no podemos determinar userId.
    // => Si quieres 100% offline update, necesito que el caller me pase userId o que exportemos updateTaskForUser.
    // ✅ Como me pediste "sin romper nada", no invento: aquí devuelvo un error si no se puede encolar.
    throw e;
  }
}

/**
 * ConvertIdeaToTask se mantiene online por ahora.
 * (si lo quieres offline también, lo hacemos con el mismo patrón que create+update)
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

export async function setTaskStatus(id: string, status: BrainItemStatus): Promise<BrainItem> {
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
    // ✅ OFFLINE: aquí también necesitas userId para cache por usuario
    // (lo podemos resolver en el caller). Sin eso, no puedo actualizar cache con seguridad.
    throw e;
  }
}

export async function postponeTask(id: string, newDueDate: string | null): Promise<BrainItem> {
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
  const todayDone = todayTasks.filter((t) => t.status === "DONE").length;

  const { count: totalTasksStored, error: totalTasksError } = await supabase
    .from("brain_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED");

  if (totalTasksError) throw totalTasksError;

  const { count: totalIdeasStored, error: totalIdeasError } = await supabase
    .from("brain_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "idea")
    .neq("status", "ARCHIVED");

  if (totalIdeasError) throw totalIdeasError;

  const totalTasks = totalTasksStored ?? 0;
  const totalIdeas = totalIdeasStored ?? 0;
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
