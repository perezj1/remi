import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i=0;i<raw.length;i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function ensurePushSubscription(userId: string, locale: string, tz?: string) {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return { ok:false, reason:"unsupported" };
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok:false, reason:"denied" };

    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const json = (sub as any).toJSON();
    const { endpoint, keys } = json || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) return { ok:false, reason:"invalid" };

    const timezone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Zurich";

    const { error } = await supabase.from("push_subscriptions").upsert(
      { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, locale, tz: timezone },
      { onConflict: "user_id,endpoint" }
    );
    if (error) throw error;

    return { ok:true };
  } catch (e) {
    console.error("ensurePushSubscription", e);
    return { ok:false, reason:"exception" };
  }
}
