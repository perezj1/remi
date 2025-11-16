import { useEffect, useState } from "react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      // Evita el mini-banner automático
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("User accepted A2HS");
    } else {
      console.log("User dismissed A2HS");
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm w-full">
        <div className="flex-1 text-sm">
          <div className="font-semibold">Instala Remi</div>
          <div className="text-xs text-slate-500">
            Añade Remi a tu lista de aplicaciones - GRATIS!
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-full bg-[#8F31F3] text-white text-xs font-semibold"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
