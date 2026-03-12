import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  listId?: string;
  role?: "editor" | "viewer";
  lang?: "es" | "en" | "de";
  expiresInHours?: number;
};

function normalizeLang(raw?: string | null): "es" | "en" | "de" {
  const value = String(raw ?? "").toLowerCase().trim();
  if (value.startsWith("de")) return "de";
  if (value.startsWith("en")) return "en";
  return "es";
}

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

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.getUser(jwt);

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "invalid_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const listId = (body.listId ?? "").trim();
    const role = body.role === "viewer" ? "viewer" : "editor";
    const expiresInHours = Math.max(1, Math.min(body.expiresInHours ?? 24 * 7, 24 * 30));
    const reqLang = normalizeLang(body.lang || req.headers.get("accept-language"));

    if (!listId) {
      return new Response(JSON.stringify({ error: "missing_list_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership, error: membershipErr } = await admin
      .from("shared_list_members")
      .select("role")
      .eq("list_id", listId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipErr) {
      return new Response(JSON.stringify({ error: "membership_error", details: membershipErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!membership || !["owner", "editor"].includes(String(membership.role))) {
      return new Response(JSON.stringify({ error: "not_allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inviteRows, error: inviteErr } = await admin.rpc("create_shared_list_invite", {
      p_list_id: listId,
      p_role: role,
      p_expires_in_hours: expiresInHours,
    });

    if (inviteErr) {
      return new Response(JSON.stringify({ error: "invite_error", details: inviteErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invite = Array.isArray(inviteRows) ? inviteRows[0] : null;
    if (!invite?.token) {
      return new Response(JSON.stringify({ error: "invalid_invite_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: listRow } = await admin
      .from("shared_lists")
      .select("title")
      .eq("id", listId)
      .maybeSingle();

    const appUrl =
      (Deno.env.get("PUBLIC_APP_URL") || Deno.env.get("SITE_URL") || "").replace(/\/+$/, "");
    const shareBase = appUrl || new URL(req.url).origin;
    const shareUrl = `${shareBase}/lists/invite/${encodeURIComponent(String(invite.token))}`;
    const listTitle = String(listRow?.title ?? "Shared list");
    const senderName =
      String(
        user.user_metadata?.username ??
          user.user_metadata?.user_name ??
          user.user_metadata?.display_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          "Alguien",
      ).trim() || "Alguien";
    const sharedListLabel =
      reqLang === "en" ? "Shared list" : reqLang === "de" ? "Geteilte Liste" : "Lista compartida";
    const shareMessage = `${senderName} 💬:\n────────\n${sharedListLabel}: ${listTitle}\n────────\nREMI ->\n${shareUrl}`;

    return new Response(
      JSON.stringify({
        token: String(invite.token),
        expires_at: String(invite.expires_at ?? ""),
        shareUrl,
        shareMessage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "internal_error", details: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

