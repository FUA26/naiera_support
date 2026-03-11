# In-App Integration API Design

**Date:** 2025-03-11
**Status:** Approved (v3 - Aligned with Existing Services)
**Author:** Claude

## Overview

API untuk aplikasi eksternal mengakses sistem ticketing menggunakan **API Key** dari Channel. Ini memungkinkan aplikasi eksternal (mobile app, web app) untuk:

1. Membuat tiket support
2. Melihat daftar tiket support user
3. Melihat detail tiket
4. Melihat pesan-pesan dalam tiket
5. Mengirim pesan balasan ke tiket

## Architecture

API ini **menggunakan service layer yang sudah ada**:
- `addTicketMessage()` dari `ticket-message-service.ts` - handles activity logging, reopening, webhooks, notifications
- API endpoints hanya menambahkan API key validation dan ownership check

```
┌─────────────────┐
│  External App   │
│  (your app)     │
└────────┬────────┘
         │ X-API-Key
         ▼
┌─────────────────────────────────┐
│  API Route Layer                │
│  - Validate API Key             │
│  - Validate ownership           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Service Layer (existing)       │
│  - addTicketMessage()           │
│  - Activity logging             │
│  - Webhooks                     │
│  - Notifications                │
└─────────────────────────────────┘
```

## Authentication

### API Key Method

- **Header:** `X-API-Key: <channel_api_key>`
- API Key diambil dari `Channel.apiKey` untuk channel dengan `type: INTEGRATED_APP`
- Setiap request harus menyertakan API key yang valid
- API Key divalidasi untuk memastikan channel aktif

### Validation Flow

1. Extract `X-API-Key` header from request
2. Find Channel by `apiKey` where `type: INTEGRATED_APP` and `isActive: true`
3. If not found, return `401 UNAUTHORIZED`
4. Use `channel.id` and `channel.appId` for filtering tickets

### External User Identification

Tickets diidentifikasi oleh `externalUserId` - ID user dari sistem aplikasi eksternal.
Setiap request yang butuh user context harus menyertakan `externalUserId` sebagai:
- Query parameter (untuk GET)
- Request body (untuk POST)

### Ownership Validation

Untuk setiap request yang mengakses ticket tertentu, endpoint harus memvalidasi:
- Ticket belongs to the channel dari API key
- `externalUserId` matches ticket's `externalUserId`

Jika tidak valid, return `403 FORBIDDEN`.

## API Endpoints

### Existing Endpoints (Already Implemented)

#### 1. GET /api/integrated/tickets
List semua tickets untuk external user tertentu

**Authentication:** Required (`X-API-Key` header)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| externalUserId | string | Yes | User ID from external app |
| status | string | No | Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) |

**Response:**
```json
{
  "tickets": [
    {
      "id": "clx1234567890",
      "ticketNumber": "APP-12345",
      "subject": "Login tidak bisa",
      "status": "OPEN",
      "priority": "NORMAL",
      "createdAt": "2025-03-11T10:00:00Z",
      "updatedAt": "2025-03-11T10:30:00Z",
      "messageCount": 3,
      "lastMessage": "Apa pesan errornya?"
    }
  ]
}
```

**Note:** `messageCount` excludes internal messages. `lastMessage` excludes internal messages.

#### 2. POST /api/integrated/tickets
Create new ticket dari external app

**Authentication:** Required (`X-API-Key` header)

**Request Body:**
```json
{
  "externalUserId": "user_123",
  "externalUserName": "John Doe",
  "externalUserEmail": "john@example.com",
  "subject": "Help needed",
  "message": "I need help with...",
  "priority": "NORMAL"
}
```

**Response:**
```json
{
  "id": "clx1234567890",
  "ticketNumber": "APP-12345",
  "status": "OPEN",
  "subject": "Help needed",
  "createdAt": "2025-03-11T10:00:00Z"
}
```

---

### New Endpoints (To Be Implemented)

#### 3. GET /api/integrated/tickets/:id
Get detail single ticket

**Authentication:** Required (`X-API-Key` header)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| externalUserId | string | Yes | User ID from external app (for ownership validation) |

**Response:**
```json
{
  "id": "clx1234567890",
  "ticketNumber": "APP-12345",
  "subject": "Login tidak bisa",
  "description": "Saya tidak bisa login ke akun saya",
  "status": "OPEN",
  "priority": "NORMAL",
  "createdAt": "2025-03-11T10:00:00Z",
  "updatedAt": "2025-03-11T10:30:00Z",
  "resolvedAt": null,
  "closedAt": null,
  "lastMessage": {
    "id": "clx0987654321",
    "message": "Mohon tunggu, kami sedang memeriksanya",
    "sender": "AGENT",
    "createdAt": "2025-03-11T10:30:00Z"
  }
}
```

**Note:** `lastMessage` excludes internal messages (`isInternal: true`).

**Error Responses:**
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user or channel
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Return `403 FORBIDDEN` if ownership validation fails
- Fetch last message from `TicketMessage` where `isInternal: false` ordered by `createdAt` DESC
- Include agent name/email if last message is from agent

---

#### 4. GET /api/integrated/tickets/:id/messages
Get semua messages untuk ticket tertentu

**Authentication:** Required (`X-API-Key` header)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| externalUserId | string | Yes | - | User ID from external app (for ownership validation) |
| page | number | No | 1 | Page number for pagination |
| pageSize | number | No | 50 | Items per page |

**Response:**
```json
{
  "items": [
    {
      "id": "clx1111111111",
      "message": "Saya tidak bisa login",
      "sender": "CUSTOMER",
      "isInternal": false,
      "attachments": [
        {
          "url": "https://cdn.example.com/screenshot.png",
          "name": "screenshot.png",
          "type": "image/png",
          "size": 123456
        }
      ],
      "createdAt": "2025-03-11T10:00:00Z",
      "createdBy": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "clx2222222222",
      "message": "Apa pesan errornya?",
      "sender": "AGENT",
      "isInternal": false,
      "attachments": [],
      "createdAt": "2025-03-11T10:15:00Z",
      "createdBy": {
        "name": "Support Agent",
        "email": "support@company.com"
      }
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 50,
  "totalPages": 1
}
```

**Note:** Only returns messages where `isInternal: false`. Internal agent notes are excluded.

**Error Responses:**
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user or channel
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Filter `isInternal: false` to exclude internal messages
- Sort by `createdAt` ASC (oldest first)
- Include attachment metadata with `url`, `name`, `type`, `size`
- For customer messages: include name/email from `guestName`/`guestEmail`
- For agent messages: include user info from `userId` relation

---

#### 5. POST /api/integrated/tickets/:id/messages
Add message baru ke ticket (dari customer)

**Authentication:** Required (`X-API-Key` header)

**Request Body:**
```json
{
  "externalUserId": "user_123",
  "message": "Ini pesan tambahan dari customer",
  "attachments": [
    {
      "url": "https://cdn.example.com/file.pdf",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 123456
    }
  ]
}
```

**Validation:**
- `externalUserId`: Required, string - User ID from external app
- `message`: Required, string, 1-5000 characters
- `attachments`: Optional, array, max 5 files, max 10MB each

**Response:**
```json
{
  "id": "clx4444444444",
  "ticketId": "clx1234567890",
  "message": "Ini pesan tambahan dari customer",
  "sender": "CUSTOMER",
  "attachments": [],
  "createdAt": "2025-03-11T11:00:00Z"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user or channel
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Call existing `addTicketMessage()` service with:
  - `sender: CUSTOMER`
  - `userId: null` (customer is external, not a backoffice user)
- Service handles:
  - Activity logging (`CUSTOMER_REPLIED`)
  - Ticket reopening: CLOSED → IN_PROGRESS (not OPEN, not RESOLVED)
  - Webhook trigger (`MESSAGE_ADDED` event)
  - Agent notification (`notifyAgentTicketReply()`)

---

## Error Response Format

All endpoints return consistent error format:

### Standard Error
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

### Validation Error (Zod)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Human readable message",
  "details": "Error details string"
}
```

**Note:** Existing implementation returns `details` as string (not array). Maintain this pattern for consistency.

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | API key doesn't have access or ticket ownership mismatch |
| `NOT_FOUND` | 404 | Ticket not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## File Structure

```
apps/backoffice/
├── app/api/integrated/
│   └── tickets/
│       ├── route.ts                          # Existing: GET list, POST create
│       └── [id]/
│           ├── route.ts                      # NEW: GET ticket detail
│           └── messages/
│               └── route.ts                  # NEW: GET list, POST add message
├── lib/
│   ├── services/
│   │   └── ticketing/
│   │       ├── ticket-message-service.ts     # Existing: addTicketMessage()
│   │       └── integration-service.ts        # NEW: verifyApiKey(), validateTicketOwnership()
│   └── validations/
│       └── ticket-validation.ts              # Update: Add new schemas
```

---

## Database Context

Existing `Ticket` model:
- `externalUserId` - User ID from external app
- `channelId` - Links to INTEGRATED_APP channel
- `appId` - Links to App
- `status` - OPEN, IN_PROGRESS, RESOLVED, CLOSED

Existing `TicketMessage` model:
- `sender` - CUSTOMER or AGENT
- `isInternal` - Boolean for internal-only messages
- `attachments` - JSON array of attachment metadata

---

## Security Considerations

1. **API Key Validation**: Every request validates the API key
2. **Channel Isolation**: Tickets are isolated by channel (cross-channel access = 403)
3. **User Ownership**: `externalUserId` must match ticket's `externalUserId`
4. **Input Sanitization**: All user inputs validated with Zod
5. **Attachment Validation**: Max 5 files, 10MB per file
6. **Internal Message Protection**: Internal messages never exposed to external API

---

## Test Cases

Implementation should cover these test cases:

### Positive Cases
- Valid API key + valid externalUserId → success
- Pagination works correctly (page, pageSize)
- Attachments uploaded and linked correctly

### Negative Cases
- Missing API key → 401
- Invalid API key → 401
- Inactive channel → 401
- Wrong channel → 403 (ticket belongs to different channel)
- Wrong externalUserId → 403 (ticket belongs to different user)
- Non-existent ticket → 404

### Edge Cases
- Empty messages list → returns `items: []`
- Ticket with only internal messages → lastMessage excluded
- Re-opening behavior: CLOSED → IN_PROGRESS after customer reply
- Attachment size limit (10MB) enforced
- Max 5 attachments enforced

---

## Implementation Order

1. **integration-service.ts** - Create shared helpers:
   - `verifyApiKey()` - Validate and return channel
   - `validateTicketOwnership()` - Check channel + externalUserId

2. **GET /api/integrated/tickets/[id]/route.ts** - Ticket detail endpoint

3. **GET/POST /api/integrated/tickets/[id]/messages/route.ts** - Messages endpoints:
   - Uses existing `addTicketMessage()` service
   - Only adds API key + ownership validation layer

4. **Update validations** - Add Zod schemas if needed

5. **Testing** - Test with sample API key and external user

---

## API Usage Example

```javascript
// Configuration
const API_KEY = "your-channel-api-key";
const BASE_URL = "http://localhost:3100/api/integrated";
const EXTERNAL_USER_ID = "user_123"; // Your user's ID

// List tickets for user
async function listTickets() {
  const response = await fetch(`${BASE_URL}/tickets?externalUserId=${EXTERNAL_USER_ID}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json(); // { tickets: [...] }
}

// Get ticket detail
async function getTicket(ticketId) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}?externalUserId=${EXTERNAL_USER_ID}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json();
}

// Get messages
async function getMessages(ticketId, page = 1) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/messages?externalUserId=${EXTERNAL_USER_ID}&page=${page}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json(); // { items: [...], total, page, totalPages }
}

// Add message
async function addMessage(ticketId, message, attachments = []) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      externalUserId: EXTERNAL_USER_ID,
      message,
      attachments
    })
  });
  return response.json();
}

// Example: Full flow
async function supportFlow() {
  // 1. List all tickets
  const { tickets } = await listTickets();
  console.log(`Found ${tickets.length} tickets`);

  if (tickets.length > 0) {
    const ticket = tickets[0];

    // 2. Get ticket detail
    const detail = await getTicket(ticket.id);
    console.log('Ticket:', detail.subject, '-', detail.status);

    // 3. Get messages
    const { items } = await getMessages(ticket.id);
    console.log(`Messages: ${items.length}`);

    // 4. Reply to ticket
    const reply = await addMessage(ticket.id, "Terima kasih infonya");
    console.log('Message sent:', reply.id);
  }
}
```
