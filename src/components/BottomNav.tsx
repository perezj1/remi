// src/components/BottomNav.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Inbox, Plus, Brain, type LucideIcon } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const isActive = (path: string) => location.pathname === path;

  const handleCreateClick = () => {
    // Siempre abrimos el modal en la pantalla de Hoy
    navigate("/");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("remi-open-capture"));
    }, 80);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      {/* Píldora blanca */}
      <div className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        {/* Botón: Hoy */}
        <NavItem
          to="/"
          label={t("bottomNav.today")}
          icon={Home}
          active={isActive("/")}
        />

        {/* Botón: Status */}
        <NavItem
          to="/status"
          label={t("bottomNav.status")}
          icon={Brain}
          active={isActive("/status")}
        />

        {/* Botón central: + morado REMI */}
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full border-1 border-white bg-[#7d59c9] text-white shadow-[0_8px_20px_rgba(143,49,243,0.2)] -translate-y-0"
          onClick={handleCreateClick}
          type="button"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Botón: Bandeja */}
        <NavItem
          to="/inbox"
          label={t("bottomNav.inbox")}
          icon={Inbox}
          active={isActive("/inbox")}
        />
      </div>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
}

function NavItem({ to, label, active, icon: Icon }: NavItemProps) {
  return (
    <Link
      to={to}
      className="flex h-12 w-12 items-center justify-center rounded-full transition"
    >
      <Icon
        className={`w-6 h-6 ${
          active ? "text-[#7d59c9]" : "text-neutral-800"
        }`}
      />
      {/* Etiqueta solo para accesibilidad */}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
