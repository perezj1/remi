import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    "remi-open-install": Event;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

function detectIsIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || window.navigator.vendor;
  return /iPad|iPhone|iPod/.test(ua);
}

function detectIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const { t } = useI18n();

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const ios = detectIsIos();
    setIsIos(ios);

    if (ios && !detectIsStandalone()) {
      setShowIosInstructions(true);
    }
  }, []);

  useEffect(() => {
    if (isIos) return;

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIos]);

  useEffect(() => {
    const openHandler = () => {
      if (isIos) {
        if (!detectIsStandalone()) setShowIosInstructions(true);
      } else if (deferredPrompt) {
        setShowPwaPrompt(true);
      }
    };

    window.addEventListener("remi-open-install", openHandler);
    return () => window.removeEventListener("remi-open-install", openHandler);
  }, [isIos, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log("A2HS choice:", choice.outcome);

    setDeferredPrompt(null);
    setShowPwaPrompt(false);
  };

  const handleClosePwa = () => setShowPwaPrompt(false);
  const handleCloseIos = () => setShowIosInstructions(false);

  if (!showPwaPrompt && !showIosInstructions) return null;

  return (
    <div className="fixed left-4 right-4 z-50 flex justify-center bottom-[calc(1rem+78px+env(safe-area-inset-bottom))]">
      <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm w-full relative">
        <div className="flex-1 text-sm pr-10">
          {showIosInstructions ? (
            <>
              <div className="font-semibold">{t("installPrompt.iosTitle")}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("installPrompt.iosStep1BeforeShare")}{" "}
                <span className="font-semibold">
                  {t("installPrompt.iosShareLabel")}
                </span>
                <svg
                  className="inline-block w-5 h-5 ml-1 align-middle text-[#007AFF]"
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
                {t("installPrompt.iosStep1AfterShare")}
                <br />
                {t("installPrompt.iosStep2BeforeAction")}{" "}
                <span className="font-semibold">
                  «{t("installPrompt.iosAddToHome")}»
                </span>{" "}
                {t("installPrompt.iosStep2AfterAction")}
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold">
                {t("installPrompt.defaultTitle")}
              </div>
              <div className="text-xs text-slate-500">
                {t("installPrompt.defaultDescription")}
              </div>
            </>
          )}
        </div>

        {/* ✅ X: más arriba + un pelín a la derecha, y con hitbox cómoda */}
        <button
          onClick={showIosInstructions ? handleCloseIos : handleClosePwa}
          aria-label={t("installPrompt.close")}
          className="absolute -top-2 right-1 p-2 text-xs text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        {/* ✅ Instalar: un poco más abajo para no pegarse a la X */}
        {showPwaPrompt && !showIosInstructions && (
          <button
            onClick={handleInstallClick}
            className="mt-5 px-3 py-1.5 rounded-full bg-[#7d59c9] text-white text-xs font-semibold"
          >
            {t("installPrompt.buttonInstall")}
          </button>
        )}
      </div>
    </div>
  );
}
