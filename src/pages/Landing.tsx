// src/pages/Landing.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Brain,
  Bell,
  Calendar,
  TrendingDown,
  Zap,
  Sparkles,
  Check,
  Share2,
} from "lucide-react";
import heroIllustration from "/icons/icon-512.png";
import remiIconSmall from "/icons/icon-192.png";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { RemiLocale } from "@/locales";
import { es } from "@/locales/es";
import { en } from "@/locales/en";
import { de } from "@/locales/de";
import { useNavigate } from "react-router-dom";

// mapa local solo con la parte de "landing" de cada idioma
const landingCopyByLang: Record<RemiLocale, any> = {
  es: es.landing,
  en: en.landing,
  de: de.landing,
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // idioma solo para la landing
  const [lang, setLang] = React.useState<RemiLocale>(() => {
    if (typeof window === "undefined") return "es";

    const stored = window.localStorage.getItem("landingLang") as
      | RemiLocale
      | null;
    if (stored && (["es", "en", "de"] as RemiLocale[]).includes(stored)) {
      return stored;
    }

    // Detectar idioma del navegador
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("de")) return "de";
    return "en"; // por defecto inglés si no es es/de
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("landingLang", lang);
    }
  }, [lang]);

  const t = landingCopyByLang[lang];

  const handleShareRemi = async () => {
    const url = window.location.origin;
    const text = t.hero.shareText; // solo landing
    const copiedMsg = t.hero.shareCopied; // solo landing

    try {
      if (navigator.share) {
        await navigator.share({
          title: "REMI",
          text,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert(copiedMsg);
      } else {
        alert(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    // remi-page -> scroll dentro de la shell, landing-shell -> fondo lila y centrado
    <div className="remi-page landing-shell text-foreground">
      {/* tarjeta blanca tipo móvil */}
      <div className="relative">
        {/* Selector de idioma arriba a la derecha dentro de la tarjeta */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* HERO */}
        <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 overflow-hidden bg-white shadow-2xl rounded-s-3xl rounded-e-3xl">
          {/* Imagen: solo el círculo, sin tarjeta cuadrada */}
          <div
            className="relative animate-fade-in mt-10 lg:mt-0 flex justify-center"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Contenedor circular por si el PNG no es perfectamente redondo */}
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={heroIllustration}
                alt="Remi logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background" />
          <div className="absolute top-20 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div
            className="absolute bottom-10 -right-10 w-40 h-40 bg-accent/15 rounded-3xl blur-3xl"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 px-6 mt-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Texto */}
              {/* 👉 TÍTULO HERO CENTRADO EN MÓVIL, IZQUIERDA EN DESKTOP */}
              <div className="space-y-8 animate-fade-in text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {t.hero.title.part1}{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-[#7d59c9]">
                    {t.hero.title.highlighted}
                  </span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {t.hero.description}
                </p>

                {/* Botones hero */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    className="
                      w-full sm:w-auto
                      inline-flex items-center justify-center gap-2
                      font-semibold text-sm sm:text-base
                      px-6 py-4 
                      bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                      text-white
                      shadow-none border-0
                    "
                    onClick={() => navigate("/auth")}
                  >
                    {t.hero.ctaPrimary}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShareRemi}
                    className="landing-btn-secondary w-full inline-flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t.hero.shareButtonLabel}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
          <div className="relative z-10 px-6">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold">
                {t.features.title.part1}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-[#7d59c9]">
                  {t.features.title.highlighted}
                </span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* 1 */}
              <Card className="landing-card p-6 md:p-8 animate-fade-in transition-all duration-300 hover:shadow-hover">
                <div
                  className="
                    w-12 h-12 md:w-14 md:h-14 mb-3
                    rounded-2xl
                    flex items-center justify-center
                    bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                    "
                >
                  <Bell className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                  {t.features.items.reminders.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.features.items.reminders.description}
                </p>
              </Card>

              {/* 2 */}
              <Card className="landing-card p-6 md:p-8 animate-fade-in transition-all duration-300 hover:shadow-hover">
                <div
                  className="
                    w-12 h-12 md:w-14 md:h-14 mb-3
                    rounded-2xl
                    flex items-center justify-center
                    bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                    "
                >
                  <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                  {t.features.items.temporal.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.features.items.temporal.description}
                </p>
              </Card>

              {/* 3 */}
              <Card className="landing-card p-6 md:p-8 animate-fade-in transition-all duration-300 hover:shadow-hover">
                <div
                  className="
                    w-12 h-12 md:w-14 md:h-14 mb-3
                    rounded-2xl
                    flex items-center justify-center
                    bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                    "
                >
                  <TrendingDown className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                  {t.features.items.mentalLoad.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.features.items.mentalLoad.description}
                </p>
              </Card>

              {/* 4 */}
              <Card className="landing-card p-6 md:p-8 animate-fade-in transition-all duration-300 hover:shadow-hover">
                <div
                  className="
                    w-12 h-12 md:w-14 md:h-14 mb-3 rounded-2xl flex items-center justify-center
                    bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]                    
                  "
                >
                  <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                  {t.features.items.quickCapture.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t.features.items.quickCapture.description}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* MENTAL LOAD */}
        <section className="py-16 md:py-24 relative">
          <div className="px-6">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto">
              {/* Texto + card */}
              <div
                className="space-y-6 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                {/* Título */}
                {/* 👉 TÍTULO BLOQUE MENTAL LOAD CENTRADO EN MÓVIL, IZQUIERDA EN DESKTOP */}
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-center lg:text-left">
                  {t.mentalLoad.title.part1}{" "}
                  <span className="text-[#7d59c9]">
                    {t.mentalLoad.title.highlighted}
                  </span>
                </h2>

                {/* Card */}
                <div className="space-y-6 animate-fade-in">
                  <Card className="landing-card p-6 md:p-8 shadow-elegant">
                    {/* Parte superior: emoji + textos */}
                    <div className="flex flex-col items-center text-center gap-3 md:gap-4">
                      {/* Emoji / icono redondo */}
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#f4f9ff] flex items-center justify-center shadow-sm">
                        <span className="text-2xl md:text-3xl">😊</span>
                      </div>

                      {/* Textos principales */}
                      <div className="space-y-1">
                        <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#7d59c9]">
                          {t.mentalLoad.badge}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                          {t.mentalLoad.headline}
                        </h3>
                        <p className="text-xs md:text-sm leading-relaxed text-[#6f6c80] max-w-xs mx-auto">
                          {t.mentalLoad.subheadline}
                        </p>
                      </div>
                    </div>

                    {/* Bloque inferior lila con barra */}
                    <div className="mt-6 rounded-2xl bg-[#f7f4ff] px-4 py-3 md:px-5 md:py-4">
                      <div className="flex items-center justify-between text-[11px] md:text-xs font-medium text-[#3b3355] mb-2">
                        <span>{t.mentalLoad.clearMindLabel}</span>
                        <span>69%</span>
                      </div>

                      <Progress
                        value={69}
                        className="h-2 md:h-2.5 rounded-full bg-[#ebe4ff] [&>div]:bg-[linear-gradient(90deg,#c266ff,#f173ff)]"
                      />

                      <p className="mt-2 text-[11px] md:text-xs text-[#8a86a3] leading-relaxed">
                        {t.mentalLoad.clearMindHelper}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Párrafo introductorio */}
                <p className="text-s md:text-base leading-relaxed text-slate-900 max-w-md text-center">
                  {t.mentalLoad.description}
                </p>

                {/* Lista de puntos 1 / 2 / 3 en tarjeta */}
                <div
                  className="
                    rounded-2xl
                    bg-white
                    shadow-[0_18px_45px_rgba(15,23,42,0.12)]
                    border border-slate-100
                    px-4 py-4 md:px-5 md:py-5
                  "
                >
                  <div className="space-y-4 whitespace-pre-line">
                    {[1, 2, 3].map((step) => {
                      const titleKey =
                        step === 1
                          ? "step1Title"
                          : step === 2
                          ? "step2Title"
                          : "step3Title";
                      const descKey =
                        step === 1
                          ? "step1Description"
                          : step === 2
                          ? "step2Description"
                          : "step3Description";

                      return (
                        <div className="flex items-start gap-3" key={step}>
                          {/* Círculo con número */}
                          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#f0efff] flex items-center justify-center text-[#7d59c9] text-xs md:text-sm font-semibold">
                            {step}
                          </div>

                          {/* Texto del punto */}
                          <div>
                            <h4 className="text-sm md:text-base font-semibold text-foreground">
                              {t.mentalLoad[titleKey]}
                            </h4>
                            <p className="mt-1 text-xs md:text-sm leading-snug text-slate-900 max-w-md">
                              {t.mentalLoad[descKey]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 md:py-24 relative">
          <div className="px-6 flex justify-center">
            <div className="w-full max-w-sm">
              {/* Tarjeta principal con borde morado */}
              <div className="rounded-[32px] border-2 border-[#7d59c9] bg-[#fdfbff] px-6 py-10 md:px-8 md:py-12 flex flex-col gap-8 text-center">
                {/* Badge superior */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9] mx-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.cta.badge}</span>
                </div>

                {/* Título principal */}
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                  {t.cta.title.part1}{" "}
                  <span className="text-[#7d59c9]">
                    {t.cta.title.highlighted}
                  </span>
                </h2>

                {/* Texto descriptivo */}
                <p className="text-sm leading-relaxed text-[#6f6c80] max-w-xs mx-auto">
                  {t.cta.description}
                </p>

                {/* Botones */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate("/auth")}
                    className="
                      w-full
                      inline-flex items-center justify-center gap-2
                      font-semibold text-sm sm:text-base
                      px-6 py-4 
                      bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                      text-white
                      shadow-none border-0
                    "
                  >
                    {t.cta.ctaPrimary}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                {/* Lista de ventajas */}
                <div className="mt-4 space-y-3 text-left text-xs text-[#6f6c80]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#f4f0ff] border border-[#e2d9ff] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#7d59c9]" />
                    </div>
                    <span>{t.cta.feature1}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#f4f0ff] border border-[#e2d9ff] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#7d59c9]" />
                    </div>
                    <span>{t.cta.feature2}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#f4f0ff] border border-[#e2d9ff] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#7d59c9]" />
                    </div>
                    <span>{t.cta.feature3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border bg-background/70 backdrop-blur-sm rounded-b-[40px]">
          <div className="px-6 py-10 md:py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={remiIconSmall}
                      alt="Remi logo"
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-contain"
                    />
                  </div>

                  <span className="text-xl font-bold">Remi</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t.footer.description}
                </p>
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground">
              <p>{t.footer.copyright}</p>
              <div className="flex gap-6">
                {/* <span>Twitter</span>
                <span>LinkedIn</span>
                <span>Instagram</span> */}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
