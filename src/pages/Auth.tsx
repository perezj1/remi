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
import { Mail, Lock } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/"); // REMI empieza en "/"
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Franja morada superior con el icono de Remi */}
      <div className="relative flex flex-col items-center justify-center bg-[#7d59c9] text-white rounded-b-[40px] pt-8 pb-8 px-6 overflow-hidden">
        {/* Icono Remi flotando (sin círculo blanco) */}
        <div className="flex flex-col items-center mb-3">
          <img
            src="/icons/icon-192.png"
            alt="Remi"
            className="h-20 w-20"
          />
          <div className="h-2 w-12 rounded-full bg-black/35 opacity-50 blur-[2px]" />
        </div>

        <span className="text-2xl font-bold tracking-tight">Remi</span>
        <span className="mt-2 text-sm text-white/90 text-center max-w-xs">
          {t("auth.subtitleAuth2")}
        </span>
      </div>

      {/* Card colocada debajo de la franja morada, sin solaparse */}
      <div className="flex-1 flex items-start justify-center px-4">
        <Card className="w-full max-w-md mt-5 rounded-3xl shadow-xl border-0">
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
                    className="pl-10 h-11"
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
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="remi-btn-primary w-full h-11 rounded-full bg-[#7d59c9] hover:bg-[#7a28d0] border-0 text-white"
                style={{ boxShadow: "0 4px 10px rgba(15, 23, 42, 0.25)" }}
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
                  className="font-medium text-[#7d59c9] hover:text-[#7a28d0]"
                >
                  {isLogin
                    ? t("auth.toggleToRegister")
                    : t("auth.toggleToLogin")}
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
