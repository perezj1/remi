// src/components/RemiCaptureHost.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
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

// ✅ Ajusta aquí si tu “index” real es "/index" en lugar de "/"
const INDEX_PATHNAME = "/";

// ✅ token para forzar 2 URLs distintas en el historial
const MODAL_HISTORY_KEY = "_mh"; // 0 base, 1 modal

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

/** ---------------------------
 * ✅ Modal in URL (single modal)
 * -------------------------- */
type ModalKind = "mind" | "mental";

function getModalParam(search: string): ModalKind | null {
  try {
    const p = new URLSearchParams(search);
    const v = p.get("modal");
    if (v === "mind" || v === "mental") return v;
    return null;
  } catch {
    return null;
  }
}

function setModalParam(search: string, modal: ModalKind): string {
  try {
    const p = new URLSearchParams(search);
    p.set("modal", modal);
    const s = p.toString();
    return s ? `?${s}` : "";
  } catch {
    return `?modal=${modal}`;
  }
}

function clearModalParam(search: string): string {
  try {
    const p = new URLSearchParams(search);
    p.delete("modal");
    const s = p.toString();
    return s ? `?${s}` : "";
  } catch {
    return "";
  }
}

function setHistoryToken(search: string, token: "0" | "1"): string {
  try {
    const p = new URLSearchParams(search);
    p.set(MODAL_HISTORY_KEY, token);
    const s = p.toString();
    return s ? `?${s}` : "";
  } catch {
    return `?${MODAL_HISTORY_KEY}=${token}`;
  }
}

function clearHistoryToken(search: string): string {
  try {
    const p = new URLSearchParams(search);
    p.delete(MODAL_HISTORY_KEY);
    const s = p.toString();
    return s ? `?${s}` : "";
  } catch {
    return "";
  }
}

function isStandalonePwa(): boolean {
  try {
    // iOS (navigator.standalone) + estándar (display-mode)
    const anyNav = navigator as any;
    const iosStandalone = !!anyNav?.standalone;
    const displayStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
    return !!(iosStandalone || displayStandalone);
  } catch {
    return false;
  }
}

export default function RemiCaptureHost() {
  const { user } = useAuth();
  const { setModalOpen } = useModalUi();

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ modal inicial (MindDumpModal)
  const [mindDumpOpen, setMindDumpOpen] = useState(false);
  const [mindDumpInitialText, setMindDumpInitialText] = useState<string>("");
  const [mindDumpInitialNonce, setMindDumpInitialNonce] = useState(0);

  // ✅ modal de revisión (MentalDumpModal)
  const [mentalDumpOpen, setMentalDumpOpen] = useState(false);
  const [mentalDumpInitialText, setMentalDumpInitialText] = useState<string>("");
  const [mentalDumpInitialNonce, setMentalDumpInitialNonce] = useState(0);

  const skipNextAutoOpenRef = useRef(false);
  const autoOpenScheduledRef = useRef(false);

  // ✅ 1 solo indicador global para UI (BottomNav etc.)
  useEffect(() => {
    setModalOpen(mindDumpOpen || mentalDumpOpen);
    return () => setModalOpen(false);
  }, [mindDumpOpen, mentalDumpOpen, setModalOpen]);

  // ✅ Sync URL -> state (para back/forward)
  const modalInUrl = getModalParam(location.search);

  useEffect(() => {
    const wantMind = modalInUrl === "mind";
    const wantMental = modalInUrl === "mental";

    if (mindDumpOpen !== wantMind) setMindDumpOpen(wantMind);
    if (mentalDumpOpen !== wantMental) setMentalDumpOpen(wantMental);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalInUrl]);

  /**
   * ✅ Apertura robusta (PWA cold start):
   * - base:  INDEX + _mh=0 (sin modal)  (replace)
   * - modal: INDEX + _mh=1 + modal=...  (push)
   *
   * El truco es que las URLs sean distintas (_mh=0 vs _mh=1)
   * y que el push del modal ocurra un tick después (setTimeout).
   */
  const openCapture = useCallback(
    (prefill?: string, source: "auto" | "user" = "user") => {
      setMindDumpInitialText(prefill ?? "");
      setMindDumpInitialNonce((n) => n + 1);

      setMentalDumpOpen(false);
      setMindDumpOpen(true);

      // Siempre sobre index
      const cleaned = clearHistoryToken(clearModalParam(location.search));
      const baseSearch = setHistoryToken(cleaned, "0");
      const modalSearch = setModalParam(setHistoryToken(cleaned, "1"), "mind");

      // 1) dejar base en la entrada actual
      navigate({ pathname: INDEX_PATHNAME, search: baseSearch }, { replace: true });

      // 2) push del modal
      const delay = source === "auto" && isStandalonePwa() ? 60 : 0;
      window.setTimeout(() => {
        navigate({ pathname: INDEX_PATHNAME, search: modalSearch }, { replace: false });
      }, delay);
    },
    [location.search, navigate]
  );

  // ✅ cambiar Mind -> Mental (replace para que "Atrás" cierre modal, no vuelva a mind)
  const openReviewFromMindDump = useCallback(
    (text: string) => {
      setMentalDumpInitialText(text);
      setMentalDumpInitialNonce((n) => n + 1);

      setMindDumpOpen(false);
      setMentalDumpOpen(true);

      const cleaned = clearHistoryToken(clearModalParam(location.search));
      const modalSearch = setModalParam(setHistoryToken(cleaned, "1"), "mental");

      navigate({ pathname: INDEX_PATHNAME, search: modalSearch }, { replace: true });
    },
    [location.search, navigate]
  );

  const shouldAutoPreview = mentalDumpInitialText.trim().length > 0;

  // ✅ Auto-open “central” (cold start + resume)
  const openMindDumpAuto = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    // si ya hay modal en la URL, no auto-abrir
    if (getModalParam(location.search)) return;

    // si venimos de share, lo gestiona el efecto de SHARE_DRAFT
    if (isShareEntry(location.search)) return;

    // si el flujo de share pidió saltarse un auto-open, respetarlo
    if (skipNextAutoOpenRef.current) {
      skipNextAutoOpenRef.current = false;
      return;
    }

    // cooldown anti doble disparo
    try {
      const now = Date.now();
      const last = Number(sessionStorage.getItem(AUTO_OPEN_LAST_TS_KEY) || "0");
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
        openCapture(pending.trim(), "auto");
        return;
      }
    } catch {
      // ignore
    }

    openCapture("", "auto");
  }, [location.search, openCapture, user]);

  // ✅ Auto-open en cold start (pero NO en refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    // Evitar doble disparo en PWA: cold start puede lanzar varios eventos (pageshow + visibility)
    if (autoOpenScheduledRef.current) return;
    autoOpenScheduledRef.current = true;

    try {
      const nav = performance
        .getEntriesByType?.("navigation")
        ?.at(0) as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") return;
    } catch {
      // ignore
    }

    // Pequeño delay para que BrowserRouter esté totalmente listo en PWA instalada
    window.setTimeout(() => {
      openMindDumpAuto();
    }, isStandalonePwa() ? 80 : 0);

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

  // ✅ Leer draft compartido (desde /share-target)
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const currentSearch = window.location.search || location.search;
    const hasSharedFlag = isShareEntry(currentSearch);

    const raw = sessionStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) {
      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        const latestSearch = window.location.search || location.search;
        navigate(
          { pathname: INDEX_PATHNAME, search: removeSharedParam(latestSearch) },
          { replace: true }
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
          const latestSearch = window.location.search || location.search;
          navigate(
            { pathname: INDEX_PATHNAME, search: removeSharedParam(latestSearch) },
            { replace: true }
          );
        }
        return;
      }

      openCapture(text, "auto");

      if (hasSharedFlag) {
        skipNextAutoOpenRef.current = true;
        const latestSearch = window.location.search || location.search;
        navigate(
          { pathname: INDEX_PATHNAME, search: removeSharedParam(latestSearch) },
          { replace: true }
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
        const latestSearch = window.location.search || location.search;
        navigate(
          { pathname: INDEX_PATHNAME, search: removeSharedParam(latestSearch) },
          { replace: true }
        );
      }
    }
  }, [user?.id, location.search, navigate, openCapture]);

  // ✅ Eventos globales (user initiated)
  useEffect(() => {
    const onOpenCapture = (ev: Event) => {
      const ce = ev as CustomEvent<any>;
      const incomingText =
        typeof ce?.detail?.initialText === "string" ? ce.detail.initialText : "";
      openCapture(incomingText?.trim?.() ?? "", "user");
    };

    const onOpenMentalDump = () => openCapture("", "user");

    window.addEventListener("remi-open-capture", onOpenCapture as EventListener);
    window.addEventListener("remi-open-mental-dump", onOpenMentalDump);

    return () => {
      window.removeEventListener("remi-open-capture", onOpenCapture as EventListener);
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
      repeatType: RepeatType
    ) => {
      if (!user) return;
      await createTask(user.id, title, dueDate, reminderMode, repeatType);
      emitItemsChanged();
    },
    [emitItemsChanged, user]
  );

  const handleCreateIdea = useCallback(
    async (title: string) => {
      if (!user) return;
      await createIdea(user.id, title);
      emitItemsChanged();
    },
    [emitItemsChanged, user]
  );

  // ✅ Cierre: siempre cerrar y dejar INDEX limpio (sin modal, sin _mh)
  const closeAllAndGoIndex = useCallback(() => {
    setMindDumpOpen(false);
    setMentalDumpOpen(false);

    const cleaned = clearHistoryToken(clearModalParam(window.location.search || location.search));
    navigate({ pathname: INDEX_PATHNAME, search: cleaned }, { replace: true });
  }, [location.search, navigate]);

  return (
    <>
      <MindDumpModal
        open={mindDumpOpen}
        onClose={closeAllAndGoIndex}
        onOpenReview={openReviewFromMindDump}
        initialText={mindDumpInitialText}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
        initialTextNonce={mindDumpInitialNonce}
      />

      <MentalDumpModal
        open={mentalDumpOpen}
        onClose={closeAllAndGoIndex}
        onCreateTask={handleCreateTask}
        onCreateIdea={handleCreateIdea}
        initialText={mentalDumpInitialText}
        initialTextNonce={mentalDumpInitialNonce}
        autoPreview={shouldAutoPreview}
      />
    </>
  );
}
