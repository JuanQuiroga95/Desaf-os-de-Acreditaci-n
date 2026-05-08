"use client";

import React, { createContext, useContext, useState } from "react";

interface UIContextType {
  isAIBlocked: boolean;
  setAIBlocked: (blocked: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isAIBlocked, setAIBlocked] = useState(false);

  return (
    <UIContext.Provider value={{ isAIBlocked, setAIBlocked }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
