"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AppContextType = {
  selectedAppId: string | null;
  setSelectedAppId: (appId: string | null) => void;
  accessibleApps: Array<{ id: string; name: string; slug: string }>;
  hasAllAccess: boolean;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedAppId, setSelectedAppIdState] = useState<string | null>(null);
  const [accessibleApps, setAccessibleApps] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [hasAllAccess, setHasAllAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedAppId");
    if (stored) setSelectedAppIdState(stored);
  }, []);

  // Load accessible apps
  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/apps/accessible");
        if (res.ok) {
          const data = await res.json();
          setAccessibleApps(data.apps);
          setHasAllAccess(data.hasAllAccess);

          // If admin, default to "all"
          if (data.hasAllAccess && !selectedAppId) {
            setSelectedAppIdState("all");
          }
        }
      } catch (error) {
        console.error("Failed to load apps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, [selectedAppId]);

  const setSelectedAppId = (appId: string | null) => {
    setSelectedAppIdState(appId);
    if (appId) {
      localStorage.setItem("selectedAppId", appId);
    } else {
      localStorage.removeItem("selectedAppId");
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedAppId,
        setSelectedAppId,
        accessibleApps,
        hasAllAccess,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
