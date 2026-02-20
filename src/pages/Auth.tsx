// src/pages/Auth.tsx
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

type SlideItem = {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  accent: string;
  useLogo?: boolean;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const slides: SlideItem[] =
    lang === "de"
      ? [
          {
            title: "Das, was dein Kopf braucht",
            subtitle: "Remi erinnert fuer dich",
            description:
              "Hol Aufgaben, Ideen und Erinnerungen aus dem Kopf und fokussiere dich auf das, was wirklich wichtig ist.",
            emoji: "🟣",
            accent: "#7d59c9",
            useLogo: true,
          },
          {
            title: "Alles merken, ohne Stress",
            subtitle: "Dein externes Gedaechtnis",
            description:
              "Remi bringt dir genau das zurueck, was du brauchst, im richtigen Moment.",
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
              "Hilf anderen, den Kopf frei zu machen und das gemeinsame Erinnern zu geniessen, ohne alles allein zu tragen.",
            emoji: "\uD83E\uDD1D",
            accent: "#c959a5",
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
              title: "Recuerda todo sin estres",
              subtitle: "Tu memoria externa",
              description:
                "Remi te devuelve lo importante justo en el momento adecuado.",
              emoji: "🧠",
              accent: "#596dc9",
            },
            {
              title: "Menos carga mental",
              subtitle: "Captura rapida, mente tranquila",
              description:
                "Escribe una frase y Remi interpreta fecha, hora y recordatorio automaticamente.",
              emoji: "🌿",
              accent: "#59c9b5",
            },
            {
              title: "Memoria compartida",
              subtitle: "Comparte listas, notas y recordatorios",
              description:
                "Ayuda a los demas a despejar su mente y a disfrutar recordando juntos, sin tener que cargar solos con todo.",
              emoji: "\uD83E\uDD1D",
              accent: "#c959a5",
            },
          ];

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
            height: sheetOpen ? "50dvh" : "122px",
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 bg-white">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
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
                setIsLogin(false);
                setSheetOpen(true);
              }}
              className="h-12 rounded-full text-[15px] font-semibold focus:outline-none focus:ring-0"
              style={{
                background: !isLogin ? "#7d59c9" : "#f3f4f8",
                color: !isLogin ? "#ffffff" : "#475569",
                boxShadow: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {t("auth.submitRegister")}
            </button>
          </div>

          {sheetOpen && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 overflow-y-auto px-1 pb-1">
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
                    aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
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

              <button
                type="submit"
                className="h-11 w-full rounded-full border-0 text-[15px] font-semibold text-white focus:outline-none"
                style={{ background: "#7d59c9", boxShadow: "none", WebkitTapHighlightColor: "transparent" }}
                disabled={loading}
              >
                {loading
                  ? t("common.loading")
                  : isLogin
                    ? t("auth.submitLogin")
                    : t("auth.submitRegister")}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default Auth;
