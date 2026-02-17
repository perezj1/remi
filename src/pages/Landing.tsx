// src/pages/Landing.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Bell,
  Calendar,
  TrendingDown,
  Zap,
  Sparkles,
  Check,
  Share2,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Download,
  ShieldCheck,
  Quote,
  RefreshCw,
  Wand2,
  ExternalLink,
} from "lucide-react";
import heroIllustration from "/icons/icon-512.png";
import remiIconSmall from "/icons/icon-192.png";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { RemiLocale } from "@/locales";
import { es } from "@/locales/es";
import { en } from "@/locales/en";
import { de } from "@/locales/de";
import { Link, useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// mapa local solo con la parte de "landing" de cada idioma
const landingCopyByLang: Record<RemiLocale, any> = {
  es: es.landing,
  en: en.landing,
  de: de.landing,
};

// Tipado mínimo para beforeinstallprompt (no está en lib.dom.d.ts por defecto)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav: any = window.navigator as any;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    nav?.standalone === true
  );
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [lang, setLang] = React.useState<RemiLocale>(() => {
    if (typeof window === "undefined") return "es";

    const stored = window.localStorage.getItem(
      "landingLang",
    ) as RemiLocale | null;
    if (stored && (["es", "en", "de"] as RemiLocale[]).includes(stored))
      return stored;

    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("de")) return "de";
    return "en";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("landingLang", lang);
  }, [lang]);

  const t = landingCopyByLang[lang];
  // ✅ ahora todo lo "extra" viene del archivo de idioma:
  const x = t.extra;
  const legalLabels = {
    es: {
      terms: "Términos",
      agb: "AGB",
      privacy: "Privacidad",
      cookies: "Cookies",
      disclaimer: "Descargo",
      impressum: "Impressum",
    },
    en: {
      terms: "Terms",
      agb: "AGB",
      privacy: "Privacy",
      cookies: "Cookies",
      disclaimer: "Disclaimer",
      impressum: "Impressum",
    },
    de: {
      terms: "Nutzungsbedingungen",
      agb: "AGB",
      privacy: "Datenschutz",
      cookies: "Cookies",
      disclaimer: "Haftungsausschluss",
      impressum: "Impressum",
    },
  }[lang];

  const handleShareRemi = async () => {
    const url = `${window.location.origin}/landing`;
    const text = t?.hero?.shareText ?? x.hero.kicker;
    const copiedMsg = t?.hero?.shareCopied ?? url;

    try {
      if (navigator.share) {
        await navigator.share({ title: "REMI", text, url });
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

  // Modal instalación + soporte beforeinstallprompt
  const [installOpen, setInstallOpen] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);

  // ✅ banner iOS
  const [showIosInstallBanner, setShowIosInstallBanner] =
    React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault?.();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setInstallOpen(false);
      setShowIosInstallBanner(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as any,
    );
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as any,
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  // ✅ ahora todo esto viene de x.modal / x.iosBanner
  const installLabel = x.modal.installLabel;
  const modalTitle = x.modal.title;
  const modalDesc = x.modal.description;

  const iosSteps = x.modal.iosSteps;
  const desktopSteps = x.modal.desktopSteps;

  const handleInstallNow = async () => {
    if (installed) return;

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch (e) {
        console.error(e);
      }
      return;
    }
    // iOS/Safari/otros: sin prompt directo => el modal muestra instrucciones
  };

  // click CTA instalar en landing
  const handleInstallCtaClick = () => {
    if (installed) return;

    if (isIOS()) {
      setShowIosInstallBanner(true);
      setInstallOpen(false);
      return;
    }

    setInstallOpen(true);
  };

  // Textos banner iOS desde locales
  const iosBannerTitle = x.iosBanner.title;
  const iosBannerStep1 = x.iosBanner.step1;
  const iosBannerStep2 = x.iosBanner.step2;

  return (
    <div className="remi-page landing-shell text-foreground">
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* ✅ Banner iOS */}
        {showIosInstallBanner && !installed && (
          <div className="fixed bottom-4 left-4 right-4 z-[999] flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 max-w-md w-full border border-slate-200">
              <div className="flex-1 text-sm">
                <div className="font-semibold text-slate-900">
                  {iosBannerTitle}
                </div>

                <div className="text-xs text-slate-600 mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">1.</span>
                    <span className="text-slate-700">{iosBannerStep1}</span>

                    {/* Icono tipo iOS Share */}
                    <svg
                      className="inline-block w-5 h-5 align-middle text-[#7d59c9]"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect
                        x="5"
                        y="9"
                        width="14"
                        height="11"
                        rx="3"
                        ry="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 3v9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.5 6.5 12 3l3.5 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-semibold">2.</span>
                    <span className="text-slate-700">{iosBannerStep2}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosInstallBanner(false)}
                aria-label={x.iosBanner.closeAria}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden bg-white shadow-2xl rounded-s-3xl rounded-e-3xl">
          <div
            className="relative animate-fade-in mt-10 lg:mt-0 flex justify-center"
            style={{ animationDelay: "0.2s" }}
          >
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
          <div className="absolute bottom-10 -right-10 w-40 h-40 bg-accent/15 rounded-3xl blur-3xl" />

          <div className="relative z-10 px-6 mt-10">
            <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-7 animate-fade-in text-center lg:text-left">
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {x.hero.kicker}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {t.hero.title.part1}{" "}
                  <span className="_toggle bg-gradient-to-r from-primary to-accent bg-clip-text text-[#7d59c9]">
                    {t.hero.title.highlighted}
                  </span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {x.hero.description}
                </p>

                <div className="mx-auto lg:mx-0 max-w-xl">
                  <div className="grid gap-2 text-left text-sm md:text-[15px] text-slate-900">
                    {[
                      {
                        icon: <Zap className="w-4 h-4" />,
                        text: x.hero.bullets.a,
                      },
                      {
                        icon: <Wand2 className="w-4 h-4" />,
                        text: x.hero.bullets.b,
                      },
                      {
                        icon: <Bell className="w-4 h-4" />,
                        text: x.hero.bullets.c,
                      },
                      {
                        icon: <Tablet className="w-4 h-4" />,
                        text: x.hero.bullets.d,
                      },
                    ].map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="mt-0.5 text-[#7d59c9]">{b.icon}</div>
                        <span className="leading-snug">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  {[
                    {
                      icon: <ShieldCheck className="w-3.5 h-3.5" />,
                      text: x.trustRow.a,
                    },
                    {
                      icon: <Zap className="w-3.5 h-3.5" />,
                      text: x.trustRow.b,
                    },
                    {
                      icon: <TrendingDown className="w-3.5 h-3.5" />,
                      text: x.trustRow.c,
                    },
                  ].map((it, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]"
                    >
                      {it.icon}
                      {it.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ejemplo (solo desktop) */}
              <div className="hidden lg:block">
                <Card className="landing-card p-6 md:p-8 shadow-elegant">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#f1eff7] flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-[#7d59c9]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900">
                        {x.interpret.exampleLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {x.interpret.helperLine}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4 text-sm text-slate-900 leading-relaxed">
                    {x.interpret.examples.map((ex: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#7d59c9] font-semibold">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {x.interpret.chips.map((chip: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 inline-flex items-center gap-2"
                      >
                        {idx === 0 ? (
                          <Calendar className="w-3.5 h-3.5 text-[#7d59c9]" />
                        ) : idx === 1 ? (
                          <RefreshCw className="w-3.5 h-3.5 text-[#7d59c9]" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 text-[#7d59c9]" />
                        )}
                        {chip}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="py-14 md:py-18 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
          <div className="relative z-10 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-4 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                {x.problem.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                {x.problem.text}
              </p>
              <p className="text-sm md:text-base text-slate-900">
                {x.problem.micro}
              </p>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/15 to-background" />
          <div className="relative z-10 px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-3 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                {x.how.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                {x.how.subtitle}
              </p>
            </div>

            <div className="mx-auto w-full max-w-6xl grid md:grid-cols-3 gap-6">
              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f1eff7] flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {x.how.step1Title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {x.how.step1Text}
                </p>
              </Card>

              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f1eff7] flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {x.how.step2Title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {x.how.step2Text}
                </p>
              </Card>

              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f1eff7] flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {x.how.step3Title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {x.how.step3Text}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* SHARE FEATURE */}
        <section className="py-14 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
          <div className="relative z-10 px-6">
            <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-6 items-stretch">
              <Card className="landing-card p-6 md:p-8 shadow-elegant">
                <div className="flex flex-col items-start gap-3">
  {/* Fila 1: icono + NEU */}
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-[#f1eff7] flex items-center justify-center">
      <Share2 className="w-6 h-6 text-[#7d59c9]" />
    </div>

    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7d59c9]">
      {x.shareFeature.badge}
    </p>
  </div>

  {/* Fila 2: título debajo (centrado) */}
<p className="text-xl md:text-2xl font-extrabold text-slate-900 text-center w-full">
  {x.shareFeature.title}
</p>


  {/* Pill debajo (sin cambiar formato) */}
  <span className="text-[11px] font-medium text-[#7d59c9] bg-[#f1eff7] px-2.5 py-1 rounded-full">
    {x.shareFeature.tag}
  </span>
</div>



                <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {x.shareFeature.text}
                </p>

                <div className="mt-5 grid gap-3">
                  {x.shareFeature.points.map((p: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f1eff7] border border-[#d8cee9] flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#7d59c9]" />
                      </div>
                      <span className="text-sm md:text-base text-slate-900 leading-snug">
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="landing-card p-6 md:p-8 shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f1eff7] flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-[#7d59c9]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {x.shareFeature.exampleLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {x.shareFeature.helperLine}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4 text-sm text-slate-900 leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-[#7d59c9] font-semibold">•</span>
                    <span>{x.shareFeature.example}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate("/auth")}
                    className="
                      w-full
                      inline-flex items-center justify-center gap-2
                      font-semibold
                      bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                      text-white
                      shadow-none border-0
                    "
                  >
                    {x.shareFeature.ctaTry}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShareRemi}
                    className="w-full inline-flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t.hero.shareButtonLabel}</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES + INSTALAR */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
          <div className="relative z-10 px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 space-y-4 animate-fade-in">
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

            <div className="mx-auto w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">
              <div className="space-y-4 text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {x.install.title}
                </h3>

                <p className="text-base md:text-lg text-muted-foreground">
                  {x.install.text}
                </p>

                <p className="text-sm md:text-base text-slate-900">
                  {x.install.helper}
                </p>

                <div className="grid gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
                  {[x.install.bullet1, x.install.bullet2, x.install.bullet3].map(
                    (p: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#f1eff7] border border-[#d8cee9] flex items-center justify-center mt-0.5">
                          <Check className="w-3.5 h-3.5 text-[#7d59c9]" />
                        </div>
                        <span className="text-sm md:text-base text-slate-900 leading-snug">
                          {p}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="pt-3 flex justify-center lg:justify-start">
                  <Button
                    type="button"
                    onClick={handleInstallCtaClick}
                    className="
                      w-full sm:w-auto
                      inline-flex items-center justify-center gap-2
                      font-semibold text-sm sm:text-base
                      px-6 py-4
                      bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                      text-white
                      shadow-none border-0
                    "
                  >
                    <Download className="w-4 h-4" />
                    {installLabel}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">{x.install.ctaHint}</p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Monitor className="w-3.5 h-3.5" />
                    {x.install.device.desktop}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Smartphone className="w-3.5 h-3.5" />
                    {x.install.device.phone}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Tablet className="w-3.5 h-3.5" />
                    iPad / {x.install.device.tablet}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Globe className="w-3.5 h-3.5" />
                    ES / EN / DE
                  </span>
                </div>
              </div>

              {/* Tarjeta visual */}
              <Card className="landing-card p-6 md:p-8 shadow-elegant">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f1eff7] flex items-center justify-center">
                      <Download className="w-6 h-6 text-[#7d59c9]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {x.install.badge}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {x.install.pwaCard.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-[#7d59c9] bg-[#f1eff7] px-2.5 py-1 rounded-full">
                    PWA
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-white border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={remiIconSmall}
                      alt="Remi"
                      className="w-10 h-10 rounded-full object-contain"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Remi</p>
                      <p className="text-xs text-muted-foreground">
                        {x.install.pwaCard.appLike}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#7d59c9]" />
                      <span>{x.install.mini1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#7d59c9]" />
                      <span>{x.install.mini2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#7d59c9]" />
                      <span>{x.install.mini3}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4">
                  <p className="text-xs font-semibold text-[#7d59c9] mb-2">
                    {x.interpret.exampleLabel}
                  </p>
                  <div className="grid gap-2 text-sm text-slate-900">
                    {x.interpret.examples.map((ex: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#7d59c9] font-semibold">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-14 md:py-20 relative">
          <div className="px-6">
            <div className="max-w-5xl mx-auto text-center space-y-3 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                {x.social.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                {x.social.subtitle}
              </p>

              <div className="mt-8 grid md:grid-cols-2 gap-6 text-left">
                {x.social.testimonials.map(
                  (
                    it: { quote: string; author: string },
                    idx: number,
                  ) => (
                    <Card key={idx} className="landing-card p-6 md:p-7">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#f1eff7] flex items-center justify-center">
                          <Quote className="w-5 h-5 text-[#7d59c9]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {it.quote}
                          </p>
                          <p className="mt-3 text-xs font-semibold text-slate-900">
                            — {it.author}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ),
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4">{x.social.note}</p>
            </div>
          </div>
        </section>

        {/* MENTAL LOAD (tu sección original) */}
        <section className="py-16 md:py-24 relative">
          <div className="px-6">
            <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div
                className="space-y-6 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-center lg:text-left">
                  {t.mentalLoad.title.part1}{" "}
                  <span className="text-[#7d59c9]">
                    {t.mentalLoad.title.highlighted}
                  </span>
                </h2>

                <div className="space-y-6 animate-fade-in">
                  <Card className="landing-card p-6 md:p-8 shadow-elegant">
                    <div className="flex flex-col items-center text-center gap-3 md:gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#f1eff7] flex items-center justify-center shadow-sm">
                        <span className="text-2xl md:text-3xl">😊</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#7d59c9]">
                          {t.mentalLoad.badge}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                          {t.mentalLoad.headline}
                        </h3>
                        <p className="text-xs md:text-sm leading-relaxed text-[#64748b] max-w-xs mx-auto">
                          {t.mentalLoad.subheadline}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#f8f6fc] px-4 py-3 md:px-5 md:py-4">
                      <div className="flex items-center justify-between text-[11px] md:text-xs font-medium text-[#334155] mb-2">
                        <span>{t.mentalLoad.clearMindLabel}</span>
                        <span>67%</span>
                      </div>

                      <Progress
                        value={67}
                        className="h-2 md:h-2.5 rounded-full bg-[#e4dbf3] [&>div]:bg-[linear-gradient(90deg,#59a5c9_0%,#5989c9_12.5%,#596dc9_25%,#6b63c9_37.5%,#7d59c9_50%,#9959c9_62.5%,#b559c9_75%,#bf59b7_87.5%,#c959a5_100%)]"
                      />

                      <p className="mt-2 text-[11px] md:text-xs text-[#7c86a2] leading-relaxed">
                        {t.mentalLoad.clearMindHelper}
                      </p>
                    </div>
                  </Card>
                </div>

                <p className="text-s md:text-base leading-relaxed text-slate-900 max-w-md text-center">
                  {t.mentalLoad.description}
                </p>

                <div className="rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] border border-slate-100 px-4 py-4 md:px-5 md:py-5">
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
                          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#ece8f5] flex items-center justify-center text-[#7d59c9] text-xs md:text-sm font-semibold">
                            {step}
                          </div>

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
              {/* tu layout original deja la otra columna vacía */}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 md:py-24 relative">
          <div className="px-6 flex justify-center">
            <div className="w-full max-w-sm">
              <div className="rounded-[32px] border-2 border-[#7d59c9] bg-[#fafafe] px-6 py-10 md:px-8 md:py-12 flex flex-col gap-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9] mx-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.cta.badge}</span>
                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                  {t.cta.title.part1}{" "}
                  <span className="text-[#7d59c9]">
                    {t.cta.title.highlighted}
                  </span>
                </h2>

                <p className="text-sm leading-relaxed text-[#64748b] max-w-xs mx-auto">
                  {t.cta.description}
                </p>

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

                <div className="mt-2 space-y-3 text-left text-xs text-[#64748b]">
                  {[t.cta.feature1, t.cta.feature2, t.cta.feature3].map(
                    (txt: string, idx: number) => (
                      <div className="flex items-center gap-2" key={idx}>
                        <div className="w-5 h-5 rounded-full bg-[#f1eff7] border border-[#d8cee9] flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#7d59c9]" />
                        </div>
                        <span>{txt}</span>
                      </div>
                    ),
                  )}
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

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Globe className="w-3.5 h-3.5" />
                    ES / EN / DE
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Monitor className="w-3.5 h-3.5" />
                    {t.footer.multiDeviceLabel ?? "Multi-device"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eff7] text-[11px] font-medium text-[#7d59c9]">
                    <Download className="w-3.5 h-3.5" />
                    PWA
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground">
              <p>{t.footer.copyright}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[12px]">
                <Link to="/legal/terms" className="text-[#7d59c9] hover:underline">
                  {legalLabels.terms}
                </Link>
                <Link to="/legal/agb" className="text-[#7d59c9] hover:underline">
                  {legalLabels.agb}
                </Link>
                <Link to="/legal/privacy" className="text-[#7d59c9] hover:underline">
                  {legalLabels.privacy}
                </Link>
                <Link to="/legal/cookies" className="text-[#7d59c9] hover:underline">
                  {legalLabels.cookies}
                </Link>
                <Link to="/legal/disclaimer" className="text-[#7d59c9] hover:underline">
                  {legalLabels.disclaimer}
                </Link>
                <Link to="/legal/impressum" className="text-[#7d59c9] hover:underline">
                  {legalLabels.impressum}
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* MODAL DE INSTALACIÓN */}
        <Dialog open={installOpen} onOpenChange={setInstallOpen}>
          <DialogContent className="sm:max-w-[520px] bg-white border border-slate-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#7d59c9]" />
                {modalTitle}
              </DialogTitle>
              <DialogDescription>{modalDesc}</DialogDescription>
            </DialogHeader>

            {installed ? (
              <div className="mt-2 rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4 text-sm text-slate-900">
                {x.modal.alreadyInstalled}
              </div>
            ) : (
              <>
                {deferredPrompt ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4 text-sm text-slate-900">
                      {x.modal.promptText}
                    </div>

                    <Button
                      onClick={handleInstallNow}
                      className="
                        w-full
                        inline-flex items-center justify-center gap-2
                        font-semibold
                        bg-[linear-gradient(135deg,hsl(260_52%_57%),hsl(280_70%_65%))]
                        text-white
                        shadow-none border-0
                      "
                    >
                      <Download className="w-4 h-4" />
                      {installLabel}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-4">
                    <div className="rounded-2xl bg-[#f8f6fc] border border-[#ddd4ef] p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {isIOS() ? x.modal.sectionIOS : x.modal.sectionDesktop}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {x.modal.installRequired}
                      </p>

                      <div className="mt-3 grid gap-2 text-sm text-slate-900">
                        {(isIOS() ? iosSteps : desktopSteps).map(
                          (s: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-[#7d59c9] font-semibold">
                                {idx + 1}.
                              </span>
                              <span className="leading-snug">{s}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setInstallOpen(false)}
                      >
                        {x.modal.close}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full inline-flex items-center justify-center gap-2"
                        onClick={() => window.open(window.location.origin, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {x.modal.openInBrowser}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {x.modal.directInstallHint}
                    </p>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LandingPage;

