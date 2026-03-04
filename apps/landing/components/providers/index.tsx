"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import type { PublicSettings } from "@/lib/settings-data";

interface SettingsContextValue {
  settings: PublicSettings;
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(
  undefined
);

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

export function Providers({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings?: PublicSettings;
}) {
  return (
    <SettingsContext.Provider value={{ settings: settings || getDefaultSettings() }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="landing-theme"
        themes={["light"]}
      >
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

function getDefaultSettings(): PublicSettings {
  return {
    siteName: "Super App Naiera",
    siteSubtitle: "Kabupaten Naiera",
    siteDescription: null,
    siteLogoUrl: null,
    citizenName: "Warga Naiera",
    contactAddress: null,
    contactPhones: null,
    contactEmails: null,
    socialFacebook: null,
    socialTwitter: null,
    socialInstagram: null,
    socialYouTube: null,
    copyrightText: null,
    versionNumber: "1.0.0",
    heroBackgroundUrl: null,
  };
}
