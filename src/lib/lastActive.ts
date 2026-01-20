import { supabase } from "@/integrations/supabase/client";

const KEY_PREFIX = "remi:last_active_sent_at:";
const THROTTLE_MINUTES = 30;

export async function touchLastActive(userId: string) {
  if (!userId) return;

  const key = `${KEY_PREFIX}${userId}`;
  const now = Date.now();

  const last = Number(localStorage.getItem(key) || "0");
  const throttleMs = THROTTLE_MINUTES * 60 * 1000;

  if (last && now - last < throttleMs) return;

  localStorage.setItem(key, String(now));

  const { error } = await supabase
    .from("remi_user_settings")
    .update({ last_active_at: new Date(now).toISOString() })
    .eq("user_id", userId);

  // Si falla, no bloqueamos la app; solo permitimos reintentar pronto
  if (error) {
    localStorage.removeItem(key);
    // opcional: console.error("touchLastActive error", error);
  }
}
