/**
 * Ticket Module - Validation Schemas
 *
 * Zod schemas for ticket-related operations.
 * Demonstrates validation patterns for:
 * - Ticket creation with app/channel validation
 * - Guest vs authenticated user flows
 * - Message and attachment handling
 * - Ticket updates and status transitions
 *
 * @pattern docs/patterns/validation.md
 */

import { z } from "zod";

// ============================================================================
// Enums (defined as Zod schemas, imported from Prisma)
// ============================================================================

export const ticketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const channelTypeEnum = z.enum([
  "WEB_FORM",
  "PUBLIC_LINK",
  "WIDGET",
  "INTEGRATED_APP",
  "WHATSAPP",
  "TELEGRAM",
]);

export const senderTypeEnum = z.enum(["CUSTOMER", "AGENT", "SYSTEM"]);

// ============================================================================
// Attachment Schema
// ============================================================================

export const ticketAttachmentSchema = z.object({
  url: z.string().url("Attachment URL must be valid"),
  name: z.string().max(255, "Attachment name must be less than 255 characters"),
  type: z.string().min(1, "Attachment type is required"),
  size: z
    .number()
    .max(10 * 1024 * 1024, "Attachment size must not exceed 10MB"),
});

// ============================================================================
// Ticket Schemas
// ============================================================================

/**
 * Schema for creating a new ticket via public API
 * - Requires appSlug and channelType to identify the app/channel
 * - Subject must be 5-200 characters
 * - Message must be 10-5000 characters
 * - Supports up to 5 attachments
 * - For guests: requires email, optionally name and phone
 * - For authenticated users: userId is derived from session
 */
export const createTicketSchema = z
  .object({
    appSlug: z.string().min(1, "App slug is required"),
    channelType: channelTypeEnum,
    subject: z
      .string()
      .min(5, "Subject must be at least 5 characters")
      .max(200, "Subject must be less than 200 characters"),
    message: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(5000, "Message must be less than 5000 characters"),
    description: z
      .string()
      .max(2000, "Description must be less than 2000 characters")
      .optional(),
    attachments: z
      .array(ticketAttachmentSchema)
      .max(5, "Maximum 5 attachments allowed")
      .optional(),
    priority: priorityEnum.optional(),
    guestEmail: z.string().email("Invalid email address").optional(),
    guestName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .optional(),
    guestPhone: z
      .string()
      .regex(/^[+]?[\d\s-]+$/, "Invalid phone number format")
      .optional(),
  })
  .refine(
    (data) =>
      // For INTEGRATED_APP channel, authentication is required (no guest info)
      data.channelType === "INTEGRATED_APP" ||
      // For other channels, guest email is required if not authenticated
      data.guestEmail,
    {
      message: "Email is required for this channel type",
      path: ["guestEmail"],
    }
  );

/**
 * Schema for updating an existing ticket
 * - All fields are optional for partial updates
 * - Supports status change, assignment, and priority change
 */
export const updateTicketSchema = z
  .object({
    status: ticketStatusEnum.optional(),
    assignedTo: z.string().nullable().optional(),
    priority: priorityEnum.optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

/**
 * Schema for bulk ticket operations
 */
export const bulkTicketUpdateSchema = z.object({
  ticketIds: z.array(z.string()).min(1, "Select at least one ticket"),
  status: ticketStatusEnum.optional(),
  assignedTo: z.string().nullable().optional(),
  priority: priorityEnum.optional(),
});

// ============================================================================
// Message Schemas
// ============================================================================

/**
 * Schema for adding a message to a ticket
 * - Message must be 1-5000 characters
 * - Supports up to 5 attachments
 * - isInternal flag for agent-only notes
 */
export const addMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be less than 5000 characters"),
  attachments: z
    .array(ticketAttachmentSchema)
    .max(5, "Maximum 5 attachments allowed")
    .optional(),
  isInternal: z.boolean().default(false),
});

/**
 * Schema for listing messages with pagination
 */
export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
});

// ============================================================================
// Query/Filter Schemas
// ============================================================================

/**
 * Schema for listing tickets with filtering and pagination
 * - Supports pagination with customizable page size (max 100)
 * - Filter by app, status, assignment
 * - Search across subject, email, name, ticket number
 * - Sort by createdAt, updatedAt, or priority
 */
export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  appId: z.string().optional(),
  status: ticketStatusEnum.optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "priority"])
    .default("createdAt"),
});

// ============================================================================
// Integrated App API Schemas
// ============================================================================

/**
 * Schema for creating tickets from integrated apps using API Key
 * - Uses X-API-Key header for authentication (no session required)
 * - externalUserId identifies the customer in your system
 * - externalUserName and externalUserEmail are optional for context
 */
export const integratedTicketSchema = z.object({
  externalUserId: z.string().min(1, "External user ID is required"),
  externalUserName: z.string().max(100).optional(),
  externalUserEmail: z.string().email().optional(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
  priority: priorityEnum.optional(),
});

/**
 * Schema for listing tickets for an external user
 */
export const integratedListTicketsSchema = z.object({
  externalUserId: z.string().min(1, "External user ID is required"),
});

// ============================================================================
// Public API Schemas
// ============================================================================

/**
 * Schema for checking ticket status via public API
 */
export const ticketStatusCheckSchema = z.object({
  ticketNumber: z.string().min(1, "Ticket number is required"),
  email: z.string().email("Invalid email address"),
});

// ============================================================================
// Export TypeScript Types
// ============================================================================

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type BulkTicketUpdateInput = z.infer<typeof bulkTicketUpdateSchema>;
export type AddMessageInput = z.infer<typeof addMessageSchema>;
export type ListTicketsQueryInput = z.infer<typeof listTicketsQuerySchema>;
export type TicketStatusCheckInput = z.infer<typeof ticketStatusCheckSchema>;
