// src/App.tsx
import React, { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import { NotificationsCenterProvider } from "@/contexts/NotificationsCenterContext";
import type { RemiLocale } from "@/locales";

import InstallPrompt from "@/components/InstallPrompt";
import ScrollToTop from "@/components/ScrollToTop";

// ✅ Provider + hook para ocultar BottomNav cuando hay modales abiertos
import { ModalUiProvider, useModalUi } from "@/contexts/ModalUiContext";

// ✅ Share Target (pública)

// ✅ OFFLINE SYNC
import { syncOfflineQueue } from "@/lib/syncOfflineQueue";
import { invalidateBrainItemQueries } from "@/lib/brainItemsQueryCache";
import { invalidateSharedListQueries } from "@/lib/sharedListQueryCache";
import { toast } from "sonner";

// ✅ Host global de captura (modales globales)
const TodayPage = React.lazy(() => import("@/pages/Index"));
const TasksPage = React.lazy(() => import("@/pages/Tasks"));
const SharedListsPage = React.lazy(() => import("@/pages/Lists"));
const ProfilePage = React.lazy(() => import("@/pages/Profile"));
const AuthPage = React.lazy(() => import("@/pages/Auth"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const BottomNav = React.lazy(() => import("@/components/BottomNav"));
const StatusPage = React.lazy(() => import("@/pages/Status"));
const LandingPage = React.lazy(() => import("@/pages/Landing"));
const ShareInvitePage = React.lazy(() => import("@/pages/ShareInvitePage"));
const SharedListInvitePage = React.lazy(() => import("@/pages/SharedListInvitePage"));
const LegalPage = React.lazy(() => import("@/pages/Legal"));
const ResetPasswordPage = React.lazy(() => import("@/pages/ResetPassword"));
const ShareTargetPage = React.lazy(() => import("@/pages/ShareTarget"));
const RemiCaptureHost = React.lazy(() => import("@/components/RemiCaptureHost"));

// ✅ Supabase client (ruta correcta)
import { supabase } from "@/integrations/supabase/client";

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

// ✅ helper: actualiza last_active_at con throttle (30 min por dispositivo)
async function touchLastActive(userId: string) {
  if (!userId) return;

  const key = `remi:last_active_sent_at:${userId}`;
  const nowMs = Date.now();
  const throttleMs = 30 * 60 * 1000;

  try {
    const last = Number(localStorage.getItem(key) || "0");
    if (last && nowMs - last < throttleMs) return;

    localStorage.setItem(key, String(nowMs));

    const { error } = await supabase
      .from("remi_user_settings")
      .update({ last_active_at: new Date(nowMs).toISOString() })
      .eq("user_id", userId);

    // Si falla, permitimos reintento pronto
    if (error) {
      localStorage.removeItem(key);
      console.error("[App] touchLastActive failed:", error);
    }
  } catch (e) {
    console.error("[App] touchLastActive error:", e);
  }
}

function RouteFallback() {
  return <div className="min-h-[100dvh] bg-[#fafafe]" />;
}

function AppDataRefreshBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const onChanged = () => {
      void Promise.all([
        invalidateBrainItemQueries(queryClient, user.id),
        invalidateSharedListQueries(queryClient, user.id),
      ]).catch((error) => {
        console.error("[App] cache refresh failed:", error);
      });
    };

    window.addEventListener("remi-items-changed", onChanged);
    return () => window.removeEventListener("remi-items-changed", onChanged);
  }, [queryClient, user]);

  return null;
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

  // ✅ NUEVO: marcar actividad del usuario (last_active_at)
  React.useEffect(() => {
    if (!user?.id) return;
    touchLastActive(user.id);
  }, [user?.id]);

  // ✅ NUEVO: también marcar actividad al cambiar de ruta (throttle 30 min)
  React.useEffect(() => {
    if (!user?.id) return;
    touchLastActive(user.id);
  }, [location.pathname, user?.id]);

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

  const pathname = location.pathname.toLowerCase();
  const search = location.search.toLowerCase();
  const hash = location.hash.toLowerCase();

  // ✅ NUEVO: si la URL contiene "share" (en path o query), NO queremos modales globales
  // Esto cubre: /share/:token, /share-target, y cualquier ruta con ?share=...
  const isShareUrl =
    pathname.includes("/share") ||
    pathname.startsWith("/lists/invite") ||
    search.includes("share");

  // Ocultar bottom nav en rutas públicas/“técnicas”
  const hideBottomNavRoute =
    pathname.startsWith("/landing") ||
    pathname.startsWith("/share-target") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/reset-password");

  const isAuthRoute = pathname.startsWith("/auth");
  const isAuthRecoveryRoute =
    isAuthRoute &&
    (hash.includes("type=recovery") ||
      hash.includes("access_token=") ||
      search.includes("type=recovery") ||
      search.includes("token_hash=") ||
      search.includes("code="));
  const isLandingRoute = pathname.startsWith("/landing");
  const isLegalRoute = pathname.startsWith("/legal");
  const isResetPasswordRoute = pathname.startsWith("/reset-password");

  // ✅ NUEVO: Ocultar también si es share URL (para evitar overlays en share)
  const hideBottomNav =
    hideBottomNavRoute || isAnyModalOpen || isShareUrl;

  // ✅ Montar el host SOLO cuando:
  // - hay usuario logueado
  // - y NO estamos en rutas públicas/técnicas
  // ✅ NUEVO: y NO estamos en share URLs (para que no aparezcan modales)
  const shouldMountCaptureHost = !!user && !hideBottomNavRoute && !isShareUrl;

  // ✅ “Shell” global: altura correcta en móvil + fondo consistente
  const isPublicShell = hideBottomNavRoute || isAuthRoute || !user;

  // ✅ Para share: usa el mismo fondo suave (evita “blanco infinito”)
  // ✅ En rutas internas logueadas: fondo uniforme suave hasta abajo.
  const isAppPrivateRoute = !!user && !isPublicShell && !isShareUrl;
  const shellBgClass = isShareUrl
    ? "bg-[#F6F7FB]"
    : isAppPrivateRoute
      ? "bg-[#fafafe]"
      : isPublicShell
        ? "bg-white"
        : "bg-white";

  // ✅ Reserva inferior global para que el contenido nunca quede debajo de la BottomNav
  const NAV_RESERVE_PX = 110;

  // ✅ FIX BottomNav + modales:
  // Si hay un modal abierto, NO reservamos espacio abajo.
  // ✅ NUEVO: Si es share URL, tampoco reservamos.
  const shouldReserveBottomSpace = !!user && !hideBottomNav && !isShareUrl;

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

      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Share Target (pública) */}
        <Route path="/share-target" element={<ShareTargetPage />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={!user || isAuthRecoveryRoute ? <AuthPage /> : <Navigate to={from} replace />}
        />

        {/* Reset password (pública) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Hoy */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <TodayPage />
            </RequireAuth>
          }
        />

        {/* Bandeja antigua -> Recordatorios */}
        <Route
          path="/inbox"
          element={
            <RequireAuth>
              <Navigate to="/tasks" replace />
            </RequireAuth>
          }
        />

        {/* Recordatorios */}
        <Route
          path="/tasks"
          element={
            <RequireAuth>
              <TasksPage />
            </RequireAuth>
          }
        />

        {/* Ideas antiguas -> Recordatorios / Notas */}
        <Route
          path="/ideas"
          element={
            <RequireAuth>
              <Navigate to="/tasks?tab=notes" replace />
            </RequireAuth>
          }
        />

        {/* Listas compartidas */}
        <Route
          path="/lists"
          element={
            <RequireAuth>
              <SharedListsPage />
            </RequireAuth>
          }
        />
        <Route path="/lists/invite/*" element={<SharedListInvitePage />} />

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

        {/* Legal pública */}
        <Route path="/legal" element={<Navigate to="/legal/terms" replace />} />
        <Route path="/legal/:doc" element={<LegalPage />} />

        {/* share page */}
        <Route path="/share/:token" element={<ShareInvitePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      {/* ✅ Host global (fuera de Routes) */}
      {/* ✅ NUEVO: nunca montar en URLs de share */}
      {shouldMountCaptureHost && (
        <Suspense fallback={null}>
          <RemiCaptureHost />
        </Suspense>
      )}

      {/* Bottom nav solo si hay usuario y no está oculto por ruta o modal */}
      {/* ✅ NUEVO: también ocultar en URLs de share */}
      {user && !hideBottomNav && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}

      {!isLandingRoute && !isLegalRoute && !isAuthRoute && !isResetPasswordRoute && <InstallPrompt />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <I18nProvider>
          <ModalUiProvider>
            <NotificationsCenterProvider>
              <AppDataRefreshBridge />
              <AppRoutes />
            </NotificationsCenterProvider>
          </ModalUiProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
