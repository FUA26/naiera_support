# Ticketing Platform Design

**Date:** 2026-03-05
**Status:** Approved
**Author:** Claude + User

## Overview

Support ticketing platform with multi-channel integration for single-tenant organization.

### Key Requirements

| Aspect | Requirement |
|--------|-------------|
| **Apps** | Products with multiple channels each |
| **Channels** | Web Form, Public Link, Widget, Integrated App, Chatbot (future WA/Telegram) |
| **Workflow** | Open → In Progress → Resolved → Closed |
| **Users** | Existing user system + ticket permissions |
| **Customers** | Login (integrated) / Guest (public channels) |
| **Notifications** | Email, In-app, Agent alerts, Channel-based replies |
| **API** | Create, Check status, Add message, Webhooks |

## Architecture

**Approach:** Hybrid API-First

- Ticket module in backoffice (shared infra, fast start)
- Public API layer for external integrations
- API boundaries designed for future microservice extraction

```
apps/backoffice/
├── app/(dashboard)/tickets/          # UI untuk agents
├── app/api/public/tickets/           # Public API
├── app/api/tickets/                  # Internal API
├── app/api/webhooks/                 # Webhook endpoints
└── lib/services/ticketing/           # Business logic
```

## Data Model

### Core Entities

```prisma
model App {
  id          String   @id
  name        String
  slug        String   @unique
  description String?
  isActive    Boolean  @default(true)
  channels    Channel[]
  tickets     Ticket[]
}

model Channel {
  id          String   @id
  appId       String
  app         App      @relation(fields: [appId], references: [id])
  type        ChannelType
  name        String
  config      Json
  isActive    Boolean  @default(true)
  tickets     Ticket[]
}

enum ChannelType {
  WEB_FORM
  PUBLIC_LINK
  WIDGET
  INTEGRATED_APP
  WHATSAPP
  TELEGRAM
}

model Ticket {
  id          String        @id
  appId       String
  app         App           @relation(fields: [appId], references: [id])
  channelId   String
  channel     Channel       @relation(fields: [channelId], references: [id])

  // Customer (guest OR user)
  userId      String?
  user        User?         @relation(fields: [userId], references: [id])
  guestEmail  String?
  guestName   String?
  guestPhone  String?

  subject     String
  status      TicketStatus  @default(OPEN)
  priority    Priority      @default(NORMAL)
  assignedTo  String?
  assignedAt  DateTime?

  messages    TicketMessage[]
  activities  TicketActivity[]
  webhookLogs WebhookLog[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  resolvedAt  DateTime?
  closedAt    DateTime?
}

enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED }
enum Priority { LOW, NORMAL, HIGH, URGENT }

model TicketMessage {
  id          String   @id
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  sender      SenderType
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  message     String   @db.Text
  attachments Json?
  isInternal  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

enum SenderType { CUSTOMER, AGENT, SYSTEM }

model TicketActivity {
  id          String       @id
  ticketId    String
  ticket      Ticket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  action      ActivityAction
  userId      String?
  user        User?        @relation(fields: [userId], references: [id])
  changes     Json?
  createdAt   DateTime     @default(now())
}

enum ActivityAction {
  CREATED, STATUS_CHANGED, ASSIGNED, PRIORITY_CHANGED,
  NOTE_ADDED, CUSTOMER_REPLIED, AGENT_REPLIED, CLOSED, REOPENED
}

model WebhookLog {
  id          String   @id
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  url         String
  event       WebhookEvent
  payload     Json
  statusCode  Int?
  response    String?  @db.Text
  attempts    Int      @default(0)
  success     Boolean
  sentAt      DateTime @default(now())
}

enum WebhookEvent {
  TICKET_CREATED, TICKET_UPDATED, MESSAGE_ADDED,
  STATUS_CHANGED, ASSIGNED
}
```

## API Design

### Public API (External Integrations)

**POST /api/public/tickets** - Create ticket
```typescript
interface CreateTicketRequest {
  appSlug: string;
  channelType: ChannelType;
  subject: string;
  message: string;
  attachments?: Array<{ url: string; name: string }>;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}
```

**GET /api/public/tickets/:id/status** - Check ticket status

**POST /api/public/tickets/:id/messages** - Add message (chatbot/WA)

### Internal API (Agent Dashboard)

**GET /api/tickets** - List tickets (filters: app, status, assigned, search)

**GET /api/tickets/:id** - Ticket detail

**PATCH /api/tickets/:id** - Update (status, assign, priority)

**POST /api/tickets/:id/messages** - Agent reply

**POST /api/tickets/:id/close** - Close ticket

### Authentication

| Endpoint | Auth Method |
|----------|-------------|
| `/api/public/tickets` | Optional JWT or API Key |
| `/api/public/tickets/:id/status` | Ticket secret key or JWT |
| `/api/public/tickets/:id/messages` | API Key |
| `/api/tickets/*` | JWT + TICKET_* permissions |

## Service Layer

```
lib/services/ticketing/
├── ticket-service.ts
├── ticket-message-service.ts
├── ticket-activity-service.ts
├── webhook-service.ts
├── notification-service.ts
└── types.ts
```

### Key Functions

- `createTicket()` - Create with number generation (APP-XXXXX)
- `assignTicket()` - Assign + notify
- `updateTicketStatus()` - Update + set timestamps
- `addMessage()` - Add + auto-reopen if closed
- `triggerWebhook()` - Queue + retry (3x, exponential backoff)
- `notifyAgent*()` / `notifyCustomer*()` - Email/in-app/channel

## UI/UX

### Agent Dashboard Routes

```
/tickets              - List with filters
/tickets/new          - Create ticket
/tickets/[id]         - Detail with messages + activity
```

### Public Components

```typescript
<TicketForm />        // Public form component
<TicketWidget />       // Embeddable widget
<TicketList />         // For integrated apps
```

## Permissions

New permissions to add:

| Permission | Description |
|------------|-------------|
| TICKET_VIEW_OWN | View own tickets |
| TICKET_VIEW_ALL | View all tickets |
| TICKET_CREATE | Create tickets |
| TICKET_UPDATE_OWN/ALL | Update tickets |
| TICKET_DELETE | Delete tickets |
| TICKET_ASSIGN | Assign tickets |
| TICKET_CLOSE | Close tickets |
| TICKET_MESSAGE_* | Message operations |
| TICKET_APP_* | App/channel management |
| TICKET_REPORT_* | Reports/export |

## Error Handling

| Error Code | Scenario |
|------------|----------|
| TICKET_NOT_FOUND | Invalid ticket ID |
| TICKET_CLOSED | Action on closed ticket |
| INVALID_CHANNEL | Inactive/invalid channel |
| GUEST_INFO_REQUIRED | Missing guest info for public API |
| MESSAGE_TOO_LONG | Message exceeds limit |
| INVALID_FILE_TYPE | Unsupported attachment |

### Edge Cases

- Customer replies to closed ticket → Auto-reopen
- Unassigned >X hours → Escalation
- Guest email matches user → Link ticket
- Webhook fails → Retry 3x then disable

## Testing

- Unit tests for services (Vitest)
- E2E tests for UI (Playwright)
- API tests for endpoints
- Integration tests for full flows

## Future Considerations

- WhatsApp/Telegram integration
- SLA management
- Ticket merging
- Knowledge base integration
- Customer satisfaction ratings
- Analytics dashboard
