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

const LANGUAGE_KEY = "remi_language";
const NOTIF_KEY = "remi_notifications";
const AVATAR_KEY = "remi_avatar";

type RemiLang = "es" | "en" | "de";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---- datos del usuario ----
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // ---- ajustes de la app ----
  const [preferredLanguage, setPreferredLanguage] =
    useState<RemiLang>("es");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ---- contraseña / guardado ----
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- avatar ----
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!user) return;

    const meta = (user.user_metadata || {}) as {
      username?: string;
      language?: RemiLang;
      avatar_url?: string;
    };

    const baseUsername =
      meta.username && meta.username.trim() !== ""
        ? meta.username
        : user.email
        ? user.email.split("@")[0]
        : "";

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

    // idioma
    const storedLangMeta = meta.language;
    const storedLangLocal =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(LANGUAGE_KEY) as RemiLang | null)
        : null;

    const finalLang: RemiLang = storedLangMeta || storedLangLocal || "es";
    setPreferredLanguage(finalLang);

    // notificaciones
    if (typeof window !== "undefined") {
      const notif = window.localStorage.getItem(NOTIF_KEY);
      if (notif === "0") setNotificationsEnabled(false);
      if (notif === "1") setNotificationsEnabled(true);
    }

    // avatar
    let metaAvatar = meta.avatar_url;
    if (!metaAvatar && typeof window !== "undefined") {
      metaAvatar = window.localStorage.getItem(AVATAR_KEY) || undefined;
    }
    if (metaAvatar) setAvatarUrl(metaAvatar);
  }, [user]);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RemiLang;
    setPreferredLanguage(value);
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const handleShareApp = async () => {
    const url = window.location.origin;
    const text = "Estoy usando REMI para organizar mis tareas diarias 🚀";

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace de REMI copiado al portapapeles");
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
      toast.error("No se pudo cerrar sesión. Intenta de nuevo.");
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

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("La imagen debe pesar menos de 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const updatePayload: {
        email?: string;
        password?: string;
        data: {
          username: string;
          language: RemiLang;
          avatar_url: string | null;
        };
      } = {
        data: {
          username,
          language: preferredLanguage,
          avatar_url: avatarUrl,
        },
      };

      if (email && email !== user.email) {
        updatePayload.email = email;
      }

      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
          setSaving(false);
          return;
        }
        updatePayload.password = newPassword.trim();
      }

      const { error } = await supabase.auth.updateUser(updatePayload);
      if (error) {
        console.error(error);
        toast.error(error.message);
      } else {
        // guardar preferencias locales
        window.localStorage.setItem(LANGUAGE_KEY, preferredLanguage);
        window.localStorage.setItem(
          NOTIF_KEY,
          notificationsEnabled ? "1" : "0"
        );
        if (avatarUrl) {
          window.localStorage.setItem(AVATAR_KEY, avatarUrl);
        }
        toast.success("Perfil actualizado correctamente.");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = username || (user?.email ?? "Usuario");
  const initial =
    !avatarUrl && displayName ? displayName.charAt(0).toUpperCase() : "R";

  return (
    <div className="remi-page flex flex-col">
      {/* HEADER CON GRADIENTE USANDO COLOR REMI (#8F31F3) */}
      <div
        style={{
          padding: "16px 20px 40px",
          background:
            "linear-gradient(#8F31F3)",
          color: "white",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-3 text-[13px]"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={16} />
          <span>Perfil</span>
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
                Miembro desde {memberSince}
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
            <h2 className="text-sm font-semibold mb-1">User information</h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Edita tus datos básicos y cómo se muestra REMI.
            </p>

            <form className="space-y-3" onSubmit={handleSave}>
              {/* USERNAME */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <UserIcon size={13} />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu nombre en REMI"
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Mail size={13} />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Lock size={13} />
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Déjalo vacío si no quieres cambiarla"
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              {/* LANGUAGE */}
              <div className="space-y-1 text-xs">
                <label className="font-medium flex items-center gap-1">
                  <Globe2 size={13} />
                  Language
                </label>
                <div className="relative">
                  <select
                    value={preferredLanguage}
                    onChange={handleLanguageChange}
                    className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs outline-none appearance-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  >
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 German</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <div className="font-medium">Notifications</div>
                  <div className="text-[11px] text-slate-500">
                    Recordatorios para tareas importantes.
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
                      notificationsEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* BOTÓN GUARDAR */}
              <button
                type="submit"
                disabled={saving}
                className="mt-3 w-full rounded-full bg-[#8F31F3] text-white text-xs font-semibold py-2.5 shadow-md active:translate-y-[1px] disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </section>

          {/* TARJETA: ACCIONES DE CUENTA */}
          <section
            className="bg-white rounded-2xl shadow-md"
            style={{ padding: "14px 14px 10px" }}
          >
            <h2 className="text-sm font-semibold mb-1">Account actions</h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Comparte REMI o cierra sesión en este dispositivo.
            </p>

            <button
              type="button"
              onClick={handleShareApp}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-violet-200 text-violet-600 text-xs py-2.5 mb-2 shadow-sm hover:bg-violet-50 transition"
            >
              <Share2 size={14} />
              <span>Share app</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500 text-white text-xs py-2.5 shadow-md hover:bg-red-600 transition active:translate-y-[1px]"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
