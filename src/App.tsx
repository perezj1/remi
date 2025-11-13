// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import TodayPage from "@/pages/Index";
import InboxPage from "@/pages/Inbox";
import IdeasPage from "@/pages/Ideas";
import ProfilePage from "@/pages/Profile";

import AuthPage from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import BottomNav from "@/components/BottomNav";

// Componente que protege rutas privadas
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {/* wrapper para dejar espacio inferior si hace falta */}
      <div className="pb-16">
        <Routes>
          {/* Ruta pública de login/registro */}
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/" replace />}
          />

          {/* Rutas privadas */}
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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Solo mostramos la BottomNav si hay usuario logueado */}
      {user && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
