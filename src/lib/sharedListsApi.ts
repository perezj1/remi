import { supabase } from "@/integrations/supabase/client";

export type SharedListRole = "owner" | "editor" | "viewer";

export type SharedList = {
  id: string;
  title: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
  my_role: SharedListRole;
  my_notification_enabled: boolean;
  members_count: number;
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

function ensure(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
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
    .select("id, title, owner_user_id, created_at, updated_at")
    .in("id", listIds)
    .order("updated_at", { ascending: false });

  if (listErr) throw listErr;

  const { data: countsRaw, error: countErr } = await supabase
    .from("shared_list_members")
    .select("list_id")
    .in("list_id", listIds);

  if (countErr) throw countErr;

  const countMap = new Map<string, number>();
  for (const row of (countsRaw ?? []) as Array<{ list_id: string }>) {
    countMap.set(row.list_id, (countMap.get(row.list_id) ?? 0) + 1);
  }

  return ((listsRaw ?? []) as Array<Record<string, unknown>>)
    .map((row) => {
      const id = ensure(row.id, "");
      const member = membershipByList.get(id);
      if (!member) return null;

      return {
        id,
        title: ensure(row.title, ""),
        owner_user_id: ensure(row.owner_user_id, ""),
        created_at: ensure(row.created_at, new Date().toISOString()),
        updated_at: ensure(row.updated_at, new Date().toISOString()),
        my_role: member.role,
        my_notification_enabled: !!member.notification_enabled,
        members_count: countMap.get(id) ?? 1,
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

  return {
    id: ensure(row.id, ""),
    title: ensure(row.title, clean),
    owner_user_id: ownerUserId,
    created_at: ensure(row.created_at, new Date().toISOString()),
    updated_at: ensure(row.updated_at, new Date().toISOString()),
    my_role: "owner",
    my_notification_enabled: true,
    members_count: 1,
  };
}

export async function updateSharedListTitle(listId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("shared_lists")
    .update({ title: title.trim() })
    .eq("id", listId);
  if (error) throw error;
}

export async function deleteSharedList(listId: string): Promise<void> {
  const { error } = await supabase.from("shared_lists").delete().eq("id", listId);
  if (error) throw error;
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

export async function createSharedListItem(
  listId: string,
  text: string,
  userId: string,
  position: number,
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
  return data as SharedListItem;
}

export async function updateSharedListItem(
  itemId: string,
  updates: Partial<Pick<SharedListItem, "text" | "done" | "assigned_to_user_id" | "position">>,
  userId: string,
): Promise<void> {
  const payload: Record<string, unknown> = { updated_by: userId };

  if (typeof updates.text === "string") payload.text = updates.text.trim();
  if (typeof updates.done === "boolean") payload.done = updates.done;
  if (typeof updates.position === "number") payload.position = updates.position;
  if ("assigned_to_user_id" in updates) payload.assigned_to_user_id = updates.assigned_to_user_id ?? null;

  const { error } = await supabase.from("shared_list_items").update(payload).eq("id", itemId);
  if (error) throw error;
}

export async function deleteSharedListItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("shared_list_items").delete().eq("id", itemId);
  if (error) throw error;
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

export async function acceptSharedListInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc("accept_shared_list_invite", {
    p_token: token,
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
