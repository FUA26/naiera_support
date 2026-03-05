/**
 * Ticket Module - Type Definitions
 *
 * Type definitions for ticketing service layer.
 * Includes input types, response types, and query parameters.
 */

import { TicketStatus, Priority, ChannelType, SenderType, ActivityAction, WebhookEvent } from "@prisma/client";

// ============================================================================
// Input Types
// ============================================================================

export interface CreateTicketInput {
  appId: string;
  channelId: string;
  subject: string;
  description?: string;
  message: string;
  priority?: Priority;
  userId?: string;
  guestInfo?: {
    email: string;
    name?: string;
    phone?: string;
  };
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
  createdBy?: string;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  assignedTo?: string | null;
  priority?: Priority;
}

export interface AddMessageInput {
  ticketId: string;
  sender: SenderType;
  message: string;
  userId?: string;
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
  isInternal?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

export interface TicketWithRelations {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  app: {
    id: string;
    name: string;
    slug: string;
  };
  channel: {
    id: string;
    type: ChannelType;
    name: string;
  };
  customer: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  assignedAt: Date | null;
  app: {
    id: string;
    name: string;
    slug: string;
  };
  channel: {
    id: string;
    type: ChannelType;
    name: string;
  };
  customer: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  messages: TicketMessage[];
  activities: TicketActivity[];
}

export interface TicketMessage {
  id: string;
  sender: SenderType;
  message: string;
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
  isInternal: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface TicketActivity {
  id: string;
  action: ActivityAction;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// ============================================================================
// Query Types
// ============================================================================

export interface ListTicketsParams {
  page?: number;
  pageSize?: number;
  appId?: string;
  status?: TicketStatus;
  assignedTo?: string; // "mine" | "unassigned" | userId
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority";
}

export interface PaginatedTickets {
  items: TicketWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Export Enums for Convenience
// ============================================================================

export type { TicketStatus, Priority, ChannelType, SenderType, ActivityAction, WebhookEvent };
