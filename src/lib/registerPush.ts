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

  // Esperamos a que el SW esté listo
  const registration = await navigator.serviceWorker.ready;
  console.log("CLIENT VAPID_PUBLIC_KEY =>", VAPID_PUBLIC_KEY);

  // Si ya hay suscripción, la reutilizamos
  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
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
        status: "ACTIVE",   // 👈 importante
      },
      {
        // IMPORTANT: solo columnas que existen en la tabla
        onConflict: "user_id,endpoint",
      }
    );

  if (error) {
    console.error("Error saving push subscription", error);
    throw error;
  }
}
