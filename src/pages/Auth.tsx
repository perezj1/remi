// src/pages/Auth.tsx
import { useState, useEffect } from "react";
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
import { Sparkles, Mail, Lock } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
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
          navigate("/");
        } else {
          navigate("/");
        }
      }
    } catch (_error) {
      toast.error(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#ffffff]">
      {/* fondo suave con el color principal */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20 -z-10" />

      <Card className="w-full max-w-md relative shadow-card border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#8F31F3] flex items-center justify-center shadow-button">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="remi-btn-primary w-full shadow-button h-11 rounded-full bg-[#8F31F3] hover:bg-[#7a28d0]"
              disabled={loading}
            >
              {loading
                ? t("common.loading")
                : isLogin
                ? t("auth.submitLogin")
                : t("auth.submitRegister")}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[#8F31F3] hover:text-[#7a28d0] font-medium"
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
  );
};

export default Auth;
