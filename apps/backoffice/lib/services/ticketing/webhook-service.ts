/**
 * Webhook Service
 *
 * Handles webhook delivery for ticket events:
 * - Queued delivery with retry logic
 * - Automatic webhook disabling on repeated failures
 * - Logging of all webhook attempts
 *
 * Supported events: TICKET_CREATED, TICKET_UPDATED, MESSAGE_ADDED, STATUS_CHANGED, ASSIGNED
 */

import { prisma } from "@/lib/prisma";
import { WebhookEvent } from "@prisma/client";

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [0, 60000, 300000]; // 0, 1 min, 5 min

interface WebhookJob {
  ticketId: string;
  event: WebhookEvent;
  data: any;
}

/**
 * In-memory webhook queue
 *
 * Jobs are deduplicated by ticketId-event combination.
 * Each key processes sequentially to ensure correct event ordering.
 */
class WebhookQueue {
  private queue: Map<string, WebhookJob[]> = new Map();
  private processing = new Map<string, Promise<void>>();

  /**
   * Add a webhook job to the queue
   */
  async add(job: WebhookJob) {
    const key = `${job.ticketId}-${job.event}`;

    if (!this.queue.has(key)) {
      this.queue.set(key, []);
    }

    this.queue.get(key)!.push(job);

    // Start processing if not already running for this key
    if (!this.processing.has(key)) {
      this.processing.set(key, this.process(key));
    }
  }

  /**
   * Process jobs for a specific key
   */
  private async process(key: string): Promise<void> {
    try {
      const jobs = this.queue.get(key);
      if (!jobs || jobs.length === 0) return;

      const job = jobs.shift()!;
      await this.deliver(job);

      // Process remaining jobs recursively
      if (jobs.length > 0) {
        await this.process(key);
      }
    } finally {
      this.processing.delete(key);
    }
  }

  /**
   * Deliver a webhook job to all active webhooks for the ticket's app
   */
  private async deliver(job: WebhookJob) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: job.ticketId },
      include: {
        app: {
          include: {
            webhooks: true,
          },
        },
      },
    });

    if (!ticket) return;

    // Filter active webhooks that are subscribed to this event
    const activeWebhooks = ticket.app.webhooks.filter(
      (w) => w.isActive && w.events.includes(job.event)
    );

    // Deliver to each webhook
    for (const webhook of activeWebhooks) {
      await this.deliverWebhook(webhook.id, webhook.url, job.event, job.data);
    }
  }

  /**
   * Deliver a single webhook with retry logic
   */
  private async deliverWebhook(
    webhookId: string,
    url: string,
    event: WebhookEvent,
    data: any
  ) {
    // Attempt delivery with retries
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": event,
          },
          body: JSON.stringify(data),
        });

        // Log attempt
        await prisma.webhookLog.create({
          data: {
            webhookId,
            ticketId: data.ticket?.id || data.ticketId,
            url,
            event,
            payload: data,
            statusCode: response.status,
            success: response.ok,
            attempts: attempt + 1,
          },
        });

        // Success - exit retry loop
        if (response.ok) return;
      } catch (error) {
        // Log failed attempt
        await prisma.webhookLog.create({
          data: {
            webhookId,
            ticketId: data.ticket?.id || data.ticketId,
            url,
            event,
            payload: data,
            response: String(error),
            success: false,
            attempts: attempt + 1,
          },
        });
      }

      // Wait before retry (except after last attempt)
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt + 1]));
      }
    }

    // All attempts failed - disable webhook
    if (webhookId) {
      await prisma.webhook.update({
        where: { id: webhookId },
        data: { isActive: false },
      });
    }
  }
}

// Global webhook queue instance
const webhookQueue = new WebhookQueue();

/**
 * Trigger a webhook event for a ticket
 *
 * Adds the event to the queue for async delivery.
 */
export async function triggerWebhook(
  ticketId: string,
  event: WebhookEvent,
  data: any
) {
  await webhookQueue.add({ ticketId, event, data });
}

/**
 * Get all webhooks for an app
 */
export async function getWebhooks(appId: string) {
  return prisma.webhook.findMany({
    where: { appId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Create a new webhook for an app
 */
export async function createWebhook(
  appId: string,
  url: string,
  events: WebhookEvent[],
  secret?: string
) {
  return prisma.webhook.create({
    data: {
      appId,
      url,
      events,
      secret,
    },
  });
}

/**
 * Update an existing webhook
 */
export async function updateWebhook(
  webhookId: string,
  data: {
    url?: string;
    events?: WebhookEvent[];
    secret?: string;
    isActive?: boolean;
  }
) {
  return prisma.webhook.update({
    where: { id: webhookId },
    data,
  });
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(webhookId: string) {
  return prisma.webhook.delete({
    where: { id: webhookId },
  });
}

/**
 * Get webhook logs for a ticket
 */
export async function getWebhookLogs(ticketId: string) {
  return prisma.webhookLog.findMany({
    where: { ticketId },
    orderBy: { sentAt: "desc" },
    include: {
      webhook: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });
}
