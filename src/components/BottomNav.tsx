// src/components/BottomNav.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";

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
        <NavItem to="/" label="Hoy" active={isActive("/")} />
        <NavItem to="/inbox" label="Bandeja" active={isActive("/inbox")} />
      </div>

      <button className="remi-bottom-cta" onClick={handleCreateClick}>
        +
      </button>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  active?: boolean;
}

function NavItem({ to, label, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={
        "remi-bottom-link " + (active ? "remi-bottom-link--active" : "")
      }
    >
      <div className="remi-bottom-icon" />
      <span className="remi-bottom-label">{label}</span>
    </Link>
  );
}
