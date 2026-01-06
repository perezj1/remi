// src/App.tsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import type { RemiLocale } from "@/locales";

import TodayPage from "@/pages/Index";
import InboxPage from "@/pages/Inbox";
import TasksPage from "@/pages/Tasks";
import IdeasPage from "@/pages/Ideas";
import ProfilePage from "@/pages/Profile";
import AuthPage from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";
import StatusPage from "@/pages/Status";
import ScrollToTop from "@/components/ScrollToTop";
import LandingPage from "@/pages/Landing";

// ✅ Provider + hook para ocultar BottomNav cuando hay modales abiertos
import { ModalUiProvider, useModalUi } from "@/contexts/ModalUiContext";

// ✅ Share Target (pública)
import ShareTargetPage from "@/pages/ShareTarget";

// ✅ OFFLINE SYNC
import { syncOfflineQueue } from "@/lib/syncOfflineQueue";
import { toast } from "sonner";

// ✅ NUEVO: Host global de captura (modales globales)
import RemiCaptureHost from "@/components/RemiCaptureHost";

// ---- RUTAS PROTEGIDAS ----
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate to="/auth" replace state={{ from: location.pathname || "/" }} />
    );
  }
  return children;
}

function AppRoutes() {
  const { user, profile } = useAuth();
  const { lang, setLang } = useI18n();
  const location = useLocation();

  // ✅ lee si hay algún modal abierto
  const { isAnyModalOpen } = useModalUi();

  // ✅ Idioma desde perfil
  React.useEffect(() => {
    const pLang = (((profile as any)?.language ?? null) as RemiLocale | null);

    if (pLang && pLang !== lang && ["es", "en", "de"].includes(pLang)) {
      setLang(pLang);
    }
  }, [profile, lang, setLang]);

  // ✅ OFFLINE: sincroniza al entrar (si hay red) y cuando vuelva la señal
  React.useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const runSync = async (reason: "mount" | "online") => {
      if (cancelled) return;

      if (typeof navigator !== "undefined" && navigator.onLine === false) return;

      try {
        await syncOfflineQueue(user.id);

        if (reason === "online") {
          toast.success("Sincronizado ✅");
        }
      } catch (e) {
        console.error("[App] syncOfflineQueue failed:", e);
      }
    };

    runSync("mount");

    const onOnline = () => runSync("online");
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
    };
  }, [user?.id]);

  type LocationState = { from?: string };
  const state = location.state as LocationState | null;
  const from = state?.from || "/";

  // Ocultar bottom nav en rutas públicas/“técnicas”
  const pathname = location.pathname.toLowerCase();
  const hideBottomNavRoute =
    pathname.startsWith("/landing") || pathname.startsWith("/share-target");

  const isAuthRoute = pathname.startsWith("/auth");

  // ✅ Ocultar también si hay un modal abierto
  const hideBottomNav = hideBottomNavRoute || isAnyModalOpen;

  // ✅ Montar el host SOLO cuando:
  // - hay usuario logueado
  // - y NO estamos en rutas públicas/técnicas
  const shouldMountCaptureHost = !!user && !hideBottomNavRoute;

  // ✅ “Shell” global: altura correcta en móvil + fondo consistente
  const isPublicShell = hideBottomNavRoute || isAuthRoute || !user;
  const shellBgClass = isPublicShell ? "bg-white" : "bg-[#F6F7FB]";

  // ✅ Reserva inferior global para que el contenido nunca quede debajo de la BottomNav
  // Ajusta NAV_RESERVE_PX si cambias el tamaño visual de la pill nav.
  const NAV_RESERVE_PX = 110;
  const shouldReserveBottomSpace = !!user && !hideBottomNavRoute;

  return (
    <div
      className={`min-h-[100dvh] ${shellBgClass} text-slate-900`}
      style={{
        paddingBottom: shouldReserveBottomSpace
          ? `calc(${NAV_RESERVE_PX}px + env(safe-area-inset-bottom))`
          : "env(safe-area-inset-bottom)",
      }}
    >
      <ScrollToTop />

      <Routes>
        {/* Share Target (pública) */}
        <Route path="/share-target" element={<ShareTargetPage />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to={from} replace />}
        />

        {/* Hoy */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <TodayPage />
            </RequireAuth>
          }
        />

        {/* Bandeja */}
        <Route
          path="/inbox"
          element={
            <RequireAuth>
              <InboxPage />
            </RequireAuth>
          }
        />

        {/* Tareas */}
        <Route
          path="/tasks"
          element={
            <RequireAuth>
              <TasksPage />
            </RequireAuth>
          }
        />

        {/* Ideas */}
        <Route
          path="/ideas"
          element={
            <RequireAuth>
              <IdeasPage />
            </RequireAuth>
          }
        />

        {/* Perfil */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* Status */}
        <Route
          path="/status"
          element={
            <RequireAuth>
              <StatusPage />
            </RequireAuth>
          }
        />

        {/* Landing pública */}
        <Route path="/landing" element={<LandingPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ✅ Host global (fuera de Routes) */}
      {shouldMountCaptureHost && <RemiCaptureHost />}

      {/* Bottom nav solo si hay usuario y no está oculto por ruta o modal */}
      {user && !hideBottomNav && <BottomNav />}

      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ModalUiProvider>
            <AppRoutes />
          </ModalUiProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
