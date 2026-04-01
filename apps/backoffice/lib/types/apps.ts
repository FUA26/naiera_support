/**
 * Apps & Channels Types
 *
 * Type definitions for the apps and channels management system.
 */

import type { LucideIcon } from "lucide-react";

/** App entity */
export interface App {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  channels: Channel[];
  _count: {
    tickets: number;
  };
}

/** Channel entity */
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  isActive: boolean;
  apiKey?: string | null;
}

/** Channel type enum values */
export type ChannelType =
  | "WEB_FORM"
  | "PUBLIC_LINK"
  | "WIDGET"
  | "INTEGRATED_APP"
  | "WHATSAPP"
  | "TELEGRAM";

/** Channel configuration */
export interface ChannelConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  bgDark: string;
}

/** Dialog state types */
export interface AppDialogState {
  open: boolean;
  mode: "create" | "edit";
  app: App | null;
}

export interface ChannelDialogState {
  open: boolean;
  mode: "create" | "edit";
  app: App | null;
  channel: Channel | null;
}

export interface DeleteDialogState {
  open: boolean;
  type: "app" | "channel";
  item: App | Channel | null;
  app: App | null;
}

export interface ManageChannelSheetState {
  open: boolean;
  app: App | null;
  channel: Channel | null;
}

/** Form types */
export interface AppFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export interface ChannelFormData {
  name: string;
  type: ChannelType;
  isActive: boolean;
}

/** API payload types */
export interface CreateAppPayload {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateAppPayload {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateChannelPayload {
  appId: string;
  name: string;
  type: ChannelType;
  isActive?: boolean;
}

export interface UpdateChannelPayload {
  name?: string;
  type?: ChannelType;
  isActive?: boolean;
}

/** Integration guide section */
export interface IntegrationSection {
  title: string;
  content: string;
  isCode: boolean;
}

/** Integration guide */
export interface IntegrationGuide {
  title: string;
  description: string;
  sections: IntegrationSection[];
}
