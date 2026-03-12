// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-events-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const APP_ORIGIN = (Deno.env.get("APP_ORIGIN") ?? "https://example.com").replace(/\/+$/, "");
const EVENTS_SECRET = Deno.env.get("EVENTS_SECRET") ?? "";
const SOCIAL_PUSH_MAX_SUBSCRIPTIONS_PER_USER = Math.max(
  1,
  Number(Deno.env.get("SOCIAL_PUSH_MAX_SUBSCRIPTIONS_PER_USER") ?? "1"),
);
const SOCIAL_PUSH_RECENT_WINDOW_MS = 10_000;
const ITEM_ADDED_GRACE_MS = 1_200;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY");
}

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type JsonRecord = Record<string, unknown>;
type SupportedLang = "es" | "en" | "de";
type ProfileInfo = {
  display_name: string | null;
  avatar_url: string | null;
  language: SupportedLang;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeLang(value: unknown): SupportedLang {
  const raw = asString(value).trim().toLowerCase();
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("de")) return "de";
  return "es";
}

function defaultUserName(lang: SupportedLang) {
  if (lang === "en") return "User";
  if (lang === "de") return "Benutzer";
  return "Usuario";
}

function itemFallbackLabel(lang: SupportedLang) {
  if (lang === "en") return "this item";
  if (lang === "de") return "dieses Element";
  return "este elemento";
}

function unknownItemLabel(lang: SupportedLang) {
  if (lang === "en") return "an item";
  if (lang === "de") return "ein Element";
  return "un elemento";
}

function listFallbackLabel(lang: SupportedLang) {
  if (lang === "en") return "this list";
  if (lang === "de") return "diese Liste";
  return "esta lista";
}

function sharedItemFallbackLabel(lang: SupportedLang) {
  if (lang === "en") return "this item";
  if (lang === "de") return "dieses Element";
  return "este elemento";
}

function normalizePayload(value: unknown): JsonRecord {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return asRecord(parsed) ?? {};
    } catch {
      return {};
    }
  }
  return asRecord(value) ?? {};
}

function normalizeInviteType(value: unknown): "task" | "idea" | null {
  return value === "task" || value === "idea" ? value : null;
}

function normalizeInviteStatus(value: unknown): "pending" | "accepted" | "rejected" | "expired" {
  switch (value) {
    case "accepted":
    case "rejected":
    case "expired":
      return value;
    default:
      return "pending";
  }
}

function normalizeListAction(action: unknown): string | null {
  switch (action) {
    case "item_added":
    case "item_deleted":
    case "item_assigned":
    case "item_unassigned":
    case "item_completed":
    case "item_reopened":
    case "item_renamed":
    case "list_renamed":
    case "member_joined":
      return action;
    default:
      return null;
  }
}

function resolveListAction(eventType: string, payload: JsonRecord): string {
  const payloadAction = normalizeListAction(payload.action);
  if (payloadAction) return payloadAction;
  if (eventType === "item_deleted") return "item_deleted";
  if (eventType === "item_done_toggled") {
    return payload.done === false ? "item_reopened" : "item_completed";
  }
  if (eventType === "member_joined") return "member_joined";
  return "item_added";
}

function resolveShareInviteKind(
  eventType: string,
  status: "pending" | "accepted" | "rejected" | "expired",
  expiresAt: string | null,
): "share_sent" | "share_accepted" | "share_rejected" | "share_expired" | null {
  if (status === "accepted") return "share_accepted";
  if (status === "rejected") return "share_rejected";
  if (status === "expired") return "share_expired";

  const expiresMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;
  if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
    return "share_expired";
  }

  return null;
}

function pickFirstString(row: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const v = asNullableString(row[key]);
    if (v && v.trim()) return v.trim();
  }
  return null;
}

function pickNestedString(value: unknown, keys: string[]): string | null {
  const row = asRecord(value);
  if (!row) return null;
  return pickFirstString(row, keys);
}

function looksLikeUserId(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function looksLikeHumanName(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (looksLikeUserId(trimmed)) return false;
  if (trimmed.length > 120) return false;
  return true;
}

function pickGenericActorUserId(row: JsonRecord, payload: JsonRecord, excludeIds: string[]): string | null {
  const excluded = new Set(excludeIds.filter(Boolean));
  const ignoredKeys = new Set([
    "id",
    "sender_user_id",
    "sender_id",
    "brain_item_id",
    "new_brain_item_id",
    "received_item_id",
    "accepted_item_id",
    "new_item_id",
    "copied_brain_item_id",
    "token",
  ]);

  for (const source of [row, payload]) {
    for (const [key, rawValue] of Object.entries(source)) {
      const keyLower = key.toLowerCase();
      if (ignoredKeys.has(keyLower)) continue;
      if (!keyLower.includes("user") && !keyLower.endsWith("_id") && !keyLower.endsWith("_by")) {
        continue;
      }

      const candidate = asNullableString(rawValue)?.trim();
      if (looksLikeUserId(candidate) && !excluded.has(candidate!)) {
        return candidate!;
      }

      const nestedCandidate = pickNestedString(rawValue, ["user_id", "id"]);
      if (looksLikeUserId(nestedCandidate) && !excluded.has(nestedCandidate!)) {
        return nestedCandidate!;
      }
    }
  }

  return null;
}

function pickGenericActorDisplayName(
  row: JsonRecord,
  payload: JsonRecord,
  ignoredValues: string[],
): string | null {
  const ignored = new Set(ignoredValues.filter(Boolean).map((value) => value.trim().toLocaleLowerCase()));
  const ignoredKeys = new Set([
    "sender_display_name",
    "sender_name",
    "title",
    "item_title",
    "list_title",
  ]);

  for (const source of [row, payload]) {
    for (const [key, rawValue] of Object.entries(source)) {
      const keyLower = key.toLowerCase();
      if (ignoredKeys.has(keyLower)) continue;
      if (
        !keyLower.includes("display_name") &&
        !keyLower.includes("username") &&
        !keyLower.endsWith("_name") &&
        !keyLower.endsWith("_display")
      ) {
        continue;
      }

      const candidate = asNullableString(rawValue)?.trim();
      if (looksLikeHumanName(candidate) && !ignored.has(candidate!.toLocaleLowerCase())) {
        return candidate!;
      }

      const nestedCandidate = pickNestedString(rawValue, ["display_name", "name", "username"]);
      if (
        looksLikeHumanName(nestedCandidate) &&
        !ignored.has(nestedCandidate!.trim().toLocaleLowerCase())
      ) {
        return nestedCandidate!;
      }
    }
  }

  return null;
}

function pickInviteCreatedItemId(row: JsonRecord, payload: JsonRecord): string | null {
  const keys = [
    "new_brain_item_id",
    "received_item_id",
    "accepted_item_id",
    "new_item_id",
    "copied_brain_item_id",
  ];
  return pickFirstString(row, keys) ?? pickFirstString(payload, keys);
}

function pickInviteActorUserId(row: JsonRecord, payload: JsonRecord, eventKind: "accepted" | "rejected"): string | null {
  const keys = eventKind === "accepted"
    ? [
      "accepted_by",
      "accepted_user_id",
      "accepted_by_user_id",
      "recipient_user_id",
      "recipient_id",
      "receiver_user_id",
      "receiver_id",
      "target_user_id",
      "target_id",
      "user_id",
    ]
    : [
      "rejected_by",
      "rejected_user_id",
      "rejected_by_user_id",
      "recipient_user_id",
      "recipient_id",
      "receiver_user_id",
      "receiver_id",
      "target_user_id",
      "target_id",
      "user_id",
    ];

  const direct = pickFirstString(row, keys) ?? pickFirstString(payload, keys);
  if (direct) return direct;

  const keyword = eventKind === "accepted" ? "accept" : "reject";
  for (const source of [row, payload]) {
    for (const [key, value] of Object.entries(source)) {
      const lower = key.toLowerCase();
      if (!lower.includes(keyword)) continue;
      const nested = pickNestedString(value, ["user_id", "id", "accepted_by", "rejected_by"]);
      if (nested && nested.length >= 10) return nested;
      const text = asNullableString(value)?.trim();
      if (text && text.length >= 10 && (lower.includes("id") || lower.includes("user"))) {
        return text;
      }
    }
  }
  return pickGenericActorUserId(row, payload, [
    pickFirstString(row, ["sender_user_id", "sender_id"]) ?? "",
  ]);
}

function pickInviteActorDisplayName(row: JsonRecord, payload: JsonRecord, eventKind: "accepted" | "rejected"): string | null {
  const keys = eventKind === "accepted"
    ? [
      "accepted_by_display_name",
      "accepted_display_name",
      "recipient_display_name",
      "recipient_name",
      "receiver_display_name",
      "receiver_name",
      "target_display_name",
      "target_name",
    ]
    : [
      "rejected_by_display_name",
      "rejected_display_name",
      "recipient_display_name",
      "recipient_name",
      "receiver_display_name",
      "receiver_name",
      "target_display_name",
      "target_name",
    ];

  const direct = pickFirstString(row, keys) ?? pickFirstString(payload, keys);
  if (direct) return direct;

  const keyword = eventKind === "accepted" ? "accept" : "reject";
  for (const source of [row, payload]) {
    for (const [key, value] of Object.entries(source)) {
      const lower = key.toLowerCase();
      if (!lower.includes(keyword)) continue;
      const nested = pickNestedString(value, ["display_name", "name", "username"]);
      if (nested && nested.trim()) return nested.trim();
      const text = asNullableString(value)?.trim();
      if (text && (lower.includes("name") || lower.includes("display"))) {
        return text;
      }
    }
  }
  return pickGenericActorDisplayName(row, payload, [
    pickFirstString(row, ["sender_display_name", "sender_name"]) ?? "",
    asNullableString(payload.title) ?? "",
    asNullableString(payload.item_title) ?? "",
  ]);
}

async function getProfileMap(userIds: string[]) {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) {
    return new Map<string, ProfileInfo>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, language")
    .in("id", unique);

  if (error) {
    console.error("profiles query error", error);
    return new Map<string, ProfileInfo>();
  }

  const map = new Map<string, ProfileInfo>();
  for (const row of (data ?? []) as Array<{
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    language: string | null;
  }>) {
    map.set(row.id, {
      display_name: row.display_name ?? null,
      avatar_url: row.avatar_url ?? null,
      language: normalizeLang(row.language),
    });
  }
  return map;
}

async function getBrainItemLookupMap(itemIds: string[]) {
  const unique = Array.from(new Set(itemIds.filter(Boolean)));
  const map = new Map<string, { user_id: string; title: string | null; type: "task" | "idea" | null }>();
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("brain_items")
    .select("id, user_id, title, type")
    .in("id", unique);

  if (error) {
    console.error("brain_items query error", error);
    return map;
  }

  for (const row of (data ?? []) as Array<{
    id: string;
    user_id: string;
    title: string | null;
    type: "task" | "idea" | null;
  }>) {
    map.set(row.id, {
      user_id: row.user_id,
      title: row.title ?? null,
      type: row.type ?? null,
    });
  }

  return map;
}

async function getSharedListTitle(listId: string): Promise<string | null> {
  if (!listId) return null;
  const { data, error } = await supabase
    .from("shared_lists")
    .select("title")
    .eq("id", listId)
    .maybeSingle();
  if (error) {
    console.error("shared_lists query error", error);
    return null;
  }
  return asNullableString((data as JsonRecord | null)?.title);
}

async function getSharedItemText(itemId: string): Promise<string | null> {
  if (!itemId) return null;
  const { data, error } = await supabase
    .from("shared_list_items")
    .select("text")
    .eq("id", itemId)
    .maybeSingle();
  if (error) {
    console.error("shared_list_items query error", error);
    return null;
  }
  const text = asNullableString((data as JsonRecord | null)?.text);
  return text?.trim() || null;
}

async function getSharedItemTextFromEventHistory(
  listId: string,
  itemId: string,
  currentEventId: string,
): Promise<string | null> {
  if (!listId || !itemId) return null;

  const { data, error } = await supabase
    .from("shared_list_events")
    .select("id, payload, created_at")
    .eq("list_id", listId)
    .eq("item_id", itemId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("shared_list_events item text history lookup error", { listId, itemId }, error);
    return null;
  }

  for (const row of (data ?? []) as Array<{ id: string; payload: unknown }>) {
    if (row.id === currentEventId) continue;
    const payload = normalizePayload(row.payload);
    const text =
      asNullableString(payload.item_text)?.trim() ||
      asNullableString(payload.next_text)?.trim() ||
      asNullableString(payload.previous_text)?.trim();
    if (text) return text;
  }

  return null;
}

async function getListRecipients(listId: string, actorUserId: string): Promise<string[]> {
  if (!listId) return [];
  const { data, error } = await supabase
    .from("shared_list_members")
    .select("user_id, notification_enabled")
    .eq("list_id", listId);

  if (error) {
    console.error("shared_list_members query error", error);
    return [];
  }

  const users = new Set<string>();
  for (const row of (data ?? []) as Array<{ user_id: string; notification_enabled?: boolean | null }>) {
    if (!row.user_id || row.user_id === actorUserId) continue;
    if (row.notification_enabled === false) continue;
    users.add(row.user_id);
  }
  return Array.from(users);
}

async function reserveSocialPushSend(userId: string, dedupeKey: string): Promise<boolean> {
  const type = `SOCIAL_PUSH:${dedupeKey}`;
  const { error } = await supabase.from("remi_notifications_log").insert({
    user_id: userId,
    brain_item_id: null,
    type,
  });

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return false;
    }
    console.error("remi_notifications_log reserve error", userId, dedupeKey, error);
    return false;
  }

  return true;
}

async function releaseSocialPushReservation(userId: string, dedupeKey: string) {
  const type = `SOCIAL_PUSH:${dedupeKey}`;
  const { error } = await supabase
    .from("remi_notifications_log")
    .delete()
    .eq("user_id", userId)
    .eq("type", type);

  if (error) {
    console.error("remi_notifications_log release error", userId, dedupeKey, error);
  }
}

function normalizeSignaturePart(value: string | null | undefined): string {
  return String(value ?? "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function hasRecentSocialPushSignature(
  userId: string,
  signature: string,
  windowMs = SOCIAL_PUSH_RECENT_WINDOW_MS,
): Promise<boolean> {
  const sinceIso = new Date(Date.now() - windowMs).toISOString();
  const { data, error } = await supabase
    .from("remi_notifications_log")
    .select("id")
    .eq("user_id", userId)
    .eq("type", `SOCIAL_RECENT:${signature}`)
    .gte("created_at", sinceIso)
    .limit(1);

  if (error) {
    console.error("remi_notifications_log recent lookup error", userId, signature, error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

async function logRecentSocialPushSignature(userId: string, signature: string) {
  const { error } = await supabase.from("remi_notifications_log").insert({
    user_id: userId,
    brain_item_id: null,
    type: `SOCIAL_RECENT:${signature}`,
  });

  if (error) {
    console.error("remi_notifications_log recent insert error", userId, signature, error);
  }
}

function buildListRecentSignature(args: {
  recipientUserId: string;
  actorUserId: string;
  listId: string;
  itemId: string | null;
  action: string;
  itemText: string;
  assignedToUserId?: string | null;
}): string {
  return [
    "list",
    args.recipientUserId,
    args.actorUserId,
    args.listId,
    args.itemId ?? "",
    args.action,
    normalizeSignaturePart(args.itemText),
    args.assignedToUserId ?? "",
  ].join("|");
}

function buildShareRecentSignature(args: {
  senderUserId: string;
  inviteId: string;
  kind: string;
  actorUserId?: string | null;
  itemType?: string | null;
  itemTitle: string;
}): string {
  return [
    "share",
    args.senderUserId,
    args.inviteId,
    args.kind,
    args.actorUserId ?? "",
    args.itemType ?? "",
    normalizeSignaturePart(args.itemTitle),
  ].join("|");
}

async function shouldSkipGenericItemAdded(args: {
  eventId: string;
  createdAt: string | null;
  listId: string;
  itemId: string | null;
  actorUserId: string;
  action: string;
}): Promise<boolean> {
  if (args.action !== "item_added" || !args.itemId) return false;

  await new Promise((resolve) => setTimeout(resolve, ITEM_ADDED_GRACE_MS));

  const createdAtMs = args.createdAt ? Date.parse(args.createdAt) : Number.NaN;
  const sinceIso = Number.isFinite(createdAtMs)
    ? new Date(createdAtMs - SOCIAL_PUSH_RECENT_WINDOW_MS).toISOString()
    : new Date(Date.now() - SOCIAL_PUSH_RECENT_WINDOW_MS).toISOString();

  const { data, error } = await supabase
    .from("shared_list_events")
    .select("id, event_type, payload")
    .eq("list_id", args.listId)
    .eq("item_id", args.itemId)
    .eq("actor_user_id", args.actorUserId)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("shared_list_events generic suppression lookup error", args, error);
    return false;
  }

  return (data ?? []).some((row: any) => {
    if (String(row?.id ?? "") === args.eventId) return false;
    const candidateAction = resolveListAction(
      asString(row?.event_type),
      normalizePayload(row?.payload),
    );
    return candidateAction !== "item_added";
  });
}

async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    url: string;
    tag: string;
    icon?: string;
    badge?: string;
    image?: string;
  },
) {
  const { data, error } = await supabase
    .from("remi_push_subscriptions")
    .select("endpoint, p256dh, auth, status, created_at")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("remi_push_subscriptions query error", userId, error);
    return false;
  }

  const rows = (data ?? []) as Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
    status: string;
    created_at: string | null;
  }>;

  if (rows.length === 0) return false;

  const uniqueByEndpoint: Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
    status: string;
    created_at: string | null;
  }> = [];
  const seenEndpoints = new Set<string>();
  for (const row of rows) {
    const endpointKey = row.endpoint?.trim();
    if (!endpointKey || seenEndpoints.has(endpointKey)) continue;
    seenEndpoints.add(endpointKey);
    uniqueByEndpoint.push(row);
    if (uniqueByEndpoint.length >= SOCIAL_PUSH_MAX_SUBSCRIPTIONS_PER_USER) break;
  }

  if (uniqueByEndpoint.length === 0) return false;

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    tag: payload.tag,
    icon: payload.icon,
    badge: payload.badge,
    image: payload.image,
  });

  let delivered = false;

  for (const row of uniqueByEndpoint) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        jsonPayload,
      );
      delivered = true;
    } catch (error) {
      const statusCode = (error as any)?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase
          .from("remi_push_subscriptions")
          .update({ status: "INACTIVE" })
          .eq("user_id", userId)
          .eq("endpoint", row.endpoint);
        continue;
      }
      console.error("webpush send error", userId, error);
    }
  }

  return delivered;
}

function buildListMessage(lang: SupportedLang, args: {
  action: string;
  actor: string;
  item: string;
  list: string;
  hasConcreteItem: boolean;
  previousText?: string | null;
  nextText?: string | null;
  assignedToDisplayName?: string | null;
  assignedToUserId?: string | null;
  actorUserId?: string | null;
}): string {
  const {
    action,
    actor,
    item,
    list,
    hasConcreteItem,
    previousText,
    nextText,
    assignedToDisplayName,
    assignedToUserId,
    actorUserId,
  } = args;

  const fallbackItem = itemFallbackLabel(lang);
  const fallbackUnknown = unknownItemLabel(lang);
  const fallbackList = listFallbackLabel(lang);
  const finalItem = item || fallbackItem;
  const finalList = list || fallbackList;

  if (lang === "en") {
    switch (action) {
      case "item_added":
        return `${actor} added "${finalItem}" to the list "${finalList}".`;
      case "item_deleted":
        return hasConcreteItem
          ? `${actor} deleted "${finalItem}" from the list "${finalList}".`
          : `${actor} deleted ${fallbackUnknown} from the list "${finalList}".`;
      case "item_assigned": {
        const assignee = assignedToDisplayName?.trim() || assignedToUserId?.slice(0, 8) || "";
        if (assignedToUserId && actorUserId && assignedToUserId === actorUserId) {
          return `${actor} assigned "${finalItem}" to themselves in the list "${finalList}".`;
        }
        if (assignee) {
          return `${actor} assigned "${finalItem}" to ${assignee} in the list "${finalList}".`;
        }
        return `${actor} assigned "${finalItem}" in the list "${finalList}".`;
      }
      case "item_unassigned":
        return `${actor} removed the assignment from "${finalItem}" in the list "${finalList}".`;
      case "item_completed":
        return `${actor} marked "${finalItem}" as done in the list "${finalList}".`;
      case "item_reopened":
        return `${actor} reopened "${finalItem}" in the list "${finalList}".`;
      case "item_renamed": {
        const previous = previousText?.trim() || fallbackItem;
        const next = nextText?.trim() || finalItem;
        return `${actor} renamed "${previous}" to "${next}" in the list "${finalList}".`;
      }
      case "list_renamed": {
        const previous = previousText?.trim() || fallbackList;
        const next = nextText?.trim() || finalList;
        return `${actor} renamed the list "${previous}" to "${next}".`;
      }
      case "member_joined":
        return `${actor} accepted the list "${finalList}".`;
      default:
        return `${actor} added "${finalItem}" to the list "${finalList}".`;
    }
  }

  if (lang === "de") {
    switch (action) {
      case "item_added":
        return `${actor} hat "${finalItem}" zur Liste "${finalList}" hinzugefügt.`;
      case "item_deleted":
        return hasConcreteItem
          ? `${actor} hat "${finalItem}" aus der Liste "${finalList}" gelöscht.`
          : `${actor} hat ${fallbackUnknown} aus der Liste "${finalList}" gelöscht.`;
      case "item_assigned": {
        const assignee = assignedToDisplayName?.trim() || assignedToUserId?.slice(0, 8) || "";
        if (assignedToUserId && actorUserId && assignedToUserId === actorUserId) {
          return `${actor} hat sich "${finalItem}" in der Liste "${finalList}" selbst zugewiesen.`;
        }
        if (assignee) {
          return `${actor} hat "${finalItem}" in der Liste "${finalList}" an ${assignee} zugewiesen.`;
        }
        return `${actor} hat "${finalItem}" in der Liste "${finalList}" zugewiesen.`;
      }
      case "item_unassigned":
        return `${actor} hat die Zuweisung von "${finalItem}" in der Liste "${finalList}" entfernt.`;
      case "item_completed":
        return `${actor} hat "${finalItem}" in der Liste "${finalList}" als erledigt markiert.`;
      case "item_reopened":
        return `${actor} hat "${finalItem}" in der Liste "${finalList}" wieder aktiviert.`;
      case "item_renamed": {
        const previous = previousText?.trim() || fallbackItem;
        const next = nextText?.trim() || finalItem;
        return `${actor} hat "${previous}" in der Liste "${finalList}" in "${next}" umbenannt.`;
      }
      case "list_renamed": {
        const previous = previousText?.trim() || fallbackList;
        const next = nextText?.trim() || finalList;
        return `${actor} hat die Liste "${previous}" in "${next}" umbenannt.`;
      }
      case "member_joined":
        return `${actor} hat die Liste "${finalList}" angenommen.`;
      default:
        return `${actor} hat "${finalItem}" zur Liste "${finalList}" hinzugefügt.`;
    }
  }

  switch (action) {
    case "item_added":
      return `${actor} agregó "${finalItem}" a la lista "${finalList}".`;
    case "item_deleted":
      return hasConcreteItem
        ? `${actor} eliminó "${finalItem}" de la lista "${finalList}".`
        : `${actor} eliminó ${fallbackUnknown} de la lista "${finalList}".`;
    case "item_assigned": {
      const assignee = assignedToDisplayName?.trim() || assignedToUserId?.slice(0, 8) || "";
      if (assignedToUserId && actorUserId && assignedToUserId === actorUserId) {
        return `${actor} se asignó "${finalItem}" de la lista "${finalList}".`;
      }
      if (assignee) {
        return `${actor} asignó "${finalItem}" a ${assignee} en la lista "${finalList}".`;
      }
      return `${actor} asignó "${finalItem}" en la lista "${finalList}".`;
    }
    case "item_unassigned":
      return `${actor} quitó la asignación de "${finalItem}" en la lista "${finalList}".`;
    case "item_completed":
      return `${actor} marcó "${finalItem}" como hecho en la lista "${finalList}".`;
    case "item_reopened":
      return `${actor} volvió a activar "${finalItem}" en la lista "${finalList}".`;
    case "item_renamed": {
      const previous = previousText?.trim() || fallbackItem;
      const next = nextText?.trim() || finalItem;
      return `${actor} renombró "${previous}" a "${next}" en la lista "${finalList}".`;
    }
    case "list_renamed": {
      const previous = previousText?.trim() || fallbackList;
      const next = nextText?.trim() || finalList;
      return `${actor} renombró la lista "${previous}" a "${next}".`;
    }
    case "member_joined":
      return `${actor} aceptó la lista "${finalList}".`;
    default:
      return `${actor} agregó "${finalItem}" a la lista "${finalList}".`;
  }
}

function buildShareInviteMessage(lang: SupportedLang, args: {
  kind: "share_accepted" | "share_rejected" | "share_expired";
  itemType: "task" | "idea" | null;
  itemTitle: string;
  actorDisplayName?: string | null;
  actorUserId?: string | null;
}): string {
  const { kind, itemType, itemTitle, actorDisplayName, actorUserId } = args;
  const item = itemTitle || sharedItemFallbackLabel(lang);
  const actor = actorDisplayName?.trim() || actorUserId?.slice(0, 8) || defaultUserName(lang);
  const isIdea = itemType === "idea";

  if (lang === "en") {
    switch (kind) {
      case "share_accepted":
        return isIdea
          ? `${actor} accepted the note "${item}".`
          : `${actor} accepted the reminder "${item}".`;
      case "share_rejected":
        return isIdea
          ? `${actor} rejected the shared note "${item}".`
          : `${actor} rejected the shared reminder "${item}".`;
      case "share_expired":
      default:
        return isIdea
          ? `The shared note "${item}" expired.`
          : `The shared reminder "${item}" expired.`;
    }
  }

  if (lang === "de") {
    switch (kind) {
      case "share_accepted":
        return isIdea
          ? `${actor} hat die Notiz "${item}" angenommen.`
          : `${actor} hat die Erinnerung "${item}" angenommen.`;
      case "share_rejected":
        return isIdea
          ? `${actor} hat die geteilte Notiz "${item}" abgelehnt.`
          : `${actor} hat die geteilte Erinnerung "${item}" abgelehnt.`;
      case "share_expired":
      default:
        return isIdea
          ? `Die geteilte Notiz "${item}" ist abgelaufen.`
          : `Die geteilte Erinnerung "${item}" ist abgelaufen.`;
    }
  }

  switch (kind) {
    case "share_accepted":
      return isIdea
        ? `${actor} aceptó la nota "${item}".`
        : `${actor} aceptó el recordatorio "${item}".`;
    case "share_rejected":
      return isIdea
        ? `${actor} rechazó la nota compartida "${item}".`
        : `${actor} rechazó el recordatorio compartido "${item}".`;
    case "share_expired":
    default:
      return isIdea
        ? `La nota compartida "${item}" expiró.`
        : `El recordatorio compartido "${item}" expiró.`;
  }
}

function buildShareInviteTitle(lang: SupportedLang, itemType: "task" | "idea" | null) {
  if (lang === "en") {
    return itemType === "idea" ? "Shared note" : "Shared reminder";
  }
  if (lang === "de") {
    return itemType === "idea" ? "Geteilte Notiz" : "Geteilte Erinnerung";
  }
  return itemType === "idea" ? "Nota compartida" : "Recordatorio compartido";
}

function hasValidEventSecret(req: Request): boolean {
  if (!EVENTS_SECRET) return true;
  const secretHeader = req.headers.get("x-events-secret")?.trim();
  if (secretHeader && secretHeader === EVENTS_SECRET) return true;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return !!(bearer && bearer === EVENTS_SECRET);
}

async function processSharedListEvent(record: JsonRecord) {
  const eventId = asString(record.id) || crypto.randomUUID();
  const createdAt = asNullableString(record.created_at);
  const listId = asString(record.list_id);
  const itemId = asString(record.item_id);
  const eventType = asString(record.event_type);
  const actorUserId = asString(record.actor_user_id);
  const payload = normalizePayload(record.payload);

  if (!listId || !eventType || !actorUserId) {
    console.log("shared_list_events ignored: missing required fields");
    return;
  }

  const listTitleRaw =
    (payload.list_title as string | undefined)?.trim() ||
    (await getSharedListTitle(listId)) ||
    "";

  const fallbackItemText = await getSharedItemText(itemId);
  const historicalItemText =
    !fallbackItemText && itemId
      ? await getSharedItemTextFromEventHistory(listId, itemId, eventId)
      : null;
  const itemTextRaw =
    asNullableString(payload.item_text)?.trim() ||
    asNullableString(payload.next_text)?.trim() ||
    asNullableString(payload.previous_text)?.trim() ||
    fallbackItemText ||
    historicalItemText ||
    "";
  const hasConcreteItem = Boolean(itemTextRaw.trim());

  const action = resolveListAction(eventType, payload);
  const recipients = await getListRecipients(listId, actorUserId);
  if (recipients.length === 0) return;

  if (
    await shouldSkipGenericItemAdded({
      eventId,
      createdAt,
      listId,
      itemId: itemId || null,
      actorUserId,
      action,
    })
  ) {
    return;
  }

  const relatedUserIds = [actorUserId, ...recipients];
  const assignedToUserId = asNullableString(payload.assigned_to_user_id)?.trim() || null;
  if (assignedToUserId) relatedUserIds.push(assignedToUserId);
  const profileMap = await getProfileMap(relatedUserIds);
  const actorAvatarUrl = profileMap.get(actorUserId)?.avatar_url ?? undefined;

  const assignedToDisplayName =
    asNullableString(payload.assigned_to_display_name)?.trim() ||
    (assignedToUserId ? profileMap.get(assignedToUserId)?.display_name?.trim() || null : null);

  for (const userId of recipients) {
    const recipientLang = profileMap.get(userId)?.language ?? "es";
    const actor =
      profileMap.get(actorUserId)?.display_name?.trim() ||
      actorUserId.slice(0, 8) ||
      defaultUserName(recipientLang);
    const listTitle = listTitleRaw || listFallbackLabel(recipientLang);
    const itemText = itemTextRaw || itemFallbackLabel(recipientLang);
    const message = buildListMessage(recipientLang, {
      action,
      actor,
      item: itemText,
      list: listTitle,
      hasConcreteItem,
      previousText: asNullableString(payload.previous_text),
      nextText: asNullableString(payload.next_text),
      assignedToDisplayName,
      assignedToUserId,
      actorUserId,
    });
    const dedupeKey = `list:${eventId}:${userId}`;
    const reserved = await reserveSocialPushSend(userId, dedupeKey);
    if (!reserved) continue;

    const recentSignature = buildListRecentSignature({
      recipientUserId: userId,
      actorUserId,
      listId,
      itemId: itemId || null,
      action,
      itemText: itemTextRaw || itemFallbackLabel(recipientLang),
      assignedToUserId,
    });
    const alreadySentRecently = await hasRecentSocialPushSignature(userId, recentSignature);
    if (alreadySentRecently) {
      await releaseSocialPushReservation(userId, dedupeKey);
      continue;
    }

    const delivered = await sendPushToUser(userId, {
      title: listTitle,
      body: message,
      url: `${APP_ORIGIN}/lists?list=${encodeURIComponent(listId)}`,
      tag: `social-list-${eventId}-${userId}`,
      icon: actorAvatarUrl,
      badge: `${APP_ORIGIN}/icons/icon-192.png`,
    });
    if (!delivered) {
      await releaseSocialPushReservation(userId, dedupeKey);
      continue;
    }

    await logRecentSocialPushSignature(userId, recentSignature);
  }
}

async function processShareInviteEvent(eventType: string, record: JsonRecord) {
  const inviteId = asString(record.id) || crypto.randomUUID();
  const status = normalizeInviteStatus(record.status);
  const expiresAt = asNullableString(record.expires_at);
  const kind = resolveShareInviteKind(eventType, status, expiresAt);
  if (!kind) return;

  const senderUserId = asNullableString(record.sender_user_id)?.trim() || null;
  if (!senderUserId) return;

  const payload = normalizePayload(record.payload);
  const itemType =
    normalizeInviteType(payload.type) ??
    normalizeInviteType(payload.item_type) ??
    null;
  const itemTitle =
    asNullableString(payload.title)?.trim() ||
    asNullableString(payload.item_title)?.trim() ||
    "este elemento";
  const createdItemId = pickInviteCreatedItemId(record, payload);
  const createdItemMap = createdItemId ? await getBrainItemLookupMap([createdItemId]) : new Map();
  const createdItem = createdItemId ? createdItemMap.get(createdItemId) ?? null : null;

  let actorUserId: string | null = null;
  let actorDisplayName: string | null = null;
  if (kind === "share_accepted") {
    actorUserId = pickInviteActorUserId(record, payload, "accepted") ?? createdItem?.user_id ?? null;
    actorDisplayName = pickInviteActorDisplayName(record, payload, "accepted");
  } else if (kind === "share_rejected") {
    actorUserId = pickInviteActorUserId(record, payload, "rejected");
    actorDisplayName = pickInviteActorDisplayName(record, payload, "rejected");
  } else {
    actorUserId = senderUserId;
    actorDisplayName = asNullableString(record.sender_display_name);
  }

  const relatedUserIds = [senderUserId];
  if (actorUserId) relatedUserIds.push(actorUserId);
  const profileMap = await getProfileMap(relatedUserIds);
  const senderLang = profileMap.get(senderUserId)?.language ?? "es";
  if (actorUserId && !actorDisplayName) {
    actorDisplayName = profileMap.get(actorUserId)?.display_name ?? null;
  }
  const actorAvatarUrl = actorUserId ? profileMap.get(actorUserId)?.avatar_url ?? undefined : undefined;
  const resolvedItemType = itemType ?? createdItem?.type ?? null;
  const resolvedItemTitle =
    itemTitle ||
    createdItem?.title ||
    sharedItemFallbackLabel(senderLang);

  const message = buildShareInviteMessage(senderLang, {
    kind,
    itemType: resolvedItemType,
    itemTitle: resolvedItemTitle,
    actorDisplayName,
    actorUserId,
  });
  const title = buildShareInviteTitle(senderLang, resolvedItemType);
  const route = resolvedItemType === "idea" ? "/ideas" : "/tasks";

  const dedupeKey = `share:${inviteId}:${kind}:${senderUserId}`;
  const reserved = await reserveSocialPushSend(senderUserId, dedupeKey);
  if (!reserved) return;

  const recentSignature = buildShareRecentSignature({
    senderUserId,
    inviteId,
    kind,
    actorUserId,
    itemType: resolvedItemType,
    itemTitle: resolvedItemTitle,
  });
  const alreadySentRecently = await hasRecentSocialPushSignature(
    senderUserId,
    recentSignature,
  );
  if (alreadySentRecently) {
    await releaseSocialPushReservation(senderUserId, dedupeKey);
    return;
  }

  const delivered = await sendPushToUser(senderUserId, {
    title,
    body: message,
    url: `${APP_ORIGIN}${route}`,
    tag: `social-share-${inviteId}-${kind}-${senderUserId}`,
    icon: actorAvatarUrl,
    badge: `${APP_ORIGIN}/icons/icon-192.png`,
  });
  if (!delivered) {
    await releaseSocialPushReservation(senderUserId, dedupeKey);
    return;
  }

  await logRecentSocialPushSignature(senderUserId, recentSignature);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return json({ ok: true, service: "remi-social-push" });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  if (!hasValidEventSecret(req)) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const root = asRecord(body) ?? {};

    const table = asString(root.table);
    const eventType = asString(root.type).toUpperCase();
    const record = asRecord(root.record);

    if (!table || !eventType || !record) {
      return json({ ok: true, mode: "event", ignored: "invalid_payload" });
    }

    if (table === "shared_list_events" && eventType === "INSERT") {
      await processSharedListEvent(record);
      return json({ ok: true, mode: "event", table, eventType });
    }

    if (table === "share_invites" && (eventType === "INSERT" || eventType === "UPDATE")) {
      await processShareInviteEvent(eventType, record);
      return json({ ok: true, mode: "event", table, eventType });
    }

    return json({ ok: true, mode: "event", ignored: `${table}:${eventType}` });
  } catch (error) {
    console.error("remi-social-push error", error);
    return json(
      {
        error: "internal_error",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
