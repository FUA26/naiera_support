/**
 * Ticket Module - Service Layer
 *
 * Service layer for ticket operations using Prisma database.
 * Provides CRUD operations with relation includes and activity logging.
 *
 * @pattern docs/patterns/service-layer.md
 * @pattern docs/patterns/activity-logs.md
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateTicketInput,
  UpdateTicketInput,
  ListTicketsParams,
  TicketWithRelations,
  PaginatedTickets,
} from "./types";
import { TicketStatus, ActivityAction, WebhookEvent, SenderType } from "@prisma/client";
import { triggerWebhook } from "./webhook-service";
import { notifyAgentTicketCreated, notifyCustomerTicketUpdate, notifyCustomerTicketCreated } from "./notification-service";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ticket number based on app slug
 * Format: {SLUG_PREFIX}-{COUNT}
 */
export async function generateTicketNumber(appSlug: string): Promise<string> {
  const prefix = appSlug.substring(0, 4).toUpperCase();
  const count = await prisma.ticket.count({
    where: {
      app: { slug: appSlug },
    },
  });
  return `${prefix}-${String(count + 1).padStart(5, "0")}`;
}

/**
 * Format ticket for list response
 */
function formatTicketListItem(ticket: any): TicketWithRelations {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    app: ticket.app,
    channel: ticket.channel,
    customer: {
      userId: ticket.userId,
      guestEmail: ticket.guestEmail,
      guestName: ticket.guestName,
      guestPhone: ticket.guestPhone,
    },
    assignedTo: ticket.assignedToUser
      ? {
          id: ticket.assignedToUser.id,
          name: ticket.assignedToUser.name,
          avatar: ticket.assignedToUser.avatar,
        }
      : undefined,
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create a new ticket
 *
 * Validates the app and channel, generates a ticket number,
 * creates the ticket with the initial message, and logs activity.
 */
export async function createTicket(data: CreateTicketInput): Promise<any> {
  const {
    appId,
    channelId,
    subject,
    description,
    message,
    priority,
    userId,
    guestInfo,
    attachments,
    createdBy,
  } = data;

  // Validate app exists and is active
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app || !app.isActive) {
    throw new Error("INVALID_APP");
  }

  // Validate channel exists, belongs to app, and is active
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, appId, isActive: true },
  });
  if (!channel) {
    throw new Error("INVALID_CHANNEL");
  }

  // Validate customer info - either userId or guest email is required
  if (!userId && !guestInfo?.email) {
    throw new Error("GUEST_INFO_REQUIRED");
  }

  // Generate ticket number
  const ticketNumber = await generateTicketNumber(app.slug);

  // Create ticket with initial message and activity
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      appId,
      channelId,
      subject,
      description,
      priority: priority || ("NORMAL" as any),
      userId,
      guestEmail: guestInfo?.email,
      guestName: guestInfo?.name,
      guestPhone: guestInfo?.phone,
      status: TicketStatus.OPEN,
      messages: {
        create: {
          sender: SenderType.CUSTOMER,
          userId,
          message,
          attachments,
        },
      },
      activities: {
        create: {
          action: ActivityAction.CREATED,
          userId: createdBy || userId,
        },
      },
    },
    include: {
      app: true,
      channel: true,
      user: true,
      messages: true,
    },
  });

  // Trigger webhook for ticket creation
  await triggerWebhook(ticket.id, WebhookEvent.TICKET_CREATED, { ticket });

  // Notify agents about new ticket
  await notifyAgentTicketCreated(ticket.id);

  return ticket;
}

/**
 * Get a single ticket by ID with full relations
 *
 * Includes messages (with user info) and activities (with user info).
 */
export async function getTicketById(ticketId: string): Promise<any> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      app: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      channel: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignedToUser: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      attachments: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  return ticket;
}

/**
 * Get paginated list of tickets with filtering and sorting
 *
 * Supports filtering by:
 * - app
 * - status
 * - assignedTo (including "mine" and "unassigned" special values)
 * - search (searches subject, guest email/name, ticket number)
 *
 * Supports sorting by createdAt, updatedAt, or priority.
 */
export async function listTickets(
  params: ListTicketsParams,
  userId?: string
): Promise<PaginatedTickets> {
  const {
    page = 1,
    pageSize = 20,
    appId,
    status,
    assignedTo,
    search,
    sortBy = "createdAt",
  } = params;

  const where: Prisma.TicketWhereInput = {};

  if (appId) {
    where.appId = appId;
  }

  if (status) {
    where.status = status;
  }

  if (assignedTo === "mine") {
    where.assignedTo = userId;
  } else if (assignedTo === "unassigned") {
    where.assignedTo = null;
  } else if (assignedTo) {
    where.assignedTo = assignedTo;
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { guestEmail: { contains: search, mode: "insensitive" } },
      { guestName: { contains: search, mode: "insensitive" } },
      { ticketNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const orderBy: Prisma.TicketOrderByWithRelationInput = {};
  if (sortBy === "priority") {
    orderBy.priority = "desc";
  }
  orderBy[sortBy] = "desc";

  // Get total count and items in parallel
  const [total, items] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        app: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        channel: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
  ]);

  return {
    items: items.map(formatTicketListItem),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Update an existing ticket
 *
 * Supports updating:
 * - status (automatically sets resolvedAt/closedAt when appropriate)
 * - assignedTo (automatically sets assignedAt)
 * - priority
 *
 * Logs activities for each change and triggers webhooks/notifications.
 */
export async function updateTicket(
  ticketId: string,
  data: UpdateTicketInput,
  updatedBy: string
): Promise<any> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { app: true },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const updates: any = {};
  const activities: Array<{
    action: ActivityAction;
    changes?: Record<string, unknown>;
  }> = [];

  // Handle status change
  if (data.status && data.status !== ticket.status) {
    updates.status = data.status;

    if (data.status === TicketStatus.RESOLVED) {
      updates.resolvedAt = new Date();
    }

    if (data.status === TicketStatus.CLOSED) {
      updates.closedAt = new Date();
    }

    activities.push({
      action: ActivityAction.STATUS_CHANGED,
      changes: { from: ticket.status, to: data.status },
    });
  }

  // Handle assignment change
  if (data.assignedTo !== undefined && data.assignedTo !== ticket.assignedTo) {
    updates.assignedTo = data.assignedTo;
    updates.assignedAt = data.assignedTo ? new Date() : null;

    activities.push({
      action: ActivityAction.ASSIGNED,
      changes: { from: ticket.assignedTo, to: data.assignedTo },
    });
  }

  // Handle priority change
  if (data.priority && data.priority !== ticket.priority) {
    updates.priority = data.priority;
    activities.push({
      action: ActivityAction.PRIORITY_CHANGED,
      changes: { from: ticket.priority, to: data.priority },
    });
  }

  // No changes to make
  if (Object.keys(updates).length === 0) {
    return ticket;
  }

  // Update ticket with activities
  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...updates,
      activities: {
        create: activities.map((a) => ({
          ...a,
          userId: updatedBy,
        })),
      },
    },
    include: {
      app: true,
      channel: true,
      assignedToUser: true,
    },
  });

  // Trigger webhook for ticket update
  await triggerWebhook(ticketId, WebhookEvent.TICKET_UPDATED, { ticket: updated });

  // Notify customer about status change
  if (data.status) {
    await notifyCustomerTicketUpdate(ticketId, "status_change");
  }

  // Notify about assignment
  if (data.assignedTo !== undefined) {
    await triggerWebhook(ticketId, WebhookEvent.ASSIGNED, {
      ticket: updated,
      assignedTo: data.assignedTo,
    });
  }

  return updated;
}

/**
 * Close a ticket
 *
 * Convenience function to set ticket status to CLOSED.
 */
export async function closeTicket(ticketId: string, closedBy: string): Promise<any> {
  return updateTicket(ticketId, { status: TicketStatus.CLOSED }, closedBy);
}

/**
 * Reopen a closed ticket
 *
 * Sets status to IN_PROGRESS and clears closedAt timestamp.
 */
export async function reopenTicket(ticketId: string, reopenedBy: string): Promise<any> {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: TicketStatus.IN_PROGRESS,
      closedAt: null,
      activities: {
        create: {
          action: ActivityAction.REOPENED,
          userId: reopenedBy,
        },
      },
    },
  });

  // Trigger webhook for status change
  await triggerWebhook(ticketId, WebhookEvent.STATUS_CHANGED, { ticket: updated });

  return updated;
}

/**
 * Get ticket statistics
 *
 * Returns counts of tickets by status, priority, and overdue count.
 */
export async function getTicketStats(appId?: string): Promise<{
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<string, number>;
  unassigned: number;
  overdue: number;
}> {
  const where: Prisma.TicketWhereInput = appId ? { appId } : {};

  const tickets = await prisma.ticket.findMany({
    where,
    select: {
      status: true,
      priority: true,
      resolvedAt: true,
      assignedTo: true,
    },
  });

  const byStatus: Record<TicketStatus, number> = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  const byPriority: Record<string, number> = {
    LOW: 0,
    NORMAL: 0,
    HIGH: 0,
    URGENT: 0,
  };

  let unassigned = 0;
  let overdue = 0;
  const now = new Date();

  for (const ticket of tickets) {
    // Count by status
    byStatus[ticket.status]++;

    // Count by priority
    if (ticket.priority) {
      const priority = ticket.priority as string;
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    }

    // Count unassigned
    if (!ticket.assignedTo) {
      unassigned++;
    }

    // Count overdue (resolved more than 7 days ago but not closed)
    if (ticket.resolvedAt && ticket.status !== TicketStatus.CLOSED) {
      const daysSinceResolved = Math.floor(
        (now.getTime() - ticket.resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceResolved > 7) {
        overdue++;
      }
    }
  }

  return {
    total: tickets.length,
    byStatus,
    byPriority,
    unassigned,
    overdue,
  };
}
