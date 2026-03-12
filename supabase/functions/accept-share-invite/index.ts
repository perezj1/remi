// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function safeStr(v: any) {
  return typeof v === "string" ? v : "";
}

function safeBool(v: any, fallback = false) {
  if (typeof v === "boolean") return v;
  return fallback;
}

function safeNum(v: any, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function normalizeReminderMode(v: any) {
  const s = safeStr(v).toUpperCase();
  if (s === "NONE") return "NONE";
  if (s === "ON_DUE_DATE") return "ON_DUE_DATE";
  if (s === "DAY_BEFORE_AND_DUE") return "DAY_BEFORE_AND_DUE";
  if (s === "DAILY_UNTIL_DUE") return "DAILY_UNTIL_DUE";
  if (s === "WEEK_BEFORE_AND_DUE") return "WEEK_BEFORE_AND_DUE";
  return "NONE";
}

function normalizeType(v: any) {
  const s = safeStr(v).toLowerCase();
  if (s === "task") return "task";
  if (s === "idea") return "idea";
  return null;
}

function safeJsonObject(v: any): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return { ...(v as Record<string, unknown>) };
  }
  return {};
}

function computeHabitNextNotificationAt(
  dueIso: string | null,
  offsetMinutes: number,
) {
  if (!dueIso) return null;
  const d = new Date(dueIso);
  if (isNaN(d.getTime())) return null;
  if (offsetMinutes && typeof offsetMinutes === "number") {
    d.setMinutes(d.getMinutes() - offsetMinutes);
  }
  return d.toISOString();
}

function isExpired(expiresAtRaw: any) {
  if (!expiresAtRaw) return false;
  const d = new Date(expiresAtRaw);
  return Number.isFinite(d.getTime()) && d.getTime() < Date.now();
}

async function getReceiverProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("profiles read failed", error);
    return { display_name: null as string | null, avatar_url: null as string | null };
  }

  return {
    display_name: typeof data?.display_name === "string" ? data.display_name : null,
    avatar_url: typeof data?.avatar_url === "string" ? data.avatar_url : null,
  };
}

function resolveAcceptedDisplayName(user: any, profileDisplayName: string | null) {
  return (
    profileDisplayName ||
    safeStr(user?.user_metadata?.username).trim() ||
    safeStr(user?.user_metadata?.user_name).trim() ||
    safeStr(user?.user_metadata?.display_name).trim() ||
    safeStr(user?.user_metadata?.full_name).trim() ||
    safeStr(user?.user_metadata?.name).trim() ||
    null
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    const jwt = auth.replace("Bearer ", "").trim();
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Invalid user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const receiverUser = userRes.user;
    const receiverUserId = receiverUser.id;

    const body = await req.json();
    const token = safeStr(body?.token);
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invite, error: invErr } = await supabase
      .from("share_invites")
      .select("token, status, expires_at, payload")
      .eq("token", token)
      .maybeSingle();

    if (invErr) {
      return new Response(
        JSON.stringify({ error: "DB read failed", details: invErr.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!invite) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isExpired(invite.expires_at)) {
      try {
        await supabase.from("share_invites").update({ status: "expired" }).eq(
          "token",
          token,
        );
      } catch {
        // ignore
      }

      return new Response(JSON.stringify({ error: "Invite expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Invite already processed", status: invite.status }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = safeJsonObject(invite.payload);
    const type = normalizeType(payload.type);
    const title = safeStr(payload.title).trim();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Invalid payload (missing/invalid type)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!title) {
      return new Response(JSON.stringify({ error: "Invalid payload (missing title)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const due_date = payload.due_date ?? null;
    const reminder_mode = normalizeReminderMode(payload.reminder_mode);
    const status = "ACTIVE";
    const is_hidden = safeBool(payload.is_hidden, false);
    const repeat_type = safeStr(payload.repeat_type || "none") || "none";
    const is_habit = safeBool(payload.is_habit, false);
    const habit_offset_minutes = safeNum(payload.habit_offset_minutes, 0);

    let next_reminder_at: string | null =
      typeof payload.next_reminder_at === "string" ? payload.next_reminder_at : null;

    let next_notification_at: string | null =
      typeof payload.next_notification_at === "string"
        ? payload.next_notification_at
        : null;

    if (is_habit) {
      if (!next_notification_at) {
        next_notification_at = computeHabitNextNotificationAt(
          due_date,
          habit_offset_minutes,
        );
      }
    } else {
      if (repeat_type !== "none") {
        if (!next_reminder_at) {
          next_reminder_at = due_date ? new Date(due_date).toISOString() : null;
        }
      } else {
        next_reminder_at = null;
      }
      next_notification_at = null;
    }

    const nowIso = new Date().toISOString();

    const insertRow: any = {
      user_id: receiverUserId,
      type,
      title,
      due_date,
      reminder_mode,
      status,
      is_hidden,
      repeat_type,
      next_reminder_at,
      is_habit,
      habit_offset_minutes,
      next_notification_at,
      last_notified_at: null,
      updated_at: nowIso,
      received_from_share: true,
      sent_via_share: false,
      shared_count: 0,
      last_shared_at: null,
    };

    const { data: created, error: createErr } = await supabase
      .from("brain_items")
      .insert(insertRow)
      .select("id")
      .maybeSingle();

    if (createErr) {
      return new Response(
        JSON.stringify({ error: "Failed to create brain_item", details: createErr.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const receiverProfile = await getReceiverProfile(receiverUserId);
    const acceptedDisplayName = resolveAcceptedDisplayName(
      receiverUser,
      receiverProfile.display_name,
    );

    const nextPayload = {
      ...payload,
      accepted_by: receiverUserId,
      accepted_user_id: receiverUserId,
      accepted_by_user_id: receiverUserId,
      accepted_by_display_name: acceptedDisplayName,
      accepted_display_name: acceptedDisplayName,
      accepted_by_avatar_url: receiverProfile.avatar_url,
      new_brain_item_id: created?.id ?? null,
      accepted_at: nowIso,
    };

    const { error: updErr } = await supabase
      .from("share_invites")
      .update({
        status: "accepted",
        accepted_at: nowIso,
        payload: nextPayload,
      })
      .eq("token", token);

    if (updErr) {
      return new Response(
        JSON.stringify({
          ok: true,
          newBrainItemId: created?.id ?? null,
          warning: "Item created but invite status update failed",
          details: updErr.message,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, newBrainItemId: created?.id ?? null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Edge function error", details: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
