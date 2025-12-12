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

// ✅ NUEVO: página que recibe el share_target
import ShareTargetPage from "@/pages/ShareTarget";

// ---- RUTAS PROTEGIDAS ----
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }
  return children;
}

function AppRoutes() {
  const { user, profile } = useAuth();
  const { lang, setLang } = useI18n();
  const location = useLocation();

  React.useEffect(() => {
    const pLang = (((profile as any)?.language ?? null) as RemiLocale | null);

    if (pLang && pLang !== lang && ["es", "en", "de"].includes(pLang)) {
      setLang(pLang);
    }
  }, [profile, lang, setLang]);

  type LocationState = { from?: string };
  const state = location.state as LocationState | null;
  const from = state?.from || "/";

  // Ocultar bottom nav en rutas públicas/“técnicas”
  const pathname = location.pathname.toLowerCase();
  const hideBottomNav =
    pathname.startsWith("/landing") || pathname.startsWith("/share-target");

  return (
    <>
      {/* Siempre que cambie la ruta, pone el scroll arriba */}
      <ScrollToTop />

      <Routes>
        {/* ✅ Share Target (pública): Android "Compartir → Remi" entra aquí */}
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

        {/* Bandeja de entrada (Todo) */}
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

      {/* Bottom nav solo si hay usuario y NO estamos en /landing o /share-target */}
      {user && !hideBottomNav && <BottomNav />}

      <InstallPrompt />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <AppRoutes />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
