import { createContext, useContext } from "react";

export interface SaveContextValue {
  saveNow: () => Promise<void>;
  isSaving: boolean;
}

export const SaveContext = createContext<SaveContextValue | null>(null);

export function useSave() {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error("useSave must be used within a SaveContext.Provider");
  }
  return context;
}
