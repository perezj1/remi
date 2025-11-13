// src/components/BottomNav.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleCreateClick = () => {
    // Navegamos a Home y luego lanzamos un evento para que Index abra el modal
    navigate("/");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("remi-open-capture"));
    }, 80);
  };

  return (
    <nav className="remi-bottom-nav">
      <div className="remi-bottom-nav-inner">
        <NavItem to="/" label="Hoy" icon="🏠" active={isActive("/")} />
        <NavItem
          to="/inbox"
          label="Bandeja"
          icon="📥"
          active={isActive("/inbox")}
        />
        <NavItem
          to="/ideas"
          label="Ideas"
          icon="💡"
          active={isActive("/ideas")}
        />
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
  icon: string;
  active?: boolean;
}

function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={
        "remi-bottom-link " + (active ? "remi-bottom-link--active" : "")
      }
    >
      <span className="remi-bottom-link-icon">{icon}</span>
      <span className="remi-bottom-link-label">{label}</span>
    </Link>
  );
}
