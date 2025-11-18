// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll en la ventana
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Por si usas contenedores con scroll (como .remi-page)
    const pages = document.querySelectorAll<HTMLElement>(".remi-page");
    pages.forEach((el) => {
      el.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname]);

  return null;
}
