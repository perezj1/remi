// src/lib/syncOfflineQueue.ts
import {
  createIdea,
  createTask,
  updateTask,
  setTaskStatus,
  postponeTask,
  type BrainItem,
} from "@/lib/brainItemsApi";

import {
  queueList,
  queueRemove,
  type OfflineOp,
} from "@/lib/offlineQueue";

import {
  loadCachedTasks,
  saveCachedTasks,
  loadCachedIdeas,
  saveCachedIdeas,
  loadCachedInbox,
  saveCachedInbox,
} from "@/lib/localBrainCache";

const ID_MAP_KEY = "remi_offline_idmap_v1";

type IdMap = Record<string, string>; // tempId -> realId

function loadIdMap(): IdMap {
  try {
    const raw = localStorage.getItem(ID_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as IdMap) : {};
  } catch {
    return {};
  }
}

function saveIdMap(map: IdMap) {
  try {
    localStorage.setItem(ID_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function resolveMaybeMappedId(id: string, map: IdMap): string {
  return map[id] ?? id;
}

function replaceIdEverywhere(userId: string, tempId: string, realId: string) {
  const tasks = loadCachedTasks(userId).map((x) =>
    x.id === tempId ? { ...x, id: realId } : x
  );
  saveCachedTasks(userId, tasks);

  const ideas = loadCachedIdeas(userId).map((x) =>
    x.id === tempId ? { ...x, id: realId } : x
  );
  saveCachedIdeas(userId, ideas);

  const inbox = loadCachedInbox(userId).map((x) =>
    x.id === tempId ? { ...x, id: realId } : x
  );
  saveCachedInbox(userId, inbox);
}

/**
 * Sincroniza la cola offline en orden.
 * - Si falla una operación, se corta y se reintentará más tarde.
 */
export async function syncOfflineQueue(userId: string) {
  if (!userId) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  const ops = queueList().filter((o) => o.userId === userId);
  const idMap = loadIdMap();

  for (const op of ops) {
    try {
      // ✅ antes de ejecutar, remap de ids si aplica
      const opResolved = resolveOpIds(op, idMap);

      const maybeCreated = await runOp(opResolved);

      // ✅ si fue creación y venía de offline con tempId, mapeamos y reescribimos cache
      if (opResolved.type === "CREATE_TASK" || opResolved.type === "CREATE_IDEA") {
        const tempId = (op as any).clientTempId as string | undefined;
        if (tempId && maybeCreated?.id && maybeCreated.id !== tempId) {
          idMap[tempId] = maybeCreated.id;
          saveIdMap(idMap);
          replaceIdEverywhere(userId, tempId, maybeCreated.id);
        }
      }

      await queueRemove(op.id);
    } catch (e) {
      console.error("[syncOfflineQueue] op failed, will retry later:", op, e);
      break;
    }
  }
}

function resolveOpIds(op: OfflineOp, idMap: IdMap): OfflineOp {
  switch (op.type) {
    case "UPDATE_TASK":
      return { ...op, taskId: resolveMaybeMappedId(op.taskId, idMap) };
    case "SET_TASK_STATUS":
      return { ...op, taskId: resolveMaybeMappedId(op.taskId, idMap) };
    case "POSTPONE_TASK":
      return { ...op, taskId: resolveMaybeMappedId(op.taskId, idMap) };
    default:
      return op;
  }
}

async function runOp(op: OfflineOp): Promise<BrainItem | null> {
  switch (op.type) {
    case "CREATE_TASK": {
      return await createTask(op.userId, op.title, op.dueDate, op.reminderMode, op.repeatType);
    }

    case "CREATE_IDEA": {
      return await createIdea(op.userId, op.title);
    }

    case "UPDATE_TASK": {
      return await updateTask(op.taskId, op.title, op.dueDate, op.reminderMode, op.repeatType);
    }

    case "SET_TASK_STATUS": {
      return await setTaskStatus(op.taskId, op.status);
    }

    case "POSTPONE_TASK": {
      return await postponeTask(op.taskId, op.dueDateIso);
    }

    default: {
      const _never: never = op;
      return _never;
    }
  }
}
