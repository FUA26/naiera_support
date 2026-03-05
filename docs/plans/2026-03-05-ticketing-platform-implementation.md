# Ticketing Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-channel support ticketing platform with public API, agent dashboard, and webhook integration.

**Architecture:** Hybrid API-First - Ticket module in backoffice sharing existing infra, with dedicated API layer for external integrations. Data model designed for future microservice extraction.

**Tech Stack:** Next.js 16, Prisma 6, TypeScript, existing RBAC system, MJML for emails, S3/MinIO for attachments.

---

## Prerequisites

- Existing backoffice app with Prisma, RBAC, email templates
- PostgreSQL database on port 5434
- Docker services running (postgres, minio)

---

## Task 1: Database Schema - Add Ticket Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add Ticket enums and models**

Add to `apps/backoffice/prisma/schema.prisma` at the end (before final `}`):

```prisma
// =============================================================================
// TICKETING MODULE
// =============================================================================

enum ChannelType {
  WEB_FORM
  PUBLIC_LINK
  WIDGET
  INTEGRATED_APP
  WHATSAPP
  TELEGRAM
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum SenderType {
  CUSTOMER
  AGENT
  SYSTEM
}

enum ActivityAction {
  CREATED
  STATUS_CHANGED
  ASSIGNED
  PRIORITY_CHANGED
  NOTE_ADDED
  CUSTOMER_REPLIED
  AGENT_REPLIED
  CLOSED
  REOPENED
}

enum WebhookEvent {
  TICKET_CREATED
  TICKET_UPDATED
  MESSAGE_ADDED
  STATUS_CHANGED
  ASSIGNED
}

model App {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  isActive    Boolean  @default(true)
  channels    Channel[]
  tickets     Ticket[]
  webhooks    Webhook[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([isActive])
}

model Channel {
  id        String     @id @default(cuid())
  appId     String
  app       App        @relation(fields: [appId], references: [id], onDelete: Cascade)
  type      ChannelType
  name      String
  config    Json       // { welcomeMessage, color, widgetPosition, etc }
  isActive  Boolean    @default(true)
  tickets   Ticket[]

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([appId])
  @@index([isActive])
}

model Ticket {
  id          String        @id @default(cuid())
  ticketNumber String       @unique // Format: APP-XXXXX
  appId       String
  app         App           @relation(fields: [appId], references: [id])
  channelId   String
  channel     Channel       @relation(fields: [channelId], references: [id])

  // Customer (guest OR user)
  userId      String?
  user        User?         @relation("TicketCustomer", fields: [userId], references: [id])
  guestEmail  String?       @db.VarChar(255)
  guestName   String?       @db.VarChar(255)
  guestPhone  String?       @db.VarChar(50)

  // Ticket details
  subject     String        @db.VarChar(500)
  description String?       @db.Text
  status      TicketStatus  @default(OPEN)
  priority    Priority      @default(NORMAL)

  // Agent handling
  assignedTo  String?
  assignedToUser   User?    @relation("AssignedTickets", fields: [assignedTo], references: [id])
  assignedAt  DateTime?

  // Timestamps
  resolvedAt  DateTime?
  closedAt    DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  messages    TicketMessage[]
  activities  TicketActivity[]
  webhookLogs WebhookLog[]

  @@index([appId])
  @@index([channelId])
  @@index([userId])
  @@index([assignedTo])
  @@index([status])
  @@index([createdAt])
  @@index([ticketNumber])
}

model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  sender      SenderType
  userId      String?
  user        User?    @relation("TicketMessages", fields: [userId], references: [id])

  message     String   @db.Text
  attachments Json?    // [{ url, name, type, size }]
  isInternal  Boolean  @default(false)

  createdAt   DateTime @default(now())

  @@index([ticketId])
  @@index([createdAt])
}

model TicketActivity {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      Ticket        @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  action      ActivityAction
  userId      String?
  user        User?         @relation("TicketActivities", fields: [userId], references: [id])
  changes     Json?         // { from: "OPEN", to: "IN_PROGRESS" }
  metadata    Json?         // Additional context

  createdAt   DateTime      @default(now())

  @@index([ticketId])
  @@index([createdAt])
}

model Webhook {
  id          String   @id @default(cuid())
  appId       String
  app         App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  url         String   @db.Text
  events      WebhookEvent[]
  secret      String?  @db.VarChar(255)
  isActive    Boolean  @default(true)

  logs        WebhookLog[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([appId])
  @@index([isActive])
}

model WebhookLog {
  id          String   @id @default(cuid())
  webhookId   String?
  webhook     Webhook? @relation(fields: [webhookId], references: [id])
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  url         String   @db.Text
  event       WebhookEvent
  payload     Json
  statusCode  Int?
  response    String?  @db.Text
  attempts    Int      @default(0)

  success     Boolean
  sentAt      DateTime @default(now())

  @@index([ticketId])
  @@index([webhookId])
  @@index([sentAt])
}
```

**Step 2: Add Ticket relations to existing User model**

Find the `model User` block and add these relations:

```prisma
model User {
  // ... existing fields ...

  // Ticket relations
  customerTickets    Ticket[]              @relation("TicketCustomer")
  assignedTickets    Ticket[]              @relation("AssignedTickets")
  ticketMessages     TicketMessage[]       @relation("TicketMessages")
  ticketActivities   TicketActivity[]      @relation("TicketActivities")

  // ... rest of existing fields ...
}
```

**Step 3: Push schema to database**

Run: `pnpm --filter backoffice db:push`
Expected: Schema pushed successfully

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat(tickets): add database schema for ticketing module"
```

---

## Task 2: Seed Ticket Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed-permissions.ts`

**Step 1: Add ticket permissions to seed array**

Add to the `permissions` array in `apps/backoffice/prisma/seed-permissions.ts` (before the closing `];`):

```typescript
  // Ticket Management
  { name: "TICKET_VIEW_OWN", category: "TICKET", description: "View own assigned tickets" },
  { name: "TICKET_VIEW_ALL", category: "TICKET", description: "View all tickets" },
  { name: "TICKET_CREATE", category: "TICKET", description: "Create new tickets" },
  { name: "TICKET_UPDATE_OWN", category: "TICKET", description: "Update own assigned tickets" },
  { name: "TICKET_UPDATE_ALL", category: "TICKET", description: "Update any ticket" },
  { name: "TICKET_DELETE", category: "TICKET", description: "Delete tickets" },
  { name: "TICKET_ASSIGN", category: "TICKET", description: "Assign tickets to agents" },
  { name: "TICKET_CLOSE", category: "TICKET", description: "Close tickets" },
  { name: "TICKET_REOPEN", category: "TICKET", description: "Reopen closed tickets" },

  // Ticket Messages
  { name: "TICKET_MESSAGE_VIEW", category: "TICKET", description: "View ticket messages" },
  { name: "TICKET_MESSAGE_SEND", category: "TICKET", description: "Send messages to tickets" },
  { name: "TICKET_MESSAGE_INTERNAL", category: "TICKET", description: "Add internal notes" },

  // App/Channel Management
  { name: "TICKET_APP_VIEW", category: "TICKET", description: "View apps and channels" },
  { name: "TICKET_APP_MANAGE", category: "TICKET", description: "Create and manage apps/channels" },

  // Ticket Reports
  { name: "TICKET_REPORT_VIEW", category: "TICKET", description: "View ticket reports/analytics" },
  { name: "TICKET_EXPORT", category: "TICKET", description: "Export ticket data" },
```

**Step 2: Run seed**

Run: `pnpm --filter backoffice db:seed`
Expected: New permissions created

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/seed-permissions.ts
git commit -m "feat(tickets): add ticketing permissions"
```

---

## Task 3: Create Ticket Service Layer

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/types.ts`
- Create: `apps/backoffice/lib/services/ticketing/ticket-service.ts`

**Step 1: Create types file**

Create `apps/backoffice/lib/services/ticketing/types.ts`:

```typescript
import { TicketStatus, Priority, ChannelType, SenderType, ActivityAction, WebhookEvent } from "@prisma/client";

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

export interface TicketWithRelations {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  app: { id: string; name: string; slug: string };
  channel: { id: string; type: ChannelType; name: string };
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
```

**Step 2: Create ticket service**

Create `apps/backoffice/lib/services/ticketing/ticket-service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateTicketInput, UpdateTicketInput, ListTicketsParams, TicketWithRelations, PaginatedTickets } from "./types";
import { TicketStatus, ActivityAction } from "@prisma/client";
import { addTicketActivity } from "./ticket-activity-service";
import { triggerWebhook } from "./webhook-service";
import { notifyAgentsTicketCreated, notifyCustomerTicketUpdate } from "./notification-service";

export async function generateTicketNumber(appSlug: string): Promise<string> {
  const prefix = appSlug.substring(0, 4).toUpperCase();
  const count = await prisma.ticket.count({
    where: {
      app: { slug: appSlug }
    }
  });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}

export async function createTicket(data: CreateTicketInput): Promise<any> {
  const { appId, channelId, subject, description, message, priority, userId, guestInfo, attachments, createdBy } = data;

  // Validate app and channel
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app || !app.isActive) {
    throw new Error("INVALID_APP");
  }

  const channel = await prisma.channel.findFirst({
    where: { id: channelId, appId, isActive: true }
  });
  if (!channel) {
    throw new Error("INVALID_CHANNEL");
  }

  // Validate customer info
  if (!userId && (!guestInfo?.email)) {
    throw new Error("GUEST_INFO_REQUIRED");
  }

  // Generate ticket number
  const ticketNumber = await generateTicketNumber(app.slug);

  // Create ticket
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      appId,
      channelId,
      subject,
      description,
      priority: priority || "NORMAL",
      userId,
      guestEmail: guestInfo?.email,
      guestName: guestInfo?.name,
      guestPhone: guestInfo?.phone,
      status: TicketStatus.OPEN,
      messages: {
        create: {
          sender: userId ? SenderType.CUSTOMER : SenderType.CUSTOMER,
          userId,
          message,
          attachments,
        }
      },
      activities: {
        create: {
          action: ActivityAction.CREATED,
          userId: createdBy || userId,
        }
      }
    },
    include: {
      app: true,
      channel: true,
      user: true,
      messages: true,
    }
  });

  // Trigger webhook
  await triggerWebhook(ticket.id, "TICKET_CREATED" as WebhookEvent, { ticket });

  // Notify agents
  await notifyAgentsTicketCreated(ticket.id);

  return ticket;
}

export async function getTicketById(ticketId: string): Promise<any> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      app: { select: { id: true, name: true, slug: true } },
      channel: { select: { id: true, type: true, name: true } },
      user: { select: { id: true, name: true, email: true, avatar: true } },
      assignedToUser: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      }
    }
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  return ticket;
}

export async function listTickets(params: ListTicketsParams, userId?: string): Promise<PaginatedTickets> {
  const { page = 1, pageSize = 20, appId, status, assignedTo, search, sortBy = "createdAt" } = params;

  const where: Prisma.TicketWhereInput = {};

  if (appId) where.appId = appId;
  if (status) where.status = status;
  if (assignedTo === "mine") where.assignedTo = userId;
  if (assignedTo === "unassigned") where.assignedTo = null;
  if (assignedTo && assignedTo !== "mine" && assignedTo !== "unassigned") where.assignedTo = assignedTo;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { guestEmail: { contains: search, mode: "insensitive" } },
      { guestName: { contains: search, mode: "insensitive" } },
      { ticketNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.TicketOrderByWithRelationInput = {};
  if (sortBy === "priority") {
    // Priority order: URGENT > HIGH > NORMAL > LOW
    orderBy.priority = "desc";
  }
  orderBy[sortBy] = "desc";

  const [total, items] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        app: { select: { id: true, name: true, slug: true } },
        channel: { select: { id: true, type: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        assignedToUser: { select: { id: true, name: true, avatar: true } },
      }
    })
  ]);

  return {
    items: items.map(formatTicketListItem),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

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
    assignedTo: ticket.assignedToUser ? {
      id: ticket.assignedToUser.id,
      name: ticket.assignedToUser.name,
      avatar: ticket.assignedToUser.avatar,
    } : undefined,
  };
}

export async function updateTicket(ticketId: string, data: UpdateTicketInput, updatedBy: string): Promise<any> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { app: true }
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const updates: any = {};
  const activities: any[] = [];

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

  if (data.assignedTo !== undefined && data.assignedTo !== ticket.assignedTo) {
    updates.assignedTo = data.assignedTo;
    updates.assignedAt = data.assignedTo ? new Date() : null;

    activities.push({
      action: ActivityAction.ASSIGNED,
      changes: { from: ticket.assignedTo, to: data.assignedTo },
    });
  }

  if (data.priority && data.priority !== ticket.priority) {
    updates.priority = data.priority;
    activities.push({
      action: ActivityAction.PRIORITY_CHANGED,
      changes: { from: ticket.priority, to: data.priority },
    });
  }

  if (Object.keys(updates).length === 0) {
    return ticket;
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...updates,
      activities: {
        create: activities.map(a => ({
          ...a,
          userId: updatedBy,
        }))
      }
    },
    include: {
      app: true,
      channel: true,
      assignedToUser: true,
    }
  });

  // Trigger webhooks
  await triggerWebhook(ticketId, "TICKET_UPDATED" as WebhookEvent, { ticket: updated });

  // Notify customer
  await notifyCustomerTicketUpdate(ticketId, "status_change");

  return updated;
}

export async function closeTicket(ticketId: string, closedBy: string): Promise<any> {
  return updateTicket(ticketId, { status: TicketStatus.CLOSED }, closedBy);
}

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
        }
      }
    }
  });

  await triggerWebhook(ticketId, "STATUS_CHANGED" as WebhookEvent, { ticket: updated });

  return updated;
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/
git commit -m "feat(tickets): add ticket service layer"
```

---

## Task 4: Create Activity Service

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/ticket-activity-service.ts`

**Step 1: Create activity service**

Create `apps/backoffice/lib/services/ticketing/ticket-activity-service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ActivityAction, SenderType } from "@prisma/client";

interface AddActivityInput {
  ticketId: string;
  action: ActivityAction;
  userId?: string;
  changes?: any;
  metadata?: any;
}

export async function addTicketActivity(input: AddActivityInput) {
  return prisma.ticketActivity.create({
    data: {
      ticketId: input.ticketId,
      action: input.action,
      userId: input.userId,
      changes: input.changes,
      metadata: input.metadata,
    }
  });
}

export async function getTicketActivities(ticketId: string) {
  return prisma.ticketActivity.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/ticket-activity-service.ts
git commit -m "feat(tickets): add ticket activity service"
```

---

## Task 5: Create Message Service

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/ticket-message-service.ts`

**Step 1: Create message service**

Create `apps/backoffice/lib/services/ticketing/ticket-message-service.ts`:

```typescript
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

export async function addTicketMessage(input: AddMessageInput) {
  const { ticketId, sender, message, userId, attachments, isInternal = false } = input;

  // Get ticket
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  // Check if ticket is closed and customer is replying
  const shouldReopen = ticket.status === TicketStatus.CLOSED && sender === SenderType.CUSTOMER && !isInternal;

  // Create message
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

  const newMessage = await prisma.$transaction(async (tx) => {
    const msg = await tx.ticketMessage.create({ data: messageData });

    // Update ticket updatedAt
    await tx.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    // Add activity
    await tx.ticketActivity.create({
      data: {
        ticketId,
        action: sender === SenderType.CUSTOMER ? ActivityAction.CUSTOMER_REPLIED : ActivityAction.AGENT_REPLIED,
        userId,
      }
    });

    // Reopen if needed
    if (shouldReopen) {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: TicketStatus.IN_PROGRESS,
          closedAt: null,
        }
      });

      await tx.ticketActivity.create({
        data: {
          ticketId,
          action: ActivityAction.REOPENED,
        }
      });
    }

    return msg;
  });

  // Trigger webhook
  await triggerWebhook(ticketId, "MESSAGE_ADDED", { message: newMessage, ticket });

  // Notify
  if (sender === SenderType.CUSTOMER && !isInternal) {
    await notifyAgentTicketReply(ticketId);
  } else if (sender === SenderType.AGENT && !isInternal) {
    await notifyCustomerTicketUpdate(ticketId, "new_message");
  }

  return newMessage;
}

export async function getTicketMessages(ticketId: string) {
  return prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/ticket-message-service.ts
git commit -m "feat(tickets): add ticket message service"
```

---

## Task 6: Create Notification Service

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/notification-service.ts`

**Step 1: Create notification service**

Create `apps/backoffice/lib/services/ticketing/notification-service.ts`:

```typescript
import { prisma } from "@/lib/prisma";

// In-app notifications (can use existing notification system)
export async function notifyAgentTicketCreated(ticketId: string) {
  // Get agents with TICKET_VIEW_ALL permission
  // Send in-app notification
  // TODO: Implement with existing notification system
  console.log(`[Notification] New ticket created: ${ticketId}`);
}

export async function notifyAgentTicketReply(ticketId: string) {
  console.log(`[Notification] Customer replied to ticket: ${ticketId}`);
}

export async function notifyAgentTicketAssigned(ticketId: string, agentId: string) {
  console.log(`[Notification] Ticket ${ticketId} assigned to agent ${agentId}`);
}

// Customer notifications
export async function notifyCustomerTicketUpdate(ticketId: string, updateType: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { app: true, user: true }
  });

  if (!ticket) return;

  // If logged in user - in-app notification
  if (ticket.userId) {
    console.log(`[Notification] Ticket update for user ${ticket.userId}: ${updateType}`);
    return;
  }

  // If guest - send email
  if (ticket.guestEmail) {
    console.log(`[Email] Send ticket update to ${ticket.guestEmail}: ${updateType}`);
    // TODO: Implement email sending with MJML template
  }
}

export async function notifyCustomerTicketCreated(ticketId: string, ticketNumber: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId }
  });

  if (!ticket) return;

  if (ticket.guestEmail) {
    console.log(`[Email] Send ticket confirmation to ${ticket.guestEmail}: ${ticketNumber}`);
    // TODO: Send email with ticket number and link
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/notification-service.ts
git commit -m "feat(tickets): add notification service stubs"
```

---

## Task 7: Create Webhook Service

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/webhook-service.ts`

**Step 1: Create webhook service**

Create `apps/backoffice/lib/services/ticketing/webhook-service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { WebhookEvent } from "@prisma/schema.prisma";
import fetch from 'node-fetch';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [0, 60000, 300000]; // 0s, 1min, 5min

interface WebhookJob {
  ticketId: string;
  event: WebhookEvent;
  data: any;
}

class WebhookQueue {
  private queue: Map<string, WebhookJob[]> = new Map();

  async add(job: WebhookJob) {
    const key = `${job.ticketId}-${job.event}`;
    if (!this.queue.has(key)) {
      this.queue.set(key, []);
    }
    this.queue.get(key)!.push(job);
    await this.process(key);
  }

  private async process(key: string) {
    const jobs = this.queue.get(key);
    if (!jobs || jobs.length === 0) return;

    const job = jobs.shift()!;
    await this.deliver(job);

    // Process next if any
    if (jobs.length > 0) {
      setTimeout(() => this.process(key), 1000);
    }
  }

  private async deliver(job: WebhookJob) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: job.ticketId },
      include: { app: { include: { webhooks: true } } }
    });

    if (!ticket) return;

    const activeWebhooks = ticket.app.webhooks.filter(w =>
      w.isActive && w.events.includes(job.event)
    );

    for (const webhook of activeWebhooks) {
      await this.deliverWebhook(webhook.id, webhook.url, job.event, job.data);
    }
  }

  private async deliverWebhook(webhookId: string, url: string, event: WebhookEvent, data: any) {
    let lastError: any = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
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
          }
        });

        if (response.ok) {
          return; // Success
        }

        lastError = `HTTP ${response.status}`;
      } catch (error) {
        lastError = error;
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
          }
        });
      }

      // Wait before retry
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt + 1]));
      }
    }

    // All attempts failed - disable webhook temporarily
    if (lastError) {
      await prisma.webhook.update({
        where: { id: webhookId },
        data: { isActive: false }
      });
    }
  }
}

const webhookQueue = new WebhookQueue();

export async function triggerWebhook(ticketId: string, event: WebhookEvent, data: any) {
  await webhookQueue.add({ ticketId, event, data });
}

export async function getWebhooks(appId: string) {
  return prisma.webhook.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createWebhook(appId: string, url: string, events: WebhookEvent[], secret?: string) {
  return prisma.webhook.create({
    data: { appId, url, events, secret }
  });
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/webhook-service.ts
git commit -m "feat(tickets): add webhook service with retry logic"
```

---

## Task 8: Create Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/ticket-validation.ts`

**Step 1: Create validation schemas**

Create `apps/backoffice/lib/validations/ticket-validation.ts`:

```typescript
import { z } from "zod";
import { TicketStatus, Priority, ChannelType, SenderType } from "@prisma/schema.prisma";

// Public API - Create Ticket
export const createTicketSchema = z.object({
  appSlug: z.string().min(1, "App slug is required"),
  channelType: z.enum(["WEB_FORM", "PUBLIC_LINK", "WIDGET", "INTEGRATED_APP"]),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long"),
  attachments: z.array(z.object({
    url: z.string().url(),
    name: z.string().max(255),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB")
  })).max(5, "Maximum 5 attachments allowed").optional(),
  guestEmail: z.string().email("Invalid email").optional(),
  guestName: z.string().min(2).max(100).optional(),
  guestPhone: z.string().regex(/^[+]?[\d\s-]+$/, "Invalid phone number").optional(),
}).refine(
  data => !data.userId || (!data.guestEmail && !data.guestName),
  "Cannot provide both userId and guest info"
);

// Update Ticket
export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assignedTo: z.string().nullable().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

// Add Message
export const addMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    url: z.string().url(),
    name: z.string().max(255),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024)
  })).max(5).optional(),
  isInternal: z.boolean().default(false),
});

// List Tickets Query
export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  appId: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "priority"]).default("createdAt"),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/ticket-validation.ts
git commit -m "feat(tickets): add validation schemas"
```

---

## Task 9: Create Public API Routes

**Files:**
- Create: `apps/backoffice/app/api/public/tickets/route.ts`
- Create: `apps/backoffice/app/api/public/tickets/[id]/route.ts`
- Create: `apps/backoffice/app/api/public/tickets/[id]/status/route.ts`
- Create: `apps/backoffice/app/api/public/tickets/[id]/messages/route.ts`

**Step 1: Create public tickets route**

Create `apps/backoffice/app/api/public/tickets/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { createTicketSchema } from "@/lib/validations/ticket-validation";
import { createTicket } from "@/lib/services/ticketing/ticket-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    // Get app by slug
    const app = await prisma.app.findUnique({
      where: { slug: validated.appSlug, isActive: true },
      include: {
        channels: {
          where: { type: validated.channelType, isActive: true }
        }
      }
    });

    if (!app || app.channels.length === 0) {
      return NextResponse.json(
        { error: "INVALID_APP", message: "Invalid or inactive app/channel" },
        { status: 400 }
      );
    }

    const channel = app.channels[0]; // Use first active channel of this type

    // Check for authenticated user
    const session = await requireAuth().catch(() => null);
    const userId = session?.user?.id;

    // For INTEGRATED_APP, require login
    if (validated.channelType === "INTEGRATED_APP" && !userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Login required" },
        { status: 401 }
      );
    }

    // For public channels, require guest info if not logged in
    if (!userId && !validated.guestEmail) {
      return NextResponse.json(
        { error: "GUEST_INFO_REQUIRED", message: "Email is required" },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = await createTicket({
      appId: app.id,
      channelId: channel.id,
      subject: validated.subject,
      message: validated.message,
      attachments: validated.attachments,
      userId,
      guestInfo: userId ? undefined : {
        email: validated.guestEmail!,
        name: validated.guestName,
        phone: validated.guestPhone,
      }
    });

    return NextResponse.json({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      createdAt: ticket.createdAt,
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
```

**Step 2: Create ticket status route**

Create `apps/backoffice/app/api/public/tickets/[id]/status/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/services/ticketing/ticket-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await getTicketById(params.id);

    return NextResponse.json({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      subject: ticket.subject,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: ticket.messages.map((m: any) => ({
        message: m.message,
        sender: m.sender,
        createdAt: m.createdAt,
      })),
    });

  } catch (error: any) {
    if (error.message === "TICKET_NOT_FOUND") {
      return NextResponse.json(
        { error: "TICKET_NOT_FOUND", message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create ticket messages route**

Create `apps/backoffice/app/api/public/tickets/[id]/messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { addMessageSchema } from "@/lib/validations/ticket-validation";
import { addTicketMessage } from "@/lib/services/ticketing/ticket-message-service";
import { SenderType } from "@prisma/schema.prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = addMessageSchema.parse(body);

    // TODO: Add API key authentication for chatbot/WA

    const message = await addTicketMessage({
      ticketId: params.id,
      sender: SenderType.CUSTOMER,
      message: validated.message,
      attachments: validated.attachments,
      isInternal: false,
    });

    return NextResponse.json({
      messageId: message.id,
      ticketId: params.id,
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/public/tickets/
git commit -m "feat(tickets): add public API routes"
```

---

## Task 10: Create Internal API Routes

**Files:**
- Create: `apps/backoffice/app/api/tickets/route.ts`
- Create: `apps/backoffice/app/api/tickets/[id]/route.ts`
- Create: `apps/backoffice/app/api/tickets/[id]/messages/route.ts`
- Create: `apps/backoffice/app/api/tickets/[id]/close/route.ts`

**Step 1: Create tickets list route**

Create `apps/backoffice/app/api/tickets/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { listTicketsQuerySchema } from "@/lib/validations/ticket-validation";
import { listTickets, createTicket } from "@/lib/services/ticketing/ticket-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    const { searchParams } = new URL(request.url);
    const params = listTicketsQuerySchema.parse(Object.fromEntries(searchParams));

    const result = await listTickets(params, session.user.id);

    return NextResponse.json(result);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
```

**Step 2: Create ticket detail route**

Create `apps/backoffice/app/api/tickets/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getTicketById, updateTicket } from "@/lib/services/ticketing/ticket-service";
import { updateTicketSchema } from "@/lib/validations/ticket-validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    const ticket = await getTicketById(params.id);
    return NextResponse.json({ ticket });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_UPDATE_ALL");

    const body = await request.json();
    const validated = updateTicketSchema.parse(body);

    const ticket = await updateTicket(params.id, validated, session.user.id);
    return NextResponse.json({ ticket });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**Step 3: Create ticket messages route**

Create `apps/backoffice/app/api/tickets/[id]/messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { addMessageSchema } from "@/lib/validations/ticket-validation";
import { addTicketMessage } from "@/lib/services/ticketing/ticket-message-service";
import { SenderType } from "@prisma/schema.prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_MESSAGE_SEND");

    const body = await request.json();
    const validated = addMessageSchema.parse(body);

    const message = await addTicketMessage({
      ticketId: params.id,
      sender: SenderType.AGENT,
      message: validated.message,
      userId: session.user.id,
      attachments: validated.attachments,
      isInternal: validated.isInternal || false,
    });

    return NextResponse.json({ message });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**Step 4: Create close ticket route**

Create `apps/backoffice/app/api/tickets/[id]/close/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { closeTicket } from "@/lib/services/ticketing/ticket-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_CLOSE");

    const ticket = await closeTicket(params.id, session.user.id);
    return NextResponse.json({ ticket });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**Step 5: Commit**

```bash
git add apps/backoffice/app/api/tickets/
git commit -m "feat(tickets): add internal API routes"
```

---

## Task 11: Create Ticket List Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/tickets/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/tickets/components/ticket-table.tsx`
- Create: `apps/backoffice/app/(dashboard)/tickets/components/ticket-filters.tsx`

**Step 1: Create tickets page**

Create `apps/backoffice/app/(dashboard)/tickets/page.tsx`:

```typescript
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketList } from "./components/ticket-list";

export default async function TicketsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <p className="text-muted-foreground">Manage customer support tickets</p>
      </div>
      <TicketList />
    </div>
  );
}
```

**Step 2: Create ticket list component**

Create `apps/backoffice/app/(dashboard)/tickets/components/ticket-list.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TicketTable } from "./ticket-table";
import { TicketFilters } from "./ticket-filters";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  app: { name: string };
  customer: { guestName?: string; guestEmail?: string };
  assignedTo?: { name: string };
}

interface Filters {
  page: number;
  pageSize: number;
  status?: string;
  assignedTo?: string;
  search?: string;
}

export function TicketList() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
      />
      <TicketTable
        tickets={data?.items || []}
        isLoading={isLoading}
        total={data?.total || 0}
        page={filters.page}
        pageSize={filters.pageSize}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

**Step 3: Create ticket table component**

Create `apps/backoffice/app/(dashboard)/tickets/components/ticket-table.tsx`:

```typescript
"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  app: { name: string };
  customer: { guestName?: string; guestEmail?: string };
  assignedTo?: { name: string };
}

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-500",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500",
  RESOLVED: "bg-green-500/10 text-green-500",
  CLOSED: "bg-gray-500/10 text-gray-500",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/10 text-gray-500",
  NORMAL: "bg-blue-500/10 text-blue-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  URGENT: "bg-red-500/10 text-red-500",
};

export function TicketTable({
  tickets,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
}: TicketTableProps) {
  const router = useRouter();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <TableCell className="font-mono text-sm">
                {ticket.ticketNumber}
              </TableCell>
              <TableCell className="font-medium">
                {ticket.subject}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[ticket.status]}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.customer.guestName || ticket.customer.guestEmail || "-"}
              </TableCell>
              <TableCell>
                {ticket.assignedTo?.name || <span className="text-muted">Unassigned</span>}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Create ticket filters component**

Create `apps/backoffice/app/(dashboard)/tickets/components/ticket-filters.tsx`:

```typescript
"use client";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";

interface Filters {
  page: number;
  pageSize: number;
  status?: string;
  assignedTo?: string;
  search?: string;
}

interface TicketFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Input
        placeholder="Search tickets..."
        value={filters.search || ""}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
        className="w-64"
      />

      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value === "all" ? undefined : value, page: 1 })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.assignedTo || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            assignedTo: value === "all" ? undefined : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Assigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="mine">Mine</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
        </SelectContent>
      </Select>

      {(filters.status || filters.assignedTo || filters.search) && (
        <Button
          variant="ghost"
          onClick={() =>
            onFiltersChange({
              page: 1,
              pageSize: filters.pageSize,
            })
          }
        >
          Clear
        </Button>
      )}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tickets/
git commit -m "feat(tickets): add ticket list page with filters"
```

---

## Task 12: Create Ticket Detail Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/tickets/[id]/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-detail.tsx`
- Create: `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-messages.tsx`

**Step 1: Create ticket detail page**

Create `apps/backoffice/app/(dashboard)/tickets/[id]/page.tsx`:

```typescript
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketDetail } from "./components/ticket-detail";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");

  return <TicketDetail ticketId={params.id} />;
}
```

**Step 2: Create ticket detail component**

Create `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-detail.tsx`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { TicketMessages } from "./ticket-messages";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useState } from "react";

interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const updateTicket = async (updates: any) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  const closeTicket = async () => {
    if (!confirm("Are you sure you want to close this ticket?")) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/close`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to close");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const ticket = data?.ticket;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <Badge>{ticket.ticketNumber}</Badge>
            <Badge variant="outline">{ticket.app.name}</Badge>
          </div>
          <p className="text-muted">
            {ticket.channel.type} • Created {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Select
            value={ticket.status}
            onValueChange={(value) => updateTicket({ status: value })}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={closeTicket}
            disabled={isUpdating || ticket.status === "CLOSED"}
          >
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketMessages ticketId={ticketId} onUpdate={refetch} />
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Customer</h3>
            <p className="text-sm">
              {ticket.user?.name || ticket.guestName || "Unknown"}
            </p>
            <p className="text-sm text-muted">
              {ticket.user?.email || ticket.guestEmail || "-"}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge>{ticket.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Priority</span>
                <Badge>{ticket.priority}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Assigned To</span>
                <span>{ticket.assignedTo?.name || "Unassigned"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create ticket messages component**

Create `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-messages.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Avatar } from "@workspace/ui/components/avatar";
import { formatDistanceToNow } from "date-fns";

interface TicketMessagesProps {
  ticketId: string;
  onUpdate: () => void;
}

export function TicketMessages({ ticketId, onUpdate }: TicketMessagesProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data } = useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isInternal }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      onUpdate();
    },
  });

  const ticket = data?.ticket;
  const messages = ticket?.messages || [];

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversation</h2>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "AGENT" ? "justify-end" : ""}`}
          >
            {msg.sender === "CUSTOMER" && (
              <Avatar className="w-8 h-8" />
            )}
            <div
              className={`max-w-md rounded-lg p-3 ${
                msg.sender === "AGENT"
                  ? "bg-primary text-primary-foreground"
                  : msg.isInternal
                  ? "bg-yellow-100 dark:bg-yellow-900"
                  : "bg-muted"
              }`}
            >
              {msg.isInternal && (
                <p className="text-xs font-semibold mb-1">Internal Note</p>
              )}
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </p>
            </div>
            {msg.sender === "AGENT" && (
              <Avatar className="w-8 h-8" />
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="internal"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
          />
          <label htmlFor="internal" className="text-sm">
            Internal note
          </label>
        </div>
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <Button
          onClick={() => sendMessage.mutate()}
          disabled={!message.trim() || sendMessage.isPending}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tickets/[id]/
git commit -m "feat(tickets): add ticket detail page"
```

---

## Task 13: Seed Initial App and Channel

**Files:**
- Create: `apps/backoffice/prisma/seed-ticketing.ts`

**Step 1: Create ticketing seed file**

Create `apps/backoffice/prisma/seed-ticketing.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTicketing() {
  console.log("🌱 Seeding ticketing module...\n");

  // Create default app
  const app = await prisma.app.upsert({
    where: { slug: "support" },
    update: {},
    create: {
      name: "Support",
      slug: "support",
      description: "General support tickets",
      isActive: true,
      channels: {
        create: [
          {
            type: "WEB_FORM",
            name: "Website Form",
            config: { welcomeMessage: "How can we help you today?" },
            isActive: true,
          },
          {
            type: "INTEGRATED_APP",
            name: "In-App Support",
            config: {},
            isActive: true,
          },
        ],
      },
    },
  });

  console.log(`✅ App created: ${app.slug} (${app.name})`);
  console.log(`   Channels: ${app.channels?.length || 0}\n`);

  console.log("🎉 Ticketing seeding completed!\n");
}

seedTicketing()
  .catch((e) => {
    console.error("❌ Error seeding ticketing:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Step 2: Add to package.json scripts**

Add to `apps/backoffice/package.json` scripts:

```json
"db:seed:ticketing": "tsx prisma/seed-ticketing.ts"
```

**Step 3: Run seed**

Run: `pnpm --filter backoffice db:seed:ticketing`
Expected: App and channels created

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/seed-ticketing.ts apps/backoffice/package.json
git commit -m "feat(tickets): add ticketing seed script"
```

---

## Task 14: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add ticketing section to CLAUDE.md**

Add to `CLAUDE.md` after the existing sections:

```markdown
## Ticketing Module

### Architecture
- Multi-app, multi-channel support (Web Form, Widget, Integrated App)
- Guest and authenticated user support
- Webhook integration for external systems

### Service Layer
- `lib/services/ticketing/ticket-service.ts` - Core ticket operations
- `lib/services/ticketing/ticket-message-service.ts` - Message handling
- `lib/services/ticketing/webhook-service.ts` - Webhook delivery
- `lib/services/ticketing/notification-service.ts` - Notifications

### Public API
- `POST /api/public/tickets` - Create ticket
- `GET /api/public/tickets/:id/status` - Check status
- `POST /api/public/tickets/:id/messages` - Add message (chatbot)

### Permissions
- TICKET_VIEW_ALL, TICKET_CREATE, TICKET_UPDATE_ALL
- TICKET_MESSAGE_SEND, TICKET_CLOSE, TICKET_ASSIGN
- TICKET_APP_MANAGE for app/channel management
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add ticketing module documentation"
```

---

## Summary

This implementation plan covers:

1. ✅ Database schema with all ticketing entities
2. ✅ RBAC permissions integration
3. ✅ Service layer (tickets, messages, activities, webhooks, notifications)
4. ✅ Public API for external integrations
5. ✅ Internal API for agent dashboard
6. ✅ Agent UI (list, detail, messages)
7. ✅ Validation schemas
8. ✅ Seed data

**Total tasks:** 14
**Estimated completion:** 4-6 hours

---

## Post-Implementation

After completing all tasks:

1. **Test the flow:**
   - Create ticket via public API
   - View in agent dashboard
   - Reply as agent
   - Verify notifications

2. **Add remaining features:**
   - Email templates for ticket notifications
   - File upload handling
   - Widget embed code generation
   - Analytics dashboard

3. **Documentation:**
   - API documentation for external integrators
   - Widget integration guide
   - Webhook setup guide
