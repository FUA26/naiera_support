/**
 * Notification Service
 *
 * Handles notifications for ticket events:
 * - Agent notifications (new tickets, replies, assignments)
 * - Customer notifications (ticket updates, confirmations)
 *
 * This is a placeholder implementation that logs to console.
 * In production, this would integrate with email, SMS, push notifications, etc.
 */

import { prisma } from "@/lib/prisma";

/**
 * Notify agents that a new ticket has been created
 */
export async function notifyAgentTicketCreated(ticketId: string) {
  console.log(`[Notification] New ticket created: ${ticketId}`);
  // TODO: Implement actual agent notification
  // - Send to all agents with permission
  // - Push notification, email, or in-app alert
}

/**
 * Notify agents that a customer has replied to a ticket
 */
export async function notifyAgentTicketReply(ticketId: string) {
  console.log(`[Notification] Customer replied to ticket: ${ticketId}`);
  // TODO: Implement actual agent notification
  // - Notify assigned agent specifically
  // - Escalate if no response within SLA
}

/**
 * Notify a specific agent that a ticket has been assigned to them
 */
export async function notifyAgentTicketAssigned(ticketId: string, agentId: string) {
  console.log(`[Notification] Ticket ${ticketId} assigned to agent ${agentId}`);
  // TODO: Implement actual agent notification
  // - Direct notification to assigned agent
  // - Include ticket details and priority
}

/**
 * Notify customer about ticket update
 *
 * Handles both registered users and guest customers (via email)
 */
export async function notifyCustomerTicketUpdate(ticketId: string, updateType: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { app: true, user: true },
  });

  if (!ticket) return;

  // Notify registered user
  if (ticket.userId) {
    console.log(`[Notification] Ticket update for user ${ticket.userId}: ${updateType}`);
    // TODO: Implement in-app notification or email for registered user
  }

  // Email guest customer
  if (ticket.guestEmail) {
    console.log(
      `[Email] Send ticket update to ${ticket.guestEmail}: ${updateType}`
    );
    // TODO: Implement email sending
    // - Use transactional email service
    // - Include ticket number, update details, and link to ticket
  }
}

/**
 * Notify customer about ticket creation confirmation
 *
 * Sends ticket number and initial confirmation to customer
 */
export async function notifyCustomerTicketCreated(ticketId: string, ticketNumber: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return;

  if (ticket.guestEmail) {
    console.log(
      `[Email] Send ticket confirmation to ${ticket.guestEmail}: ${ticketNumber}`
    );
    // TODO: Implement confirmation email
    // - Include ticket number, subject, and link to track status
  }
}
