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

/**
 * Calls the Edge Function create-share-invite
 * Input: brainItemId (existing brain_items row id)
 * Output: { token, shareUrl, shareMessage, lang }
 */
export async function createShareInvite(
  brainItemId: string,
): Promise<CreateShareInviteResult> {
  if (!brainItemId) throw new Error("Missing brainItemId");

  const { data, error } = await supabase.functions.invoke("create-share-invite", {
    body: { brainItemId },
  });

  if (error) {
    // supabase-js packs HTTP errors here
    throw new Error(error.message || "create-share-invite failed");
  }
  if (!data?.token || !data?.shareUrl || !data?.shareMessage) {
    throw new Error("create-share-invite returned invalid response");
  }

  return data as CreateShareInviteResult;
}

/**
 * Calls the public Edge Function get-share-invite (JWT disabled)
 * Input: token
 * Output: preview info (+ optional extra fields)
 */
export async function getShareInvite(token: string): Promise<ShareInvitePublic> {
  if (!token) throw new Error("Missing token");

  const { data, error } = await supabase.functions.invoke("get-share-invite", {
    body: { token },
  });

  if (error) {
    throw new Error(error.message || "get-share-invite failed");
  }
  if (!data?.status) {
    throw new Error("get-share-invite returned invalid response");
  }

  return data as ShareInvitePublic;
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
