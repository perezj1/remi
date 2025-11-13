// src/lib/brainItemsApi.ts
import { supabase } from "@/integrations/supabase/client";

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode = "NONE" | "ON_DUE_DATE" | "DAY_BEFORE_AND_DUE" | "DAILY_UNTIL_DUE";

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

export async function fetchActiveTasks(userId: string): Promise<BrainItem[]> {
  const { data, error } = await supabase
    .from("brain_items")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "task")
    .eq("status", "ACTIVE")
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
  return data as BrainItem[];
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

export async function createIdea(userId: string, title: string): Promise<BrainItem> {
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
