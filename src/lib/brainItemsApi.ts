// src/lib/brainItemsApi.ts
import { supabase } from "@/integrations/supabase/client";

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode =
  | "NONE"
  | "ON_DUE_DATE"
  | "DAY_BEFORE_AND_DUE"
  | "DAILY_UNTIL_DUE";

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
}

/**
 * Devuelve la fecha de inicio de hoy en hora local (00:00:00.000)
 */
function getTodayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
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

    // Por si en el futuro hay otros tipos
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

export async function createTask(
  userId: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode
): Promise<BrainItem> {
  const { data, error } = await supabase
    .from("brain_items")
    .insert({
      user_id: userId,
      type: "task",
      title,
      due_date: dueDate,
      reminder_mode: reminderMode,
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
 * Convertir una idea existente en tarea:
 * - cambia type a "task"
 * - actualiza el título
 * - asigna due_date y reminder_mode
 */
export async function convertIdeaToTask(
  id: string,
  title: string,
  dueDate: string | null,
  reminderMode: ReminderMode
): Promise<BrainItem> {
  const { data, error } = await supabase
    .from("brain_items")
    .update({
      type: "task",
      title,
      due_date: dueDate,
      reminder_mode: reminderMode,
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
  const { data, error } = await supabase
    .from("brain_items")
    .update({
      due_date: newDueDate,
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
 * Se usará cuando el usuario pulse el icono de papelera.
 */
export async function deleteBrainItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("brain_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Resumen para la página de "Status" de Remi.
 * Usa tareas e ideas + tabla brain_activity_days para la racha y actividad.
 */
export type RemiStatusSummary = {
  /** Tareas de hoy (por fecha de vencimiento) */
  todayTotal: number;
  /** Tareas de hoy marcadas como DONE */
  todayDone: number;
  /** Días de los últimos 7 con al menos 1 día de actividad (crear/completar) */
  weekActiveDays: number;
  /** Total de tareas almacenadas (no archivadas) */
  totalTasksStored: number;
  /** Total de ideas almacenadas (no archivadas) */
  totalIdeasStored: number;
  /** Total de elementos (tareas + ideas) no archivados */
  totalItemsStored: number;
  /** Racha de días consecutivos con actividad (hasta hoy) */
  streakDays: number;
  /** Días desde la última actividad (0 = hoy, 1 = ayer, etc., null = nunca) */
  daysSinceLastActivity: number | null;
};

export async function fetchRemiStatusSummary(
  userId: string
): Promise<RemiStatusSummary> {
  const now = new Date();

  // Helpers de fechas en hora local
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

  // Ventana máxima que miramos hacia atrás para la racha (en días)
  const MAX_STREAK_DAYS = 60;
  const streakWindowStart = new Date(todayStart);
  streakWindowStart.setDate(
    streakWindowStart.getDate() - (MAX_STREAK_DAYS - 1)
  );

  // 1) Tareas de hoy (por due_date)
  const {
    data: todayTasksRaw,
    error: todayError,
  } = await supabase
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

  // 2) Total de tareas almacenadas (no archivadas)
  const {
    count: totalTasksStored,
    error: totalTasksError,
  } = await supabase
    .from("brain_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "task")
    .neq("status", "ARCHIVED");

  if (totalTasksError) throw totalTasksError;

  // 3) Total de ideas almacenadas (no archivadas)
  const {
    count: totalIdeasStored,
    error: totalIdeasError,
  } = await supabase
    .from("brain_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "idea")
    .neq("status", "ARCHIVED");

  if (totalIdeasError) throw totalIdeasError;

  const totalTasks = totalTasksStored ?? 0;
  const totalIdeas = totalIdeasStored ?? 0;
  const totalItemsStored = totalTasks + totalIdeas;

  // 4) Días activos en la ventana de racha usando brain_activity_days
  const startDateKey = formatLocalDateKey(streakWindowStart);
  const endDateKey = formatLocalDateKey(todayStart);

  const {
    data: activityRows,
    error: activityError,
  } = await supabase
    .from("brain_activity_days")
    .select("day, completed_tasks")
    .eq("user_id", userId)
    .gte("day", startDateKey)
    .lte("day", endDateKey);

  if (activityError) throw activityError;

  type ActivityRow = { day: string; completed_tasks: number };
  const activity = (activityRows ?? []) as ActivityRow[];

  const activityDays = new Set<string>();
  for (const row of activity) {
    // "day" viene como "YYYY-MM-DD"
    activityDays.add(row.day);
  }

  // 5) Calcular racha de días consecutivos (hasta hoy)
  let streakDays = 0;
  for (let offset = 0; offset < MAX_STREAK_DAYS; offset++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - offset);
    const key = formatLocalDateKey(d);
    if (activityDays.has(key)) {
      streakDays += 1;
    } else {
      break;
    }
  }

  // 6) Días activos en la última semana (7 días incluyendo hoy)
  let weekActiveDays = 0;
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - offset);
    const key = formatLocalDateKey(d);
    if (activityDays.has(key)) {
      weekActiveDays += 1;
    }
  }

  // 7) Días desde la última actividad (crear tarea/idea o completar tarea)
  let daysSinceLastActivity: number | null = null;
  if (activity.length > 0) {
    let lastDate: Date | null = null;

    for (const row of activity) {
      // row.day es "YYYY-MM-DD"
      const d = new Date(row.day + "T00:00:00Z");
      if (!lastDate || d > lastDate) {
        lastDate = d;
      }
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
    totalTasksStored: totalTasks,
    totalIdeasStored: totalIdeas,
    totalItemsStored,
    streakDays,
    daysSinceLastActivity,
  };
}
