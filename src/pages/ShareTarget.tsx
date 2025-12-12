// src/pages/ShareTarget.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const SHARE_DRAFT_KEY = "remi_share_draft_v1";

function buildSharedText(search: string) {
  const params = new URLSearchParams(search);
  const title = (params.get("title") ?? "").trim();
  const text = (params.get("text") ?? "").trim();
  const url = (params.get("url") ?? "").trim();

  return [title, text, url].filter(Boolean).join("\n").trim();
}

export default function ShareTargetPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const combined = buildSharedText(location.search);

    // 1) Guardamos (o limpiamos) el borrador
    if (combined) {
      sessionStorage.setItem(
        SHARE_DRAFT_KEY,
        JSON.stringify({ text: combined, ts: Date.now() })
      );
    } else {
      sessionStorage.removeItem(SHARE_DRAFT_KEY);
    }

    // 2) Si no hay sesión, mandamos a login preservando el return
    if (!user) {
      navigate("/auth", {
        replace: true,
        state: { from: `/share-target${location.search}` },
      });
      return;
    }

    // 3) Si hay usuario:
    if (combined) {
      navigate("/?shared=1", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [user, location.search, navigate]);

  return null;
}
