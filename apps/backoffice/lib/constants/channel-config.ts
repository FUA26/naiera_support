/**
 * Channel Configuration
 *
 * Central configuration for all channel types including icons, colors, and labels.
 */

import {
  Globe,
  Link as LinkIcon,
  Box,
  Code,
  Smartphone,
  Megaphone,
} from "lucide-react";
import type { ChannelConfig, ChannelType } from "@/lib/types/apps";

/**
 * Channel type configuration mapping
 * Provides visual styling and metadata for each channel type
 */
export const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
  WEB_FORM: {
    label: "Web Form",
    icon: Globe,
    color: "text-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-500/10",
  },
  PUBLIC_LINK: {
    label: "Public Link",
    icon: LinkIcon,
    color: "text-green-500",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-500/10",
  },
  WIDGET: {
    label: "Widget",
    icon: Box,
    color: "text-purple-500",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-500/10",
  },
  INTEGRATED_APP: {
    label: "Integrated App",
    icon: Code,
    color: "text-orange-500",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-500/10",
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: Smartphone,
    color: "text-emerald-500",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-500/10",
  },
  TELEGRAM: {
    label: "Telegram",
    icon: Megaphone,
    color: "text-sky-500",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-500/10",
  },
} as const;

/** Channel type options for select dropdowns */
export const CHANNEL_TYPE_OPTIONS: Array<{
  value: ChannelType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = Object.entries(CHANNEL_CONFIG).map(([key, config]) => ({
  value: key as ChannelType,
  label: config.label,
  icon: config.icon,
  color: config.color,
}));

/** Default channel type */
export const DEFAULT_CHANNEL_TYPE: ChannelType = "WEB_FORM";

/** Helper to get channel config */
export function getChannelConfig(type: ChannelType): ChannelConfig {
  return CHANNEL_CONFIG[type];
}

/** Helper to get channel config by type string (with fallback) */
export function getChannelConfigUnsafe(type: string): ChannelConfig | null {
  return CHANNEL_CONFIG[type as ChannelType] ?? null;
}
