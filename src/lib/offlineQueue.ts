// src/lib/offlineQueue.ts
export type OfflineOpType =
  | "CREATE_TASK"
  | "CREATE_IDEA"
  | "UPDATE_TASK"
  | "SET_TASK_STATUS"
  | "POSTPONE_TASK";

export type OfflineOpBase = {
  id: string; // id de la operación en cola
  type: OfflineOpType;
  createdAt: number;
  userId: string;
};

export type OfflineCreateTaskOp = OfflineOpBase & {
  type: "CREATE_TASK";
  clientTempId?: string; // ✅ id temporal del BrainItem creado offline
  title: string;
  dueDate: string | null;
  reminderMode: any; // ReminderMode
  repeatType: any; // RepeatType
};

export type OfflineCreateIdeaOp = OfflineOpBase & {
  type: "CREATE_IDEA";
  clientTempId?: string; // ✅ id temporal del BrainItem creado offline
  title: string;
};

export type OfflineUpdateTaskOp = OfflineOpBase & {
  type: "UPDATE_TASK";
  taskId: string; // puede ser tempId
  title: string;
  dueDate: string | null;
  reminderMode: any; // ReminderMode
  repeatType: any; // RepeatType
};

export type OfflineSetTaskStatusOp = OfflineOpBase & {
  type: "SET_TASK_STATUS";
  taskId: string; // puede ser tempId
  status: "ACTIVE" | "DONE";
};

export type OfflinePostponeTaskOp = OfflineOpBase & {
  type: "POSTPONE_TASK";
  taskId: string; // puede ser tempId
  dueDateIso: string; // ISO string
};

export type OfflineOp =
  | OfflineCreateTaskOp
  | OfflineCreateIdeaOp
  | OfflineUpdateTaskOp
  | OfflineSetTaskStatusOp
  | OfflinePostponeTaskOp;

// ✅ subimos versión para no mezclar con viejas ops sin tempId
const STORAGE_KEY = "remi_offline_queue_v2";

function safeParse(json: string | null): OfflineOp[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as OfflineOp[];
  } catch {
    return [];
  }
}

function safeWrite(list: OfflineOp[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function queueList(): OfflineOp[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function queueAdd(op: OfflineOp) {
  const list = queueList();
  list.push(op);
  safeWrite(list);
}

export function queueRemove(id: string) {
  const list = queueList().filter((x) => x.id !== id);
  safeWrite(list);
}

export function queueClear() {
  safeWrite([]);
}

export function makeOpId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function makeTempItemId() {
  // ✅ id temporal estable para items creados offline
  return `local_${makeOpId()}`;
}
