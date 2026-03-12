// src/pages/Auth.tsx
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

type SlideItem = {
  title: string;
  subtitle: string;
  description: string;
  examplesText?: string;
  emoji: string;
  accent: string;
  useLogo?: boolean;
};

type AuthView = "login" | "register" | "forgot" | "reset";

function hasRecoveryHash(): boolean {
  if (typeof window === "undefined") return false;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery" ||
    searchParams.has("token_hash")
  );
}

function getSafeRedirect(raw: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

const Auth = () => {
  const [authView, setAuthView] = useState<AuthView>(() =>
    hasRecoveryHash() ? "reset" : "login"
  );
  const [sheetOpen, setSheetOpen] = useState<boolean>(() => hasRecoveryHash());
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(() => hasRecoveryHash());
  const { signUp, signIn, requestPasswordReset, updatePassword, user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const redirectPath = getSafeRedirect(new URLSearchParams(location.search).get("redirect"));
  const isLogin = authView === "login";
  const isRegister = authView === "register";
  const isForgot = authView === "forgot";
  const authCopy =
    lang === "de"
      ? {
          forgotCta: "Passwort vergessen?",
          forgotTitle: "Passwort zurücksetzen",
          forgotHelp: "Wir senden dir einen Link per E-Mail, um dein Passwort zu ändern.",
          forgotSubmit: "Wiederherstellungslink senden",
          forgotSuccess:
            "Wenn diese E-Mail existiert, haben wir einen Wiederherstellungslink gesendet.",
          forgotError: "Wiederherstellungs-E-Mail konnte nicht gesendet werden.",
          backToLogin: "Zurück zur Anmeldung",
          resetTitle: "Neues Passwort festlegen",
          resetHelp: "Gib dein neues Passwort ein, um die Wiederherstellung abzuschließen.",
          resetPasswordLabel: "Neues Passwort",
          resetConfirmLabel: "Passwort bestätigen",
          resetConfirmPlaceholder: "Passwort wiederholen",
          resetSubmit: "Passwort aktualisieren",
          resetSuccess: "Passwort aktualisiert. Du bist nun eingeloggt.",
          resetError: "Passwort konnte nicht aktualisiert werden.",
          resetMismatch: "Die Passwörter stimmen nicht überein.",
          hidePassword: "Passwort ausblenden",
          showPassword: "Passwort anzeigen",
        }
      : lang === "en"
        ? {
            forgotCta: "Forgot password?",
            forgotTitle: "Reset password",
            forgotHelp: "We'll send you an email with a link to change your password.",
            forgotSubmit: "Send reset link",
            forgotSuccess: "If that email exists, we sent a reset link.",
            forgotError: "Couldn't send the reset email.",
            backToLogin: "Back to sign in",
            resetTitle: "Set a new password",
            resetHelp: "Enter your new password to finish recovery.",
            resetPasswordLabel: "New password",
            resetConfirmLabel: "Confirm password",
            resetConfirmPlaceholder: "Repeat your password",
            resetSubmit: "Update password",
            resetSuccess: "Password updated. You're now signed in.",
            resetError: "Couldn't update your password.",
            resetMismatch: "Passwords do not match.",
            hidePassword: "Hide password",
            showPassword: "Show password",
          }
        : {
            forgotCta: "¿Olvidaste tu contraseña?",
            forgotTitle: "Recuperar contraseña",
            forgotHelp: "Te enviaremos un enlace por email para cambiar tu contraseña.",
            forgotSubmit: "Enviar enlace de recuperación",
            forgotSuccess: "Si el email existe, enviamos el enlace de recuperación.",
            forgotError: "No se pudo enviar el email de recuperación.",
            backToLogin: "Volver a iniciar sesión",
            resetTitle: "Define tu nueva contraseña",
            resetHelp: "Introduce la nueva contraseña para completar la recuperación.",
            resetPasswordLabel: "Nueva contraseña",
            resetConfirmLabel: "Confirmar contraseña",
            resetConfirmPlaceholder: "Repite tu contraseña",
            resetSubmit: "Actualizar contraseña",
            resetSuccess: "Contraseña actualizada. Ya puedes continuar.",
            resetError: "No se pudo actualizar la contraseña.",
            resetMismatch: "Las contraseñas no coinciden.",
            hidePassword: "Ocultar contraseña",
            showPassword: "Mostrar contraseña",
          };

  const slides: SlideItem[] =
    lang === "de"
      ? [
          {
            title: "Das, was dein Kopf braucht",
            subtitle: "Remi erinnert für dich",
            description:
              "Hol Aufgaben, Ideen und Erinnerungen aus dem Kopf und fokussiere dich auf das, was wirklich wichtig ist.",
            emoji: "🟣",
            accent: "#7d59c9",
            useLogo: true,
          },
          {
            title: "Alles merken, ohne Stress",
            subtitle: "Dein externes Gedächtnis",
            description:
              "Remi bringt dir genau das zurück, was du brauchst, im richtigen Moment.",
            emoji: "🧠",
            accent: "#596dc9",
          },
          {
            title: "Mentale Last runter",
            subtitle: "Schnell erfassen, ruhig bleiben",
            description:
              "Ein Satz reicht: Remi versteht Datum, Uhrzeit und Wiederholung automatisch.",
            emoji: "🌿",
            accent: "#59c9b5",
          },
          {
            title: "Geteilte Erinnerung",
            subtitle: "Teile Listen, Notizen und Erinnerungen",
            description:
              "Hilf anderen, den Kopf frei zu machen und das gemeinsame Erinnern zu genießen, ohne alles allein zu tragen.",
            emoji: "\uD83E\uDD1D",
            accent: "#c959a5",
          },
          {
            title: "Frag Remi",
            subtitle: "Finde wieder, was du gespeichert hast",
            description:
              "Stell Remi eine Frage und du bekommst schnell eine Antwort aus dem, was du gespeichert hast.",
            examplesText:
              'Z. B.: "Wo sind die Schlüssel?" · "Was steht auf der Einkaufsliste?"...',
            emoji: "🔍",
            accent: "#59a5c9",
          },
        ]
      : lang === "en"
        ? [
            {
              title: "What your mind needs",
              subtitle: "Remi remembers for you",
              description:
                "Get tasks, ideas, and reminders out of your head so you can focus on what truly matters.",
              emoji: "🟣",
              accent: "#7d59c9",
              useLogo: true,
            },
            {
              title: "Remember everything, without stress",
              subtitle: "Your external memory",
              description:
                "Remi brings back what you need exactly when you need it.",
              emoji: "🧠",
              accent: "#596dc9",
            },
            {
              title: "Lower mental load",
              subtitle: "Capture fast, stay calm",
              description:
                "Write one sentence. Remi understands date, time, and repeat automatically.",
              emoji: "🌿",
              accent: "#59c9b5",
            },
            {
              title: "Shared memory",
              subtitle: "Share lists, notes, and reminders",
              description:
                "Help others clear their minds and enjoy remembering together, without carrying everything alone.",
              emoji: "\uD83E\uDD1D",
              accent: "#c959a5",
            },
            {
              title: "Ask Remi",
              subtitle: "Find what you already saved",
              description:
                "Ask Remi a question and it quickly answers using what you have saved.",
              examplesText:
                'Examples: "Where are the keys?" · "What is on the shopping list?"...',
              emoji: "🔍",
              accent: "#59a5c9",
            },
          ]
        : [
            {
              title: "Lo que tu mente necesita",
              subtitle: "Remi recuerda por ti",
              description:
                "Saca de tu cabeza tareas, ideas y recordatorios para enfocarte en lo que de verdad importa.",
              emoji: "🟣",
              accent: "#7d59c9",
              useLogo: true,
            },
            {
              title: "Recuerda todo sin estrés",
              subtitle: "Tu memoria externa",
              description:
                "Remi te devuelve lo importante justo en el momento adecuado.",
              emoji: "🧠",
              accent: "#596dc9",
            },
            {
              title: "Menos carga mental",
              subtitle: "Captura rápida, mente tranquila",
              description:
                "Escribe una frase y Remi interpreta fecha, hora y recordatorio automáticamente.",
              emoji: "🌿",
              accent: "#59c9b5",
            },
            {
              title: "Memoria compartida",
              subtitle: "Comparte listas, notas y recordatorios",
              description:
                "Ayuda a los demás a despejar su mente y a disfrutar recordando juntos, sin tener que cargar solos con todo.",
              emoji: "\uD83E\uDD1D",
              accent: "#c959a5",
            },
            {
              title: "Pregúntale a Remi",
              subtitle: "Encuentra lo que ya guardaste",
              description:
                "Haz una pregunta a Remi y te responderá rápidamente usando la información que has guardado.",
              examplesText:
                'Ej.: "¿Dónde están las llaves?" · "¿Qué tengo que comprar?"...',
              emoji: "🔍",
              accent: "#59a5c9",
            },
          ];

  useEffect(() => {
    if (user && !resetModalOpen) {
      navigate(redirectPath || "/", { replace: true });
    }
  }, [navigate, redirectPath, resetModalOpen, user]);

  useEffect(() => {
    const syncRecoveryState = () => {
      if (hasRecoveryHash()) {
        setAuthView("login");
        setResetModalOpen(true);
        setSheetOpen(true);
      }
    };

    syncRecoveryState();
    window.addEventListener("hashchange", syncRecoveryState);
    window.addEventListener("popstate", syncRecoveryState);
    return () => {
      window.removeEventListener("hashchange", syncRecoveryState);
      window.removeEventListener("popstate", syncRecoveryState);
    };
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthView("login");
        setResetModalOpen(true);
        setSheetOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        const { error } = await requestPasswordReset(email);
        if (error) {
          toast.error(error.message || authCopy.forgotError);
        } else {
          toast.success(authCopy.forgotSuccess);
          setAuthView("login");
        }
        return;
      }

      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error(t("auth.errorInvalidCredentials"));
        } else if (error.message.includes("User already registered")) {
          toast.error(t("auth.errorUserAlreadyRegistered"));
        } else {
          toast.error(error.message);
        }
      } else {
        if (isRegister) {
          toast.success(t("auth.signUpSuccess"));
        }
        navigate(redirectPath || "/", { replace: true });
      }
    } catch (_error) {
      toast.error(t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error(authCopy.resetMismatch);
        return;
      }

      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message || authCopy.resetError);
        return;
      }

      toast.success(authCopy.resetSuccess);
      setResetModalOpen(false);
      setPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, "/auth");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#eef2f9] text-slate-900">
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden">
        <section
          className="relative min-h-0 flex-1 overflow-hidden"
          onClick={() => setSheetOpen(false)}
          style={{
            background: "#ffffff",
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <div className="absolute left-[-26px] top-[62%] h-36 w-36 rounded-full" style={{ background: "#7d59c91f" }} />
          <div className="absolute right-[-22px] top-[42%] h-28 w-28 rounded-full" style={{ background: "#59a5c924" }} />
          <div className="absolute left-[14%] top-[18%] h-2 w-2 rounded-full" style={{ background: "#7d59c9" }} />
          <div className="absolute left-[76%] top-[16%] h-2.5 w-2.5 rounded-full" style={{ background: "#59c9b5" }} />
          <div className="absolute left-[86%] top-[28%] h-1.5 w-1.5 rounded-full" style={{ background: "#c959a5" }} />

          <div
            ref={sliderRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
              if (idx !== activeSlide) setActiveSlide(idx);
            }}
            className="relative z-[1] flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
          >
            {slides.map((slide, index) => (
              <article
                key={`auth-slide-${index}`}
                className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center overflow-y-auto px-4 py-6 text-center text-slate-900 sm:px-6 sm:py-10"
              >
                {slide.useLogo ? (
                  <img src="/icons/icon-192.png" alt="Remi" className="h-20 w-20 sm:h-24 sm:w-24" />
                ) : (
                  <div
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.15)] sm:h-20 sm:w-20"
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${slide.accent}33`,
                    }}
                  >
                    <span className="text-[30px] leading-none sm:text-[36px]">{slide.emoji}</span>
                  </div>
                )}
                <h1
                  className="mt-4 font-extrabold leading-[0.95] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(34px, 8.2vw, 50px)" }}
                >
                  {slide.title}
                </h1>
                <p
                  className="mt-3 font-semibold leading-tight"
                  style={{ color: slide.accent, fontSize: "clamp(22px, 5.2vw, 30px)" }}
                >
                  {slide.subtitle}
                </p>
                <p
                  className="mt-3 max-w-[320px] leading-relaxed text-slate-600"
                  style={{ fontSize: "clamp(15px, 3.8vw, 20px)" }}
                >
                  {slide.description}
                </p>
                {slide.examplesText ? (
                  <p
                    className="mt-2 max-w-[320px] leading-relaxed text-slate-500"
                    style={{ fontSize: "clamp(13px, 3.4vw, 16px)" }}
                  >
                    {slide.examplesText}
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <div className="absolute bottom-6 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-2.5">
            {slides.map((_, index) => (
              <button
                key={`slide-dot-${index}`}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(index);
                  const el = sliderRef.current;
                  if (!el) return;
                  const slideWidth = el.clientWidth;
                  el.scrollTo({ left: index * slideWidth, behavior: "smooth" });
                }}
                className={
                  index === activeSlide
                    ? "h-2.5 w-6 rounded-full"
                    : "h-2.5 w-2.5 rounded-full bg-slate-300"
                }
                style={index === activeSlide ? { background: "#7d59c9" } : undefined}
              />
            ))}
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-md rounded-t-[30px] border border-slate-200 bg-white px-4 pt-4 pb-5 shadow-[0_-12px_28px_rgba(15,23,42,0.14)] transition-all duration-300"
          style={{
            height: sheetOpen ? "56dvh" : "122px",
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 bg-white">
            <button
              type="button"
              onClick={() => {
                setAuthView("login");
                setSheetOpen(true);
              }}
              className="h-12 rounded-full text-[15px] font-semibold focus:outline-none focus:ring-0"
              style={{
                background: isLogin ? "#7d59c9" : "#f3f4f8",
                color: isLogin ? "#ffffff" : "#475569",
                boxShadow: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {t("auth.submitLogin")}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthView("register");
                setSheetOpen(true);
              }}
              className="h-12 rounded-full text-[15px] font-semibold focus:outline-none focus:ring-0"
              style={{
                background: isRegister ? "#7d59c9" : "#f3f4f8",
                color: isRegister ? "#ffffff" : "#475569",
                boxShadow: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {t("auth.submitRegister")}
            </button>
          </div>

          {sheetOpen && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 overflow-y-auto px-1 pb-1">
              {isForgot && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
                  <p className="font-semibold text-slate-700">
                    {authCopy.forgotTitle}
                  </p>
                  <p>{authCopy.forgotHelp}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] font-semibold text-slate-700">
                  {t("auth.emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-2xl border-slate-200 bg-[#fbfbfe] pl-10 text-[15px]"
                  />
                </div>
              </div>

              {!isForgot && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-semibold text-slate-700">
                    {t("auth.passwordLabel")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
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
                      aria-label={showPassword ? authCopy.hidePassword : authCopy.showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isRegister && (
                <p className="text-[11px] leading-snug text-slate-500">
                  {t("auth.acceptPrefix")}{" "}
                  <Link to="/legal/terms" className="text-violet-700 underline underline-offset-2">
                    {t("auth.acceptTerms")}
                  </Link>{" "}
                  {t("auth.acceptAnd")}{" "}
                  <Link to="/legal/privacy" className="text-violet-700 underline underline-offset-2">
                    {t("auth.acceptPrivacy")}
                  </Link>
                  .
                </p>
              )}

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setAuthView("forgot")}
                  className="w-full text-left text-[12px] font-medium text-violet-700 underline underline-offset-2"
                >
                  {authCopy.forgotCta}
                </button>
              )}

              {isForgot && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthView("login");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full text-left text-[12px] font-medium text-slate-600 underline underline-offset-2"
                >
                  {authCopy.backToLogin}
                </button>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-full border-0 text-[15px] font-semibold text-white focus:outline-none"
                style={{ background: "#7d59c9", boxShadow: "none", WebkitTapHighlightColor: "transparent" }}
                disabled={loading}
              >
                {loading
                  ? t("common.loading")
                  : isForgot
                    ? authCopy.forgotSubmit
                    : isLogin
                    ? t("auth.submitLogin")
                    : t("auth.submitRegister")}
              </button>
            </form>
          )}
        </section>
      </div>

      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <form
            onSubmit={handleResetSubmit}
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_56px_rgba(15,23,42,0.28)]"
          >
            <h2 className="text-[20px] font-bold text-slate-900">{authCopy.resetTitle}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{authCopy.resetHelp}</p>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="reset-password" className="text-[13px] font-semibold text-slate-700">
                {authCopy.resetPasswordLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="reset-password"
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
                  aria-label={showPassword ? authCopy.hidePassword : authCopy.showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <Label htmlFor="confirm-password" className="text-[13px] font-semibold text-slate-700">
                {authCopy.resetConfirmLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={authCopy.resetConfirmPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 rounded-2xl border-slate-200 bg-[#fbfbfe] pl-10 text-[15px]"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setPassword("");
                  setConfirmPassword("");
                  window.history.replaceState({}, document.title, "/auth");
                }}
                className="h-11 flex-1 rounded-full bg-slate-100 text-[14px] font-semibold text-slate-700"
              >
                {authCopy.backToLogin}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-full bg-[#7d59c9] text-[14px] font-semibold text-white"
              >
                {loading ? t("common.loading") : authCopy.resetSubmit}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Auth;
