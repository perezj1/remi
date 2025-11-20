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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/registerPush";
import { useI18n } from "@/contexts/I18nContext";
import type { RemiLocale } from "@/locales";

const NOTIF_KEY = "remi_notifications";

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, updateAuthUser } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---- datos del usuario ----
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // ---- ajustes de la app ----
  const [preferredLanguage, setPreferredLanguage] =
    useState<RemiLocale>(lang);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ---- contraseña / guardado ----
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- avatar ----
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // mostrar
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // subir
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Cargar datos iniciales cuando cambian user o profile
  useEffect(() => {
    if (!user) return;

    // Nombre: primero perfil, luego metadata, luego email
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
        })
      );
    }

    // idioma: prioridad profiles.language → metadata.language
    const profileLang = (((profile as any)?.language ??
      meta.language ??
      null) as RemiLocale | null);

    if (profileLang) {
      setPreferredLanguage(profileLang);
      setLang(profileLang);
    }

    // notificaciones (primero local, luego settings en Supabase)
    if (typeof window !== "undefined") {
      const notif = window.localStorage.getItem(NOTIF_KEY);
      if (notif === "0") setNotificationsEnabled(false);
      if (notif === "1") setNotificationsEnabled(true);
    }

    (async () => {
      try {
        const { data } = await supabase
          .from("remi_user_settings")
          .select("notifications_enabled")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && data.notifications_enabled !== null) {
          setNotificationsEnabled(data.notifications_enabled);
        }
      } catch (err) {
        console.error("Error loading notification settings", err);
      }
    })();

    // avatar: ahora usamos principalmente la tabla profiles
    const avatarFromProfile = profile?.avatar_url || null;
    const metaAvatar = meta.avatar_url || null;

    setAvatarUrl(avatarFromProfile ?? metaAvatar);
    setAvatarFile(null);
    setAvatarError(null);
  }, [user, profile, setLang]);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RemiLocale;
    setPreferredLanguage(value); // estado de formulario
    setLang(value); // cambia idioma de la UI + localStorage
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
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

  // --- Avatar: elegir archivo y previsualizar ---
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
      // 1) si hay nuevo archivo, subirlo a Storage y obtener URL pública
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

      // 2) Actualizar perfil en la tabla public.profiles (nombre + avatar + idioma)
      await updateProfile({
        display_name: username,
        avatar_url: finalAvatarUrl,
        language: preferredLanguage,
      } as any);

      // 3) Actualizar email / contraseña en Auth
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

      // 4) guardar ajustes de notificaciones en remi_user_settings
      const { error: settingsError } = await supabase
        .from("remi_user_settings")
        .upsert(
          {
            user_id: user.id,
            notifications_enabled: notificationsEnabled,
            notify_day_before: true,
            notify_on_due_date: true,
            repeat_until_done: true,
            notification_hour_utc: 6, // ejemplo: 6:00 UTC
          },
          { onConflict: "user_id" }
        );

      if (settingsError) {
        console.error("Error saving notification settings", settingsError);
      }

      // 5) si las notificaciones están activadas, registrar suscripción push
      if (notificationsEnabled) {
        try {
          await registerPushSubscription(user.id);
        } catch (subErr) {
          console.error("Error registering push subscription", subErr);
        }
      }

      // 6) guardar preferencias locales (solo notificaciones; el idioma lo guarda el I18nProvider)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          NOTIF_KEY,
          notificationsEnabled ? "1" : "0"
        );
      }

      toast.success(t("profile.updateSuccess"));
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error(t("profile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    username || (user?.email ?? t("profile.defaultUserName"));
  const initial =
    !avatarUrl && displayName
      ? displayName.charAt(0).toUpperCase()
      : "R";

  return (
    <div className="remi-page flex flex-col">
      {/* HEADER CON GRADIENTE USANDO COLOR REMI (#7d59c9) */}
      <div
        style={{
          padding: "16px 20px 40px",
          background: "#7d59c9",
          color: "white",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-3 text-[13px]"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} />
          <span>{t("profile.back")}</span>
        </button>

        <div className="flex flex-col items-center gap-3">
          {/* AVATAR */}
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-[90px] h-[90px] rounded-full border-4 border-white/80 bg-white/10 shadow-xl flex items-center justify-center overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}
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
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
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
            <p className="text-[11px] text-red-100 mt-1">{avatarError}</p>
          )}

          <div className="text-center">
            <div className="text-[17px] font-semibold leading-tight">
              {displayName}
            </div>
            {memberSince && (
              <div className="text-[11px] opacity-90">
                {t("profile.memberSince", { date: memberSince })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="px-5 pb-24" style={{ marginTop: -20 }}>
        <div className="space-y-4">
          {/* TARJETA INFORMACIÓN DE USUARIO */}
          <section
            className="bg-white rounded-2xl shadow-md"
            style={{ padding: "14px 14px 14px" }}
          >
            <h2 className="text-sm font-semibold mb-1">
              {t("profile.sectionUserTitle")}
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
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
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
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
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
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
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
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
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none appearance-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  >
                    <option value="es">
                      {t("profile.languageSpanish")}
                    </option>
                    <option value="en">
                      {t("profile.languageEnglish")}
                    </option>
                    <option value="de">
                      {t("profile.languageGerman")}
                    </option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              {/* <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <div className="font-medium">
                    {t("profile.notificationsLabel")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t("profile.notificationsDescription")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition ${
                    notificationsEnabled ? "bg-violet-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition ${
                      notificationsEnabled
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div> */}

              {/* BOTÓN GUARDAR */}
              <button
                type="submit"
                disabled={saving}
                className="mt-3 w-full rounded-full bg-[#7d59c9] text-white text-xs font-semibold py-2.5 shadow-md active:translate-y-[1px] disabled:opacity-70"
              >
                {saving ? t("profile.saving") : t("profile.saveChanges")}
              </button>
            </form>
          </section>

          {/* TARJETA: ACCIONES DE CUENTA */}
          <section
            className="bg-white rounded-2xl shadow-md"
            style={{ padding: "14px 14px 10px" }}
          >
            <h2 className="text-sm font-semibold mb-1">
              {t("profile.sectionAccountTitle")}
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              {t("profile.sectionAccountDescription")}
            </p>

            <button
              type="button"
              onClick={handleShareApp}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-violet-200 text-violet-600 text-xs py-2.5 mb-2 shadow-sm hover:bg-violet-50 transition"
            >
              <Share2 size={14} />
              <span>{t("profile.shareButton")}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500 text-white text-xs py-2.5 shadow-md hover:bg-red-600 transition active:translate-y-[1px]"
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
