import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";

type ModalUiContextType = {
  /** Set de IDs de modales abiertos */
  openModalIds: Set<string>;

  /** true si hay algún modal abierto */
  isAnyModalOpen: boolean;

  /** ✅ API robusta */
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;

  /** ✅ Compatibilidad con tu API actual (contador/boolean) */
  setModalOpen: (open: boolean) => void;

  /** número de modales abiertos (derivado del Set) */
  modalOpenCount: number;
};

const ModalUiContext = createContext<ModalUiContextType | null>(null);

export function ModalUiProvider({ children }: { children: React.ReactNode }) {
  const [openModalIdsState, setOpenModalIdsState] = useState<Set<string>>(
    () => new Set()
  );

  const registerModal = useCallback((id: string) => {
    if (!id) return;
    setOpenModalIdsState((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterModal = useCallback((id: string) => {
    if (!id) return;
    setOpenModalIdsState((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * ✅ Backward-compatible: si algún modal antiguo usa setModalOpen(true/false)
   * lo mapeamos a un ID fijo "legacy".
   */
  const setModalOpen = useCallback(
    (open: boolean) => {
      const legacyId = "__legacy_modal__";
      if (open) registerModal(legacyId);
      else unregisterModal(legacyId);
    },
    [registerModal, unregisterModal]
  );

  const modalOpenCount = openModalIdsState.size;
  const isAnyModalOpen = modalOpenCount > 0;

  const value = useMemo(
    () => ({
      openModalIds: openModalIdsState,
      modalOpenCount,
      isAnyModalOpen,
      registerModal,
      unregisterModal,
      setModalOpen,
    }),
    [
      openModalIdsState,
      modalOpenCount,
      isAnyModalOpen,
      registerModal,
      unregisterModal,
      setModalOpen,
    ]
  );

  return (
    <ModalUiContext.Provider value={value}>{children}</ModalUiContext.Provider>
  );
}

export function useModalUi() {
  const ctx = useContext(ModalUiContext);
  if (!ctx) {
    throw new Error("useModalUi must be used within ModalUiProvider");
  }
  return ctx;
}

/**
 * ✅ Hook helper: registra este componente como “modal abierto” mientras open=true
 * (cada modal tiene su ID propio => no hay desajustes)
 */
export function useRegisterModalOpen(open: boolean) {
  const { registerModal, unregisterModal } = useModalUi();
  const idRef = useRef<string>("");

  if (!idRef.current) {
    idRef.current = `remi_modal_${Math.random().toString(36).slice(2)}`;
  }

  useEffect(() => {
    const id = idRef.current;
    if (open) registerModal(id);
    return () => unregisterModal(id);
  }, [open, registerModal, unregisterModal]);
}
