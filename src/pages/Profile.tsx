// src/pages/Profile.tsx
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  LogOut,
  Mail,
  User as UserIcon,
  Lock,
  Globe2,
  Camera,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/registerPush";
import { useI18n } from "@/contexts/I18nContext";
import type { RemiLocale } from "@/locales";

type DevicePushStatus =
  | "unsupported"
  | "denied"
  | "needs_permission"
  | "needs_register"
  | "paused"
  | "active";

function ToggleSwitch(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const { checked, onChange, disabled, ariaLabel } = props;

  const onBg = "#EAFBF4"; // como tu imagen
  const onBorder = "#34D399";
  const onKnob = "#10B981";

  const offBg = "#E8EDF3";
  const offBorder = "#CBD5E1";
  const offKnob = "#FFFFFF";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="relative inline-flex h-[28px] w-[52px] items-center rounded-full border transition disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: checked ? onBg : offBg,
        borderColor: checked ? onBorder : offBorder,
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}
    >
      <span
        className="absolute h-[24px] w-[24px] rounded-full transition"
        style={{
          left: checked ? "24px" : "2px",
          background: checked ? onKnob : offKnob,
          boxShadow: checked
            ? "0 3px 10px rgba(16,185,129,0.25)"
            : "0 3px 10px rgba(15,23,42,0.12)",
        }}
      />
    </button>
  );
}

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, updateAuthUser } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeT = (key: string, fallback: string, vars?: Record<string, any>) => {
    const v = t(key as any, vars as any);
    if (!v || v === key) return fallback;
    return v;
  };

  // ---- datos del usuario ----
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // ---- ajustes ----
  const [preferredLanguage, setPreferredLanguage] = useState<RemiLocale>(lang);

  // ---- push por dispositivo (multi-dispositivo) ----
  const [devicePushStatus, setDevicePushStatus] =
    useState<DevicePushStatus>("unsupported");
  const [checkingDevicePush, setCheckingDevicePush] = useState(false);
  const [registeringDevicePush, setRegisteringDevicePush] = useState(false);

  // ---- contraseña / guardado ----
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- avatar ----
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const hasPushSupport = () => {
    if (typeof window === "undefined") return false;
    const hasNotif = "Notification" in window;
    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    return !!(hasNotif && hasSW && hasPush);
  };

  // ✅ Check REAL de push en ESTE dispositivo (y estado en DB por endpoint)
  const checkDevicePush = async (uid: string) => {
    if (typeof window === "undefined") {
      setDevicePushStatus("unsupported");
      return;
    }

    if (!hasPushSupport()) {
      setDevicePushStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setDevicePushStatus("denied");
      return;
    }

    if (Notification.permission !== "granted") {
      setDevicePushStatus("needs_permission");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (!sub) {
        setDevicePushStatus("needs_register");
        return;
      }

      const endpoint = sub.endpoint;

      const { data, error } = await supabase
        .from("remi_push_subscriptions")
        .select("id, status")
        .eq("user_id", uid)
        .eq("endpoint", endpoint)
        .maybeSingle();

      if (error) {
        console.error("Error checking device push in DB", error);
        setDevicePushStatus("needs_register");
        return;
      }

      if (data?.id) {
        if (data.status === "ACTIVE") return setDevicePushStatus("active");
        if (data.status === "PAUSED") return setDevicePushStatus("paused");
        // INACTIVE u otro
        return setDevicePushStatus("needs_register");
      }

      // Permiso granted + sub local existe, pero falta en DB => auto-registrar
      try {
        await registerPushSubscription(uid);
        setDevicePushStatus("active");
      } catch (e) {
        console.error("Auto-register device push failed", e);
        setDevicePushStatus("needs_register");
      }
    } catch (e) {
      console.error("Unexpected push check error", e);
      setDevicePushStatus("needs_register");
    }
  };

  // ✅ PAUSAR push en ESTE dispositivo (status=PAUSED en DB)
  const pausePushOnThisDevice = async (uid: string) => {
    if (typeof window === "undefined") return;

    if (!hasPushSupport()) {
      setDevicePushStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setDevicePushStatus("denied");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (!sub) {
        setDevicePushStatus("needs_register");
        return;
      }

      const endpoint = sub.endpoint;
      const json = sub.toJSON() as any;
      const p256dh = json?.keys?.p256dh ?? "";
      const auth = json?.keys?.auth ?? "";

      const { error } = await supabase
        .from("remi_push_subscriptions")
        .upsert(
          {
            user_id: uid,
            endpoint,
            p256dh,
            auth,
            user_agent:
              typeof navigator !== "undefined" ? navigator.userAgent : null,
            status: "PAUSED",
          },
          { onConflict: "user_id,endpoint" },
        );

      if (error) {
        console.error("Error pausing device push", error);
      }

      setDevicePushStatus("paused");
    } catch (e) {
      console.error("Unexpected pause push error", e);
      setDevicePushStatus("paused");
    }
  };

  // ✅ activar push en ESTE dispositivo (status=ACTIVE) via registerPushSubscription
  const handleEnablePushOnThisDevice = async () => {
    if (!user) return;
    setRegisteringDevicePush(true);
    try {
      await registerPushSubscription(user.id);
      toast.success(
        safeT(
          "profile.pushDeviceEnabled",
          "Notificaciones activadas en este dispositivo",
        ),
      );
      await checkDevicePush(user.id);
    } catch (e) {
      console.error("Error enabling push on this device", e);
      toast.error(
        safeT(
          "profile.pushDeviceEnableError",
          "No se pudieron activar notificaciones en este dispositivo",
        ),
      );
      await checkDevicePush(user.id);
    } finally {
      setRegisteringDevicePush(false);
    }
  };

  // ✅ toggle del dispositivo (ACTIVE <-> PAUSED)
  const handleToggleDevicePush = async (nextOn: boolean) => {
    if (!user) return;

    if (nextOn) {
      if (!hasPushSupport()) {
        toast.error(
          safeT(
            "profile.devicePushUnsupportedToast",
            "Este dispositivo/navegador no soporta push.",
          ),
        );
        setDevicePushStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        toast.error(
          safeT(
            "profile.devicePushDeniedToast",
            "Permiso denegado en este dispositivo (Ajustes del navegador).",
          ),
        );
        setDevicePushStatus("denied");
        return;
      }
      await handleEnablePushOnThisDevice();
      return;
    }

    setRegisteringDevicePush(true);
    try {
      await pausePushOnThisDevice(user.id);
      toast.success(
        safeT(
          "profile.devicePushPaused",
          "Notificaciones pausadas en este dispositivo",
        ),
      );
    } catch (e) {
      console.error("Error pausing push on this device", e);
      toast.error(
        safeT(
          "profile.devicePushPauseError",
          "No se pudieron pausar las notificaciones en este dispositivo",
        ),
      );
      try {
        await checkDevicePush(user.id);
      } catch {}
    } finally {
      setRegisteringDevicePush(false);
    }
  };

  // Cargar datos iniciales cuando cambian user o profile
  useEffect(() => {
    if (!user) return;

    const meta = (user.user_metadata || {}) as {
      username?: string;
      language?: RemiLocale;
      avatar_url?: string;
    };

    const baseUsername =
      profile?.display_name ||
      (meta.username && meta.username.trim() !== ""
        ? meta.username
        : user.email
          ? user.email.split("@")[0]
          : "");

    setUsername(baseUsername);
    setEmail(user.email ?? "");

    if (user.created_at) {
      const d = new Date(user.created_at);
      setMemberSince(
        d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
      );
    }

    // idioma
    const profileLang = (((profile as any)?.language ??
      meta.language ??
      null) as RemiLocale | null);

    if (profileLang) {
      setPreferredLanguage(profileLang);
      setLang(profileLang);
    }

    // avatar
    const avatarFromProfile = profile?.avatar_url || null;
    const metaAvatar = meta.avatar_url || null;

    setAvatarUrl(avatarFromProfile ?? metaAvatar);
    setAvatarFile(null);
    setAvatarError(null);

    // ✅ asegurar que global está "siempre activado" para que la Edge Function no excluya al usuario
    // (upsert mínimo: no toca otras columnas)
    (async () => {
      try {
        await supabase
          .from("remi_user_settings")
          .upsert(
            { user_id: user.id, notifications_enabled: true },
            { onConflict: "user_id" },
          );
      } catch (e) {
        console.error("Error ensuring notifications_enabled=true", e);
      }
    })();

    // ✅ push por dispositivo
    (async () => {
      setCheckingDevicePush(true);
      try {
        await checkDevicePush(user.id);
      } finally {
        setCheckingDevicePush(false);
      }
    })();
  }, [user, profile, setLang]);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RemiLocale;
    setPreferredLanguage(value);
    setLang(value);
  };

  const handleShareApp = async () => {
    const url = window.location.origin;
    const text = t("profile.shareText");

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(t("profile.shareCopied"));
      } else {
        alert(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (e) {
      console.error(e);
      toast.error(t("profile.logoutError"));
    }
  };

  // Avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t("profile.avatarTooBig"));
      return;
    }

    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      let finalAvatarUrl: string | null = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop() || "png";
        const path = `${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError || !uploadData) {
          console.error("Upload error", uploadError);
          setAvatarError(t("profile.avatarUploadError"));
          setSaving(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        finalAvatarUrl = publicData.publicUrl;
        setAvatarUrl(finalAvatarUrl);
        setAvatarFile(null);
      }

      // profiles
      await updateProfile({
        display_name: username,
        avatar_url: finalAvatarUrl,
        language: preferredLanguage,
      } as any);

      // Auth updates
      const authUpdates: { email?: string; password?: string } = {};

      if (email && email !== user.email) {
        authUpdates.email = email;
      }

      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          toast.error(t("profile.passwordTooShort"));
          setSaving(false);
          return;
        }
        authUpdates.password = newPassword.trim();
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await updateAuthUser(authUpdates);
        if (authError) {
          toast.error(t("profile.authUpdateError"));
          setSaving(false);
          return;
        }
      }

      // ✅ asegurar de nuevo global ON (por si acaso)
      await supabase
        .from("remi_user_settings")
        .upsert(
          { user_id: user.id, notifications_enabled: true },
          { onConflict: "user_id" },
        );

      toast.success(t("profile.updateSuccess"));
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error(t("profile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const displayName = username || (user?.email ?? t("profile.defaultUserName"));
  const initial =
    !avatarUrl && displayName ? displayName.charAt(0).toUpperCase() : "R";

  const devicePushLine = (() => {
    if (checkingDevicePush) return t("profile.devicePushChecking");
    if (devicePushStatus === "unsupported")
      return t("profile.devicePushUnsupportedLine");
    if (devicePushStatus === "denied") return t("profile.devicePushDeniedLine");
    if (devicePushStatus === "needs_permission")
      return t("profile.devicePushNeedsPermissionLine");
    if (devicePushStatus === "needs_register")
      return t("profile.devicePushNeedsRegisterLine");
    if (devicePushStatus === "paused")
      return safeT(
        "profile.devicePushPausedLine",
        "Pausadas en este dispositivo.",
      );
    return t("profile.devicePushActiveLine");
  })();

  const deviceToggleChecked = devicePushStatus === "active";
  const deviceToggleDisabled =
    checkingDevicePush ||
    registeringDevicePush ||
    !user ||
    devicePushStatus === "unsupported" ||
    devicePushStatus === "denied" ||
    devicePushStatus === "needs_permission";

  return (
    <div
      className="remi-page text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f8f7fb 0%, #ffffff 42%, #ffffff 100%)",
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "calc(10px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          border: "1px solid #ebe7f8",
          boxShadow: "0 8px 22px rgba(125,89,201,0.10)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "999px",
            background: "#7d59c91c",
            top: -90,
            left: -60,
            filter: "blur(1px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "999px",
            background: "#59a5c920",
            top: -110,
            right: -70,
            filter: "blur(1px)",
            pointerEvents: "none",
          }}
        />
        <div className="mx-auto w-full" style={{ maxWidth: "min(96vw, 1440px)" }}>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/");
            }}
            className="flex items-center gap-1 mb-2 text-[13px] text-slate-700"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <ArrowLeft size={16} />
          </button>

        <div className="flex flex-col items-center gap-3 mt-1">
          {/* AVATAR */}
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-[90px] h-[90px] rounded-full border-4 border-[#d8cdf8] bg-white shadow-[0_10px_24px_rgba(125,89,201,0.16)] flex items-center justify-center overflow-hidden"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">{initial}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#f5f2ff] shadow-md flex items-center justify-center"
            >
              <Camera size={14} className="text-violet-500" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {avatarError && (
            <p className="text-[11px] text-red-500 mt-1">{avatarError}</p>
          )}

          <div className="text-center">
            <div className="font-extrabold leading-tight text-slate-900" style={{ fontSize: "clamp(28px, 2vw, 42px)" }}>
              {displayName}
            </div>
            {memberSince && (
              <div className="text-slate-500 mt-0.5" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
                {t("profile.memberSince", { date: memberSince })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div
        style={{
          padding: "0 16px",
          marginTop: 14,
          marginBottom: 10,
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "min(96vw, 1440px)",
        }}
      >
        <div className="space-y-4">
          <section
            className="rounded-3xl border border-slate-200 bg-slate-50/80"
            style={{ padding: "clamp(14px, 1vw, 24px)" }}
          >
            <h2 className="font-semibold mb-1" style={{ fontSize: "clamp(17px, 1.1vw, 24px)" }}>
              {t("profile.sectionUserTitle")}
            </h2>
            <p className="text-slate-500 mb-3" style={{ fontSize: "clamp(13px, 0.85vw, 17px)" }}>
              {t("profile.sectionUserDescription")}
            </p>

            <form className="space-y-3" onSubmit={handleSave}>
              {/* USERNAME */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <UserIcon size={13} />
                  {t("profile.usernameLabel")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("profile.usernamePlaceholder")}
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition md:py-3 md:text-sm"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Mail size={13} />
                  {t("profile.emailLabel")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("profile.emailPlaceholder")}
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition md:py-3 md:text-sm"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Lock size={13} />
                  {t("profile.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("profile.passwordPlaceholder")}
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition md:py-3 md:text-sm"
                  />
                </div>
              </div>

              {/* LANGUAGE */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Globe2 size={13} />
                  {t("profile.languageLabel")}
                </label>
                <div className="relative">
                  <select
                    value={preferredLanguage}
                    onChange={handleLanguageChange}
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none appearance-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition md:py-3 md:text-sm"
                  >
                    <option value="es">{t("profile.languageSpanish")}</option>
                    <option value="en">{t("profile.languageEnglish")}</option>
                    <option value="de">{t("profile.languageGerman")}</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
              </div>

              {/* ✅ SOLO: NOTIFICACIONES POR DISPOSITIVO (ACTIVE/PAUSED) */}
              <div className="pt-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-medium flex items-center gap-1">
                      <Bell size={13} />
                      {safeT(
                        "profile.devicePushTitle",
                        "Notificaciones en este dispositivo",
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {devicePushLine}
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={deviceToggleChecked}
                    onChange={(next) => handleToggleDevicePush(next)}
                    disabled={deviceToggleDisabled}
                    ariaLabel={safeT(
                      "profile.devicePushToggleAria",
                      "Activar o pausar notificaciones en este dispositivo",
                    )}
                  />
                </div>

                {/* hints */}
                {(devicePushStatus === "denied" ||
                  devicePushStatus === "unsupported" ||
                  devicePushStatus === "needs_permission") && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    {devicePushStatus === "denied"
                      ? safeT(
                          "profile.devicePushDeniedHint",
                          "Si quieres activarlas: Ajustes del navegador → Notificaciones → permitir.",
                        )
                      : devicePushStatus === "needs_permission"
                        ? safeT(
                            "profile.devicePushNeedsPermissionHint",
                            "Concede permiso de notificaciones para poder activarlas.",
                          )
                        : safeT(
                            "profile.devicePushUnsupportedHint",
                            "Prueba desde Chrome/Edge/Firefox o instala la PWA.",
                          )}
                  </div>
                )}
              </div>

              {/* BOTÓN GUARDAR */}
              <button
                type="submit"
                disabled={saving}
                className="mt-3 w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md active:translate-y-[1px] disabled:opacity-70 md:py-3 md:text-sm"
              >
                {saving ? t("profile.saving") : t("profile.saveChanges")}
              </button>
            </form>
          </section>

          {/* TARJETA: ACCIONES DE CUENTA */}
          <section
            className="rounded-3xl border border-slate-200 bg-slate-50/80"
            style={{ padding: "clamp(14px, 1vw, 24px)" }}
          >
            <h2 className="font-semibold mb-1" style={{ fontSize: "clamp(17px, 1.1vw, 24px)" }}>
              {t("profile.sectionAccountTitle")}
            </h2>
            <p className="text-slate-500 mb-3" style={{ fontSize: "clamp(13px, 0.85vw, 17px)" }}>
              {t("profile.sectionAccountDescription")}
            </p>

            <button
              type="button"
              onClick={handleShareApp}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-violet-200 text-violet-600 text-xs py-2.5 mb-2 shadow-sm hover:bg-violet-50 transition md:py-3 md:text-sm"
            >
              <Share2 size={14} />
              <span>{t("profile.shareButton")}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500 text-white text-xs py-2.5 shadow-md hover:bg-red-600 transition active:translate-y-[1px] md:py-3 md:text-sm"
            >
              <LogOut size={14} />
              <span>{t("profile.logoutButton")}</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
