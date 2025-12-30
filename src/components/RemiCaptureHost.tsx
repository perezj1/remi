// src/components/RemiCaptureHost.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useModalUi } from "@/contexts/ModalUiContext";

import MindDumpModal from "@/components/MindDumpModal";
import MentalDumpModal from "@/components/MentalDumpModal";

import {
  ReminderMode,
  RepeatType,
  createIdea,
  createTask,
} from "@/lib/brainItemsApi";

import { SHARE_DRAFT_KEY } from "@/pages/ShareTarget";

const NAV_DICTATION_KEY = "remi_nav_dictation_pending_v1";
const AUTO_OPEN_LAST_TS_KEY = "remi_auto_open_last_ts_v1";
const AUTO_OPEN_COOLDOWN_MS = 1500;

function isShareEntry(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    return params.get("shared") === "1";
  } catch {
    return false;
  }
}

function removeSharedParam(search: string): string {
  try {
    const params = new URLSearchParams(search);
    params.delete("shared");
    const next = params.toString();
    return next ? `?${next}` : "";
  } catch {
    return "";
  }
}

export default function RemiCaptureHost() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { setModalOpen } = useModalUi();

  const location = useLocation();
  const navigate = useNavigate();

  const safeT = useCallback(
    (key: string, fallback: string, vars?: Record<string, any>) => {
      const v = t(key as any, vars as any);
      if (!v || v === key) return fallback;
      return v;
    },
    [t],
  );

  // ✅ modal inicial (MindDumpModal)
  const [mindDumpOpen, setMindDumpOpen] = useState(false);
  const [mindDumpInitialText, setMindDumpInitialText] = useState<string>("");
  const [mindDumpInitialNonce, setMindDumpInitialNonce] = useState(0);

  // ✅ modal de revisión (MentalDumpModal)
  const [mentalDumpOpen, setMentalDumpOpen] = useState(false);
  const [mentalDumpInitialText, setMentalDumpInitialText] =
    useState<string>("");
  const [mentalDumpInitialNonce, setMentalDumpInitialNonce] = useState(0);

  const skipNextAutoOpenRef = useRef(false);

  // ✅ esconder BottomNav cuando cualquiera de los 2 modales está abierto
  useEffect(() => {
    if (!mindDumpOpen) return;
    setModalOpen(true);
    return () => setModalOpen(false);
  }, [mindDumpOpen, setModalOpen]);

  useEffect(() => {
    if (!mentalDumpOpen) return;
    setModalOpen(true);
    return () => setModalOpen(false);
  }, [mentalDumpOpen, setModalOpen]);

  const openReviewFromMindDump = useCallback((text: string) => {
    setMentalDumpInitialText(text);
    setMentalDumpInitialNonce((n) => n + 1);
    setMentalDumpOpen(true);
    setMindDumpOpen(false);
  }, []);

  const shouldAutoPreview = mentalDumpInitialText.trim().length > 0;

  // ✅ API global: abrir capture desde cualquier parte
  const openCapture = useCallback((prefill?: string) => {
    setMindDumpInitialText(prefill ?? "");
    setMindDumpInitialNonce((n) => n + 1);
    setMindDumpOpen(true);
  }, []);

  // ✅ Auto-open “central” (cold start + resume)
  const openMindDumpAuto = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    // si venimos de share, lo gestiona el efecto de SHARE_DRAFT (evitamos abrir vacío)
    if (isShareEntry(location.search)) return;

    // si el flujo de share pidió saltarse un auto-open, respetarlo
    if (skipNextAutoOpenRef.current) {
      skipNextAutoOpenRef.current = false;
      return;
    }

    // cooldown anti doble disparo
    try {
      const now = Date.now();
      const last = Number(
        sessionStorage.getItem(AUTO_OPEN_LAST_TS_KEY) || "0",
      );
      if (now - last < AUTO_OPEN_COOLDOWN_MS) return;
      sessionStorage.setItem(AUTO_OPEN_LAST_TS_KEY, String(now));
    } catch {
      // ignore
    }

    // si hay draft de share pendiente, no abras vacío aquí
    try {
      const hasShareDraft = !!sessionStorage.getItem(SHARE_DRAFT_KEY);
      if (hasShareDraft) return;
    } catch {
      // ignore
    }

    // si hay dictado pendiente, úsalo como prefill
    try {
      const pending = sessionStorage.getItem(NAV_DICTATION_KEY);
      if (pending && pending.trim().length > 0) {
        sessionStorage.removeItem(NAV_DICTATION_KEY);
        openCapture(pending.trim());
        return;
      }
    } catch {
      // ignore
    }

    // ✅ abrir vacío SIEMPRE (da igual ruta/pestaña)
    openCapture("");
  }, [location.search, openCapture, user]);

  // ✅ Auto-open en cold start (pero NO en refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    try {
      const nav = performance
        .getEntriesByType?.("navigation")
        ?.at(0) as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") return;
    } catch {
      // si no hay soporte, seguimos
    }

    openMindDumpAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ✅ Auto-open al volver desde segundo plano / restauración (resume)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") openMindDumpAuto();
    };

    const onPageShow = () => openMindDumpAuto();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [openMindDumpAuto, user]);

  // ✅ Leer draft compartido (desde /share-target) SIN obligar a ir a "/"
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const hasSharedFlag = isShareEntry(location.search);

    const raw = sessionStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) {
      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        navigate(
          { pathname: location.pathname, search: removeSharedParam(location.search) },
          { replace: true },
        );
      }
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { text?: unknown; ts?: unknown };
      const text = String(parsed?.text ?? "").trim();

      sessionStorage.removeItem(SHARE_DRAFT_KEY);

      if (!text) {
        if (hasSharedFlag) {
          skipNextAutoOpenRef.current = true;
          navigate(
            { pathname: location.pathname, search: removeSharedParam(location.search) },
            { replace: true },
          );
        }
        return;
      }

      openCapture(text);

      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        navigate(
          { pathname: location.pathname, search: removeSharedParam(location.search) },
          { replace: true },
        );
      }
    } catch (e) {
      console.error("Invalid share draft JSON", e);
      try {
        sessionStorage.removeItem(SHARE_DRAFT_KEY);
      } catch {
        // ignore
      }
      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        navigate(
          { pathname: location.pathname, search: removeSharedParam(location.search) },
          { replace: true },
        );
      }
    }
  }, [user?.id, location.pathname, location.search, navigate, openCapture]);

  // ✅ Eventos globales
  useEffect(() => {
    const onOpenCapture = (ev: Event) => {
      const ce = ev as CustomEvent<any>;
      const incomingText =
        typeof ce?.detail?.initialText === "string" ? ce.detail.initialText : "";
      openCapture(incomingText?.trim?.() ?? "");
    };

    const onOpenMentalDump = () => openCapture("");

    window.addEventListener("remi-open-capture", onOpenCapture as EventListener);
    window.addEventListener("remi-open-mental-dump", onOpenMentalDump);

    return () => {
      window.removeEventListener(
        "remi-open-capture",
        onOpenCapture as EventListener,
      );
      window.removeEventListener("remi-open-mental-dump", onOpenMentalDump);
    };
  }, [openCapture]);

  // ✅ Crear (global) y avisar a las páginas que recarguen
  const emitItemsChanged = useCallback(() => {
    try {
      window.dispatchEvent(new Event("remi-items-changed"));
    } catch {
      // ignore
    }
  }, []);

  const handleCreateTask = useCallback(
    async (
      title: string,
      dueDate: string | null,
      reminderMode: ReminderMode,
      repeatType: RepeatType,
    ) => {
      if (!user) return;
      await createTask(user.id, title, dueDate, reminderMode, repeatType);
      emitItemsChanged();
    },
    [emitItemsChanged, user],
  );

  const handleCreateIdea = useCallback(
    async (title: string) => {
      if (!user) return;
      await createIdea(user.id, title);
      emitItemsChanged();
    },
    [emitItemsChanged, user],
  );

  return (
    <>
      <MindDumpModal
        open={mindDumpOpen}
        onClose={() => setMindDumpOpen(false)}
        onOpenReview={openReviewFromMindDump}
        initialText={mindDumpInitialText}
        initialTextNonce={mindDumpInitialNonce}
      />

      <MentalDumpModal
        open={mentalDumpOpen}
        onClose={() => setMentalDumpOpen(false)}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
        initialText={mentalDumpInitialText}
        initialTextNonce={mentalDumpInitialNonce}
        autoPreview={shouldAutoPreview}
      />
    </>
  );
}
