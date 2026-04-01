/**
 * App Identity Configuration
 *
 * This file defines the visual identity of this application.
 * Each app in the ecosystem should have its own app-identity.ts
 * with unique values while following the same structure.
 *
 * PATTERN FOR OTHER APPS:
 * Copy this file to your app's lib/config/ directory and customize:
 * - name: App name (short, displayed in sidebar)
 * - fullName: Full app name (used in page titles, descriptions)
 * - tagline: Brief description of what the app does
 * - primaryColor: Main brand color (oklch format)
 * - accentColor: Secondary accent color
 * - icon: Icon component for the app
 * - description: Longer description for about pages
 * - category: App category (e.g., 'productivity', 'communication', 'management')
 * - version: App version
 */

import { LifeBuoy } from "lucide-react";

export const appIdentity = {
  // App Identification
  name: "Naiera Support",
  fullName: "Naiera Support Ticketing System",
  shortName: "Support",
  tagline: "Modern ticketing for government",

  // Visual Identity
  icon: LifeBuoy,
  iconColor: "oklch(0.58 0.16 190)", // Teal

  // App Description
  description:
    "Comprehensive ticketing system for managing citizen support requests across multiple channels including web forms, widgets, and integrated applications.",

  // App Category
  category: "support",
  industry: "government",

  // Version Info
  version: "1.0.0",

  // Branding Colors (for programmatic usage)
  colors: {
    primary: "oklch(0.58 0.16 190)", // Teal-500
    primaryLight: "oklch(0.92 0.06 190)", // Teal-100
    primaryDark: "oklch(0.46 0.14 190)", // Teal-700
    accent: "oklch(0.65 0.14 200)", // Light Teal
  },

  // Feature Highlights (for landing/about pages)
  features: [
    "Multi-channel ticket management",
    "Automated ticket routing",
    "Real-time notifications",
    "Comprehensive analytics",
    "Role-based access control",
    "Public ticket tracking",
  ],

  // Target Users
  targetUsers: ["Support Agents", "Team Leads", "Administrators"],

  // Key Metrics (for dashboard)
  defaultMetrics: [
    { id: "total_tickets", label: "Total Tickets", icon: "ticket" },
    { id: "open_tickets", label: "Open Tickets", icon: "alert-circle" },
    { id: "resolved_today", label: "Resolved Today", icon: "check-circle" },
    { id: "avg_response", label: "Avg Response Time", icon: "clock" },
  ],

  // Social/Links (for about page)
  links: {
    documentation: "/docs",
    support: "/support",
    feedback: "/feedback",
  },

  // Theme Configuration
  theme: {
    style: "modern-friendly",
    mood: "professional-approachable",
    primaryColorFamily: "teal",
    borderStyle: "rounded", // 'rounded' | 'sharp' | 'mixed'
    animationStyle: "smooth", // 'smooth' | 'bouncy' | 'minimal'
  },

  // Accessibility Settings
  accessibility: {
    reducedMotion: false, // Can be user-controlled
    highContrast: false, // Can be user-controlled
    fontSize: "base", // 'sm' | 'base' | 'lg'
  },
} as const;

export type AppIdentity = typeof appIdentity;

/**
 * Helper function to get app identity values
 */
export function getAppIdentity() {
  return appIdentity;
}

/**
 * Helper function to get app color for programmatic usage
 */
export function getAppColor(variant: "primary" | "light" | "dark" | "accent" = "primary") {
  const colors = appIdentity.colors;
  switch (variant) {
    case "primary":
      return colors.primary;
    case "light":
      return colors.primaryLight;
    case "dark":
      return colors.primaryDark;
    case "accent":
      return colors.accent;
    default:
      return colors.primary;
  }
}
