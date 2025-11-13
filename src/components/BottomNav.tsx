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
    <nav className="remi-bottom-nav">
      <div className="remi-bottom-nav-inner">
        <NavItem to="/" label="Hoy" icon={Home} active={isActive("/")} />
        <NavItem
          to="/inbox"
          label="Bandeja"
          icon={Inbox}
          active={isActive("/inbox")}
        />
      </div>

      <button className="remi-bottom-cta" onClick={handleCreateClick}>
        <Plus className="w-6 h-6" />
      </button>
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
      className={
        "remi-bottom-link " + (active ? "remi-bottom-link--active" : "")
      }
    >
      <div className="remi-bottom-icon">
        <Icon className="w-4 h-4" />
      </div>
      <span className="remi-bottom-label">{label}</span>
    </Link>
  );
}
