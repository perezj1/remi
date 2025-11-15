// src/components/BottomNav.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Inbox, Plus, type LucideIcon } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
        {/* Botón izquierdo: Hoy */}
        <NavItem
          to="/"
          label="Hoy"
          icon={Home}
          active={isActive("/")}
        />

        {/* Botón central: + morado REMI */}
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#8F31F3] text-white shadow-[0_8px_20px_rgba(143,49,243,0.6)] -translate-y-1"
          onClick={handleCreateClick}
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Botón derecho: Bandeja */}
        <NavItem
          to="/inbox"
          label="Bandeja"
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
      className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 transition"
    >
      <Icon
        className={`w-6 h-6 ${
          active ? "text-[#8F31F3]" : "text-neutral-800"
        }`}
      />
      {/* Etiqueta solo para accesibilidad */}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
