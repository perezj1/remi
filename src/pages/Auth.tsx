// src/pages/Auth.tsx
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error(t("auth.errorInvalidCredentials"));
        } else if (error.message.includes("User already registered")) {
          toast.error(t("auth.errorUserAlreadyRegistered"));
        } else {
          toast.error(error.message);
        }
      } else {
        if (!isLogin) {
          toast.success(t("auth.signUpSuccess"));
        }
        navigate("/");
      }
    } catch (_error) {
      toast.error(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #f8f7fb 0%, #ffffff 42%, #ffffff 100%)",
      }}
    >
      <div className="px-4 pt-6 pb-3">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-violet-100 bg-white/95 px-5 py-5 shadow-[0_12px_28px_rgba(125,89,201,0.10)]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full border border-violet-200 bg-violet-50 flex items-center justify-center shadow-[0_6px_16px_rgba(125,89,201,0.12)]">
              <img src="/icons/icon-192.png" alt="Remi" className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[22px] leading-tight font-extrabold text-slate-900">Remi</p>
              <p className="text-[13px] text-slate-500 leading-snug">{t("auth.subtitleAuth2")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-6">
        <Card className="w-full max-w-md mt-2 rounded-3xl border border-violet-100 bg-white/95 shadow-[0_14px_30px_rgba(125,89,201,0.10)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("auth.emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-2xl border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("auth.passwordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 h-11 rounded-2xl border-slate-200 bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-slate-100"
                    aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="remi-btn-primary w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 border-0 text-white"
                style={{ boxShadow: "0 8px 20px rgba(124, 58, 237, 0.22)" }}
                disabled={loading}
              >
                {loading
                  ? t("common.loading")
                  : isLogin
                    ? t("auth.submitLogin")
                    : t("auth.submitRegister")}
              </Button>

              <div className="pt-1 text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-violet-700 hover:text-violet-800"
                >
                  {isLogin ? t("auth.toggleToRegister") : t("auth.toggleToLogin")}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
