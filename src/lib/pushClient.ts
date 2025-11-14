// src/lib/pushClient.ts
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

// Convierte la clave VAPID (base64 URL) a Uint8Array para subscribe()
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Serializa las claves p256dh / auth de la suscripción
function keyToBase64(sub: PushSubscription, name: "p256dh" | "auth"): string {
  const key = sub.getKey(name);
  if (!key) return "";
  const buff = new Uint8Array(key);
  let str = "";
  for (let i = 0; i < buff.length; i++) {
    str += String.fromCharCode(buff[i]);
  }
  return btoa(str);
}

// Activar notificaciones para un usuario
export async function enablePushForUser(userId: string) {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker no soportado");
  }
  if (!("PushManager" in window)) {
    throw new Error("Push API no soportada");
  }

  // 1) Pedir permiso
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones no concedido");
  }

  // 2) Esperar a que el SW esté listo
  const reg = await navigator.serviceWorker.ready;

  // 3) Comprobar si ya hay suscripción
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
    });
  }

  // 4) Guardar/actualizar en Supabase
  const payload = {
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: keyToBase64(sub, "p256dh"),
    auth: keyToBase64(sub, "auth"),
    user_agent: navigator.userAgent,
  };

  const { error } = await supabase
    .from("remi_push_subscriptions")
    .upsert(payload, { onConflict: "user_id" }); // 1 fila por usuario

  if (error) {
    console.error("Error guardando suscripción", error);
    throw error;
  }
}

// Desactivar notificaciones (opcional)
export async function disablePushForUser(userId: string) {
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
    }
  }

  // Eliminar de Supabase
  const { error } = await supabase
    .from("remi_push_subscriptions")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error eliminando suscripción", error);
    throw error;
  }
}
