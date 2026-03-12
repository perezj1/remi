import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  token?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "missing_env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const token = String(body.token ?? "").trim();

    if (!token) {
      return new Response(JSON.stringify({ error: "missing_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: invite, error: inviteErr } = await admin
      .from("shared_list_invites")
      .select("list_id, created_by, role, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (inviteErr) {
      return new Response(JSON.stringify({ error: "invite_error", details: inviteErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!invite) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: listRow }, { data: itemRows }, { data: profileRow }] = await Promise.all([
      admin
        .from("shared_lists")
        .select("title, icon_emoji")
        .eq("id", invite.list_id)
        .maybeSingle(),
      admin
        .from("shared_list_items")
        .select("text")
        .eq("list_id", invite.list_id)
        .order("position", { ascending: true })
        .limit(5),
      admin
        .from("profiles")
        .select("display_name")
        .eq("id", invite.created_by)
        .maybeSingle(),
    ]);

    const expiresAt = invite.expires_at ? String(invite.expires_at) : null;
    const expiresMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;
    const status =
      invite.status === "accepted"
        ? "accepted"
        : Number.isFinite(expiresMs) && expiresMs <= Date.now()
          ? "expired"
          : "pending";

    return new Response(
      JSON.stringify({
        status,
        senderDisplayName: String(profileRow?.display_name ?? "").trim() || null,
        listTitle: String(listRow?.title ?? "Shared list"),
        listIconEmoji: typeof listRow?.icon_emoji === "string" ? listRow.icon_emoji : null,
        role: invite.role === "viewer" ? "viewer" : "editor",
        expiresAt,
        previewItems: Array.isArray(itemRows)
          ? itemRows
              .map((row) => String(row.text ?? "").trim())
              .filter(Boolean)
          : [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "internal_error",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
