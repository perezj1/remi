import { supabase } from "@/integrations/supabase/client";
import { suggestSharedListEmoji } from "@/lib/sharedListEmojiAuto";

export type SharedListRole = "owner" | "editor" | "viewer";

export type SharedListMemberPreview = {
  user_id: string;
  avatar_url: string | null;
  display_name: string | null;
};

export type SharedList = {
  id: string;
  title: string;
  icon_emoji: string | null;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
  my_role: SharedListRole;
  my_notification_enabled: boolean;
  members_count: number;
  member_profiles: SharedListMemberPreview[];
  member_previews: SharedListMemberPreview[];
};

export type SharedListItem = {
  id: string;
  list_id: string;
  text: string;
  done: boolean;
  assigned_to_user_id: string | null;
  position: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type SharedListItemStats = {
  done: number;
  total: number;
  itemsActivityMs: number;
};

export type SharedListEventType =
  | "item_created"
  | "item_deleted"
  | "item_done_toggled"
  | "member_joined";

export type SharedListEventAction =
  | "item_added"
  | "item_deleted"
  | "item_assigned"
  | "item_unassigned"
  | "item_completed"
  | "item_reopened"
  | "item_renamed"
  | "list_renamed"
  | "member_joined";

export type SharedListEventPayload = {
  action?: SharedListEventAction;
  list_title?: string;
  item_text?: string;
  previous_text?: string;
  next_text?: string;
  done?: boolean;
  assigned_to_user_id?: string | null;
  previous_assigned_to_user_id?: string | null;
  assigned_to_display_name?: string | null;
  previous_assigned_to_display_name?: string | null;
};

export type SharedListNotification = {
  id: string;
  list_id: string;
  item_id: string | null;
  event_type: SharedListEventType;
  actor_user_id: string;
  actor_avatar_url: string | null;
  actor_display_name: string | null;
  payload: SharedListEventPayload;
  created_at: string;
  list_title: string;
  unread: boolean;
};

export type SharedListInviteStatus = "pending" | "accepted" | "expired";

export type SharedListInvitePublic = {
  status: SharedListInviteStatus;
  senderDisplayName: string | null;
  listTitle: string;
  listIconEmoji: string | null;
  role: "editor" | "viewer";
  expiresAt: string | null;
  previewItems: string[];
};

type SharedListItemSnapshot = Pick<
  SharedListItem,
  "id" | "list_id" | "text" | "done" | "assigned_to_user_id"
>;

function ensure(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function ensureNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeInviteToken(rawToken: string): string {
  const raw = String(rawToken ?? "").trim();
  if (!raw) return "";

  let token = raw;
  if (raw.includes("/lists/invite")) {
    try {
      const parsed = new URL(raw);
      const fromQuery = parsed.searchParams.get("token")?.trim();
      if (fromQuery) token = fromQuery;
      else {
        const marker = "/lists/invite/";
        const idx = parsed.pathname.toLowerCase().indexOf(marker);
        if (idx >= 0) {
          token = parsed.pathname.slice(idx + marker.length);
        }
      }
    } catch {
      token = raw;
    }
  }

  try {
    token = decodeURIComponent(token);
  } catch {
    // keep raw token if decoding fails
  }

  return token
    .trim()
    .replace(/^["'`]+/, "")
    .replace(/["'`]+$/, "")
    .replace(/[.,;:!?]+$/, "");
}

function ensureBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toMs(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSharedListEventAction(value: unknown): SharedListEventAction | undefined {
  switch (value) {
    case "item_added":
    case "item_deleted":
    case "item_assigned":
    case "item_unassigned":
    case "item_completed":
    case "item_reopened":
    case "item_renamed":
    case "list_renamed":
    case "member_joined":
      return value;
    default:
      return undefined;
  }
}

function normalizeSharedListEventPayload(value: unknown): SharedListEventPayload {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeSharedListEventPayload(parsed);
    } catch {
      return {};
    }
  }

  if (typeof value !== "object" || Array.isArray(value)) return {};

  const row = value as Record<string, unknown>;
  return {
    action: normalizeSharedListEventAction(row.action),
    list_title: ensureNullableString(row.list_title) ?? undefined,
    item_text: ensureNullableString(row.item_text) ?? undefined,
    previous_text: ensureNullableString(row.previous_text) ?? undefined,
    next_text: ensureNullableString(row.next_text) ?? undefined,
    done: ensureBoolean(row.done),
    assigned_to_user_id: "assigned_to_user_id" in row ? ensureNullableString(row.assigned_to_user_id) : undefined,
    previous_assigned_to_user_id:
      "previous_assigned_to_user_id" in row
        ? ensureNullableString(row.previous_assigned_to_user_id)
        : undefined,
    assigned_to_display_name:
      "assigned_to_display_name" in row ? ensureNullableString(row.assigned_to_display_name) : undefined,
    previous_assigned_to_display_name:
      "previous_assigned_to_display_name" in row
        ? ensureNullableString(row.previous_assigned_to_display_name)
        : undefined,
  };
}

function normalizeSharedListEventKeyPart(value: string | null | undefined): string {
  return String(value ?? "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildSharedListEventFingerprint(
  row: {
    list_id: string;
    item_id: string | null;
    event_type: SharedListEventType;
    actor_user_id: string;
  },
  payload: SharedListEventPayload,
  fallbackItemText: string | null,
): string {
  return [
    row.list_id,
    row.item_id ?? "",
    row.event_type,
    row.actor_user_id,
    normalizeSharedListEventKeyPart(payload.item_text ?? fallbackItemText),
    normalizeSharedListEventKeyPart(payload.previous_text),
    normalizeSharedListEventKeyPart(payload.next_text),
    payload.done === undefined ? "" : payload.done ? "1" : "0",
    payload.assigned_to_user_id ?? "",
    payload.previous_assigned_to_user_id ?? "",
  ].join("|");
}

function buildSharedListEventCoarseFingerprint(
  row: {
    list_id: string;
    item_id: string | null;
    event_type: SharedListEventType;
    actor_user_id: string;
  },
  payload: SharedListEventPayload,
  fallbackItemText: string | null,
): string {
  const mainText =
    payload.item_text ?? payload.next_text ?? payload.previous_text ?? fallbackItemText;
  return [
    row.list_id,
    row.item_id ?? "",
    row.event_type,
    row.actor_user_id,
    normalizeSharedListEventKeyPart(mainText),
  ].join("|");
}

function normalizeSharedListInviteStatus(
  rawStatus: unknown,
  expiresAt: string | null,
): SharedListInviteStatus {
  if (rawStatus === "accepted") return "accepted";

  const expiresMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;
  if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
    return "expired";
  }

  return "pending";
}

async function invokeFunctionWithTimeout<T>(
  name: string,
  body: Record<string, unknown>,
  timeoutMs = 5000,
): Promise<{ data: T | null; error: { message: string } | null }> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      supabase.functions.invoke(name, { body }) as Promise<{
        data: T | null;
        error: { message?: string } | null;
      }>,
      new Promise<{ data: T | null; error: { message: string } | null }>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve({
            data: null,
            error: { message: `${name} timed out` },
          });
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function fetchSharedListItemSnapshot(itemId: string): Promise<SharedListItemSnapshot | null> {
  const { data, error } = await supabase
    .from("shared_list_items")
    .select("id, list_id, text, done, assigned_to_user_id")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return data as SharedListItemSnapshot;
}

async function fetchSharedListTitleSnapshot(listId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("shared_lists")
    .select("title")
    .eq("id", listId)
    .maybeSingle();

  if (error) throw error;
  return ensureNullableString((data as Record<string, unknown> | null)?.title);
}

async function recordSharedListEvent(
  listId: string,
  itemId: string | null,
  eventType: SharedListEventType,
  actorUserId: string,
  payload: SharedListEventPayload = {},
): Promise<void> {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

  const { error } = await supabase.from("shared_list_events").insert({
    list_id: listId,
    item_id: itemId,
    event_type: eventType,
    actor_user_id: actorUserId,
    payload: cleanPayload,
  });

  if (error) {
    console.error("Error recording shared list event", error);
  }
}

function getSharedListEventTypeForAction(action: SharedListEventAction): SharedListEventType {
  switch (action) {
    case "item_deleted":
      return "item_deleted";
    case "item_completed":
    case "item_reopened":
      return "item_done_toggled";
    case "member_joined":
      return "member_joined";
    default:
      return "item_created";
  }
}

async function recordSharedListActivity(
  listId: string,
  itemId: string | null,
  action: SharedListEventAction,
  actorUserId: string,
  payload: SharedListEventPayload = {},
): Promise<void> {
  await recordSharedListEvent(
    listId,
    itemId,
    getSharedListEventTypeForAction(action),
    actorUserId,
    {
      ...payload,
      action,
    },
  );
}

export async function fetchSharedLists(userId: string): Promise<SharedList[]> {
  const { data: memberships, error: membersErr } = await supabase
    .from("shared_list_members")
    .select("list_id, role, notification_enabled")
    .eq("user_id", userId);

  if (membersErr) throw membersErr;

  const membershipRows = (memberships ?? []) as Array<{
    list_id: string;
    role: SharedListRole;
    notification_enabled: boolean;
  }>;

  const listIds = membershipRows.map((m) => m.list_id);
  if (listIds.length === 0) return [];

  const membershipByList = new Map(membershipRows.map((m) => [m.list_id, m]));

  const { data: listsRaw, error: listErr } = await supabase
    .from("shared_lists")
    .select("id, title, icon_emoji, owner_user_id, created_at, updated_at")
    .in("id", listIds)
    .order("updated_at", { ascending: false });

  if (listErr) throw listErr;

  const { data: membersRaw, error: countErr } = await supabase
    .from("shared_list_members")
    .select("list_id, user_id")
    .in("list_id", listIds);

  if (countErr) throw countErr;

  const countMap = new Map<string, number>();
  const userIds = new Set<string>();
  const membersByList = new Map<string, string[]>();
  for (const row of (membersRaw ?? []) as Array<{ list_id: string; user_id: string }>) {
    countMap.set(row.list_id, (countMap.get(row.list_id) ?? 0) + 1);
    if (row.user_id) userIds.add(row.user_id);
    const prev = membersByList.get(row.list_id) ?? [];
    prev.push(row.user_id);
    membersByList.set(row.list_id, prev);
  }

  const profileMap = new Map<string, { avatar_url: string | null; display_name: string | null }>();
  if (userIds.size > 0) {
    const { data: profilesRaw, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, avatar_url, display_name")
      .in("id", Array.from(userIds));

    if (!profilesErr) {
      for (const row of (profilesRaw ?? []) as Array<{ id: string; avatar_url: string | null; display_name: string | null }>) {
        profileMap.set(row.id, {
          avatar_url: row.avatar_url ?? null,
          display_name: row.display_name ?? null,
        });
      }
    }
  }

  return ((listsRaw ?? []) as Array<Record<string, unknown>>)
    .map((row) => {
      const id = ensure(row.id, "");
      const member = membershipByList.get(id);
      if (!member) return null;

      return {
        id,
        title: ensure(row.title, ""),
        icon_emoji: typeof row.icon_emoji === "string" ? row.icon_emoji : null,
        owner_user_id: ensure(row.owner_user_id, ""),
        created_at: ensure(row.created_at, new Date().toISOString()),
        updated_at: ensure(row.updated_at, new Date().toISOString()),
        my_role: member.role,
        my_notification_enabled: !!member.notification_enabled,
        members_count: countMap.get(id) ?? 1,
        member_profiles: (membersByList.get(id) ?? []).map((memberId) => ({
          user_id: memberId,
          avatar_url: profileMap.get(memberId)?.avatar_url ?? null,
          display_name: profileMap.get(memberId)?.display_name ?? null,
        })),
        member_previews: (membersByList.get(id) ?? []).slice(0, 5).map((memberId) => ({
          user_id: memberId,
          avatar_url: profileMap.get(memberId)?.avatar_url ?? null,
          display_name: profileMap.get(memberId)?.display_name ?? null,
        })),
      } as SharedList;
    })
    .filter((v): v is SharedList => !!v)
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
}

export async function createSharedList(_userId: string, title: string): Promise<SharedList> {
  const clean = title.trim();
  if (!clean) throw new Error("Missing title");

  const { data, error } = await supabase.rpc("create_shared_list", {
    p_title: clean,
  });

  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  const ownerUserId = ensure(row.owner_user_id, "");
  const listId = ensure(row.id, "");
  const existingIcon = typeof row.icon_emoji === "string" ? row.icon_emoji.trim() : "";
  let iconEmoji = existingIcon.length > 0 ? existingIcon : null;

  if (!iconEmoji) {
    const suggestedEmoji = suggestSharedListEmoji(clean);
    if (suggestedEmoji) {
      try {
        await updateSharedListIcon(listId, suggestedEmoji);
        iconEmoji = suggestedEmoji;
      } catch (err) {
        console.error("Error applying automatic emoji to shared list", err);
      }
    }
  }

  return {
    id: listId,
    title: ensure(row.title, clean),
    icon_emoji: iconEmoji,
    owner_user_id: ownerUserId,
    created_at: ensure(row.created_at, new Date().toISOString()),
    updated_at: ensure(row.updated_at, new Date().toISOString()),
    my_role: "owner",
    my_notification_enabled: true,
    members_count: 1,
    member_profiles: [],
    member_previews: [],
  };
}

export async function updateSharedListTitle(
  listId: string,
  title: string,
  options?: { actorUserId?: string; skipEventLog?: boolean },
): Promise<void> {
  const cleanTitle = title.trim();
  const previousTitle =
    !options?.skipEventLog && options?.actorUserId ? await fetchSharedListTitleSnapshot(listId) : null;

  const { error } = await supabase
    .from("shared_lists")
    .update({ title: cleanTitle })
    .eq("id", listId);
  if (error) throw error;

  if (
    !options?.skipEventLog &&
    options?.actorUserId &&
    previousTitle &&
    previousTitle.trim() !== cleanTitle
  ) {
    void recordSharedListActivity(listId, null, "list_renamed", options.actorUserId, {
      list_title: cleanTitle,
      previous_text: previousTitle,
      next_text: cleanTitle,
    });
  }
}

export async function updateSharedListIcon(listId: string, iconEmoji: string | null): Promise<void> {
  const clean = iconEmoji ? iconEmoji.trim() : null;
  const { error } = await supabase
    .from("shared_lists")
    .update({ icon_emoji: clean && clean.length > 0 ? clean : null })
    .eq("id", listId);
  if (error) throw error;
}

export async function deleteSharedList(listId: string): Promise<void> {
  // Preferred path: backend-safe delete (if DB migration/function exists).
  const rpcRes = await supabase.rpc("delete_shared_list_safe", {
    p_list_id: listId,
  });

  if (!rpcRes.error) return;

  // If function is missing, fall back to client-side ordered cleanup to avoid FK conflicts.
  const rpcMsg = String((rpcRes.error as any)?.message ?? "");
  const functionMissing =
    rpcMsg.toLowerCase().includes("function") &&
    rpcMsg.toLowerCase().includes("delete_shared_list_safe") &&
    rpcMsg.toLowerCase().includes("does not exist");

  if (!functionMissing) {
    // Non-missing-function errors should surface immediately.
    throw rpcRes.error;
  }

  const { error: eventsErr } = await supabase
    .from("shared_list_events")
    .delete()
    .eq("list_id", listId);
  if (eventsErr) throw eventsErr;

  const { error: itemsErr } = await supabase
    .from("shared_list_items")
    .delete()
    .eq("list_id", listId);
  if (itemsErr) throw itemsErr;

  const { error: invitesErr } = await supabase
    .from("shared_list_invites")
    .delete()
    .eq("list_id", listId);
  if (invitesErr) throw invitesErr;

  const { error: membersErr } = await supabase
    .from("shared_list_members")
    .delete()
    .eq("list_id", listId);
  if (membersErr) throw membersErr;

  const { error: listErr } = await supabase
    .from("shared_lists")
    .delete()
    .eq("id", listId);
  if (listErr) throw listErr;
}

export async function leaveSharedList(listId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("shared_list_members")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function fetchSharedListItems(listId: string): Promise<SharedListItem[]> {
  const { data, error } = await supabase
    .from("shared_list_items")
    .select("id, list_id, text, done, assigned_to_user_id, position, created_by, updated_by, created_at, updated_at")
    .eq("list_id", listId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SharedListItem[];
}

export async function fetchSharedListItemStats(
  listIds: string[],
): Promise<Record<string, SharedListItemStats>> {
  const uniqueListIds = [...new Set(listIds.map((value) => value.trim()).filter(Boolean))];
  if (uniqueListIds.length === 0) return {};

  const { data, error } = await supabase
    .from("shared_list_items")
    .select("list_id, done, created_at, updated_at")
    .in("list_id", uniqueListIds);

  if (error) throw error;

  const stats = Object.fromEntries(
    uniqueListIds.map((listId) => [
      listId,
      {
        done: 0,
        total: 0,
        itemsActivityMs: 0,
      } satisfies SharedListItemStats,
    ]),
  ) as Record<string, SharedListItemStats>;

  for (const row of (data ?? []) as Array<{
    list_id: string;
    done: boolean;
    created_at: string | null;
    updated_at: string | null;
  }>) {
    const current = stats[row.list_id];
    if (!current) continue;

    current.total += 1;
    if (row.done) current.done += 1;

    const createdMs = row.created_at ? Date.parse(row.created_at) : 0;
    const updatedMs = row.updated_at ? Date.parse(row.updated_at) : 0;
    current.itemsActivityMs = Math.max(
      current.itemsActivityMs,
      Number.isFinite(createdMs) ? createdMs : 0,
      Number.isFinite(updatedMs) ? updatedMs : 0,
    );
  }

  return stats;
}

export async function createSharedListItem(
  listId: string,
  text: string,
  userId: string,
  position: number,
  options?: { skipEventLog?: boolean },
): Promise<SharedListItem> {
  const clean = text.trim();
  if (!clean) throw new Error("Missing text");

  const { data, error } = await supabase
    .from("shared_list_items")
    .insert({
      list_id: listId,
      text: clean,
      done: false,
      position,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, list_id, text, done, assigned_to_user_id, position, created_by, updated_by, created_at, updated_at")
    .single();

  if (error) throw error;
  if (!options?.skipEventLog) {
    void recordSharedListActivity(listId, data.id, "item_added", userId, {
      item_text: data.text,
    });
  }
  return data as SharedListItem;
}

export async function updateSharedListItem(
  itemId: string,
  updates: Partial<Pick<SharedListItem, "text" | "done" | "assigned_to_user_id" | "position">>,
  userId: string,
  options?: { skipEventLog?: boolean },
): Promise<void> {
  const shouldLogEvent =
    !options?.skipEventLog &&
    (typeof updates.text === "string" ||
      typeof updates.done === "boolean" ||
      "assigned_to_user_id" in updates);
  const previous = shouldLogEvent ? await fetchSharedListItemSnapshot(itemId) : null;
  const payload: Record<string, unknown> = { updated_by: userId };

  if (typeof updates.text === "string") payload.text = updates.text.trim();
  if (typeof updates.done === "boolean") payload.done = updates.done;
  if (typeof updates.position === "number") payload.position = updates.position;
  if ("assigned_to_user_id" in updates) payload.assigned_to_user_id = updates.assigned_to_user_id ?? null;

  const { error } = await supabase.from("shared_list_items").update(payload).eq("id", itemId);
  if (error) throw error;

  if (!previous) return;

  const nextText = typeof payload.text === "string" ? payload.text : previous.text;
  const nextAssignedToUserId =
    "assigned_to_user_id" in updates ? updates.assigned_to_user_id ?? null : previous.assigned_to_user_id;
  const eventTasks: Promise<void>[] = [];

  if (typeof updates.text === "string" && nextText !== previous.text) {
    eventTasks.push(
      recordSharedListActivity(previous.list_id, itemId, "item_renamed", userId, {
        item_text: nextText,
        previous_text: previous.text,
        next_text: nextText,
      }),
    );
  }

  if (typeof updates.done === "boolean" && updates.done !== previous.done) {
    eventTasks.push(
      recordSharedListActivity(
        previous.list_id,
        itemId,
        updates.done ? "item_completed" : "item_reopened",
        userId,
        { item_text: nextText, done: updates.done },
      ),
    );
  }

  if ("assigned_to_user_id" in updates && nextAssignedToUserId !== previous.assigned_to_user_id) {
    eventTasks.push(
      recordSharedListActivity(
        previous.list_id,
        itemId,
        nextAssignedToUserId ? "item_assigned" : "item_unassigned",
        userId,
        {
          item_text: nextText,
          assigned_to_user_id: nextAssignedToUserId,
          previous_assigned_to_user_id: previous.assigned_to_user_id,
        },
      ),
    );
  }

  if (eventTasks.length > 0) {
    await Promise.all(eventTasks);
  }
}

export async function deleteSharedListItem(
  itemId: string,
  options?: { actorUserId?: string; skipEventLog?: boolean },
): Promise<void> {
  const previous =
    !options?.skipEventLog && options?.actorUserId ? await fetchSharedListItemSnapshot(itemId) : null;
  const { error } = await supabase.from("shared_list_items").delete().eq("id", itemId);
  if (error) throw error;

  if (!previous || !options?.actorUserId || options.skipEventLog) return;

  void recordSharedListActivity(previous.list_id, previous.id, "item_deleted", options.actorUserId, {
    item_text: previous.text,
  });
}

export async function toggleSharedListNotifications(
  listId: string,
  userId: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("shared_list_members")
    .update({ notification_enabled: enabled, last_seen_at: new Date().toISOString() })
    .eq("list_id", listId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function fetchSharedListNotifications(
  userId: string,
  limit = 30,
): Promise<SharedListNotification[]> {
  const DUPLICATE_EVENT_WINDOW_MS = 8_000;
  const { data: memberships, error: membersErr } = await supabase
    .from("shared_list_members")
    .select("list_id, notification_enabled, last_seen_at, created_at")
    .eq("user_id", userId)
    .eq("notification_enabled", true);

  if (membersErr) throw membersErr;

  const membershipRows = (memberships ?? []) as Array<{
    list_id: string;
    notification_enabled: boolean;
    last_seen_at: string | null;
    created_at: string;
  }>;

  const listIds = membershipRows.map((row) => row.list_id);
  if (listIds.length === 0) return [];

  const membershipByList = new Map(membershipRows.map((row) => [row.list_id, row]));

  const { data: eventsRaw, error: eventsErr } = await supabase
    .from("shared_list_events")
    .select("id, list_id, item_id, event_type, actor_user_id, payload, created_at")
    .in("list_id", listIds)
    .neq("actor_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (eventsErr) throw eventsErr;

  const eventRows = (eventsRaw ?? []) as Array<{
    id: string;
    list_id: string;
    item_id: string | null;
    event_type: SharedListEventType;
    actor_user_id: string;
    payload: unknown;
    created_at: string;
  }>;

  if (eventRows.length === 0) return [];

  const { data: listsRaw, error: listsErr } = await supabase
    .from("shared_lists")
    .select("id, title")
    .in("id", listIds);

  if (listsErr) throw listsErr;

  const listTitleById = new Map(
    ((listsRaw ?? []) as Array<Record<string, unknown>>).map((row) => [
      ensure(row.id, ""),
      ensure(row.title, ""),
    ]),
  );

  const itemIds = Array.from(
    new Set(
      eventRows
        .map((row) => row.item_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );
  const itemTextById = new Map<string, string>();

  if (itemIds.length > 0) {
    const { data: itemsRaw, error: itemsErr } = await supabase
      .from("shared_list_items")
      .select("id, text")
      .in("id", itemIds);

    if (itemsErr) throw itemsErr;

    for (const row of (itemsRaw ?? []) as Array<Record<string, unknown>>) {
      const itemId = ensure(row.id, "");
      const itemText = ensureNullableString(row.text)?.trim();
      if (itemId && itemText) {
        itemTextById.set(itemId, itemText);
      }
    }
  }

  const normalizedEventRows = eventRows.map((row) => {
    const payload = normalizeSharedListEventPayload(row.payload);
    return {
      ...row,
      payload,
      fallback_item_text: row.item_id ? itemTextById.get(row.item_id)?.trim() ?? null : null,
    };
  });

  const dedupedEventRows = normalizedEventRows.reduce<{
    rows: Array<(typeof normalizedEventRows)[number]>;
    lastMsByFingerprint: Map<string, number>;
    lastMsByCoarseFingerprint: Map<string, number>;
  }>(
    (acc, row) => {
      const strictFingerprint = buildSharedListEventFingerprint(
        row,
        row.payload,
        row.fallback_item_text,
      );
      const coarseFingerprint = buildSharedListEventCoarseFingerprint(
        row,
        row.payload,
        row.fallback_item_text,
      );
      const createdAtMs = toMs(row.created_at);
      const strictPrevious = acc.lastMsByFingerprint.get(strictFingerprint);
      const coarsePrevious = acc.lastMsByCoarseFingerprint.get(coarseFingerprint);
      if (
        (strictPrevious !== undefined &&
          Math.abs(createdAtMs - strictPrevious) <= DUPLICATE_EVENT_WINDOW_MS) ||
        (coarsePrevious !== undefined &&
          Math.abs(createdAtMs - coarsePrevious) <= DUPLICATE_EVENT_WINDOW_MS)
      ) {
        return acc;
      }
      acc.lastMsByFingerprint.set(strictFingerprint, createdAtMs);
      acc.lastMsByCoarseFingerprint.set(coarseFingerprint, createdAtMs);
      acc.rows.push(row);
      return acc;
    },
    {
      rows: [],
      lastMsByFingerprint: new Map<string, number>(),
      lastMsByCoarseFingerprint: new Map<string, number>(),
    },
  ).rows;

  if (dedupedEventRows.length === 0) return [];

  const profileIds = new Set<string>();
  for (const eventRow of dedupedEventRows) {
    if (eventRow.actor_user_id) profileIds.add(eventRow.actor_user_id);
    const payload = eventRow.payload;
    if (payload.assigned_to_user_id) profileIds.add(payload.assigned_to_user_id);
    if (payload.previous_assigned_to_user_id) profileIds.add(payload.previous_assigned_to_user_id);
  }

  const profileMap = new Map<string, { avatar_url: string | null; display_name: string | null }>();
  if (profileIds.size > 0) {
    const { data: profilesRaw, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, avatar_url, display_name")
      .in("id", Array.from(profileIds));

    if (!profilesErr) {
      for (const row of (profilesRaw ?? []) as Array<{
        id: string;
        avatar_url: string | null;
        display_name: string | null;
      }>) {
        profileMap.set(row.id, {
          avatar_url: row.avatar_url ?? null,
          display_name: row.display_name ?? null,
        });
      }
    }
  }

  return dedupedEventRows.map((row) => {
    const payload = row.payload;
    const membership = membershipByList.get(row.list_id);
    const baselineMs = toMs(membership?.last_seen_at ?? membership?.created_at ?? null);
    const fallbackItemText = row.fallback_item_text;
    const assignedToDisplayName =
      payload.assigned_to_user_id ? profileMap.get(payload.assigned_to_user_id)?.display_name ?? null : null;
    const previousAssignedToDisplayName =
      payload.previous_assigned_to_user_id
        ? profileMap.get(payload.previous_assigned_to_user_id)?.display_name ?? null
        : null;

    return {
      id: row.id,
      list_id: row.list_id,
      item_id: row.item_id,
      event_type: row.event_type,
      actor_user_id: row.actor_user_id,
      actor_avatar_url: profileMap.get(row.actor_user_id)?.avatar_url ?? null,
      actor_display_name: profileMap.get(row.actor_user_id)?.display_name ?? null,
      payload: {
        ...payload,
        item_text: payload.item_text?.trim() || fallbackItemText || undefined,
        assigned_to_display_name: assignedToDisplayName,
        previous_assigned_to_display_name: previousAssignedToDisplayName,
      },
      created_at: row.created_at,
      list_title:
        listTitleById.get(row.list_id) ??
        payload.list_title ??
        payload.next_text ??
        "Shared list",
      unread: toMs(row.created_at) > baselineMs,
    } satisfies SharedListNotification;
  });
}

export async function markSharedListNotificationsSeen(
  userId: string,
  listIds?: string[],
): Promise<void> {
  const uniqueListIds = Array.from(new Set((listIds ?? []).filter(Boolean)));
  if (listIds && uniqueListIds.length === 0) return;

  let query = supabase
    .from("shared_list_members")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("notification_enabled", true);

  if (uniqueListIds.length > 0) {
    query = query.in("list_id", uniqueListIds);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function createSharedListInvite(
  listId: string,
  role: "editor" | "viewer" = "editor",
): Promise<{ token: string; expires_at: string }> {
  const { data, error } = await supabase.rpc("create_shared_list_invite", {
    p_list_id: listId,
    p_role: role,
    p_expires_in_hours: 24 * 7,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.token) throw new Error("Invalid invite response");

  return {
    token: String(row.token),
    expires_at: String(row.expires_at ?? new Date().toISOString()),
  };
}

export async function createSharedListInviteShare(
  listId: string,
  role: "editor" | "viewer" = "editor",
  lang: "es" | "en" | "de" = "es",
): Promise<{ token: string; expires_at: string; shareUrl: string; shareMessage: string }> {
  const { data, error } = await supabase.functions.invoke("create-shared-list-invite", {
    body: {
      listId,
      role,
      lang,
      expiresInHours: 24 * 7,
    },
  });

  if (!error && data?.token && data?.shareUrl && data?.shareMessage) {
    return {
      token: String(data.token),
      expires_at: String(data.expires_at ?? new Date().toISOString()),
      shareUrl: String(data.shareUrl),
      shareMessage: String(data.shareMessage),
    };
  }

  // Fallback when the edge function is unavailable or returns invalid data.
  const invite = await createSharedListInvite(listId, role);
  const [{ data: listRow }, { data: authRow }] = await Promise.all([
    supabase.from("shared_lists").select("title").eq("id", listId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const senderName =
    String(
      authRow.user?.user_metadata?.username ??
      authRow.user?.user_metadata?.user_name ??
      authRow.user?.user_metadata?.display_name ??
      authRow.user?.user_metadata?.full_name ??
      authRow.user?.user_metadata?.name ??
      (lang === "en" ? "Someone" : lang === "de" ? "Jemand" : "Alguien"),
    ).trim() || (lang === "en" ? "Someone" : lang === "de" ? "Jemand" : "Alguien");
  const sharedListLabel =
    lang === "en" ? "Shared list" : lang === "de" ? "Geteilte Liste" : "Lista compartida";
  const listTitle = ensure((listRow as Record<string, unknown> | null)?.title, "Shared list");

  const origin = typeof window !== "undefined" ? window.location.origin.replace(/\/+$/, "") : "";
  const shareUrl = `${origin}/lists/invite/${encodeURIComponent(invite.token)}`;
  const shareMessage = `${senderName}:\n${sharedListLabel}: ${listTitle}\nRemi -> ${shareUrl}`;

  return {
    token: invite.token,
    expires_at: invite.expires_at,
    shareUrl,
    shareMessage,
  };
}

async function getSharedListInviteFallback(
  token: string,
): Promise<SharedListInvitePublic> {
  const { data: inviteRowRaw, error: inviteErr } = await supabase
    .from("shared_list_invites")
    .select("list_id, created_by, role, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (inviteErr) throw inviteErr;
  if (!inviteRowRaw) throw new Error("Shared list invite not found");

  const inviteRow = inviteRowRaw as Record<string, unknown>;
  const listId = ensure(inviteRow.list_id, "");
  const createdBy = ensureNullableString(inviteRow.created_by);
  const expiresAt = ensureNullableString(inviteRow.expires_at);
  const role = inviteRow.role === "viewer" ? "viewer" : "editor";

  const [{ data: listRowRaw, error: listErr }, { data: itemsRaw }, { data: profileRaw }] =
    await Promise.all([
      supabase
        .from("shared_lists")
        .select("title, icon_emoji")
        .eq("id", listId)
        .maybeSingle(),
      supabase
        .from("shared_list_items")
        .select("text")
        .eq("list_id", listId)
        .order("position", { ascending: true })
        .limit(5),
      createdBy
        ? supabase.from("profiles").select("display_name").eq("id", createdBy).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (listErr) throw listErr;

  return {
    status: normalizeSharedListInviteStatus(inviteRow.status, expiresAt),
    senderDisplayName: ensureNullableString((profileRaw as Record<string, unknown> | null)?.display_name),
    listTitle: ensure((listRowRaw as Record<string, unknown> | null)?.title, "Shared list"),
    listIconEmoji: ensureNullableString((listRowRaw as Record<string, unknown> | null)?.icon_emoji),
    role,
    expiresAt,
    previewItems: ((itemsRaw ?? []) as Array<Record<string, unknown>>)
      .map((row) => ensureNullableString(row.text)?.trim() ?? "")
      .filter(Boolean),
  };
}

export async function getSharedListInvite(
  token: string,
): Promise<SharedListInvitePublic> {
  const normalizedToken = normalizeInviteToken(token);
  if (!normalizedToken) throw new Error("Missing token");

  const { data, error } = await invokeFunctionWithTimeout<Record<string, unknown>>(
    "get-shared-list-invite",
    { token: normalizedToken },
  );

  if (!error && data?.listTitle) {
    return {
      status: normalizeSharedListInviteStatus(data.status, data.expiresAt ?? null),
      senderDisplayName: ensureNullableString(data.senderDisplayName),
      listTitle: ensure(data.listTitle, "Shared list"),
      listIconEmoji: ensureNullableString(data.listIconEmoji),
      role: data.role === "viewer" ? "viewer" : "editor",
      expiresAt: ensureNullableString(data.expiresAt),
      previewItems: Array.isArray(data.previewItems)
        ? data.previewItems
            .map((value: unknown) => ensureNullableString(value)?.trim() ?? "")
            .filter(Boolean)
        : [],
    };
  }

  const fallback = await getSharedListInviteFallback(normalizedToken).catch(() => null);
  if (fallback) return fallback;

  if (error) {
    throw new Error(error.message || "get-shared-list-invite failed");
  }

  throw new Error("get-shared-list-invite returned invalid response");
}

export async function acceptSharedListInvite(token: string): Promise<string> {
  const normalizedToken = normalizeInviteToken(token);
  if (!normalizedToken) throw new Error("Missing token");

  const { data, error } = await supabase.rpc("accept_shared_list_invite", {
    p_token: normalizedToken,
  });

  if (error) throw error;
  if (!data) throw new Error("Invite was not accepted");
  return String(data);
}

export function subscribeToSharedList(listId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`shared-list-${listId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_list_items", filter: `list_id=eq.${listId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_list_members", filter: `list_id=eq.${listId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_lists", filter: `id=eq.${listId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToSharedListNotifications(
  listIds: string[],
  onChange: () => void,
): () => void {
  const uniqueListIds = Array.from(new Set(listIds.filter(Boolean)));
  if (uniqueListIds.length === 0) return () => {};

  let channel = supabase.channel(`shared-list-notifications-${uniqueListIds.join("-")}`);

  for (const listId of uniqueListIds) {
    channel = channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "shared_list_events", filter: `list_id=eq.${listId}` },
      onChange,
    );
  }

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
