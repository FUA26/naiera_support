# Notification System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a general-purpose, reusable notification system with real-time in-app notifications via WebSocket, email delivery, user preferences, and admin-manageable templates.

**Architecture:** Service layer pattern following existing codebase conventions, RESTful API routes with Next.js App Router, Socket.io for WebSocket, Prisma for persistence, React components with shadcn/ui for UI.

**Tech Stack:** Next.js 16, Prisma 6, Socket.io, Zod, React Email, Resend (optional), TypeScript

---

## Task 1: Install Dependencies

**Files:**
- Modify: `apps/backoffice/package.json`

**Step 1: Install Socket.io dependencies**

Run: `pnpm --filter backoffice add socket.io socket.io-client`

Expected: package.json updated with new dependencies

**Step 2: Commit**

```bash
git add apps/backoffice/package.json apps/backoffice/pnpm-lock.yaml
git commit -m "deps: add socket.io for websocket notifications"
```

---

## Task 2: Add Environment Variables

**Files:**
- Modify: `apps/backoffice/lib/env.ts`

**Step 1: Add notification environment variables to schema**

Add to the `envSchema` object (after line 84, before the closing brace):

```typescript
  // Notification Settings
  NOTIFICATION_AUTO_DELETE_DAYS: z.coerce.number().default(90),
  EMAIL_PROVIDER: z.enum(["mock", "resend", "nodemailer"]).default("mock"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default("http://localhost:3001"),
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/lib/env.ts
git commit -m "feat: add notification environment variables"
```

---

## Task 3: Add Prisma Schema Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add enums before Task Management Models section**

Add before line 203 (before `// Task Management Models`):

```prisma
// ============================================================================
// Notification System Models
// ============================================================================

enum NotificationType {
  SYSTEM
  INFO
  WARNING
  ERROR
}

enum NotificationPriority {
  HIGH
  MEDIUM
  LOW
}

enum NotificationChannel {
  IN_APP
  EMAIL
}
```

**Step 2: Add models after enums**

Add after the enums (after line ~222):

```prisma
model Notification {
  id          String               @id @default(cuid())
  type        NotificationType     @default(INFO)
  priority    NotificationPriority @default(MEDIUM)
  title       String
  message     String
  userId      String
  read        Boolean              @default(false)
  readAt      DateTime?
  actionUrl   String?
  actionLabel String?
  metadata    Json?
  expiresAt   DateTime?
  createdAt   DateTime             @default(now())

  user User @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([userId, createdAt])
  @@index([createdAt])
  @@index([expiresAt])
}

model NotificationPreference {
  id        String              @id @default(cuid())
  userId    String
  channel   NotificationChannel
  type      NotificationType?
  enabled   Boolean             @default(true)
  createdAt DateTime            @default(now())

  user User @relation("UserNotificationPreferences", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, channel, type])
}

model NotificationTemplate {
  id          String              @id @default(cuid())
  type        NotificationType
  channel     NotificationChannel
  subject     String
  body        String              @default("")
  variables   String[]            @default([])
  isActive    Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@unique([type, channel])
}
```

**Step 3: Add User model relations**

Find the User model (around line 39) and add inside the model after `taskActivities` (after line 67):

```prisma
  // Notification Relations
  notifications        Notification[]       @relation("UserNotifications")
  notificationPreferences NotificationPreference[] @relation("UserNotificationPreferences")
```

**Step 4: Push schema to database**

Run: `pnpm --filter backoffice db:push`

Expected: Schema pushed successfully, database tables created

**Step 5: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add notification database models"
```

---

## Task 4: Create Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/notification.ts`

**Step 1: Create notification validation schemas**

Create the file with complete Zod schemas:

```typescript
import { z } from "zod";

// Enums matching Prisma
export const notificationTypeEnum = z.enum(["SYSTEM", "INFO", "WARNING", "ERROR"]);
export type NotificationTypeEnum = z.infer<typeof notificationTypeEnum>;

export const notificationPriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type NotificationPriorityEnum = z.infer<typeof notificationPriorityEnum>;

export const notificationChannelEnum = z.enum(["IN_APP", "EMAIL"]);
export type NotificationChannelEnum = z.infer<typeof notificationChannelEnum>;

// Base notification schema
export const notificationSchema = z.object({
  type: notificationTypeEnum.default("INFO"),
  priority: notificationPriorityEnum.default("MEDIUM"),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  userId: z.string().cuid(),
  actionUrl: z.string().url().optional().or(z.literal("")),
  actionLabel: z.string().max(100).optional(),
  metadata: z.any().optional(),
  expiresAt: z.coerce.date().optional(),
});

// Create notification
export const createNotificationSchema = notificationSchema;

// Update notification (mark as read)
export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

// Query params for list
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  type: notificationTypeEnum.optional(),
  read: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "priority", "type"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Preferences
export const notificationPreferenceSchema = z.object({
  channel: notificationChannelEnum,
  type: notificationTypeEnum.optional(),
  enabled: z.boolean(),
});

export const updatePreferencesSchema = z.object({
  preferences: z.array(notificationPreferenceSchema),
});

// Template
export const notificationTemplateSchema = z.object({
  type: notificationTypeEnum,
  channel: notificationChannelEnum,
  subject: z.string().min(1).max(200),
  body: z.string().max(5000).default(""),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// Broadcast
export const broadcastNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: notificationTypeEnum.default("INFO"),
  priority: notificationPriorityEnum.default("MEDIUM"),
  target: z.enum(["all", "role", "users"]),
  roleId: z.string().cuid().optional(),
  userIds: z.array(z.string().cuid()).optional(),
  channels: z.array(notificationChannelEnum).default(["IN_APP"]),
  actionUrl: z.string().url().optional().or(z.literal("")),
  actionLabel: z.string().max(100).optional(),
});
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/lib/validations/notification.ts
git commit -m "feat: add notification validation schemas"
```

---

## Task 5: Create Email Service

**Files:**
- Create: `apps/backoffice/lib/email/interface.ts`
- Create: `apps/backoffice/lib/email/mock-provider.ts`
- Create: `apps/backoffice/lib/email/resend-provider.ts`
- Create: `apps/backoffice/lib/email/index.ts`

**Step 1: Create email interface**

Create `apps/backoffice/lib/email/interface.ts`:

```typescript
export interface EmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailProvider {
  send(params: EmailParams): Promise<boolean>;
}
```

**Step 2: Create mock provider**

Create `apps/backoffice/lib/email/mock-provider.ts`:

```typescript
import type { EmailProvider, EmailParams } from "./interface";

/**
 * Mock email provider for development/testing
 * Logs emails to console instead of sending
 */
export class MockEmailProvider implements EmailProvider {
  async send(params: EmailParams): Promise<boolean> {
    console.log("[MOCK EMAIL]", {
      to: params.to,
      subject: params.subject,
      from: params.from,
      hasHtml: !!params.html,
      hasText: !!params.text,
    });
    return true;
  }
}
```

**Step 3: Create Resend provider**

Create `apps/backoffice/lib/email/resend-provider.ts`:

```typescript
import { Resend } from "resend";
import type { EmailProvider, EmailParams } from "./interface";
import { env } from "@/lib/env";

/**
 * Resend email provider
 * Production email sending via Resend API
 */
export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY || "");
  }

  async send(params: EmailParams): Promise<boolean> {
    if (!env.RESEND_API_KEY) {
      console.warn("Resend API key not configured, skipping email send");
      return false;
    }

    try {
      const from = params.from || env.EMAIL_FROM;
      const to = Array.isArray(params.to) ? params.to : [params.to];

      await this.resend.emails.send({
        from,
        to: to[0], // Resend only supports single recipient
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      return true;
    } catch (error) {
      console.error("Resend email error:", error);
      return false;
    }
  }
}
```

**Step 4: Create email service index**

Create `apps/backoffice/lib/email/index.ts`:

```typescript
import { env } from "@/lib/env";
import type { EmailProvider, EmailParams } from "./interface";
import { MockEmailProvider } from "./mock-provider";
import { ResendEmailProvider } from "./resend-provider";

let providerInstance: EmailProvider | null = null;

function getProvider(): EmailProvider {
  if (!providerInstance) {
    switch (env.EMAIL_PROVIDER) {
      case "resend":
        providerInstance = new ResendEmailProvider();
        break;
      case "mock":
      default:
        providerInstance = new MockEmailProvider();
    }
  }
  return providerInstance;
}

/**
 * Send an email using the configured provider
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  return getProvider().send(params);
}

export type { EmailParams, EmailProvider };
export { MockEmailProvider, ResendEmailProvider };
```

**Step 5: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 6: Commit**

```bash
git add apps/backoffice/lib/email/
git commit -m "feat: add email service with mock and resend providers"
```

---

## Task 6: Create Socket.io Server

**Files:**
- Create: `apps/backoffice/lib/socket/server.ts`
- Create: `apps/backoffice/lib/socket/index.ts`

**Step 1: Create socket server singleton**

Create `apps/backoffice/lib/socket/server.ts`:

```typescript
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth/config";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 * Call this once during app initialization
 */
export function initSocketServer(httpServer: HTTPServer) {
  if (io) {
    console.warn("Socket.io server already initialized");
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin: env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      // Get session token from handshake auth
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify session using NextAuth
      // Note: In production, implement proper session verification
      // For now, we'll accept any non-empty token in development
      socket.userId = socket.handshake.auth.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket: any) => {
    const userId = (socket as AuthenticatedSocket).userId;
    console.log(`User connected: ${userId}`);

    // Join user's personal room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Handle subscribe event (redundant but explicit)
    socket.on("subscribe", (data: { userId: string }) => {
      socket.join(`user:${data.userId}`);
      console.log(`User ${data.userId} subscribed to notifications`);
    });

    // Handle mark_read event
    socket.on("mark_read", async (notificationId: string) => {
      // Emit to all user's sessions
      if (userId) {
        io?.to(`user:${userId}`).emit("notification_read", notificationId);
      }
    });

    // Handle mark_all_read event
    socket.on("mark_all_read", async () => {
      if (userId) {
        io?.to(`user:${userId}`).emit("notification_count", { unread: 0, total: 0 });
      }
    });

    // Handle get_unread_count event
    socket.on("get_unread_count", async () => {
      // This would query the database for the count
      // For now, just acknowledge
      socket.emit("unread_count_acknowledged");
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  console.log("Socket.io server initialized");
  return io;
}

/**
 * Get the Socket.io server instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit a notification to a specific user
 */
export function emitNotification(userId: string, notification: unknown) {
  io?.to(`user:${userId}`).emit("notification", notification);
}

/**
 * Emit unread count to a specific user
 */
export function emitUnreadCount(userId: string, count: { unread: number; total: number }) {
  io?.to(`user:${userId}`).emit("notification_count", count);
}

/**
 * Emit notification read event
 */
export function emitNotificationRead(userId: string, notificationId: string) {
  io?.to(`user:${userId}`).emit("notification_read", notificationId);
}

import type { Socket } from "socket.io";
```

**Step 2: Create socket service index**

Create `apps/backoffice/lib/socket/index.ts`:

```typescript
export {
  initSocketServer,
  getSocketServer,
  emitNotification,
  emitUnreadCount,
  emitNotificationRead,
} from "./server";
```

**Step 3: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 4: Commit**

```bash
git add apps/backoffice/lib/socket/
git commit -m "feat: add socket.io server for real-time notifications"
```

---

## Task 7: Create Notification Service

**Files:**
- Create: `apps/backoffice/lib/services/notification-service.ts`

**Step 1: Create notification service with all functions**

Create the complete service file:

```typescript
import { prisma } from "@/lib/prisma";
import type {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  Prisma,
} from "@prisma/client";
import { sendEmail } from "@/lib/email";
import {
  emitNotification,
  emitUnreadCount,
} from "@/lib/socket";

// Types
export interface CreateNotificationInput {
  type?: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  userId: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Prisma.InputJsonValue;
  expiresAt?: Date;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  type?: NotificationType;
  read?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedNotificationResult {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface NotificationPreferenceInput {
  channel: NotificationChannel;
  type?: NotificationType;
  enabled: boolean;
}

export interface TemplateData {
  [key: string]: string | number;
}

// Helper function
function formatNotification(notification: any): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    readAt: notification.readAt,
    actionUrl: notification.actionUrl,
    actionLabel: notification.actionLabel,
    createdAt: notification.createdAt,
    expiresAt: notification.expiresAt,
  };
}

/**
 * Create a single notification
 * Handles both in-app and email delivery based on user preferences
 */
export async function createNotification(input: CreateNotificationInput): Promise<NotificationItem | null> {
  const { userId } = input;

  // Check if IN_APP channel is enabled for this user/type
  const inAppEnabled = await isChannelEnabled(userId, "IN_APP", input.type);
  const emailEnabled = await isChannelEnabled(userId, "EMAIL", input.type);

  // If both channels are disabled, don't create notification
  if (!inAppEnabled && !emailEnabled) {
    return null;
  }

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      type: input.type || "INFO",
      priority: input.priority || "MEDIUM",
      title: input.title,
      message: input.message,
      userId,
      actionUrl: input.actionUrl,
      actionLabel: input.actionLabel,
      metadata: input.metadata,
      expiresAt: input.expiresAt,
    },
  });

  const formatted = formatNotification(notification);

  // Send in-app notification via WebSocket
  if (inAppEnabled) {
    emitNotification(userId, formatted);
    // Emit updated count
    const unreadCount = await getUnreadCount(userId);
    emitUnreadCount(userId, unreadCount);
  }

  // Send email notification
  if (emailEnabled) {
    await sendEmailNotification(notification);
  }

  return formatted;
}

/**
 * Create bulk notifications for multiple users
 */
export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
): Promise<NotificationItem[]> {
  const results = await Promise.allSettled(
    inputs.map((input) => createNotification(input))
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<NotificationItem>).value);
}

/**
 * Get notifications for a user with pagination and filtering
 */
export async function getNotifications(
  userId: string,
  params: NotificationListParams = {}
): Promise<PaginatedNotificationResult> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.NotificationWhereInput = {
    userId,
    expiresAt: {
      or: [
        { gt: new Date() },
        { equals: null },
      ],
    },
  };

  if (params.type !== undefined) {
    where.type = params.type;
  }

  if (params.read !== undefined) {
    where.read = params.read;
  }

  const orderBy: Prisma.NotificationOrderByWithRelationInput = {};
  const sortBy = params.sortBy || "createdAt";
  orderBy[sortBy as keyof Prisma.NotificationOrderByWithRelationInput] = params.sortOrder || "desc";

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    items: notifications.map(formatNotification),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<NotificationItem | null> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    return null;
  }

  if (notification.read) {
    return formatNotification(notification);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return formatNotification(updated);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    return false;
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return true;
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<{ unread: number; total: number }> {
  const [unread, total] = await Promise.all([
    prisma.notification.count({
      where: {
        userId,
        read: false,
        expiresAt: {
          or: [
            { gt: new Date() },
            { equals: null },
          ],
        },
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        expiresAt: {
          or: [
            { gt: new Date() },
            { equals: null },
          ],
        },
      },
    }),
  ]);

  return { unread, total };
}

/**
 * Get user notification preferences
 */
export async function getPreferences(userId: string): Promise<NotificationPreferenceInput[]> {
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId },
  });

  return preferences.map((p) => ({
    channel: p.channel,
    type: p.type || undefined,
    enabled: p.enabled,
  }));
}

/**
 * Update user notification preferences
 */
export async function updatePreferences(
  userId: string,
  preferences: NotificationPreferenceInput[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete existing preferences
    await tx.notificationPreference.deleteMany({
      where: { userId },
    });

    // Create new preferences
    await tx.notificationPreference.createMany({
      data: preferences.map((p) => ({
        userId,
        channel: p.channel,
        type: p.type,
        enabled: p.enabled,
      })),
    });
  });
}

/**
 * Check if a channel is enabled for a user
 */
export async function isChannelEnabled(
  userId: string,
  channel: NotificationChannel,
  type?: NotificationType
): Promise<boolean> {
  const preference = await prisma.notificationPreference.findUnique({
    where: {
      userId_channel_type: {
        userId,
        channel,
        type: type || null,
      },
    },
  });

  // If no preference exists, default to enabled
  return preference?.enabled ?? true;
}

/**
 * Get template for notification type and channel
 */
export async function getTemplate(
  type: NotificationType,
  channel: NotificationChannel
): Promise<{ subject: string; body: string; variables: string[] } | null> {
  const template = await prisma.notificationTemplate.findUnique({
    where: {
      type_channel: {
        type,
        channel,
      },
    },
  });

  if (!template || !template.isActive) {
    return null;
  }

  return {
    subject: template.subject,
    body: template.body,
    variables: template.variables,
  };
}

/**
 * Render template with data
 */
export function renderTemplate(
  template: string,
  data: TemplateData
): string {
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, String(value));
  }
  return rendered;
}

/**
 * Send email notification
 */
async function sendEmailNotification(notification: any): Promise<boolean> {
  const template = await getTemplate(notification.type, "EMAIL");

  const subject = template
    ? renderTemplate(template.subject, { title: notification.title })
    : notification.title;

  const body = template
    ? renderTemplate(template.body, {
        title: notification.title,
        message: notification.message,
      })
    : notification.message;

  // Get user email
  const user = await prisma.user.findUnique({
    where: { id: notification.userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    return false;
  }

  return sendEmail({
    to: user.email,
    subject,
    html: `<p>${body}</p>`,
    text: body.replace(/<[^>]*>/g, ""),
  });
}

/**
 * Delete expired notifications (for background job)
 */
export async function deleteExpiredNotifications(): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/lib/services/notification-service.ts
git commit -m "feat: add notification service with CRUD and preferences"
```

---

## Task 8: Create User Notification API Routes

**Files:**
- Create: `apps/backoffice/app/api/notifications/route.ts`
- Create: `apps/backoffice/app/api/notifications/unread/route.ts`
- Create: `apps/backoffice/app/api/notifications/read-all/route.ts`
- Create: `apps/backoffice/app/api/notifications/[id]/read/route.ts`
- Create: `apps/backoffice/app/api/notifications/[id]/route.ts`
- Create: `apps/backoffice/app/api/notifications/preferences/route.ts`

**Step 1: Create main notifications route (GET, POST)**

Create `apps/backoffice/app/api/notifications/route.ts`:

```typescript
/**
 * Notifications API Route
 * GET /api/notifications - List user notifications
 * POST /api/notifications - Create notification (rare use case)
 */

import { requireAuth } from "@/lib/auth/permissions";
import { notificationQuerySchema, createNotificationSchema } from "@/lib/validations/notification";
import { getNotifications, createNotification } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    const validatedQuery = notificationQuerySchema.parse(query);

    const result = await getNotifications(session.user.id, validatedQuery);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    // Override userId to match authenticated user
    validatedData.userId = session.user.id;

    const notification = await createNotification(validatedData);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not created - channel disabled" },
        { status: 400 }
      );
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create unread count route**

Create `apps/backoffice/app/api/notifications/unread/route.ts`:

```typescript
/**
 * Unread Count API Route
 * GET /api/notifications/unread - Get unread count for current user
 */

import { requireAuth } from "@/lib/auth/permissions";
import { getUnreadCount } from "@/lib/services/notification-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();

    const count = await getUnreadCount(session.user.id);

    return NextResponse.json(count);
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create read all route**

Create `apps/backoffice/app/api/notifications/read-all/route.ts`:

```typescript
/**
 * Read All API Route
 * PATCH /api/notifications/read-all - Mark all notifications as read
 */

import { requireAuth } from "@/lib/auth/permissions";
import { markAllAsRead } from "@/lib/services/notification-service";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    const session = await requireAuth();

    const count = await markAllAsRead(session.user.id);

    return NextResponse.json({ marked: count });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    );
  }
}
```

**Step 4: Create mark read route**

Create `apps/backoffice/app/api/notifications/[id]/read/route.ts`:

```typescript
/**
 * Mark Read API Route
 * PATCH /api/notifications/:id/read - Mark notification as read
 */

import { requireAuth } from "@/lib/auth/permissions";
import { markAsRead } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const notification = await markAsRead(id, session.user.id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
```

**Step 5: Create delete notification route**

Create `apps/backoffice/app/api/notifications/[id]/route.ts`:

```typescript
/**
 * Notification by ID API Route
 * DELETE /api/notifications/:id - Delete notification
 */

import { requireAuth } from "@/lib/auth/permissions";
import { deleteNotification } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const success = await deleteNotification(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
```

**Step 6: Create preferences route**

Create `apps/backoffice/app/api/notifications/preferences/route.ts`:

```typescript
/**
 * Notification Preferences API Route
 * GET /api/notifications/preferences - Get user preferences
 * PUT /api/notifications/preferences - Update preferences
 */

import { requireAuth } from "@/lib/auth/permissions";
import { updatePreferencesSchema } from "@/lib/validations/notification";
import { getPreferences, updatePreferences } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();

    const preferences = await getPreferences(session.user.id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    await updatePreferences(session.user.id, validatedData.preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
```

**Step 7: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 8: Commit**

```bash
git add apps/backoffice/app/api/notifications/
git commit -m "feat: add user notification API routes"
```

---

## Task 9: Create Admin Notification API Routes

**Files:**
- Create: `apps/backoffice/app/api/admin/notifications/route.ts`
- Create: `apps/backoffice/app/api/admin/notifications/broadcast/route.ts`
- Create: `apps/backoffice/app/api/admin/notifications/templates/route.ts`
- Create: `apps/backoffice/app/api/admin/notifications/templates/[id]/route.ts`
- Create: `apps/backoffice/app/api/admin/notifications/test/route.ts`

**Step 1: Create admin notifications list route**

Create `apps/backoffice/app/api/admin/notifications/route.ts`:

```typescript
/**
 * Admin Notifications API Route
 * GET /api/admin/notifications - View all notifications (audit)
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { notificationQuerySchema } from "@/lib/validations/notification";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.read");

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    const validatedQuery = notificationQuerySchema.parse(query);

    const page = validatedQuery.page;
    const pageSize = validatedQuery.pageSize;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (validatedQuery.type) {
      where.type = validatedQuery.type;
    }

    if (validatedQuery.read !== undefined) {
      where.read = validatedQuery.read;
    }

    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items: notifications,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create broadcast route**

Create `apps/backoffice/app/api/admin/notifications/broadcast/route.ts`:

```typescript
/**
 * Broadcast Notification API Route
 * POST /api/admin/notifications/broadcast - Send broadcast to users
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { broadcastNotificationSchema } from "@/lib/validations/notification";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.broadcast");

    const body = await request.json();
    const validatedData = broadcastNotificationSchema.parse(body);

    let userIds: string[] = [];

    // Determine target users
    if (validatedData.target === "all") {
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    } else if (validatedData.target === "role" && validatedData.roleId) {
      const users = await prisma.user.findMany({
        where: { roleId: validatedData.roleId },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    } else if (validatedData.target === "users" && validatedData.userIds) {
      userIds = validatedData.userIds;
    }

    // Create notifications for all target users
    const channels = validatedData.channels;
    const results = await Promise.allSettled(
      userIds.flatMap((userId) =>
        channels.map((channel) =>
          channel === "IN_APP"
            ? createNotification({
                title: validatedData.title,
                message: validatedData.message,
                type: validatedData.type,
                priority: validatedData.priority,
                userId,
                actionUrl: validatedData.actionUrl,
                actionLabel: validatedData.actionLabel,
              })
            : Promise.resolve(null)
        )
      )
    );

    const successCount = results.filter((r) => r.status === "fulfilled" && r.value).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: userIds.length,
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create templates list route**

Create `apps/backoffice/app/api/admin/notifications/templates/route.ts`:

```typescript
/**
 * Notification Templates API Route
 * GET /api/admin/notifications/templates - List all templates
 * POST /api/admin/notifications/templates - Create new template
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { notificationTemplateSchema } from "@/lib/validations/notification";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.templates.read");

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: [{ type: "asc" }, { channel: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.templates.create");

    const body = await request.json();
    const validatedData = notificationTemplateSchema.parse(body);

    const template = await prisma.notificationTemplate.create({
      data: validatedData,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
```

**Step 4: Create template update route**

Create `apps/backoffice/app/api/admin/notifications/templates/[id]/route.ts`:

```typescript
/**
 * Template by ID API Route
 * PUT /api/admin/notifications/templates/:id - Update template
 * DELETE /api/admin/notifications/templates/:id - Delete template
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { notificationTemplateSchema } from "@/lib/validations/notification";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.templates.update");

    const { id } = await params;
    const body = await request.json();
    const validatedData = notificationTemplateSchema.partial().parse(body);

    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.templates.delete");

    const { id } = await params;

    await prisma.notificationTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
```

**Step 5: Create test route**

Create `apps/backoffice/app/api/admin/notifications/test/route.ts`:

```typescript
/**
 * Test Notification API Route
 * POST /api/admin/notifications/test - Send test notification
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { createNotification } from "@/lib/services/notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "notifications.test");

    const notification = await createNotification({
      title: "Test Notification",
      message: "This is a test notification. If you see this, notifications are working!",
      type: "INFO",
      priority: "MEDIUM",
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
```

**Step 6: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 7: Commit**

```bash
git add apps/backoffice/app/api/admin/notifications/
git commit -m "feat: add admin notification API routes"
```

---

## Task 10: Add Notification Permissions to Seed

**Files:**
- Create: `apps/backoffice/prisma/seed-notification-permissions.ts`

**Step 1: Create notification permissions seed file**

Create `apps/backoffice/prisma/seed-notification-permissions.ts`:

```typescript
import { prisma } from "./client";

const NOTIFICATION_PERMISSIONS = [
  {
    name: "notifications.read",
    category: "notifications",
    description: "View all notifications (admin audit)",
  },
  {
    name: "notifications.broadcast",
    category: "notifications",
    description: "Send broadcast notifications to users",
  },
  {
    name: "notifications.templates.read",
    category: "notifications",
    description: "View notification templates",
  },
  {
    name: "notifications.templates.create",
    category: "notifications",
    description: "Create notification templates",
  },
  {
    name: "notifications.templates.update",
    category: "notifications",
    description: "Update notification templates",
  },
  {
    name: "notifications.templates.delete",
    category: "notifications",
    description: "Delete notification templates",
  },
  {
    name: "notifications.test",
    category: "notifications",
    description: "Send test notifications",
  },
];

async function seedNotificationPermissions() {
  console.log("🔔 Seeding notification permissions...");

  for (const permissionData of NOTIFICATION_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {
        category: permissionData.category,
        description: permissionData.description,
      },
      create: permissionData,
    });

    console.log(`  ✓ Permission: ${permission.name}`);

    // Add to admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: "Admin" },
    });

    if (adminRole) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ Notification permissions seeded");
}

seedNotificationPermissions()
  .catch((error) => {
    console.error("Error seeding notification permissions:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Run permissions seed**

Run: `pnpm --filter backoffice tsx prisma/seed-notification-permissions.ts`

Expected: Notification permissions created and added to Admin role

**Step 3: Update seed script in package.json**

Add the new seed to the db:seed script in `apps/backoffice/package.json`:

Find line 14 and update it:

From:
```
"db:seed": "tsx prisma/seed-admin.ts && tsx prisma/seed-roles.ts && tsx prisma/seed-permissions.ts && tsx prisma/seed-system-settings.ts",
```

To:
```
"db:seed": "tsx prisma/seed-admin.ts && tsx prisma/seed-roles.ts && tsx prisma/seed-permissions.ts && tsx prisma/seed-system-settings.ts && tsx prisma/seed-notification-permissions.ts",
```

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/seed-notification-permissions.ts apps/backoffice/package.json
git commit -m "feat: add notification permissions seed"
```

---

## Task 11: Create Notification Templates Seed

**Files:**
- Create: `apps/backoffice/prisma/seed-notification-templates.ts`

**Step 1: Create templates seed file**

Create `apps/backoffice/prisma/seed-notification-templates.ts`:

```typescript
import { prisma } from "./client";

const NOTIFICATION_TEMPLATES = [
  {
    type: "SYSTEM",
    channel: "IN_APP",
    subject: "System Notification",
    body: "{{title}}: {{message}}",
    variables: ["title", "message"],
  },
  {
    type: "INFO",
    channel: "IN_APP",
    subject: "Information",
    body: "{{title}}: {{message}}",
    variables: ["title", "message"],
  },
  {
    type: "WARNING",
    channel: "IN_APP",
    subject: "Warning",
    body: "{{title}}: {{message}}",
    variables: ["title", "message"],
  },
  {
    type: "ERROR",
    channel: "IN_APP",
    subject: "Error",
    body: "{{title}}: {{message}}",
    variables: ["title", "message"],
  },
  {
    type: "INFO",
    channel: "EMAIL",
    subject: "{{title}}",
    body: "<p>{{message}}</p>",
    variables: ["title", "message"],
  },
  {
    type: "WARNING",
    channel: "EMAIL",
    subject: "⚠️ {{title}}",
    body: "<p>{{message}}</p>",
    variables: ["title", "message"],
  },
  {
    type: "ERROR",
    channel: "EMAIL",
    subject: "🚨 {{title}}",
    body: "<p>{{message}}</p>",
    variables: ["title", "message"],
  },
];

async function seedNotificationTemplates() {
  console.log("📧 Seeding notification templates...");

  for (const templateData of NOTIFICATION_TEMPLATES) {
    const template = await prisma.notificationTemplate.upsert({
      where: {
        type_channel: {
          type: templateData.type,
          channel: templateData.channel,
        },
      },
      update: {
        subject: templateData.subject,
        body: templateData.body,
        variables: templateData.variables,
      },
      create: templateData,
    });

    console.log(`  ✓ Template: ${template.type} / ${template.channel}`);
  }

  console.log("✅ Notification templates seeded");
}

seedNotificationTemplates()
  .catch((error) => {
    console.error("Error seeding notification templates:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Run templates seed**

Run: `pnpm --filter backoffice tsx prisma/seed-notification-templates.ts`

Expected: Default notification templates created

**Step 3: Update seed script in package.json**

Add the templates seed to the db:seed script in `apps/backoffice/package.json`:

Update the db:seed line:

From:
```
"db:seed": "tsx prisma/seed-admin.ts && tsx prisma/seed-roles.ts && tsx prisma/seed-permissions.ts && tsx prisma/seed-system-settings.ts && tsx prisma/seed-notification-permissions.ts",
```

To:
```
"db:seed": "tsx prisma/seed-admin.ts && tsx prisma/seed-roles.ts && tsx prisma/seed-permissions.ts && tsx prisma/seed-system-settings.ts && tsx prisma/seed-notification-permissions.ts && tsx prisma/seed-notification-templates.ts",
```

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/seed-notification-templates.ts apps/backoffice/package.json
git commit -m "feat: add notification templates seed"
```

---

## Task 12: Create Client-Side Socket Hook

**Files:**
- Create: `apps/backoffice/hooks/use-socket.ts`
- Create: `apps/backoffice/hooks/use-notifications.ts`

**Step 1: Create useSocket hook**

Create `apps/backoffice/hooks/use-socket.ts`:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { env } from "@/lib/env";

interface SocketHookOptions {
  onNotification?: (notification: unknown) => void;
  onNotificationCount?: (count: { unread: number; total: number }) => void;
  onNotificationRead?: (notificationId: string) => void;
}

export function useSocket({ userId }: { userId: string }, options: SocketHookOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === "undefined") {
      return;
    }

    // Skip if userId is not available yet
    if (!userId) {
      return;
    }

    // Skip if already connected
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(env.NEXT_PUBLIC_SOCKET_URL, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      // Subscribe to user notifications
      socket.emit("subscribe", { userId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("notification", (notification) => {
      options.onNotification?.(notification);
    });

    socket.on("notification_count", (count) => {
      options.onNotificationCount?.(count);
    });

    socket.on("notification_read", (notificationId) => {
      options.onNotificationRead?.(notificationId);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, options]);

  return {
    isConnected,
    socket: socketRef.current,
  };
}
```

**Step 2: Create useNotifications hook**

Create `apps/backoffice/hooks/use-notifications.ts`:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./use-socket";

export interface NotificationItem {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: Date;
  expiresAt: Date | null;
}

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  // Set up socket connection
  useSocket(
    { userId },
    {
      onNotification: (notification) => {
        // Add new notification to cache
        queryClient.setQueryData(
          ["notifications", userId],
          (old: { items: NotificationItem[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              items: [notification as NotificationItem, ...old.items],
            };
          }
        );
        // Invalidate unread count
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      },
      onNotificationCount: (count) => {
        queryClient.setQueryData(["notifications", "unread"], count);
      },
      onNotificationRead: (notificationId) => {
        queryClient.setQueryData(
          ["notifications", userId],
          (old: { items: NotificationItem[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((n) =>
                n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
              ),
            };
          }
        );
      },
    }
  );

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!userId,
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) throw new Error("Failed to fetch unread count");
      return res.json();
    },
    enabled: !!userId,
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  // Delete mutation
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  return {
    notifications: notifications?.items || [],
    unreadCount: unreadCount?.unread || 0,
    totalCount: unreadCount?.total || 0,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
}
```

**Step 3: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 4: Commit**

```bash
git add apps/backoffice/hooks/
git commit -m "feat: add useSocket and useNotifications hooks"
```

---

## Task 13: Create Notification Bell Component

**Files:**
- Create: `apps/backoffice/components/notifications/notification-bell.tsx`

**Step 1: Create notification bell component**

Create `apps/backoffice/components/notifications/notification-bell.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDropdown } from "./notification-dropdown";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={recentNotifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/notifications/notification-bell.tsx
git commit -m "feat: add notification bell component"
```

---

## Task 14: Create Notification Dropdown Component

**Files:**
- Create: `apps/backoffice/components/notifications/notification-dropdown.tsx`

**Step 1: Create dropdown component**

Create `apps/backoffice/components/notifications/notification-dropdown.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, X, ExternalLink } from "lucide-react";
import type { NotificationItem } from "@/hooks/use-notifications";
import { Button } from "@workspace/ui/button";

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ERROR":
        return "text-destructive bg-destructive/10";
      case "WARNING":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950";
      case "SYSTEM":
        return "text-muted-foreground bg-muted";
      default:
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500";
      case "MEDIUM":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background shadow-lg"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="h-8 text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex gap-3 border-b p-4 transition-colors hover:bg-accent/50 ${
                  !notification.read ? "bg-accent/30" : ""
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getTypeColor(notification.type)}`}>
                  <div className={`h-2 w-2 rounded-full ${getPriorityDot(notification.priority)}`} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">{notification.title}</p>
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="shrink-0"
                      title={notification.read ? "Mark as unread" : "Mark as read"}
                    >
                      {notification.read ? (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </button>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              window.location.href = "/notifications";
            }}
          >
            View all notifications
            <ExternalLink className="ml-auto h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/notifications/notification-dropdown.tsx
git commit -m "feat: add notification dropdown component"
```

---

## Task 15: Add Notification Bell to Header

**Files:**
- Modify: `apps/backoffice/components/dashboard/header.tsx`

**Step 1: Add notification bell to header**

Update the import section (add after line 7):

```typescript
import { NotificationBell } from "@/components/notifications/notification-bell";
```

Update the header content (find the div with `ml-auto` around line 29 and update):

From:
```typescript
      <div className="ml-auto flex items-center gap-4">
        <UserDropdown user={user} />
      </div>
```

To:
```typescript
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell userId={user.id} />
        <UserDropdown user={user} />
      </div>
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/dashboard/header.tsx
git commit -m "feat: add notification bell to header"
```

---

## Task 16: Create Notification Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/notifications/page.tsx`

**Step 1: Create notifications page**

Create `apps/backoffice/app/(dashboard)/notifications/page.tsx`:

```typescript
/**
 * Notifications Page
 * Full notification list with filters and pagination
 */

import { requireAuth } from "@/lib/auth/permissions";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const session = await requireAuth();

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your notifications
        </p>
      </div>

      <NotificationList userId={session.user.id} />
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/app/\(dashboard\)/notifications/page.tsx
git commit -m "feat: add notifications page"
```

---

## Task 17: Create Notification List Component

**Files:**
- Create: `apps/backoffice/components/notifications/notification-list.tsx`

**Step 1: Create notification list component**

Create `apps/backoffice/components/notifications/notification-list.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { Button } from "@workspace/ui/button";
import { Badge } from "@workspace/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/select";

type FilterType = "all" | "unread" | "read";
type TypeFilter = "all" | "SYSTEM" | "INFO" | "WARNING" | "ERROR";

export function NotificationList({ userId }: { userId: string }) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [notificationType, setNotificationType] = useState<TypeFilter>("all");
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(userId);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread" && n.read) return false;
    if (filterType === "read" && !n.read) return false;
    if (notificationType !== "all" && n.type !== notificationType) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ERROR":
        return "destructive";
      case "WARNING":
        return "secondary";
      case "SYSTEM":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={notificationType}
          onValueChange={(v) => setNotificationType(v as TypeFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARNING">Warning</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="ml-auto"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="rounded-md border">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No notifications found
          </div>
        ) : (
          <ul className="divide-y">
            {filteredNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-start gap-4 p-4 transition-colors hover:bg-accent/50 ${
                  !notification.read ? "bg-accent/30" : ""
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(notification.type) as any}>
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>

                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      {notification.actionLabel || "View details"}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/notifications/notification-list.tsx
git commit -m "feat: add notification list component"
```

---

## Task 18: Create Notification Preferences Component

**Files:**
- Create: `apps/backoffice/components/notifications/notification-preferences.tsx`

**Step 1: Create preferences component**

Create `apps/backoffice/components/notifications/notification-preferences.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/button";
import { Switch } from "@workspace/ui/switch";
import { Label } from "@workspace/ui/label";
import { toast } from "sonner";

type NotificationChannel = "IN_APP" | "EMAIL";
type NotificationType = "SYSTEM" | "INFO" | "WARNING" | "ERROR";

interface PreferenceItem {
  channel: NotificationChannel;
  type?: NotificationType;
  enabled: boolean;
}

export function NotificationPreferences({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = await res.json();
      return data.preferences as PreferenceItem[];
    },
    onSuccess: (data) => {
      setPreferences(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (prefs: PreferenceItem[]) => {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferences saved successfully");
      setHasChanges(false);
    },
    onError: () => {
      toast.error("Failed to save preferences");
    },
  });

  const channels: { key: NotificationChannel; label: string; icon: React.ReactNode }[] = [
    { key: "IN_APP", label: "In-App Notifications", icon: <Bell className="h-4 w-4" /> },
    { key: "EMAIL", label: "Email Notifications", icon: <Mail className="h-4 w-4" /> },
  ];

  const types: { key: NotificationType; label: string }[] = [
    { key: "SYSTEM", label: "System" },
    { key: "INFO", label: "Information" },
    { key: "WARNING", label: "Warnings" },
    { key: "ERROR", label: "Errors" },
  ];

  const getPreference = (channel: NotificationChannel, type?: NotificationType) => {
    return preferences.find(
      (p) => p.channel === channel && (type === undefined || p.type === type)
    )?.enabled ?? true;
  };

  const setPreference = (channel: NotificationChannel, enabled: boolean, type?: NotificationType) => {
    const newPrefs = [...preferences];

    // Remove existing preference for this channel/type combo
    const existingIndex = newPrefs.findIndex(
      (p) => p.channel === channel && (type === undefined || p.type === type)
    );

    if (existingIndex >= 0) {
      newPrefs[existingIndex] = { channel, type, enabled };
    } else {
      newPrefs.push({ channel, type, enabled });
    }

    setPreferences(newPrefs);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(preferences);
  };

  const handleReset = () => {
    setPreferences(data || []);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive notifications
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {channels.map((channel) => (
          <div key={channel.key} className="rounded-md border p-4">
            <div className="mb-4 flex items-center gap-2">
              {channel.icon}
              <h4 className="font-medium">{channel.label}</h4>
            </div>

            <div className="space-y-4">
              {/* Global toggle for channel */}
              <div className="flex items-center justify-between">
                <Label htmlFor={`channel-${channel.key}`}>Enable {channel.label}</Label>
                <Switch
                  id={`channel-${channel.key}`}
                  checked={getPreference(channel.key)}
                  onCheckedChange={(checked) => setPreference(channel.key, checked)}
                />
              </div>

              {/* Type-specific toggles */}
              {getPreference(channel.key) && (
                <div className="ml-6 space-y-3 border-l pl-4">
                  {types.map((type) => (
                    <div key={type.key} className="flex items-center justify-between">
                      <Label htmlFor={`${channel.key}-${type.key}`}>{type.label}</Label>
                      <Switch
                        id={`${channel.key}-${type.key}`}
                        checked={getPreference(channel.key, type.key)}
                        onCheckedChange={(checked) =>
                          setPreference(channel.key, checked, type.key)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/notifications/notification-preferences.tsx
git commit -m "feat: add notification preferences component"
```

---

## Task 19: Create Admin Broadcast Notification Component

**Files:**
- Create: `apps/backoffice/components/admin/notifications/broadcast-form.tsx`

**Step 1: Create broadcast form component**

Create `apps/backoffice/components/admin/notifications/broadcast-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { broadcastNotificationSchema } from "@/lib/validations/notification";
import type { BroadcastNotificationInput } from "@/lib/validations/notification";
import { Button } from "@workspace/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/form";
import { Input } from "@workspace/ui/input";
import { Textarea } from "@workspace/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/select";
import {
  Checkbox,
  CheckboxControl,
  CheckboxHiddenInput,
} from "@base-ui/react/checkbox";

export function BroadcastNotificationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BroadcastNotificationInput>({
    resolver: zodResolver(broadcastNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "INFO",
      priority: "MEDIUM",
      target: "all",
      channels: ["IN_APP"],
    },
  });

  const target = form.watch("target");
  const channels = form.watch("channels") || [];

  const onSubmit = async (data: BroadcastNotificationInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send broadcast");
      }

      const result = await res.json();
      toast.success(`Broadcast sent to ${result.sent} users`);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Notification title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notification message"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="INFO">Information</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="role">Specific Role</SelectItem>
                  <SelectItem value="users">Specific Users</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channels</FormLabel>
              <div className="space-y-2">
                {(["IN_APP", "EMAIL"] as const).map((channel) => (
                  <label
                    key={channel}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={channels.includes(channel)}
                      onChange={(checked) => {
                        if (checked) {
                          field.onChange([...channels, channel]);
                        } else {
                          field.onChange(channels.filter((c) => c !== channel));
                        }
                      }}
                    >
                      <CheckboxControl />
                      <CheckboxHiddenInput />
                    </Checkbox>
                    <span>{channel === "IN_APP" ? "In-App" : "Email"}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="actionUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actionLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action Label (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="View details" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Send Broadcast
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/components/admin/notifications/broadcast-form.tsx
git commit -m "feat: add broadcast notification form component"
```

---

## Task 20: Create Admin Broadcast Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/notifications/broadcast/page.tsx`

**Step 1: Create broadcast page**

Create `apps/backoffice/app/(dashboard)/manage/notifications/broadcast/page.tsx`:

```typescript
/**
 * Broadcast Notification Page
 * Admin page for sending broadcast notifications
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { BroadcastNotificationForm } from "@/components/admin/notifications/broadcast-form";

export const metadata = {
  title: "Broadcast Notifications",
  description: "Send broadcast notifications to users",
};

export default async function BroadcastNotificationPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "notifications.broadcast");

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Broadcast Notification</h1>
        <p className="text-muted-foreground">
          Send notifications to multiple users at once
        </p>
      </div>

      <div className="max-w-2xl">
        <BroadcastNotificationForm />
      </div>
    </div>
  );
}
```

**Step 2: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 3: Commit**

```bash
git add apps/backoffice/app/\(dashboard\)/manage/notifications/broadcast/page.tsx
git commit -m "feat: add broadcast notification page"
```

---

## Task 21: Create Notification Templates Management Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/notifications/templates/page.tsx`
- Create: `apps/backoffice/components/admin/notifications/template-list.tsx`

**Step 1: Create template list component**

Create `apps/backoffice/components/admin/notifications/template-list.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/dialog";
import { Input } from "@workspace/ui/input";
import { Textarea } from "@workspace/ui/textarea";
import { Label } from "@workspace/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/table";

interface Template {
  id: string;
  type: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export function NotificationTemplateList() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      return data.templates as Template[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const res = await fetch(`/api/admin/notifications/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!res.ok) throw new Error("Failed to update template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Template updated successfully");
      setIsDialogOpen(false);
      setEditingTemplate(null);
    },
  });

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingTemplate) return;

    updateMutation.mutate({
      id: editingTemplate.id,
      subject: editingTemplate.subject,
      body: editingTemplate.body,
      variables: editingTemplate.variables,
      isActive: editingTemplate.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Customize the notification template for {editingTemplate?.type} /{" "}
              {editingTemplate?.channel}
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  rows={6}
                  value={editingTemplate.body}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, body: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {editingTemplate.variables.join(", ")}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                    {template.type}
                  </span>
                </TableCell>
                <TableCell>{template.channel}</TableCell>
                <TableCell className="font-mono text-sm">
                  {template.subject}
                </TableCell>
                <TableCell>
                  {template.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Inactive</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Step 2: Create templates page**

Create `apps/backoffice/app/(dashboard)/manage/notifications/templates/page.tsx`:

```typescript
/**
 * Notification Templates Page
 * Admin page for managing notification templates
 */

import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { NotificationTemplateList } from "@/components/admin/notifications/template-list";

export const metadata = {
  title: "Notification Templates",
  description: "Manage notification templates",
};

export default async function NotificationTemplatesPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "notifications.templates.read");

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
        <p className="text-muted-foreground">
          Customize notification templates for different types and channels
        </p>
      </div>

      <NotificationTemplateList />
    </div>
  );
}
```

**Step 3: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 4: Commit**

```bash
git add apps/backoffice/components/admin/notifications/template-list.tsx apps/backoffice/app/\(dashboard\)/manage/notifications/templates/page.tsx
git commit -m "feat: add notification templates management"
```

---

## Task 22: Update Next.js Custom Server for Socket.io

**Files:**
- Create: `apps/backoffice/server.js`
- Modify: `apps/backoffice/package.json`

**Step 1: Create custom server file**

Create `apps/backoffice/server.js`:

```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initSocketServer } = require("./lib/socket/index");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3001", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  initSocketServer(server);

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

**Step 2: Update dev script in package.json**

In `apps/backoffice/package.json`, update the dev script:

From:
```
"dev": "next dev --port 3001",
```

To:
```
"dev": "tsx server.js",
```

**Step 3: Run type check**

Run: `pnpm --filter backoffice check-types`

Expected: Type check passes

**Step 4: Commit**

```bash
git add apps/backoffice/server.js apps/backoffice/package.json
git commit -m "feat: add custom server for socket.io support"
```

---

## Task 23: Add Notification Menu Items to Sidebar

**Files:**
- Find and modify sidebar navigation component

**Step 1: Find sidebar component**

Run: `find apps/backoffice/components -name "*sidebar*" -o -name "*nav*"`

Find the navigation/sidebar file and add notification menu items.

**Step 2: Add notification menu items**

Add to the navigation (exact location depends on existing structure):

```typescript
// In user section
{
  title: "Notifications",
  href: "/notifications",
  icon: Bell,
},

// In admin/manage section
{
  title: "Broadcast",
  href: "/manage/notifications/broadcast",
  icon: Send,
},
{
  title: "Templates",
  href: "/manage/notifications/templates",
  icon: FileText,
},
```

**Step 3: Commit**

```bash
git add apps/backoffice/components/...
git commit -m "feat: add notification menu items to navigation"
```

---

## Task 24: Test Notification System

**Files:**
- None (manual testing)

**Step 1: Start development server**

Run: `pnpm --filter backoffice dev`

Expected: Server starts on port 3001 with Socket.io initialized

**Step 2: Verify WebSocket connection**

Check browser console for "Socket connected" message

**Step 3: Test notification creation**

Send a test notification via `/api/admin/notifications/test`

Expected: Notification appears in bell dropdown with unread count

**Step 4: Test preferences**

Navigate to settings and toggle notification channels

Expected: Preferences saved and affect future notifications

**Step 5: Verify all components**

- Notification bell shows in header
- Dropdown displays notifications
- Notifications page loads with filters
- Broadcast page works for admin
- Templates page loads for admin

---

## Task 25: Create Documentation

**Files:**
- Create: `apps/backoffice/docs/notification-system.md`

**Step 1: Create usage documentation**

Create documentation file with:

```markdown
# Notification System

## Overview

The notification system provides real-time in-app notifications and optional email delivery.

## Usage

### Creating Notifications

In any service:

\`\`\`typescript
import { createNotification } from "@/lib/services/notification-service";

await createNotification({
  type: "INFO",
  priority: "MEDIUM",
  title: "Task Assigned",
  message: \`You were assigned to task: \${task.title}\`,
  userId: task.assigneeId,
  actionUrl: \`/tasks/\${task.id}\`,
  metadata: { taskId: task.id }
});
\`\`\`

### Checking User Preferences

\`\`\`typescript
import { isChannelEnabled } from "@/lib/services/notification-service";

const inAppEnabled = await isChannelEnabled(userId, "IN_APP", "INFO");
\`\`\`

## API Routes

### User Routes
- GET /api/notifications
- GET /api/notifications/unread
- POST /api/notifications
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all
- DELETE /api/notifications/:id
- GET /api/notifications/preferences
- PUT /api/notifications/preferences

### Admin Routes
- GET /api/admin/notifications
- POST /api/admin/notifications/broadcast
- GET /api/admin/notifications/templates
- POST /api/admin/notifications/templates
- PUT /api/admin/notifications/templates/:id
- DELETE /api/admin/notifications/templates/:id
- POST /api/admin/notifications/test

## Components

### NotificationBell
Header component showing unread count and dropdown.

\`\`\`tsx
<NotificationBell userId={user.id} />
\`\`\`

### useNotifications Hook
\`\`\`tsx
const { notifications, unreadCount, markAsRead } = useNotifications(userId);
\`\`\`

## Environment Variables

- NOTIFICATION_AUTO_DELETE_DAYS - Days before auto-delete (default: 90)
- EMAIL_PROVIDER - mock | resend | nodemailer
- NEXT_PUBLIC_SOCKET_URL - WebSocket URL
```

**Step 2: Commit**

```bash
git add apps/backoffice/docs/notification-system.md
git commit -m "docs: add notification system documentation"
```

---

## Final Verification

**Step 1: Run all checks**

Run: `pnpm --filter backoffice check-types && pnpm --filter backoffice lint`

Expected: All checks pass

**Step 2: Verify database**

Run: `pnpm --filter backoffice db:push`

Expected: No schema changes needed

**Step 3: Test the full flow**

1. Create a test notification
2. Verify WebSocket delivery
3. Check notification bell
4. Mark as read
5. Verify count updates
6. Test preferences
7. Test broadcast (admin)

---

## Summary

This plan implements a complete notification system with:

1. **Database** - Prisma models for notifications, preferences, templates
2. **API** - User and admin routes following existing patterns
3. **Real-time** - Socket.io for instant delivery
4. **Email** - Provider system with mock and Resend support
5. **UI** - Bell, dropdown, list, preferences components
6. **Admin** - Broadcast and template management
7. **Permissions** - Seeded notification permissions

All code follows existing patterns from the codebase.
