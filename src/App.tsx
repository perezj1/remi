// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import type { RemiLocale } from "@/locales";

import TodayPage from "@/pages/Index";
import InboxPage from "@/pages/Inbox";
import IdeasPage from "@/pages/Ideas";
import ProfilePage from "@/pages/Profile";
import AuthPage from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

// Protege rutas privadas
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, profile } = useAuth();
  const { lang, setLang } = useI18n();

  // 👇 si existe profiles.language, manda sobre navegador/localStorage
  React.useEffect(() => {
    // profile viene tipado como ProfileRow (sin language), así que casteamos
    const pLang =
      (((profile as any)?.language ?? null) as RemiLocale | null);

    if (pLang && pLang !== lang && ["es", "en", "de"].includes(pLang)) {
      setLang(pLang);
    }
  }, [profile, lang, setLang]); // dependemos de profile completo, no de profile?.language

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <TodayPage />
            </RequireAuth>
          }
        />

        <Route
          path="/inbox"
          element={
            <RequireAuth>
              <InboxPage />
            </RequireAuth>
          }
        />

        <Route
          path="/ideas"
          element={
            <RequireAuth>
              <IdeasPage />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {user && <BottomNav />}

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
