// src/lib/brainItemsApi.ts
import { supabase } from "@/integrations/supabase/client";

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode =
  | "NONE"
  | "ON_DUE_DATE"
  | "DAY_BEFORE_AND_DUE"
  | "DAILY_UNTIL_DUE";

// tipo de repetición
export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

// Offset por defecto para hábitos: minutos antes de la hora
const DEFAULT_HABIT_OFFSET_MINUTES = 0;

export interface BrainItem {
  id: string;
  user_id: string;
  type: BrainItemType;
  title: string;
  due_date: string | null; // ISO string
  reminder_mode: ReminderMode;
  status: BrainItemStatus;
  created_at: string;
  updated_at: string;
  last_notified_at: string | null;

  // CAMPOS DE REPETICIÓN / HÁBITOS
  repeat_type: RepeatType;
  next_reminder_at: string | null; // ISO string o null (sistema actual)
  is_habit?: boolean; // true si es hábito
  habit_offset_minutes?: number; // minutos antes de la hora base
  next_notification_at?: string | null; // ISO string o null (para edge function nuevo)
}

/**
 * Devuelve la fecha de inicio de hoy en hora local (00:00:00.000)
 */
function getTodayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calcula la hora de notificación de un hábito aplicando un offset
 * (ej: dueDate = 10:00, offset = 120 -> 08:00).
 */
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

  const { data, error } = await supabase
    .from("brain_items")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "ACTIVE")
    // Solo tareas:
    // - sin fecha (due_date IS NULL)
    // - o con due_date >= inicio de hoy
    .or(`due_date.is.null,due_date.gte.${todayIso}`)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as BrainItem[];
}

export async function fetchInboxItems(userId: string): Promise<BrainItem[]> {
  const { data, error } = await supabase
    .from("brain_items")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const items = (data ?? []) as BrainItem[];
  const todayStart = getTodayStart();

  // Filtramos aquí para no liarnos con combinaciones AND/OR en Supabase:
  // - Todas las ideas se mantienen.
  // - Tareas sin fecha se mantienen.
  // - Tareas con fecha solo si due_date >= hoy.
  const filtered = items.filter((item) => {
    if (item.type === "idea") return true;

    if (item.type === "task") {
      if (!item.due_date) return true;
      const due = new Date(item.due_date);
      return due >= todayStart;
    }

    return true;
  });

  return filtered;
}

export async function fetchActiveIdeas(userId: string): Promise<BrainItem[]> {
  const { data, error } = await supabase
    .from("brain_items")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "idea")
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as BrainItem[];
}

// 👇 A partir de aquí: soporte para repetición y next_reminder_at

export async function createTask(
  userId: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode,
  repeatType: RepeatType = "none"
): Promise<BrainItem> {
  const hasHabit = repeatType !== "none";
  const habitOffsetMinutes = hasHabit ? DEFAULT_HABIT_OFFSET_MINUTES : 0;

  // Para hábitos, calculamos la primera notificación aplicando el offset.
  const habitNotification =
    hasHabit && dueDate
      ? computeHabitNotificationTime(dueDate, habitOffsetMinutes)
      : null;

  // next_reminder_at lo usamos para el sistema actual de notificaciones.
  const nextReminderAt = habitNotification;

  // next_notification_at queda listo por si el Edge Function nuevo lo usa.
  const nextNotificationAt = habitNotification;

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
  return data as BrainItem;
}

export async function createIdea(
  userId: string,
  title: string
): Promise<BrainItem> {
  const { data, error } = await supabase
    .from("brain_items")
    .insert({
      user_id: userId,
      type: "idea",
      title,
      // ideas nuevas: sin repetición ni next_reminder_at
      repeat_type: "none",
      next_reminder_at: null,
      is_habit: false,
      habit_offset_minutes: 0,
      next_notification_at: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BrainItem;
}

/**
 * Actualizar solo el título de una idea (se mantiene como idea).
 */
export async function updateIdeaTitle(
  id: string,
  title: string
): Promise<BrainItem> {
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

/**
 * NUEVO: Actualizar una tarea (texto, fecha, recordatorio, repetición)
 * - recalcula is_habit / habit_offset_minutes
 * - recalcula next_reminder_at / next_notification_at
 */
export async function updateTask(
  id: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode,
  repeatType: RepeatType = "none"
): Promise<BrainItem> {
  const hasHabit = repeatType !== "none";
  const habitOffsetMinutes = hasHabit ? DEFAULT_HABIT_OFFSET_MINUTES : 0;

  // Si NO hay fecha, no tiene sentido ON_DUE_DATE / DAY_BEFORE...
  const safeReminderMode: ReminderMode =
    !dueDate &&
    (reminderMode === "ON_DUE_DATE" || reminderMode === "DAY_BEFORE_AND_DUE")
      ? "NONE"
      : reminderMode;

  // Para hábitos calculamos la notificación con offset
  const habitNotification =
    hasHabit && dueDate
      ? computeHabitNotificationTime(dueDate, habitOffsetMinutes)
      : null;

  // IMPORTANTE:
  // - Hábitos: next_* con offset
  // - No hábitos: alineado con postponeTask (next_* = dueDate)
  const nextReminderAt = hasHabit ? habitNotification : dueDate;
  const nextNotificationAt = hasHabit ? habitNotification : dueDate;

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
  return data as BrainItem;
}

/**
 * Convertir una idea existente en tarea:
 * - cambia type a "task"
 * - actualiza el título
 * - asigna due_date y reminder_mode
 * - asigna repeat_type y next_reminder_at / next_notification_at (si es hábito)
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
  return data as BrainItem;
}

export async function setTaskStatus(
  id: string,
  status: BrainItemStatus
): Promise<BrainItem> {
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
  return data as BrainItem;
}

export async function postponeTask(
  id: string,
  newDueDate: string | null
): Promise<BrainItem> {
  // Lógica simple:
  // - movemos due_date
  // - alineamos next_reminder_at y next_notification_at con la nueva due_date
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
  return data as BrainItem;
}

/**
 * Borrar definitivamente un BrainItem de la base de datos.
 */
export async function deleteBrainItem(id: string): Promise<void> {
  const { error } = await supabase.from("brain_items").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Resumen para la página de "Status" de Remi.
 * Usa tareas e ideas + tabla brain_activity_days para la racha y actividad.
 */
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

export async function fetchRemiStatusSummary(
  userId: string
): Promise<RemiStatusSummary> {
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
  streakWindowStart.setDate(
    streakWindowStart.getDate() - (MAX_STREAK_DAYS - 1)
  );

  // 1) Tareas de hoy (por due_date)
  const { data: todayTasksRaw, error: todayError } = await supabase
    .from("brain_items")
    .select("id, status")
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED")
    .gte("due_date", todayStart.toISOString())
    .lte("due_date", todayEnd.toISOString());

  if (todayError) throw todayError;

  const todayTasks =
    (todayTasksRaw ?? []) as Pick<BrainItem, "id" | "status">[];

  const todayTotal = todayTasks.length;
  const todayDone = todayTasks.filter((t) => t.status === "DONE").length;

  // 2) Total tareas almacenadas
  const { count: totalTasksStored, error: totalTasksError } = await supabase
    .from("brain_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED");

  if (totalTasksError) throw totalTasksError;

  // 3) Total ideas almacenadas
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

  // 4) Días activos en la ventana de racha
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

  // 5) racha consecutiva
  let streakDays = 0;
  for (let offset = 0; offset < MAX_STREAK_DAYS; offset++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - offset);
    const key = formatLocalDateKey(d);
    if (activityDays.has(key)) streakDays += 1;
    else break;
  }

  // 6) Semana actual (lunes–domingo)
  let weekActiveDays = 0;
  const weekActivitySlots: boolean[] = [];

  const todayLocal = new Date(todayStart);
  const jsDay = todayLocal.getDay(); // 0 domingo, 1 lunes...
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

  // 7) días desde última actividad
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
