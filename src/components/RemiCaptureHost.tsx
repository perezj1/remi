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

// ✅ Ajusta si tu index real es "/index"
const INDEX_PATHNAME = "/";

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
  const [mentalDumpInitialText, setMentalDumpInitialText] =
    useState<string>("");
  const [mentalDumpInitialNonce, setMentalDumpInitialNonce] = useState(0);

  const skipNextAutoOpenRef = useRef(false);

  // -------------------------
  // ✅ Back-trap (evita que "Atrás" cierre la PWA en el primer arranque)
  // -------------------------
  const anyModalOpen = mindDumpOpen || mentalDumpOpen;
  const anyModalOpenRef = useRef(false);
  const trapArmedRef = useRef(false);
  const handlingPopRef = useRef(false);

  useEffect(() => {
    anyModalOpenRef.current = anyModalOpen;
  }, [anyModalOpen]);

  const closeAllAndGoIndex = useCallback(() => {
    setMindDumpOpen(false);
    setMentalDumpOpen(false);

    const cleaned = clearModalParam(window.location.search || location.search);
    navigate({ pathname: INDEX_PATHNAME, search: cleaned }, { replace: true });
  }, [location.search, navigate]);

  // ✅ Arma el trap cuando se abre un modal (pushState sin cambiar URL)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (anyModalOpen) {
      if (!trapArmedRef.current) {
        try {
          // URL no cambia -> React Router no “navega”, pero el historial sí gana 1 entrada.
          window.history.pushState({ __remiModalTrap: true }, "", window.location.href);
          trapArmedRef.current = true;
        } catch {
          // ignore
        }
      }
    } else {
      trapArmedRef.current = false;
    }
  }, [anyModalOpen]);

  // ✅ Captura "Atrás" (popstate) y cierra modal en vez de salir de la app
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = () => {
      if (handlingPopRef.current) return;

      // Si hay modal abierto, consumimos el back para cerrar modal
      if (anyModalOpenRef.current) {
        handlingPopRef.current = true;

        // Cierra y deja index limpio
        closeAllAndGoIndex();

        // Al cerrar, consideramos el trap consumido
        trapArmedRef.current = false;

        // liberar en siguiente tick para evitar bucles si router re-dispara cosas
        window.setTimeout(() => {
          handlingPopRef.current = false;
        }, 0);

        return;
      }

      // Si NO hay modal, dejamos el back normal (puede salir de la PWA)
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [closeAllAndGoIndex]);

  // ✅ Indicador global para UI (BottomNav etc.)
  useEffect(() => {
    setModalOpen(anyModalOpen);
    return () => setModalOpen(false);
  }, [anyModalOpen, setModalOpen]);

  // ✅ Sync URL -> state (back/forward)
  const modalInUrl = getModalParam(location.search);

  useEffect(() => {
    const wantMind = modalInUrl === "mind";
    const wantMental = modalInUrl === "mental";

    if (mindDumpOpen !== wantMind) setMindDumpOpen(wantMind);
    if (mentalDumpOpen !== wantMental) setMentalDumpOpen(wantMental);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalInUrl]);

  // ✅ Abrir capture (siempre sobre index)
  const openCapture = useCallback(
    (prefill?: string) => {
      setMindDumpInitialText(prefill ?? "");
      setMindDumpInitialNonce((n) => n + 1);

      setMentalDumpOpen(false);
      setMindDumpOpen(true);

      const cleaned = clearModalParam(location.search);

      // ponemos index base en la URL actual (replace)
      navigate({ pathname: INDEX_PATHNAME, search: cleaned }, { replace: true });

      // y empujamos modal (push)
      navigate(
        { pathname: INDEX_PATHNAME, search: setModalParam(cleaned, "mind") },
        { replace: false }
      );
    },
    [location.search, navigate]
  );

  // ✅ Mind -> Mental (replace para que Atrás cierre modal, no vuelva a mind)
  const openReviewFromMindDump = useCallback(
    (text: string) => {
      setMentalDumpInitialText(text);
      setMentalDumpInitialNonce((n) => n + 1);

      setMindDumpOpen(false);
      setMentalDumpOpen(true);

      const cleaned = clearModalParam(location.search);
      navigate(
        { pathname: INDEX_PATHNAME, search: setModalParam(cleaned, "mental") },
        { replace: true }
      );
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

    if (skipNextAutoOpenRef.current) {
      skipNextAutoOpenRef.current = false;
      return;
    }

    // cooldown
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

    // dictado pendiente
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
      // ignore
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

      openCapture(text);

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
