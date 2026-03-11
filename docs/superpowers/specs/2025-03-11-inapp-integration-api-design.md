# In-App Integration API Design

**Date:** 2025-03-11
**Status:** Approved
**Author:** Claude

## Overview

API untuk aplikasi eksternal mengakses sistem ticketing menggunakan **API Key** dari Channel. Ini memungkinkan aplikasi eksternal (mobile app, web app) untuk:

1. Melihat daftar tiket support
2. Melihat detail tiket
3. Melihat pesan-pesan dalam tiket
4. Mengirim pesan balasan ke tiket

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

## API Endpoints

### 1. List Tickets

**Endpoint:** `GET /api/public/integration/tickets`

**Authentication:** Required (`X-API-Key` header)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) |
| page | number | No | 1 | Page number for pagination |
| pageSize | number | No | 20 | Items per page |

**Response:**
```json
{
  "items": [
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
      "messageCount": 3
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

**Implementation Notes:**
- Filter tickets by `channelId` from API key
- Apply status filter if provided
- Sort by `createdAt` DESC
- Calculate message count from `TicketMessage` relation

---

### 2. Get Ticket Detail

**Endpoint:** `GET /api/public/integration/tickets/:id`

**Authentication:** Required (`X-API-Key` header)

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
  "lastMessage": {
    "id": "clx0987654321",
    "message": "Mohon tunggu, kami sedang memeriksanya",
    "sender": "AGENT",
    "createdAt": "2025-03-11T10:30:00Z"
  }
}
```

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Return `404 NOT_FOUND` if ticket not found or belongs to different channel
- Fetch last message from `TicketMessage` ordered by `createdAt` DESC

---

### 3. Get Ticket Messages

**Endpoint:** `GET /api/public/integration/tickets/:id/messages`

**Authentication:** Required (`X-API-Key` header)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
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
      "attachments": [],
      "createdAt": "2025-03-11T10:00:00Z"
    },
    {
      "id": "clx2222222222",
      "message": "Apa pesan errornya?",
      "sender": "AGENT",
      "isInternal": false,
      "attachments": [],
      "createdAt": "2025-03-11T10:15:00Z"
    },
    {
      "id": "clx3333333333",
      "message": "Mohon tunggu, kami sedang memeriksanya",
      "sender": "AGENT",
      "isInternal": false,
      "attachments": [],
      "createdAt": "2025-03-11T10:30:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 50,
  "totalPages": 1
}
```

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Exclude internal messages (`isInternal: true`) unless requested
- Sort by `createdAt` ASC (oldest first)
- Include attachment metadata

---

### 4. Add Message to Ticket

**Endpoint:** `POST /api/public/integration/tickets/:id/messages`

**Authentication:** Required (`X-API-Key` header)

**Request Body:**
```json
{
  "message": "Ini pesan tambahan dari customer",
  "attachments": [
    {
      "url": "https://cdn.example.com/file.pdf",
      "name": "screenshot.pdf",
      "type": "application/pdf",
      "size": 123456
    }
  ]
}
```

**Validation:**
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

**Implementation Notes:**
- Validate ticket belongs to the channel from API key
- Create message with `sender: CUSTOMER`
- Update ticket `updatedAt` timestamp
- Trigger notification to agents
- Log activity in `TicketActivity`

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | API key doesn't have access to this ticket |
| `NOT_FOUND` | 404 | Ticket not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## File Structure

```
apps/backoffice/
├── app/api/public/integration/
│   ├── tickets/
│   │   ├── route.ts                    # GET list tickets
│   │   └── [id]/
│   │       ├── route.ts                # GET ticket detail
│   │       └── messages/
│   │           ├── route.ts            # GET messages
│   │           └── route.ts (POST)     # POST add message
├── lib/
│   ├── services/
│   │   └── ticketing/
│   │       └── integration-service.ts  # Business logic
│   └── validations/
│       └── integration-validation.ts   # Zod schemas
```

---

## Security Considerations

1. **API Key Validation**: Every request validates the API key
2. **Channel Isolation**: Tickets are isolated by channel
3. **Rate Limiting**: Consider adding rate limiting per API key
4. **Input Sanitization**: All user inputs validated with Zod
5. **Attachment Validation**: File type and size validation

---

## Future Enhancements

1. WebSocket support for real-time message updates
2. Push notifications for new agent messages
3. Ticket creation via API (currently only via POST /api/public/tickets)
4. Ticket status update by customer (e.g., mark as resolved)
5. File upload endpoint for attachments
