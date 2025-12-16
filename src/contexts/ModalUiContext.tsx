import React, { createContext, useContext, useState, useMemo } from "react";

type ModalUiContextType = {
  modalOpenCount: number;
  setModalOpen: (open: boolean) => void;
  isAnyModalOpen: boolean;
};

const ModalUiContext = createContext<ModalUiContextType | null>(null);

export function ModalUiProvider({ children }: { children: React.ReactNode }) {
  const [modalOpenCount, setModalOpenCount] = useState(0);

  const setModalOpen = (open: boolean) => {
    setModalOpenCount((c) =>
      open ? c + 1 : Math.max(0, c - 1)
    );
  };

  const value = useMemo(
    () => ({
      modalOpenCount,
      setModalOpen,
      isAnyModalOpen: modalOpenCount > 0,
    }),
    [modalOpenCount]
  );

  return (
    <ModalUiContext.Provider value={value}>
      {children}
    </ModalUiContext.Provider>
  );
}

export function useModalUi() {
  const ctx = useContext(ModalUiContext);
  if (!ctx) {
    throw new Error("useModalUi must be used within ModalUiProvider");
  }
  return ctx;
}
