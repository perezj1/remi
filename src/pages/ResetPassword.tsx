import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function hasRecoverySignal(): boolean {
  if (typeof window === "undefined") return false;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery" ||
    hashParams.has("access_token") ||
    searchParams.has("token_hash")
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<boolean>(() => hasRecoverySignal());

  const copy = useMemo(() => {
    if (lang === "de") {
      return {
        title: "Neues Passwort festlegen",
        subtitle:
          "Gib dein neues Passwort ein, um die Wiederherstellung abzuschließen.",
        passwordLabel: "Neues Passwort",
        confirmLabel: "Passwort bestätigen",
        confirmPlaceholder: "Passwort wiederholen",
        submit: "Passwort aktualisieren",
        back: "Zurück zur Anmeldung",
        mismatch: "Die Passwörter stimmen nicht überein.",
        success: "Passwort aktualisiert.",
        invalid:
          "Der Wiederherstellungslink ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
        hidePassword: "Passwort ausblenden",
        showPassword: "Passwort anzeigen",
      };
    }

    if (lang === "en") {
      return {
        title: "Set a new password",
        subtitle: "Enter your new password to complete account recovery.",
        passwordLabel: "New password",
        confirmLabel: "Confirm password",
        confirmPlaceholder: "Repeat your password",
        submit: "Update password",
        back: "Back to sign in",
        mismatch: "Passwords do not match.",
        success: "Password updated.",
        invalid:
          "This recovery link is invalid or expired. Please request a new reset email.",
        hidePassword: "Hide password",
        showPassword: "Show password",
      };
    }

    return {
      title: "Define tu nueva contraseña",
      subtitle: "Introduce la nueva contraseña para completar la recuperación.",
      passwordLabel: "Nueva contraseña",
      confirmLabel: "Confirmar contraseña",
      confirmPlaceholder: "Repite tu contraseña",
      submit: "Actualizar contraseña",
      back: "Volver a iniciar sesión",
      mismatch: "Las contraseñas no coinciden.",
      success: "Contraseña actualizada.",
      invalid:
        "Este enlace de recuperación es inválido o ha expirado. Pide uno nuevo.",
      hidePassword: "Ocultar contraseña",
      showPassword: "Mostrar contraseña",
    };
  }, [lang]);

  useEffect(() => {
    const sync = () => {
      if (hasRecoverySignal()) {
        setReady(true);
      }
    };

    sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    window.addEventListener("hashchange", sync);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!ready) {
        toast.error(copy.invalid);
        return;
      }

      if (password !== confirmPassword) {
        toast.error(copy.mismatch);
        return;
      }

      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(copy.success);
      window.history.replaceState({}, document.title, "/auth");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef2f9] p-4 text-slate-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_56px_rgba(15,23,42,0.16)]"
      >
        <h1 className="text-[22px] font-bold text-slate-900">{copy.title}</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{copy.subtitle}</p>

        {!ready && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            {copy.invalid}
          </p>
        )}

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="new-password" className="text-[13px] font-semibold text-slate-700">
            {copy.passwordLabel}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-2xl border-slate-200 bg-[#fbfbfe] pl-10 pr-10 text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400"
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <Label htmlFor="confirm-password" className="text-[13px] font-semibold text-slate-700">
            {copy.confirmLabel}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder={copy.confirmPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-2xl border-slate-200 bg-[#fbfbfe] pl-10 text-[15px]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !ready}
          className="mt-4 h-11 w-full rounded-full bg-[#7d59c9] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("common.loading") : copy.submit}
        </button>

        <Link
          to="/auth"
          className="mt-3 inline-block text-[12px] font-medium text-slate-600 underline underline-offset-2"
        >
          {copy.back}
        </Link>
      </form>
    </div>
  );
}
