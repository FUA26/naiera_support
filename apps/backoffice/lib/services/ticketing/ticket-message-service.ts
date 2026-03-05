/**
 * Ticket Message Service
 *
 * Handles adding messages to tickets, including:
 * - Customer and agent messages
 * - Internal notes
 * - Attachment handling
 * - Automatic ticket reopening on customer reply
 * - Webhook triggers and notifications
 */

import { prisma } from "@/lib/prisma";
import { SenderType, TicketStatus, ActivityAction } from "@prisma/client";
import { addTicketActivity } from "./ticket-activity-service";
import { triggerWebhook } from "./webhook-service";
import { notifyCustomerTicketUpdate, notifyAgentTicketReply } from "./notification-service";

interface AddMessageInput {
  ticketId: string;
  sender: SenderType;
  message: string;
  userId?: string;
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
  isInternal?: boolean;
}

/**
 * Add a message to a ticket
 *
 * - Creates the message record
 * - Updates ticket's updatedAt timestamp
 * - Logs appropriate activity
 * - Reopens ticket if closed and customer replies
 * - Triggers webhooks and notifications
 */
export async function addTicketMessage(input: AddMessageInput) {
  const { ticketId, sender, message, userId, attachments, isInternal = false } = input;

  // Validate ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("TICKET_NOT_FOUND");

  // Check if ticket should be reopened (closed ticket + customer reply + not internal note)
  const shouldReopen =
    ticket.status === TicketStatus.CLOSED && sender === SenderType.CUSTOMER && !isInternal;

  // Build message data
  const messageData: any = {
    ticketId,
    sender,
    message,
    attachments,
    isInternal,
  };
  if (userId) {
    messageData.userId = userId;
  }

  // Execute in transaction for data consistency
  const newMessage = await prisma.$transaction(async (tx) => {
    // Create message
    const msg = await tx.ticketMessage.create({ data: messageData });

    // Update ticket timestamp
    await tx.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // Log activity based on sender type
    await tx.ticketActivity.create({
      data: {
        ticketId,
        action:
          sender === SenderType.CUSTOMER
            ? ActivityAction.CUSTOMER_REPLIED
            : ActivityAction.AGENT_REPLIED,
        userId,
      },
    });

    // Reopen ticket if needed
    if (shouldReopen) {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: TicketStatus.IN_PROGRESS,
          closedAt: null,
        },
      });
      await tx.ticketActivity.create({
        data: {
          ticketId,
          action: ActivityAction.REOPENED,
        },
      });
    }

    return msg;
  });

  // Trigger webhook after transaction succeeds
  await triggerWebhook(ticketId, "MESSAGE_ADDED", { message: newMessage, ticket });

  // Send notifications (only for non-internal messages)
  if (sender === SenderType.CUSTOMER && !isInternal) {
    await notifyAgentTicketReply(ticketId);
  } else if (sender === SenderType.AGENT && !isInternal) {
    await notifyCustomerTicketUpdate(ticketId, "new_message");
  }

  return newMessage;
}

/**
 * Get all messages for a ticket
 */
export async function getTicketMessages(ticketId: string) {
  return prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}
