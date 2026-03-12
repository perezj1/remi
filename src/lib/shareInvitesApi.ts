// src/lib/shareInvitesApi.ts

import { supabase } from "@/integrations/supabase/client";
import type { ReminderMode } from "@/lib/brainItemsApi";

export type ShareInviteStatus = "pending" | "accepted" | "rejected" | "expired";

export type ShareInvitePublic = {
  status: ShareInviteStatus;
  senderDisplayName: string | null;

  // Solo cuando status === "pending"
  previewLines?: string[];
  dueDate?: string | null;

  // Extra (no rompe: viene como campos adicionales del get-share-invite)
  type?: "task" | "idea" | null;
  reminderMode?: ReminderMode | null;
  repeatType?: string;
  isHabit?: boolean;
  habitOffsetMinutes?: number;
};

export type CreateShareInviteResult = {
  token: string;
  shareUrl: string;
  shareMessage: string;
  lang?: "es" | "en" | "de";
};

export type AcceptShareInviteResult = {
  ok: boolean;
  newBrainItemId: string | null;
  warning?: string;
  details?: string;
};

export type ShareInviteNotificationKind =
  | "share_sent"
  | "share_accepted"
  | "share_rejected"
  | "share_expired";

export type ShareInviteNotification = {
  id: string;
  kind: ShareInviteNotificationKind;
  created_at: string;
  actor_user_id: string | null;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
  item_type: "task" | "idea" | null;
  item_title: string | null;
  status: ShareInviteStatus;
};

export type ReceivedShareNotification = {
  id: string;
  kind: "share_received";
  created_at: string;
  item_id: string;
  item_type: "task" | "idea" | null;
  item_title: string | null;
  actor_user_id: string | null;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
};

type ShareInvitePayload = {
  type?: "task" | "idea" | null;
  title?: string | null;
  dueDate?: string | null;
  reminderMode?: ReminderMode | null;
  repeatType?: string | null;
  isHabit?: boolean;
  habitOffsetMinutes?: number | null;
};

type BrainItemLookupRow = {
  id: string;
  user_id: string;
  title: string | null;
  type: "task" | "idea" | null;
  created_at: string | null;
};

function ensureNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function pickFirstString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = ensureNullableString(row[key]);
    if (value) return value;
  }
  return null;
}

function normalizePayloadRecord(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickNestedString(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  return pickFirstString(row, keys);
}

function looksLikeUserId(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
}

function looksLikeHumanName(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (looksLikeUserId(trimmed)) return false;
  if (trimmed.length > 120) return false;
  return true;
}

function pickGenericActorUserId(
  row: Record<string, unknown>,
  payloadRow: Record<string, unknown> | null,
  excludeIds: string[],
): string | null {
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

  for (const source of payloadRow ? [row, payloadRow] : [row]) {
    for (const [key, rawValue] of Object.entries(source)) {
      const keyLower = key.toLowerCase();
      if (ignoredKeys.has(keyLower)) continue;
      if (!keyLower.includes("user") && !keyLower.endsWith("_id") && !keyLower.endsWith("_by")) {
        continue;
      }

      const candidate = ensureNullableString(rawValue)?.trim();
      if (looksLikeUserId(candidate) && !excluded.has(candidate)) {
        return candidate;
      }

      const nestedCandidate = pickNestedString(rawValue, ["user_id", "id"]);
      if (looksLikeUserId(nestedCandidate) && !excluded.has(nestedCandidate!)) {
        return nestedCandidate!.trim();
      }
    }
  }

  return null;
}

function pickGenericActorDisplayName(
  row: Record<string, unknown>,
  payloadRow: Record<string, unknown> | null,
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

  for (const source of payloadRow ? [row, payloadRow] : [row]) {
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

      const candidate = ensureNullableString(rawValue)?.trim();
      if (looksLikeHumanName(candidate) && !ignored.has(candidate!.toLocaleLowerCase())) {
        return candidate!;
      }

      const nestedCandidate = pickNestedString(rawValue, ["display_name", "name", "username"]);
      if (
        looksLikeHumanName(nestedCandidate) &&
        !ignored.has(nestedCandidate!.trim().toLocaleLowerCase())
      ) {
        return nestedCandidate!.trim();
      }
    }
  }

  return null;
}

function pickInviteCreatedItemId(
  row: Record<string, unknown>,
  payloadRow: Record<string, unknown> | null,
): string | null {
  const keys = [
    "new_brain_item_id",
    "received_item_id",
    "accepted_item_id",
    "new_item_id",
    "copied_brain_item_id",
  ];
  return pickFirstString(row, keys) ?? (payloadRow ? pickFirstString(payloadRow, keys) : null);
}

function pickActorUserId(
  row: Record<string, unknown>,
  payloadRow: Record<string, unknown> | null,
  eventKind: "accepted" | "rejected",
): string | null {
  const known = eventKind === "accepted"
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
  const knownFromRow = pickFirstString(row, known);
  if (knownFromRow) return knownFromRow;
  if (payloadRow) {
    const knownFromPayload = pickFirstString(payloadRow, known);
    if (knownFromPayload) return knownFromPayload;
  }

  const keyword = eventKind === "accepted" ? "accept" : "reject";
  for (const source of payloadRow ? [row, payloadRow] : [row]) {
    for (const [key, value] of Object.entries(source)) {
      const keyLower = key.toLowerCase();
      if (!keyLower.includes(keyword)) continue;
      const nestedCandidate = pickNestedString(value, [
        "user_id",
        "id",
        "accepted_by",
        "rejected_by",
      ]);
      if (nestedCandidate && nestedCandidate.trim().length >= 10) {
        return nestedCandidate.trim();
      }
      if (!keyLower.includes("id") && !keyLower.includes("user")) continue;
      const candidate = ensureNullableString(value)?.trim();
      if (!candidate) continue;
      if (candidate.length >= 10) return candidate;
    }
  }

  return pickGenericActorUserId(row, payloadRow, [
    pickFirstString(row, ["sender_user_id", "sender_id"]) ?? "",
  ]);
}

function pickActorDisplayName(
  row: Record<string, unknown>,
  payloadRow: Record<string, unknown> | null,
  eventKind: "accepted" | "rejected",
): string | null {
  const known = eventKind === "accepted"
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
  const knownFromRow = pickFirstString(row, known);
  if (knownFromRow) return knownFromRow;
  if (payloadRow) {
    const knownFromPayload = pickFirstString(payloadRow, known);
    if (knownFromPayload) return knownFromPayload;
  }

  const keyword = eventKind === "accepted" ? "accept" : "reject";
  for (const source of payloadRow ? [row, payloadRow] : [row]) {
    for (const [key, value] of Object.entries(source)) {
      const keyLower = key.toLowerCase();
      if (!keyLower.includes(keyword)) continue;
      const nestedCandidate = pickNestedString(value, [
        "display_name",
        "name",
        "username",
      ]);
      if (nestedCandidate && nestedCandidate.trim().length > 0) {
        return nestedCandidate.trim();
      }
      if (!keyLower.includes("name") && !keyLower.includes("display")) continue;
      const candidate = ensureNullableString(value)?.trim();
      if (!candidate) continue;
      return candidate;
    }
  }

  return pickGenericActorDisplayName(row, payloadRow, [
    pickFirstString(row, ["sender_display_name", "sender_name"]) ?? "",
    normalizeShareInvitePayload(row.payload).title ?? "",
  ]);
}

function ensureNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function ensureNullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeShareInviteType(value: unknown): "task" | "idea" | null {
  return value === "task" || value === "idea" ? value : null;
}

function normalizeReminderMode(value: unknown): ReminderMode | null {
  switch (value) {
    case "NONE":
    case "ON_DUE_DATE":
    case "DAY_BEFORE_AND_DUE":
    case "DAILY_UNTIL_DUE":
    case "WEEK_BEFORE_AND_DUE":
      return value;
    default:
      return null;
  }
}

function normalizeShareInviteStatus(value: unknown): ShareInviteStatus {
  switch (value) {
    case "accepted":
    case "rejected":
    case "expired":
      return value;
    default:
      return "pending";
  }
}

function normalizeShareInvitePayload(value: unknown): ShareInvitePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const row = value as Record<string, unknown>;

  return {
    type: normalizeShareInviteType(row.type),
    title: ensureNullableString(row.title),
    dueDate: ensureNullableString(row.dueDate) ?? ensureNullableString(row.due_date),
    reminderMode:
      normalizeReminderMode(row.reminderMode) ?? normalizeReminderMode(row.reminder_mode),
    repeatType: ensureNullableString(row.repeatType) ?? ensureNullableString(row.repeat_type),
    isHabit: ensureNullableBoolean(row.isHabit) ?? ensureNullableBoolean(row.is_habit) ?? undefined,
    habitOffsetMinutes:
      ensureNullableNumber(row.habitOffsetMinutes) ??
      ensureNullableNumber(row.habit_offset_minutes) ??
      undefined,
  };
}

async function fetchBrainItemsByIds(itemIds: string[]): Promise<Map<string, BrainItemLookupRow>> {
  const uniqueIds = Array.from(new Set(itemIds.filter(Boolean)));
  const itemMap = new Map<string, BrainItemLookupRow>();
  if (uniqueIds.length === 0) return itemMap;

  const { data, error } = await supabase
    .from("brain_items")
    .select("id, user_id, title, type, created_at")
    .in("id", uniqueIds);

  if (error) {
    console.error("Error fetching brain items for share invites", error);
    return itemMap;
  }

  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const id = ensureNullableString(row.id);
    const userId = ensureNullableString(row.user_id);
    if (!id || !userId) continue;

    itemMap.set(id, {
      id,
      user_id: userId,
      title: ensureNullableString(row.title),
      type: normalizeShareInviteType(row.type),
      created_at: ensureNullableString(row.created_at),
    });
  }

  return itemMap;
}

function findMatchingReceivedBrainItem(
  items: BrainItemLookupRow[],
  payload: ShareInvitePayload,
  eventAt: string,
  usedIds: Set<string>,
): BrainItemLookupRow | null {
  const targetTitle = payload.title?.trim().toLocaleLowerCase() ?? "";
  const targetType = payload.type ?? null;
  const eventMs = Date.parse(eventAt);

  const candidates = items.filter((item) => {
    if (usedIds.has(item.id)) return false;
    if (targetType && item.type && item.type !== targetType) return false;
    if (targetTitle && item.title?.trim().toLocaleLowerCase() !== targetTitle) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  if (!Number.isFinite(eventMs)) {
    return candidates[0];
  }

  const MAX_DIFF_MS = 15 * 60 * 1000;
  const byClosest = candidates
    .map((item) => ({
      item,
      diffMs: Math.abs(Date.parse(item.created_at ?? "") - eventMs),
    }))
    .filter((entry) => Number.isFinite(entry.diffMs))
    .sort((a, b) => a.diffMs - b.diffMs);

  if (byClosest.length > 0 && byClosest[0].diffMs <= MAX_DIFF_MS) {
    return byClosest[0].item;
  }

  return candidates[0];
}

async function fetchBrainItemType(brainItemId: string): Promise<"task" | "idea" | null> {
  const { data, error } = await supabase
    .from("brain_items")
    .select("type")
    .eq("id", brainItemId)
    .maybeSingle();

  if (error) {
    console.error("Error resolving shared brain item type", error);
    return null;
  }

  return normalizeShareInviteType((data as Record<string, unknown> | null)?.type);
}

function appendInviteKindToUrl(urlString: string, inviteType: "task" | "idea" | null): string {
  if (!inviteType) return urlString;

  try {
    const url = new URL(urlString);
    url.searchParams.set("kind", inviteType);
    return url.toString();
  } catch {
    return urlString;
  }
}

function injectShareUrl(shareMessage: string, originalUrl: string, nextUrl: string): string {
  if (!shareMessage || originalUrl === nextUrl) return shareMessage;
  return shareMessage.includes(originalUrl)
    ? shareMessage.replace(originalUrl, nextUrl)
    : shareMessage;
}

async function getShareInviteFallback(token: string): Promise<ShareInvitePublic | null> {
  const { data, error } = await supabase
    .from("share_invites")
    .select("sender_display_name, payload, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  const payload = normalizeShareInvitePayload((data as Record<string, unknown>).payload);

  return {
    status: normalizeShareInviteStatus((data as Record<string, unknown>).status),
    senderDisplayName:
      ensureNullableString((data as Record<string, unknown>).sender_display_name) ?? null,
    previewLines: payload.title ? [payload.title] : [],
    dueDate: payload.dueDate ?? null,
    type: payload.type ?? null,
    reminderMode: payload.reminderMode ?? null,
    repeatType: payload.repeatType ?? undefined,
    isHabit: payload.isHabit,
    habitOffsetMinutes: payload.habitOffsetMinutes ?? undefined,
  };
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

function resolveShareInviteNotificationKind(
  status: ShareInviteStatus,
  expiresAt: string | null,
): ShareInviteNotificationKind {
  if (status === "accepted") return "share_accepted";
  if (status === "rejected") return "share_rejected";

  const expiresMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;
  if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
    return "share_expired";
  }

  return "share_sent";
}

function resolveShareInviteEventAt(row: {
  kind: ShareInviteNotificationKind;
  created_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  expires_at: string | null;
}): string {
  if (row.kind === "share_accepted" && row.accepted_at) return row.accepted_at;
  if (row.kind === "share_rejected" && row.rejected_at) return row.rejected_at;
  if (row.kind === "share_expired" && row.expires_at) return row.expires_at;
  return row.created_at;
}

/**
 * Calls the Edge Function create-share-invite
 * Input: brainItemId (existing brain_items row id)
 * Output: { token, shareUrl, shareMessage, lang }
 */
export async function createShareInvite(
  brainItemId: string,
): Promise<CreateShareInviteResult> {
  if (!brainItemId) throw new Error("Missing brainItemId");

  const [inviteResponse, brainItemType] = await Promise.all([
    supabase.functions.invoke("create-share-invite", {
      body: { brainItemId },
    }),
    fetchBrainItemType(brainItemId),
  ]);

  const { data, error } = inviteResponse;

  if (error) {
    throw new Error(error.message || "create-share-invite failed");
  }
  if (!data?.token || !data?.shareUrl || !data?.shareMessage) {
    throw new Error("create-share-invite returned invalid response");
  }

  const originalShareUrl = String(data.shareUrl);
  const shareUrl = appendInviteKindToUrl(originalShareUrl, brainItemType);

  return {
    ...(data as CreateShareInviteResult),
    shareUrl,
    shareMessage: injectShareUrl(String(data.shareMessage), originalShareUrl, shareUrl),
  };
}

/* ------------------------------------------------------------------ */
/* ✅ NUEVO: cache + prefetch (para que el click no espere tanto)      */
/* ------------------------------------------------------------------ */

const SHARE_INVITE_TTL_MS = 5 * 60 * 1000; // 5 min
type CachedInvite = { ts: number; promise: Promise<CreateShareInviteResult> };
const inviteCache = new Map<string, CachedInvite>();

/**
 * Devuelve (y comparte) una promesa cacheada para el mismo brainItemId.
 * - Si ya hay una creación en curso, la reutiliza (dedupe).
 * - TTL para evitar reusar links viejos demasiado tiempo.
 */
export function createShareInviteCached(
  brainItemId: string,
): Promise<CreateShareInviteResult> {
  if (!brainItemId) return Promise.reject(new Error("Missing brainItemId"));

  const now = Date.now();
  const cached = inviteCache.get(brainItemId);

  if (cached && now - cached.ts < SHARE_INVITE_TTL_MS) {
    return cached.promise;
  }

  const p = createShareInvite(brainItemId).catch((err) => {
    // si falla, no dejes basura en cache
    inviteCache.delete(brainItemId);
    throw err;
  });

  inviteCache.set(brainItemId, { ts: now, promise: p });
  return p;
}

/**
 * Lanza la creación del invite lo antes posible (sin bloquear UI).
 * Útil en onPointerDown / onTouchStart.
 */
export function prefetchShareInvite(brainItemId: string): void {
  try {
    void createShareInviteCached(brainItemId);
  } catch {
    // no hacer nada; el click real manejará el error
  }
}

/** Opcional: por si quieres limpiar manualmente */
export function clearShareInviteCache(brainItemId?: string): void {
  if (brainItemId) inviteCache.delete(brainItemId);
  else inviteCache.clear();
}

/**
 * Calls the public Edge Function get-share-invite (JWT disabled)
 * Input: token
 * Output: preview info (+ optional extra fields)
 */
export async function getShareInvite(token: string): Promise<ShareInvitePublic> {
  if (!token) throw new Error("Missing token");

  const { data, error } = await invokeFunctionWithTimeout<ShareInvitePublic>(
    "get-share-invite",
    { token },
  );

  if (!error && data?.status) {
    const fallback = data.type ? null : await getShareInviteFallback(token);

    return {
      ...data,
      previewLines:
        Array.isArray(data.previewLines) && data.previewLines.length > 0
          ? data.previewLines
          : fallback?.previewLines ?? [],
      dueDate: data.dueDate ?? fallback?.dueDate ?? null,
      type: normalizeShareInviteType(data.type) ?? fallback?.type ?? null,
      reminderMode: data.reminderMode ?? fallback?.reminderMode ?? null,
      repeatType: data.repeatType ?? fallback?.repeatType,
      isHabit: data.isHabit ?? fallback?.isHabit,
      habitOffsetMinutes: data.habitOffsetMinutes ?? fallback?.habitOffsetMinutes,
    };
  }

  const fallback = await getShareInviteFallback(token);
  if (fallback) return fallback;

  if (error) {
    throw new Error(error.message || "get-share-invite failed");
  }

  throw new Error("get-share-invite returned invalid response");
}

/**
 * Calls the Edge Function accept-share-invite (JWT required)
 * Input: token
 * Output: { ok, newBrainItemId }
 */
export async function acceptShareInvite(
  token: string,
): Promise<AcceptShareInviteResult> {
  if (!token) throw new Error("Missing token");

  const { data, error } = await supabase.functions.invoke("accept-share-invite", {
    body: { token },
  });

  if (error) {
    throw new Error(error.message || "accept-share-invite failed");
  }

  const ok = !!data?.ok;
  const newBrainItemId = (data?.newBrainItemId ?? null) as string | null;

  return {
    ok,
    newBrainItemId,
    warning: data?.warning,
    details: data?.details,
  };
}

/**
 * Uses Web Share API if available; otherwise copies to clipboard.
 * Returns: "shared" | "copied"
 */
export async function shareTextOrCopy(
  shareMessage: string,
): Promise<"shared" | "copied"> {
  const msg = (shareMessage ?? "").trim();
  if (!msg) throw new Error("Missing shareMessage");

  const navAny = navigator as any;

  if (typeof navAny?.share === "function") {
    await navAny.share({ text: msg });
    return "shared";
  }

  // Fallback: clipboard
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(msg);
    return "copied";
  }

  // Last-resort fallback
  const ta = document.createElement("textarea");
  ta.value = msg;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return "copied";
}

export async function fetchShareInviteNotifications(
  userId: string,
  limit = 20,
): Promise<ShareInviteNotification[]> {
  const { data, error } = await supabase
    .from("share_invites")
    .select("*")
    .eq("sender_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []) as Array<Record<string, unknown>>;

  if (rows.length === 0) return [];

  const actorIds = new Set<string>();
  const createdItemIds = new Set<string>();
  for (const row of rows) {
    const senderUserId = pickFirstString(row, ["sender_user_id"]);
    const payloadRow = normalizePayloadRecord(row.payload);
    const acceptedBy = pickActorUserId(row, payloadRow, "accepted");
    const rejectedBy = pickActorUserId(row, payloadRow, "rejected");
    const createdItemId = pickInviteCreatedItemId(row, payloadRow);

    if (senderUserId) actorIds.add(senderUserId);
    if (acceptedBy) actorIds.add(acceptedBy);
    if (rejectedBy) actorIds.add(rejectedBy);
    if (createdItemId) createdItemIds.add(createdItemId);
  }

  const createdItemMap = await fetchBrainItemsByIds(Array.from(createdItemIds));
  for (const row of createdItemMap.values()) {
    actorIds.add(row.user_id);
  }

  const profileMap = new Map<string, { avatar_url: string | null; display_name: string | null }>();

  if (actorIds.size > 0) {
    const { data: profilesRaw, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, avatar_url, display_name")
      .in("id", Array.from(actorIds));

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

  return rows.flatMap((row) => {
    const status = normalizeShareInviteStatus(row.status);
    const payload = normalizeShareInvitePayload(row.payload);
    const payloadRow = normalizePayloadRecord(row.payload);
    const kind = resolveShareInviteNotificationKind(status, ensureNullableString(row.expires_at));
    if (kind === "share_sent") {
      return [];
    }
    const senderUserId = pickFirstString(row, ["sender_user_id"]);
    const senderDisplayName = pickFirstString(row, ["sender_display_name"]);
    const acceptedActorUserId = pickActorUserId(row, payloadRow, "accepted");
    const rejectedActorUserId = pickActorUserId(row, payloadRow, "rejected");
    const acceptedActorDisplayName = pickActorDisplayName(row, payloadRow, "accepted");
    const rejectedActorDisplayName = pickActorDisplayName(row, payloadRow, "rejected");
    const createdItemId = pickInviteCreatedItemId(row, payloadRow);
    const createdItem = createdItemId ? createdItemMap.get(createdItemId) ?? null : null;
    const actorUserId =
      kind === "share_accepted"
        ? acceptedActorUserId ?? createdItem?.user_id ?? null
        : kind === "share_rejected"
          ? rejectedActorUserId
          : kind === "share_sent"
            ? senderUserId
            : null;
    const actorDisplayName =
      kind === "share_accepted"
        ? profileMap.get(actorUserId ?? "")?.display_name ?? acceptedActorDisplayName ?? null
        : kind === "share_rejected"
          ? profileMap.get(actorUserId ?? "")?.display_name ?? rejectedActorDisplayName ?? null
          : profileMap.get(actorUserId ?? "")?.display_name ?? senderDisplayName ?? null;

    return [{
      id: ensureNullableString(row.id) ?? crypto.randomUUID(),
      kind,
      created_at: resolveShareInviteEventAt({
        kind,
        created_at: ensureNullableString(row.created_at) ?? new Date().toISOString(),
        accepted_at: ensureNullableString(row.accepted_at),
        rejected_at: ensureNullableString(row.rejected_at),
        expires_at: ensureNullableString(row.expires_at),
      }),
      actor_user_id: actorUserId,
      actor_display_name: actorDisplayName,
      actor_avatar_url: actorUserId ? profileMap.get(actorUserId)?.avatar_url ?? null : null,
      item_type: payload.type ?? createdItem?.type ?? null,
      item_title: payload.title ?? createdItem?.title ?? null,
      status,
    } satisfies ShareInviteNotification];
  });
}

export async function fetchReceivedShareNotifications(
  userId: string,
  limit = 20,
): Promise<ReceivedShareNotification[]> {
  const fallbackFromBrainItems = async (): Promise<ReceivedShareNotification[]> => {
    const { data, error } = await supabase
      .from("brain_items")
      .select("id, title, type, created_at")
      .eq("user_id", userId)
      .eq("received_from_share", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
      const rawType = ensureNullableString(row.type);
      return {
        id: `received-share-${ensureNullableString(row.id) ?? crypto.randomUUID()}`,
        kind: "share_received",
        created_at: ensureNullableString(row.created_at) ?? new Date().toISOString(),
        item_id: ensureNullableString(row.id) ?? "",
        item_type: rawType === "task" || rawType === "idea" ? rawType : null,
        item_title: ensureNullableString(row.title),
        actor_user_id: null,
        actor_display_name: null,
        actor_avatar_url: null,
      } satisfies ReceivedShareNotification;
    });
  };

  const scanLimit = Math.max(limit * 8, 120);
  const { data: receivedItemsRaw, error: receivedItemsErr } = await supabase
    .from("brain_items")
    .select("id, user_id, title, type, created_at")
    .eq("user_id", userId)
    .eq("received_from_share", true)
    .order("created_at", { ascending: false })
    .limit(scanLimit);

  if (receivedItemsErr) {
    console.error("Error fetching received brain items", receivedItemsErr);
    return fallbackFromBrainItems();
  }

  const receivedItems = ((receivedItemsRaw ?? []) as Array<Record<string, unknown>>)
    .map((row) => {
      const id = ensureNullableString(row.id);
      const ownerUserId = ensureNullableString(row.user_id);
      if (!id || !ownerUserId) return null;

      return {
        id,
        user_id: ownerUserId,
        title: ensureNullableString(row.title),
        type: normalizeShareInviteType(row.type),
        created_at: ensureNullableString(row.created_at),
      } satisfies BrainItemLookupRow;
    })
    .filter((row): row is BrainItemLookupRow => !!row);
  const receivedItemMap = new Map(receivedItems.map((row) => [row.id, row]));

  const { data: invitesRaw, error: invitesErr } = await supabase
    .from("share_invites")
    .select("*")
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(scanLimit);

  if (invitesErr) {
    console.error("Error fetching accepted share invites", invitesErr);
    return fallbackFromBrainItems();
  }

  const inviteRows = (invitesRaw ?? []) as Array<Record<string, unknown>>;
  if (inviteRows.length === 0) {
    return fallbackFromBrainItems();
  }

  const normalizedRows: ReceivedShareNotification[] = [];
  const usedReceivedItemIds = new Set<string>();

  for (const row of inviteRows) {
    const payload = normalizeShareInvitePayload(row.payload);
    const payloadRow = normalizePayloadRecord(row.payload);
    const acceptedUserId = pickActorUserId(row, payloadRow, "accepted");
    const createdAt =
      ensureNullableString(row.accepted_at) ??
      ensureNullableString(row.updated_at) ??
      ensureNullableString(row.created_at) ??
      new Date().toISOString();
    const createdItemId = pickInviteCreatedItemId(row, payloadRow);
    const createdItem = createdItemId
      ? receivedItemMap.get(createdItemId) ?? null
      : findMatchingReceivedBrainItem(receivedItems, payload, createdAt, usedReceivedItemIds);

    const belongsToUser =
      acceptedUserId === userId ||
      (createdItem?.user_id === userId);

    if (!belongsToUser) continue;

    if (createdItem?.id) {
      usedReceivedItemIds.add(createdItem.id);
    }

    const senderUserId = pickFirstString(row, ["sender_user_id", "sender_id"]);
    const senderDisplayName = pickFirstString(row, ["sender_display_name", "sender_name"]);

    normalizedRows.push({
      id: `received-share-${ensureNullableString(row.id) ?? crypto.randomUUID()}`,
      kind: "share_received",
      created_at: createdAt,
      item_id: createdItem?.id ?? createdItemId ?? ensureNullableString(row.id) ?? "",
      item_type: payload.type ?? createdItem?.type ?? null,
      item_title: payload.title ?? createdItem?.title ?? null,
      actor_user_id: senderUserId,
      actor_display_name: senderDisplayName,
      actor_avatar_url: null,
    });
  }

  normalizedRows.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const limitedRows = normalizedRows.slice(0, limit);

  if (limitedRows.length === 0) {
    return fallbackFromBrainItems();
  }

  const senderIds = Array.from(
    new Set(
      limitedRows
        .map((row) => row.actor_user_id)
        .filter((value): value is string => !!value),
    ),
  );

  const profileMap = new Map<string, { avatar_url: string | null; display_name: string | null }>();
  if (senderIds.length > 0) {
    const { data: profilesRaw, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, avatar_url, display_name")
      .in("id", senderIds);

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

  return limitedRows.map((row) => {
    const profile = row.actor_user_id ? profileMap.get(row.actor_user_id) : null;
    return {
      ...row,
      actor_display_name: profile?.display_name ?? row.actor_display_name ?? null,
      actor_avatar_url: profile?.avatar_url ?? null,
    } satisfies ReceivedShareNotification;
  });
}

export function subscribeToShareInviteNotifications(
  userId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`share-invite-notifications-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "share_invites", filter: `sender_user_id=eq.${userId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToReceivedShareNotifications(
  userId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`received-share-notifications-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "brain_items", filter: `user_id=eq.${userId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
