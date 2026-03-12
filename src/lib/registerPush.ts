// src/lib/registerPush.ts
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

// Convierte la VAPID key (base64 url-safe) a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function keepSingleActiveSubscriptionPerDevice(userId: string, endpoint: string) {
  const currentUserAgent = navigator.userAgent;
  const { error } = await supabase
    .from("remi_push_subscriptions")
    .update({ status: "INACTIVE" })
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .eq("user_agent", currentUserAgent)
    .neq("endpoint", endpoint);

  if (error) {
    console.error("Error cleaning stale device push subscriptions", error);
  }
}

export async function registerPushSubscription(userId: string) {
  if (!userId) {
    console.warn("No hay userId para registrar la suscripción push");
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push no soportado en este navegador");
    return;
  }

  // Pedimos permiso solo si aún está en "default"
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    console.warn("Permiso de notificaciones denegado");
    return;
  }

  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.trim().length < 32) {
    throw new Error("Missing or invalid VITE_VAPID_PUBLIC_KEY");
  }

  // Esperamos a que el SW esté listo
  const registration = await navigator.serviceWorker.ready;

  try {
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY.trim());

    // Si ya hay suscripción, la reutilizamos.
    // Si está rota o asociada a otra configuración, la rehacemos.
    let sub = await registration.pushManager.getSubscription();
    if (!sub) {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    } else if (!sub.endpoint) {
      await sub.unsubscribe().catch(() => undefined);
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const raw = sub.toJSON();
    const endpoint = sub.endpoint;
    const p256dh = raw.keys?.p256dh ?? null;
    const auth = raw.keys?.auth ?? null;

    const { error } = await supabase
      .from("remi_push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
          status: "ACTIVE",
        },
        {
          // ahora cuadra con el índice UNIQUE que sí quieres mantener
          onConflict: "user_id,endpoint",
        }
      );

    if (error) {
      console.error("Error saving push subscription", error);
      throw error;
    }

    await keepSingleActiveSubscriptionPerDevice(userId, endpoint);
  } catch (err) {
    // Recuperación ante suscripción inválida/obsoleta: limpiar y reintentar 1 vez.
    try {
      const stale = await registration.pushManager.getSubscription();
      if (stale) {
        await stale.unsubscribe().catch(() => undefined);
      }
      const retryKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY.trim());
      const retried = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: retryKey,
      });

      const raw = retried.toJSON();
      const { error } = await supabase.from("remi_push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: retried.endpoint,
          p256dh: raw.keys?.p256dh ?? null,
          auth: raw.keys?.auth ?? null,
          user_agent: navigator.userAgent,
          status: "ACTIVE",
        },
        { onConflict: "user_id,endpoint" },
      );
      if (error) throw error;
      await keepSingleActiveSubscriptionPerDevice(userId, retried.endpoint);
      return;
    } catch (retryErr) {
      console.error("Error registering push subscription", retryErr);
      throw retryErr;
    }
  }
}
