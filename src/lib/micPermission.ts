export async function requestMicPermission(): Promise<{
  ok: boolean;
  reason?: "denied" | "not_supported" | "no_https" | "unknown";
}> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    return { ok: false, reason: "not_supported" };
  }

  // Nota: en http (no https) muchos navegadores fallan
  // No podemos detectarlo perfecto siempre, pero ayuda:
  const isSecure =
    window.isSecureContext || location.hostname === "localhost";

  if (!isSecure) {
    return { ok: false, reason: "no_https" };
  }

  try {
    // ✅ Esto dispara el popup del navegador si está en "preguntar"
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // ✅ Si solo querías pedir permiso, libera el micro enseguida
    stream.getTracks().forEach((t) => t.stop());

    return { ok: true };
  } catch {
    // Usuario canceló o estaba bloqueado
    return { ok: false, reason: "denied" };
  }
}
