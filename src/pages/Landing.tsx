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
import { useNavigate } from "react-router-dom";

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

/**
 * Copy adicional SOLO para esta landing (sin tocar tus archivos de locales).
 */
const extraCopyByLang: Record<
  RemiLocale,
  {
    hero: {
      kicker: string;
      description: string;
      bullets: { a: string; b: string; c: string; d: string };
    };
    trustRow: { a: string; b: string; c: string };
    problem: { title: string; text: string; micro: string };
    how: {
      title: string;
      subtitle: string;
      step1Title: string;
      step1Text: string;
      step2Title: string;
      step2Text: string;
      step3Title: string;
      step3Text: string;
    };
    interpret: {
      title: string;
      text: string;
      chips: string[];
      exampleLabel: string;
      examples: string[];
    };
    everywhere: {
      title: string;
      text: string;
      points: string[];
    };
    install: {
      title: string;
      text: string;
      helper: string;
      badge: string;
      bullet1: string;
      bullet2: string;
      bullet3: string;
      mini1: string;
      mini2: string;
      mini3: string;
      ctaHint: string;
    };
    social: { title: string; subtitle: string; note: string };
    pricing: {
      title: string;
      subtitle: string;
      freeName: string;
      proName: string;
      freeItems: string[];
      proItems: string[];
      footnote: string;
    };
  }
> = {
  es: {
    hero: {
      kicker: "Dile a Remi lo que no quieres olvidar.",
      description:
        "Escribe una frase. Remi interpreta el texto y crea el recordatorio: fecha y hora, repetición si es un hábito, y el modo de recordatorio cuando toca.",
      bullets: {
        a: "Solo escribe: cero formato, cero fricción",
        b: "Remi interpreta: fechas, horas, hábitos y repetición",
        c: "Recordatorios listos para que no dependa de tu memoria",
        d: "En todos tus dispositivos: ordenador, móvil, iPad y tablet",
      },
    },
    trustRow: { a: "Rápida", b: "Simple", c: "Hecha para vaciar la mente" },
    problem: {
      title: "Tu cerebro no es una lista de tareas.",
      text:
        "Ideas, recados, pendientes… cuando lo llevas todo en la cabeza, pagas con estrés y olvidos.",
      micro:
        "Remi es tu descarga mental: lo escribes una vez y sigues con tu día.",
    },
    how: {
      title: "Cómo funciona",
      subtitle: "Escribes. Remi lo entiende. Y te lo recuerda.",
      step1Title: "1) Escribe lo que no quieres olvidar",
      step1Text: "Una frase, tal cual te sale. Sin menús, sin pensar en campos.",
      step2Title: "2) Remi lo interpreta",
      step2Text:
        "Detecta fecha y hora, si es un hábito (repetición), y ajusta el recordatorio.",
      step3Title: "3) Te lo devuelve cuando toca",
      step3Text:
        "Remi te lo pone delante en el momento adecuado para que no lo cargues tú.",
    },
    interpret: {
      title: "Texto → recordatorio automático",
      text:
        "No necesitas configurar mil cosas. Remi entiende el lenguaje natural y lo convierte en un recordatorio útil.",
      chips: ["Fecha y hora", "Hábito / repetición", "Modo de recordatorio"],
      exampleLabel: "Ejemplos",
      examples: [
        "“Mañana a las 18: llamar al seguro”",
        "“Cada lunes: gimnasio”",
        "“El día 5 pagar el alquiler”",
      ],
    },
    everywhere: {
      title: "Multi-dispositivo de verdad",
      text:
        "Remi está disponible donde estás tú: trabajo, casa, calle. Mismo acceso, mismos recordatorios.",
      points: [
        "Ordenador para capturar mientras trabajas",
        "Móvil / iPad / tablet para capturar al vuelo",
        "Úsala al instante en el navegador o instálala como app (PWA)",
      ],
    },
    install: {
      title: "Instala Remi para recibir recordatorios",
      text:
        "Para recibir notificaciones con tus recordatorios, instala Remi ahora desde tu navegador (PWA).",
      helper:
        "Disfrútala como una verdadera app: más ligera, rápida y siempre actualizada.",
      badge: "App mode",
      bullet1: "Notificaciones para recordatorios",
      bullet2: "Icono en la pantalla de inicio",
      bullet3: "Pantalla completa, sensación de app",
      mini1: "Ligera y rápida",
      mini2: "Siempre actualizada",
      mini3: "Hecha para capturar rápido",
      ctaHint:
        "Pulsa “Instalar ahora” y sigue los pasos según tu dispositivo.",
    },
    social: {
      title: "Construida con feedback real",
      subtitle:
        "Remi se mejora continuamente con pruebas y comentarios de usuarios.",
      note:
        "Añade aquí testimonios reales cuando los tengas (mejor no inventarlos).",
    },
    pricing: {
      title: "Precios",
      subtitle: "Empieza gratis. Paga solo si te aporta más.",
      freeName: "Gratis",
      proName: "Pro (opcional)",
      freeItems: [
        "Crear recordatorios desde texto",
        "Ideas y tareas",
        "Multi-dispositivo básico",
      ],
      proItems: [
        "Automatizaciones / recordatorios avanzados",
        "Funciones extra de productividad",
        "Acceso anticipado a nuevas features",
      ],
      footnote:
        "Si aún no tienes el pricing definido, deja esta sección oculta y actívala más adelante.",
    },
  },
  en: {
    hero: {
      kicker: "Tell Remi what you don’t want to forget.",
      description:
        "Write one sentence. Remi interprets it and creates the reminder: date & time, repetition if it’s a habit, and the reminder mode when it matters.",
      bullets: {
        a: "Just write: zero formatting, zero friction",
        b: "Remi interprets: dates, times, habits & repetition",
        c: "Reminders ready—so you don’t rely on memory",
        d: "On all your devices: desktop, phone, iPad & tablet",
      },
    },
    trustRow: { a: "Fast", b: "Simple", c: "Built for mind-dumping" },
    problem: {
      title: "Your brain is not a to-do list.",
      text:
        "Ideas, errands, loose ends… carrying it all in your head costs stress and forgotten stuff.",
      micro:
        "Remi is your mental offload: write it once and move on with your day.",
    },
    how: {
      title: "How it works",
      subtitle: "You write. Remi understands. Then it reminds you.",
      step1Title: "1) Write what you don’t want to forget",
      step1Text: "One sentence—just like you’d say it. No forms, no fields.",
      step2Title: "2) Remi interprets it",
      step2Text:
        "It detects date & time, whether it’s a habit (repetition), and sets the reminder mode.",
      step3Title: "3) It brings it back at the right time",
      step3Text:
        "Remi surfaces it when it matters—so you don’t carry it in your head.",
    },
    interpret: {
      title: "Text → automatic reminder",
      text:
        "No endless setup. Remi turns natural language into a useful reminder.",
      chips: ["Date & time", "Habit / repetition", "Reminder mode"],
      exampleLabel: "Examples",
      examples: [
        "“Tomorrow at 6pm: call the insurance”",
        "“Every Monday: gym”",
        "“On the 5th: pay rent”",
      ],
    },
    everywhere: {
      title: "Truly multi-device",
      text:
        "Remi is there wherever you are—work, home, on the go. Same access, same reminders.",
      points: [
        "Desktop for quick capture while working",
        "Phone / iPad / tablet for on-the-go capture",
        "Use it instantly in the browser or install as an app (PWA)",
      ],
    },
    install: {
      title: "Install Remi to get reminders",
      text:
        "To receive reminder notifications, install Remi now from your browser (PWA).",
      helper:
        "Enjoy it like a real app—lighter, faster, and always up to date.",
      badge: "App mode",
      bullet1: "Notifications for reminders",
      bullet2: "Home screen icon",
      bullet3: "Full-screen app feel",
      mini1: "Lightweight & fast",
      mini2: "Always up to date",
      mini3: "Built for fast capture",
      ctaHint: "Tap “Install now” and follow the steps for your device.",
    },
    social: {
      title: "Built with real feedback",
      subtitle:
        "Remi improves continuously with real testing and user comments.",
      note:
        "Add real testimonials here when you have them (better not to invent them).",
    },
    pricing: {
      title: "Pricing",
      subtitle: "Start free. Upgrade only if it truly helps.",
      freeName: "Free",
      proName: "Pro (optional)",
      freeItems: [
        "Create reminders from text",
        "Ideas & tasks",
        "Basic multi-device",
      ],
      proItems: [
        "Advanced automations / reminders",
        "Extra productivity features",
        "Early access to new features",
      ],
      footnote:
        "If pricing isn’t decided yet, keep this section hidden and enable it later.",
    },
  },
  de: {
    hero: {
      kicker: "Sag Remi, was du nicht vergessen willst.",
      description:
        "Schreib einen Satz. Remi interpretiert ihn und erstellt die Erinnerung: Datum & Uhrzeit, Wiederholung wenn es ein Habit ist, und den passenden Erinnerungsmodus.",
      bullets: {
        a: "Einfach schreiben: kein Format-Stress, keine Reibung",
        b: "Remi versteht: Datum, Uhrzeit, Habits & Wiederholung",
        c: "Erinnerungen fertig – du musst es dir nicht merken",
        d: "Auf allen Geräten: Computer, Handy, iPad & Tablet",
      },
    },
    trustRow: { a: "Schnell", b: "Einfach", c: "Für Brain-Dump gemacht" },
    problem: {
      title: "Dein Kopf ist keine To-do-Liste.",
      text:
        "Ideen, Erledigungen, offene Punkte… alles im Kopf zu behalten bedeutet Stress und Vergessen.",
      micro:
        "Remi ist dein mentales Auslagern: einmal schreiben und weiterleben.",
    },
    how: {
      title: "So funktioniert’s",
      subtitle: "Du schreibst. Remi versteht. Und erinnert dich.",
      step1Title: "1) Schreib, was du nicht vergessen willst",
      step1Text:
        "Ein Satz – so wie du es sagen würdest. Keine Formulare, keine Felder.",
      step2Title: "2) Remi interpretiert es",
      step2Text:
        "Es erkennt Datum & Uhrzeit, ob es ein Habit ist (Wiederholung), und setzt den Erinnerungsmodus.",
      step3Title: "3) Zur richtigen Zeit wieder da",
      step3Text:
        "Remi bringt es zurück, wenn es wichtig ist – nicht wenn du zufällig dran denkst.",
    },
    interpret: {
      title: "Text → automatische Erinnerung",
      text:
        "Keine endlose Konfiguration. Remi macht aus natürlicher Sprache eine brauchbare Erinnerung.",
      chips: ["Datum & Uhrzeit", "Habit / Wiederholung", "Erinnerungsmodus"],
      exampleLabel: "Beispiele",
      examples: [
        "„Morgen um 18 Uhr: Versicherung anrufen“",
        "„Jeden Montag: Fitnessstudio“",
        "„Am 5.: Miete zahlen“",
      ],
    },
    everywhere: {
      title: "Echtes Multi-Device",
      text:
        "Remi ist da, wo du bist: Arbeit, Zuhause, unterwegs. Gleicher Zugriff, gleiche Erinnerungen.",
      points: [
        "Computer für schnelle Erfassung bei der Arbeit",
        "Handy / iPad / Tablet für unterwegs",
        "Sofort im Browser nutzen oder als App (PWA) installieren",
      ],
    },
    install: {
      title: "Installiere Remi für Erinnerungen",
      text:
        "Damit du Benachrichtigungen für deine Erinnerungen bekommst, installiere Remi jetzt im Browser (PWA).",
      helper:
        "Wie eine echte App – leichter, schneller und immer aktuell.",
      badge: "App mode",
      bullet1: "Benachrichtigungen für Erinnerungen",
      bullet2: "Icon auf dem Homescreen",
      bullet3: "Vollbild-App-Gefühl",
      mini1: "Leicht und schnell",
      mini2: "Immer aktuell",
      mini3: "Für schnelle Erfassung",
      ctaHint: "Tippe auf „Jetzt installieren“ und folge den Schritten.",
    },
    social: {
      title: "Mit echtem Feedback gebaut",
      subtitle:
        "Remi wird laufend mit echten Tests und Rückmeldungen verbessert.",
      note:
        "Hier später echte Testimonials hinzufügen (lieber nicht erfinden).",
    },
    pricing: {
      title: "Preise",
      subtitle: "Starte gratis. Upgrade nur, wenn es dir wirklich hilft.",
      freeName: "Gratis",
      proName: "Pro (optional)",
      freeItems: [
        "Erinnerungen aus Text erstellen",
        "Ideen & Aufgaben",
        "Basis Multi-Device",
      ],
      proItems: [
        "Erweiterte Automationen / Reminder",
        "Zusätzliche Produktivitäts-Features",
        "Früher Zugriff auf neue Features",
      ],
      footnote:
        "Wenn die Preise noch nicht fix sind, diese Sektion ausblenden und später aktivieren.",
    },
  },
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

    const stored = window.localStorage.getItem("landingLang") as RemiLocale | null;
    if (stored && (["es", "en", "de"] as RemiLocale[]).includes(stored)) return stored;

    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("de")) return "de";
    return "en";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("landingLang", lang);
  }, [lang]);

  const t = landingCopyByLang[lang];
  const x = extraCopyByLang[lang];

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

  // ✅ NUEVO: banner iOS (el de tu captura)
  const [showIosInstallBanner, setShowIosInstallBanner] = React.useState(false);

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

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const installLabel =
    lang === "es" ? "Instalar ahora" : lang === "de" ? "Jetzt installieren" : "Install now";

  const modalTitle =
    lang === "es"
      ? "Instalar Remi"
      : lang === "de"
      ? "Remi installieren"
      : "Install Remi";

  const modalDesc =
    lang === "es"
      ? "Instala Remi desde tu navegador para recibir notificaciones con tus recordatorios y usarla como una app."
      : lang === "de"
      ? "Installiere Remi im Browser, um Benachrichtigungen für Erinnerungen zu erhalten und es wie eine App zu nutzen."
      : "Install Remi from your browser to receive reminder notifications and use it like an app.";

  const iosSteps =
    lang === "es"
      ? [
          "Abre el menú de compartir (icono de compartir en Safari).",
          "Pulsa “Añadir a pantalla de inicio”.",
          "Confirma “Añadir”.",
        ]
      : lang === "de"
      ? [
          "Öffne das Teilen-Menü (Share-Icon in Safari).",
          "Tippe auf „Zum Home-Bildschirm“.",
          "Bestätige „Hinzufügen“.",
        ]
      : [
          "Open the Share menu (Share icon in Safari).",
          "Tap “Add to Home Screen”.",
          "Confirm “Add”.",
        ];

  const desktopSteps =
    lang === "es"
      ? [
          "En Chrome/Edge, busca el icono de “Instalar” en la barra de direcciones o en el menú.",
          "Pulsa “Instalar”.",
        ]
      : lang === "de"
      ? [
          "In Chrome/Edge findest du das „Installieren“-Icon in der Adressleiste oder im Menü.",
          "Klicke auf „Installieren“.",
        ]
      : [
          "In Chrome/Edge, look for the install icon in the address bar or the menu.",
          "Click “Install”.",
        ];

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

  // ✅ NUEVO: click del CTA de la landing
  // - iOS => banner como tu captura
  // - resto => como ahora (abre modal)
  const handleInstallCtaClick = () => {
    if (installed) return;

    if (isIOS()) {
      setShowIosInstallBanner(true);
      setInstallOpen(false);
      return;
    }

    setInstallOpen(true);
  };

  // Textos banner iOS (como en la captura)
  const iosBannerTitle =
    lang === "es"
      ? "Instala Remi en tu iPhone - GRATIS"
      : lang === "de"
      ? "Installiere Remi auf deinem iPhone – GRATIS"
      : "Install Remi on your iPhone — FREE";

  const iosBannerStep1 =
    lang === "es"
      ? "Pulsa el botón Compartir"
      : lang === "de"
      ? "Tippe auf Teilen"
      : "Tap the Share button";

  const iosBannerStep2 =
    lang === "es"
      ? "Elige «Añadir a pantalla de inicio» y confirma."
      : lang === "de"
      ? "Wähle „Zum Home-Bildschirm“ und bestätige."
      : "Choose “Add to Home Screen” and confirm.";

  return (
    <div className="remi-page landing-shell text-foreground">
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* ✅ NUEVO: Banner iOS estilo tu captura (solo cuando se pulsa Instalar en iOS) */}
        {showIosInstallBanner && !installed && (
<div className="fixed bottom-4 left-4 right-4 z-[999] flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 max-w-md w-full border border-slate-200">
              <div className="flex-1 text-sm">
                <div className="font-semibold text-slate-900">{iosBannerTitle}</div>

                <div className="text-xs text-slate-600 mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">1.</span>
                    <span className="text-slate-700">{iosBannerStep1}</span>

                    {/* Icono tipo iOS Share */}
                    <svg
                      className="inline-block w-5 h-5 align-middle text-[#007AFF]"
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
                aria-label={lang === "es" ? "Cerrar" : lang === "de" ? "Schließen" : "Close"}
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
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
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
                      { icon: <Zap className="w-4 h-4" />, text: x.hero.bullets.a },
                      { icon: <Wand2 className="w-4 h-4" />, text: x.hero.bullets.b },
                      { icon: <Bell className="w-4 h-4" />, text: x.hero.bullets.c },
                      { icon: <Tablet className="w-4 h-4" />, text: x.hero.bullets.d },
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
                    { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: x.trustRow.a },
                    { icon: <Zap className="w-3.5 h-3.5" />, text: x.trustRow.b },
                    { icon: <TrendingDown className="w-3.5 h-3.5" />, text: x.trustRow.c },
                  ].map((it, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]"
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
                    <div className="w-10 h-10 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-[#7d59c9]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900">{x.interpret.exampleLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "es"
                          ? "Escribe una frase y listo"
                          : lang === "de"
                          ? "Ein Satz reicht"
                          : "One sentence is enough"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f7f4ff] border border-[#e8ddff] p-4 text-sm text-slate-900 leading-relaxed">
                    {x.interpret.examples.map((ex, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#7d59c9] font-semibold">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {x.interpret.chips.map((chip, idx) => (
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
              <h2 className="text-3xl md:text-4xl font-extrabold">{x.problem.title}</h2>
              <p className="text-base md:text-lg text-muted-foreground">{x.problem.text}</p>
              <p className="text-sm md:text-base text-slate-900">{x.problem.micro}</p>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/15 to-background" />
          <div className="relative z-10 px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-3 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-extrabold">{x.how.title}</h2>
              <p className="text-base md:text-lg text-muted-foreground">{x.how.subtitle}</p>
            </div>

            <div className="mx-auto w-full max-w-6xl grid md:grid-cols-3 gap-6">
              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f4f0ff] flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{x.how.step1Title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{x.how.step1Text}</p>
              </Card>

              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f4f0ff] flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{x.how.step2Title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{x.how.step2Text}</p>
              </Card>

              <Card className="landing-card p-6 md:p-8 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-[#f4f0ff] flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-[#7d59c9]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{x.how.step3Title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{x.how.step3Text}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES (tarjetas comentadas) + INSTALAR */}
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
              <p className="text-base md:text-lg text-muted-foreground">{t.features.subtitle}</p>
            </div>

            {/*
              ✅ TARJETAS ANTERIORES (sobran en este apartado) — comentadas
            */}

            <div className="mx-auto w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">
              <div className="space-y-4 text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {x.install.title}
                </h3>

                <p className="text-base md:text-lg text-muted-foreground">{x.install.text}</p>

                <p className="text-sm md:text-base text-slate-900">{x.install.helper}</p>

                <div className="grid gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
                  {[x.install.bullet1, x.install.bullet2, x.install.bullet3].map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f4f0ff] border border-[#e2d9ff] flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#7d59c9]" />
                      </div>
                      <span className="text-sm md:text-base text-slate-900 leading-snug">{p}</span>
                    </div>
                  ))}
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
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Monitor className="w-3.5 h-3.5" />
                    {lang === "es" ? "Ordenador" : lang === "de" ? "Computer" : "Desktop"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Smartphone className="w-3.5 h-3.5" />
                    {lang === "es" ? "Móvil" : lang === "de" ? "Handy" : "Phone"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Tablet className="w-3.5 h-3.5" />
                    iPad / {lang === "es" ? "Tablet" : lang === "de" ? "Tablet" : "Tablet"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Globe className="w-3.5 h-3.5" />
                    ES / EN / DE
                  </span>
                </div>
              </div>

              {/* Tarjeta visual */}
              <Card className="landing-card p-6 md:p-8 shadow-elegant">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                      <Download className="w-6 h-6 text-[#7d59c9]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{x.install.badge}</p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "es"
                          ? "Notificaciones y acceso rápido"
                          : lang === "de"
                          ? "Benachrichtigungen & Schnellzugriff"
                          : "Notifications & quick access"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-[#7d59c9] bg-[#f4f0ff] px-2.5 py-1 rounded-full">
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
                        {lang === "es"
                          ? "Como app, pero mejor"
                          : lang === "de"
                          ? "Wie eine App – nur besser"
                          : "Like an app—only better"}
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

                <div className="mt-5 rounded-2xl bg-[#f7f4ff] border border-[#e8ddff] p-4">
                  <p className="text-xs font-semibold text-[#7d59c9] mb-2">
                    {x.interpret.exampleLabel}
                  </p>
                  <div className="grid gap-2 text-sm text-slate-900">
                    {x.interpret.examples.map((ex, idx) => (
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

        {/* SOCIAL PROOF (sin inventar) */}
        <section className="py-14 md:py-20 relative">
          <div className="px-6">
            <div className="max-w-5xl mx-auto text-center space-y-3 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-extrabold">{x.social.title}</h2>
              <p className="text-base md:text-lg text-muted-foreground">{x.social.subtitle}</p>

              <div className="mt-8 grid md:grid-cols-2 gap-6 text-left">
                <Card className="landing-card p-6 md:p-7">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                      <Quote className="w-5 h-5 text-[#7d59c9]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lang === "es"
                          ? "“Aquí va un testimonio real cuando lo tengas.”"
                          : lang === "de"
                          ? "„Hier kommt ein echtes Testimonial, sobald du es hast.“"
                          : "“Add a real testimonial here when you have it.”"}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-slate-900">
                        — {lang === "es" ? "Usuario/a" : "User"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="landing-card p-6 md:p-7">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                      <Quote className="w-5 h-5 text-[#7d59c9]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lang === "es"
                          ? "“Otro testimonio real (mejor no inventarlo).”"
                          : lang === "de"
                          ? "„Noch ein echtes Testimonial (lieber nicht erfinden).“"
                          : "“Another real testimonial (better not to invent it).”"}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-slate-900">
                        — {lang === "es" ? "Usuario/a" : "User"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <p className="text-xs text-muted-foreground mt-4">{x.social.note}</p>
            </div>
          </div>
        </section>

        {/* MENTAL LOAD (tu sección original) */}
        <section className="py-16 md:py-24 relative">
          <div className="px-6">
            <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-center lg:text-left">
                  {t.mentalLoad.title.part1}{" "}
                  <span className="text-[#7d59c9]">{t.mentalLoad.title.highlighted}</span>
                </h2>

                <div className="space-y-6 animate-fade-in">
                  <Card className="landing-card p-6 md:p-8 shadow-elegant">
                    <div className="flex flex-col items-center text-center gap-3 md:gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#f4f9ff] flex items-center justify-center shadow-sm">
                        <span className="text-2xl md:text-3xl">😊</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#7d59c9]">
                          {t.mentalLoad.badge}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900">{t.mentalLoad.headline}</h3>
                        <p className="text-xs md:text-sm leading-relaxed text-[#6f6c80] max-w-xs mx-auto">
                          {t.mentalLoad.subheadline}
                        </p>
                      </div>
                    </div>

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

                <p className="text-s md:text-base leading-relaxed text-slate-900 max-w-md text-center">
                  {t.mentalLoad.description}
                </p>

                <div className="rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] border border-slate-100 px-4 py-4 md:px-5 md:py-5">
                  <div className="space-y-4 whitespace-pre-line">
                    {[1, 2, 3].map((step) => {
                      const titleKey =
                        step === 1 ? "step1Title" : step === 2 ? "step2Title" : "step3Title";
                      const descKey =
                        step === 1
                          ? "step1Description"
                          : step === 2
                          ? "step2Description"
                          : "step3Description";

                      return (
                        <div className="flex items-start gap-3" key={step}>
                          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#f0efff] flex items-center justify-center text-[#7d59c9] text-xs md:text-sm font-semibold">
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
              <div className="rounded-[32px] border-2 border-[#7d59c9] bg-[#fdfbff] px-6 py-10 md:px-8 md:py-12 flex flex-col gap-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9] mx-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.cta.badge}</span>
                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                  {t.cta.title.part1}{" "}
                  <span className="text-[#7d59c9]">{t.cta.title.highlighted}</span>
                </h2>

                <p className="text-sm leading-relaxed text-[#6f6c80] max-w-xs mx-auto">
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

                <div className="mt-2 space-y-3 text-left text-xs text-[#6f6c80]">
                  {[t.cta.feature1, t.cta.feature2, t.cta.feature3].map((txt: string, idx: number) => (
                    <div className="flex items-center gap-2" key={idx}>
                      <div className="w-5 h-5 rounded-full bg-[#f4f0ff] border border-[#e2d9ff] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#7d59c9]" />
                      </div>
                      <span>{txt}</span>
                    </div>
                  ))}
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
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Globe className="w-3.5 h-3.5" />
                    ES / EN / DE
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Monitor className="w-3.5 h-3.5" />
                    {lang === "es" ? "Multi-dispositivo" : lang === "de" ? "Multi-Device" : "Multi-device"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0ff] text-[11px] font-medium text-[#7d59c9]">
                    <Download className="w-3.5 h-3.5" />
                    PWA
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground">
              <p>{t.footer.copyright}</p>
              <div className="flex gap-6">{/* redes */}</div>
            </div>
          </div>
        </footer>

        {/* MODAL DE INSTALACIÓN (igual que antes; solo se abre en no-iOS) */}
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
              <div className="mt-2 rounded-2xl bg-[#f7f4ff] border border-[#e8ddff] p-4 text-sm text-slate-900">
                {lang === "es"
                  ? "Remi ya está instalada en este dispositivo. Tus recordatorios pueden llegar como notificaciones."
                  : lang === "de"
                  ? "Remi ist auf diesem Gerät bereits installiert. Deine Erinnerungen können als Benachrichtigungen erscheinen."
                  : "Remi is already installed on this device. Your reminders can arrive as notifications."}
              </div>
            ) : (
              <>
                {deferredPrompt ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl bg-[#f7f4ff] border border-[#e8ddff] p-4 text-sm text-slate-900">
                      {lang === "es"
                        ? "Instálala para recibir notificaciones con tus recordatorios y tener acceso rápido desde el icono."
                        : lang === "de"
                        ? "Installiere es, um Benachrichtigungen für Erinnerungen zu erhalten und schnell über das Icon zuzugreifen."
                        : "Install it to receive reminder notifications and get quick access from the icon."}
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
                    <div className="rounded-2xl bg-[#f7f4ff] border border-[#e8ddff] p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {isIOS()
                          ? lang === "es"
                            ? "En iPhone / iPad (Safari)"
                            : lang === "de"
                            ? "Auf iPhone / iPad (Safari)"
                            : "On iPhone / iPad (Safari)"
                          : lang === "es"
                          ? "En ordenador (Chrome/Edge)"
                          : lang === "de"
                          ? "Am Computer (Chrome/Edge)"
                          : "On desktop (Chrome/Edge)"}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {lang === "es"
                          ? "La instalación es necesaria para recibir notificaciones con tus recordatorios."
                          : lang === "de"
                          ? "Die Installation ist nötig, um Benachrichtigungen für Erinnerungen zu erhalten."
                          : "Installation is required to receive reminder notifications."}
                      </p>

                      <div className="mt-3 grid gap-2 text-sm text-slate-900">
                        {(isIOS() ? iosSteps : desktopSteps).map((s, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-[#7d59c9] font-semibold">{idx + 1}.</span>
                            <span className="leading-snug">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setInstallOpen(false)}
                      >
                        {lang === "es" ? "Cerrar" : lang === "de" ? "Schließen" : "Close"}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full inline-flex items-center justify-center gap-2"
                        onClick={() => window.open(window.location.origin, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {lang === "es"
                          ? "Abrir en navegador"
                          : lang === "de"
                          ? "Im Browser öffnen"
                          : "Open in browser"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {lang === "es"
                        ? "Si tu navegador soporta instalación directa, aparecerá un botón de instalación en este modal."
                        : lang === "de"
                        ? "Wenn dein Browser eine Direktinstallation unterstützt, erscheint in diesem Modal ein Install-Button."
                        : "If your browser supports direct install, an install button will appear in this modal."}
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
