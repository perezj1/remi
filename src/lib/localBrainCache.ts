// src/lib/localBrainCache.ts
import type { BrainItem } from "@/lib/brainItemsApi";

function key(userId: string, name: "tasks" | "ideas" | "inbox") {
  return `remi_cache_${name}_${userId}`;
}

export function saveCachedTasks(userId: string, tasks: BrainItem[]) {
  try {
    localStorage.setItem(key(userId, "tasks"), JSON.stringify(tasks));
  } catch {}
}
export function loadCachedTasks(userId: string): BrainItem[] {
  try {
    const raw = localStorage.getItem(key(userId, "tasks"));
    return raw ? (JSON.parse(raw) as BrainItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCachedIdeas(userId: string, ideas: BrainItem[]) {
  try {
    localStorage.setItem(key(userId, "ideas"), JSON.stringify(ideas));
  } catch {}
}
export function loadCachedIdeas(userId: string): BrainItem[] {
  try {
    const raw = localStorage.getItem(key(userId, "ideas"));
    return raw ? (JSON.parse(raw) as BrainItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCachedInbox(userId: string, items: BrainItem[]) {
  try {
    localStorage.setItem(key(userId, "inbox"), JSON.stringify(items));
  } catch {}
}
export function loadCachedInbox(userId: string): BrainItem[] {
  try {
    const raw = localStorage.getItem(key(userId, "inbox"));
    return raw ? (JSON.parse(raw) as BrainItem[]) : [];
  } catch {
    return [];
  }
}
