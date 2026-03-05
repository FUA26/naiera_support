# Notification System Design

**Date:** 2026-03-05
**Status:** Design Approved
**Author:** AI Assistant

## Overview

A general-purpose, reusable notification system for the enterprise boilerplate. Features real-time in-app notifications via WebSocket, email delivery, user preferences, and admin-manageable templates.

## Goals

- **Reusable** - Not tied to any specific domain (tasks, comments, etc.)
- **Real-time** - WebSocket-based instant delivery
- **Flexible** - Multiple channels (In-App, Email), multiple providers
- **User-controlled** - Granular notification preferences
- **Admin-manageable** - Templates and broadcasting via admin panel

## Database Schema

```prisma
model Notification {
  id          String             @id @default(cuid())
  type        NotificationType   @default(INFO)
  priority    NotificationPriority @default(MEDIUM)
  title       String
  message     String
  userId      String
  read        Boolean            @default(false)
  readAt      DateTime?
  actionUrl   String?
  actionLabel String?
  metadata    Json?
  expiresAt   DateTime?
  createdAt   DateTime           @default(now())

  user User @relation(fields: [userId], references: [id])

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

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

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

**User model additions:**
```prisma
model User {
  // ... existing fields

  notifications        Notification[]
  notificationPreferences NotificationPreference[]
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Notification Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Service    │    │   Notification│    │              │    │
│  │   Layer      │───>│   Service    │───>│ WebSocket    │    │
│  │ (createTask) │    │   (create)   │    │ (Socket.io)  │    │
│  └──────────────┘    └──────────────┘    └──────┬───────┘    │
│                             │                    │             │
│                             ▼                    ▼             │
│                      ┌──────────────┐    ┌──────────────┐      │
│                      │   Database   │    │   Email      │      │
│                      │   (store)    │    │   Service    │      │
│                      └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Routes

### User Routes
```
GET    /api/notifications              // List with pagination
GET    /api/notifications/unread       // Get unread count
POST   /api/notifications              // Manual create (rare)
PATCH  /api/notifications/:id/read     // Mark as read
PATCH  /api/notifications/read-all     // Mark all as read
DELETE /api/notifications/:id           // Delete notification

GET    /api/notifications/preferences  // Get user preferences
PUT    /api/notifications/preferences  // Update preferences
```

### Admin Routes
```
GET    /api/admin/notifications             // View all (audit)
POST   /api/admin/notifications/send      // Broadcast
GET    /api/admin/notifications/templates  // List templates
PUT    /api/admin/notifications/templates/:id  // Update template
POST   /api/admin/notifications/test       // Test send
```

## WebSocket Events

### Client → Server
```typescript
socket.on('subscribe', (userId) => {})
socket.on('mark_read', (notificationId) => {})
socket.on('mark_all_read', () => {})
socket.on('get_unread_count', () => {})
```

### Server → Client
```typescript
socket.emit('notification', notification)
socket.emit('notification_count', { unread, total })
socket.emit('notification_read', notificationId)
```

## Service Layer

### Core Functions
```typescript
// lib/services/notification-service.ts

createNotification(data)
createBulk(notifications)
getNotifications(userId, filters)
markAsRead(id)
markAllAsRead(userId)
deleteNotification(id)
getUnreadCount(userId)

// Preferences
getPreferences(userId)
updatePreferences(userId, preferences)
isChannelEnabled(userId, channel, type)

// Template
renderTemplate(type, channel, data)
getTemplate(type, channel)

// Internal
_sendInApp(notification)
_sendEmail(notification)
```

### Usage Example
```typescript
// In any service (task-service, user-service, etc.)
import { createNotification } from '@/lib/services/notification-service';

await createNotification({
  type: 'INFO',
  priority: 'MEDIUM',
  title: 'Task Assigned',
  message: `You were assigned to task: ${task.title}`,
  userId: task.assigneeId,
  actionUrl: `/tasks/${task.id}`,
  metadata: { taskId: task.id }
});
```

## UI Components

```
components/
├── notifications/
│   ├── notification-bell.tsx         // Header icon + badge
│   ├── notification-dropdown.tsx     // Dropdown list
│   ├── notification-toast.tsx        // Realtime toast
│   ├── notification-page.tsx         // Full page with filters
│   └── notification-preferences.tsx  // Settings panel
```

| Component | Description |
|-----------|-------------|
| **NotificationBell** | Icon in header, shows unread count badge, opens dropdown on click |
| **NotificationDropdown** | List of recent notifications, mark as read on click, "View all" link |
| **NotificationToast** | Auto-popup for realtime notifications, auto-dismiss |
| **NotificationPage** | Full list with filters (read/unread, type, date), pagination |
| **NotificationPreferences** | Channel toggle (in-app/email), type checkboxes |

## Email Service Interface

```typescript
// lib/email/interface.ts
interface EmailProvider {
  send(params: EmailParams): Promise<boolean>;
}

// Implementations
lib/email/resend-provider.ts
lib/email/nodemailer-provider.ts
lib/email/mock-provider.ts  // For dev/testing
```

### Configuration
```bash
EMAIL_PROVIDER=mock | resend | nodemailer
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@example.com
```

## WebSocket Server

```typescript
// lib/socket/server.ts
import { Server } from 'socket.io';

export const socketServer = {
  io: null as Server | null,

  init(httpServer) {
    this.io = new Server(httpServer, {
      path: '/api/socket.io',
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL }
    });

    // Auth middleware
    this.io.use(async (socket, next) => {
      // Validate session
      // Join user room: socket.join(`user:${userId}`)
      next();
    });
  },

  emitNotification(userId, notification) {
    this.io?.to(`user:${userId}`).emit('notification', notification);
  },

  emitUnreadCount(userId, count) {
    this.io?.to(`user:${userId}`).emit('notification_count', count);
  }
};
```

### Client Hooks
```typescript
// hooks/use-socket.ts
useSocket()          // Connect & listen
useNotifications()    // Listen to notification events
useUnreadCount()      // Sync count via socket
```

## Admin Panel Features

### Broadcast Notification
- Title & message input
- Target selection: All users | Specific role | Specific users
- Type selection: SYSTEM | INFO | WARNING | ERROR
- Channel selection: In-App | Email | Both

### Template Management
- List all templates (type + channel combo)
- Edit subject line and body
- Variable support: `{{userName}}`, `{{action}}`, etc.
- Preview button
- Active/Inactive toggle

### Audit View
- View all notifications across all users
- Filter by user, type, priority, date range, read status
- See delivery status

## User Preferences

### Hierarchy
1. **Global Toggle** - Enable/disable all notifications
2. **Channel Level** - Enable/disable In-App or Email
3. **Type Level** - Enable/disable per notification type

### Storage
```prisma
NotificationPreference:
- userId + channel (IN_APP or EMAIL) + type (optional)
- enabled: boolean
```

## Auto-Delete

```bash
NOTIFICATION_AUTO_DELETE_DAYS=90
```

Background job to delete expired notifications (via cron or Vercel Cron).

## Environment Variables

```bash
# Notification Settings
NOTIFICATION_AUTO_DELETE_DAYS=90

# Email
EMAIL_PROVIDER=mock | resend | nodemailer
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@example.com

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Migration Steps

1. Add models to Prisma schema
2. Run `pnpm --filter backoffice db:push`
3. Seed default templates and preferences
4. Create notification service
5. Create API routes
6. Set up Socket.io server
7. Create UI components
8. Add NotificationBell to header
9. Test with mock email provider

## Testing

- Mock email provider for development
- WebSocket test environment
- E2E test: trigger notification → verify WebSocket → verify email → check preferences

## Future Enhancements

- Push notifications (browser/mobile)
- Notification scheduling/delayed send
- Digest notifications (hourly/daily)
- Notification categories/grouping
- Rich notifications with images/actions
