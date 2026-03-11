# In-App Integration API Design

**Date:** 2025-03-11
**Status:** Approved (v2 - Extended Existing API)
**Author:** Claude

## Overview

API untuk aplikasi eksternal mengakses sistem ticketing menggunakan **API Key** dari Channel. Ini memungkinkan aplikasi eksternal (mobile app, web app) untuk:

1. Membuat tiket support
2. Melihat daftar tiket support user
3. Melihat detail tiket
4. Melihat pesan-pesan dalam tiket
5. Mengirim pesan balasan ke tiket

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

**Error Responses:**
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Return `403 FORBIDDEN` if ownership validation fails
- Fetch last message from `TicketMessage` ordered by `createdAt` DESC
- Include agent info if last message is from agent

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
  "total": 3,
  "page": 1,
  "pageSize": 50,
  "totalPages": 1
}
```

**Error Responses:**
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Exclude internal messages (`isInternal: true`)
- Sort by `createdAt` ASC (oldest first)
- Include attachment metadata with `url`, `name`, `type`, `size`
- Include `createdBy` info (name/email) for both customer and agent

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
- `attachments`: Optional, array, max 5 files

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
- `400` - Validation error with `details` array for Zod errors
- `401` - Invalid or missing API key
- `403` - Ticket doesn't belong to this external user
- `404` - Ticket not found

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Validate `externalUserId` matches the ticket's `externalUserId`
- Create message with `sender: CUSTOMER`, `userId: null`
- Update ticket `updatedAt` timestamp
- Update ticket status to `OPEN` if currently `RESOLVED` or `CLOSED` (re-open behavior)
- Log activity in `TicketActivity` with action `CUSTOMER_REPLIED`
- Trigger notification to agents via notification service
- Trigger webhooks if configured

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
  "details": [
    {
      "path": ["field"],
      "message": "Specific validation error"
    }
  ]
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | API key doesn't have access or ticket ownership mismatch |
| `NOT_FOUND` | 404 | Ticket not found |
| `VALIDATION_ERROR` | 400 | Invalid request data (with `details` array) |
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
│   │       └── integration-service.ts        # NEW: Shared business logic
│   └── validations/
│       └── ticket-validation.ts              # Update: Add new schemas
```

---

## Database Context

Existing `Ticket` model already supports:
- `externalUserId` - User ID from external app
- `channelId` - Links to INTEGRATED_APP channel
- `appId` - Links to App

Existing `TicketMessage` model:
- `sender` - CUSTOMER or AGENT
- `isInternal` - Boolean for internal-only messages
- `attachments` - JSON array of attachment metadata

---

## Security Considerations

1. **API Key Validation**: Every request validates the API key
2. **Channel Isolation**: Tickets are isolated by channel
3. **User Ownership**: `externalUserId` must match ticket's `externalUserId`
4. **Input Sanitization**: All user inputs validated with Zod
5. **Attachment Validation**: File type and size validation (max 5MB per file)
6. **Rate Limiting**: Consider adding rate limiting per API key (future enhancement)

---

## Implementation Order

1. **integration-service.ts** - Create shared service with API key validation and ownership check
2. **GET /api/integrated/tickets/[id]/route.ts** - Ticket detail endpoint
3. **GET/POST /api/integrated/tickets/[id]/messages/route.ts** - Messages endpoints
4. **Update validations** - Add Zod schemas for new endpoints
5. **Testing** - Test with sample API key and external user

---

## API Usage Example

```javascript
// Configuration
const API_KEY = "your-channel-api-key";
const BASE_URL = "http://localhost:3100/api/integrated";

// List tickets for user
async function listTickets(externalUserId) {
  const response = await fetch(`${BASE_URL}/tickets?externalUserId=${externalUserId}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json();
}

// Get ticket detail
async function getTicket(ticketId, externalUserId) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}?externalUserId=${externalUserId}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json();
}

// Get messages
async function getMessages(ticketId, externalUserId) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/messages?externalUserId=${externalUserId}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json();
}

// Add message
async function addMessage(ticketId, externalUserId, message, attachments = []) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ externalUserId, message, attachments })
  });
  return response.json();
}
```
