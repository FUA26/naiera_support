# Ticketing API Documentation

API untuk mengakses sistem ticketing Naiera Support. Mendukung dua metode autentikasi:
- **JWT Token** - Untuk akses publik via integrated app
- **API Key** - Untuk akses server-to-server

---

## Authentication Methods

### Method 1: JWT Token (Recommended)

Token JWT digenerate menggunakan channel `slug` atau `apiKey`. Token memiliki expiry time (default 30 menit).

#### Generate Token

**Endpoint:** `POST /api/integrated/auth/token`

**Request Body:**
```json
{
  "channelSlug": "inapp-support",
  "email": "user@example.com",
  "purpose": "list_tickets"
}
```

Atau dengan `externalUserId`:
```json
{
  "channelSlug": "inapp-support",
  "externalUserId": "user_123",
  "purpose": "list_tickets"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 1800
}
```

**Token Purposes:**
| Purpose | Description |
|---------|-------------|
| `create_ticket` | Membuat tiket baru |
| `view_ticket` | Melihat detail tiket tertentu |
| `list_tickets` | Melihat daftar tiket user |

**Menggunakan Token:**
```
?token=eyJhbGciOiJIUzI1NiJ9...
```

---

### Method 2: API Key (Server-to-Server)

Gunakan API Key dari channel dengan tipe `INTEGRATED_APP`.

**Header:**
```
X-API-Key: your-channel-api-key
```

---

## API Endpoints

### 1. Add Message to Ticket (Kirim Pesan ke Tiket)

**Endpoint:** `POST /api/integrated/tickets/{id}/messages?token={jwt_token}`

Menambahkan pesan baru ke tiket yang sudah ada.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "message": "Pesan tambahan dari customer (1-5000 karakter)",
  "attachments": [...] // Optional, array of attachment objects
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg123",
    "message": "Pesan tambahan dari customer",
    "sender": "CUSTOMER",
    "attachments": [],
    "createdAt": "2025-03-25T11:00:00Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "TOKEN_REQUIRED",
  "message": "Token akses diperlukan"
}
```

```json
{
  "success": false,
  "error": "ACCESS_DENIED",
  "message": "Anda tidak memiliki akses ke tiket ini"
}
```

**Note:**
- Pesan hanya bisa dikirim ke tiket yang **belum ditutup** (status bukan CLOSED)
- Tiket yang CLOSED akan otomatis berubah menjadi IN_PROGRESS jika customer mengirim pesan
- Token dengan purpose `create_ticket`, `list_tickets`, atau `view_ticket` dapat digunakan

---

### 2. Create Ticket

### 1. Create Ticket

**Endpoint:** `POST /api/public/tickets`

**Authentication:** Optional (JWT token atau tanpa auth untuk guest)

**Request Body (dengan Token):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "subject": "Subject minimum 5 karakter",
  "message": "Pesan minimum 10 karakter",
  "priority": "NORMAL"
}
```

**Request Body (tanpa Token - Guest):**
```json
{
  "appSlug": "my-app",
  "channelType": "WEB_FORM",
  "subject": "Subject minimum 5 karakter",
  "message": "Pesan minimum 10 karakter",
  "guestEmail": "user@example.com",
  "guestName": "John Doe",
  "priority": "NORMAL"
}
```

**Response:**
```json
{
  "id": "cmn5p5tgb000h9liefzv0o3cl",
  "ticketNumber": "TKT-12345",
  "status": "OPEN",
  "createdAt": "2025-03-25T10:00:00Z"
}
```

---

### 2. List Tickets (Daftar Tiket)

**Endpoint:** `GET /api/integrated/view-tickets?token={jwt_token}`

Halaman publik untuk menampilkan daftar tiket user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | JWT token dengan purpose `list_tickets` |

**Contoh URL:**
```
https://your-domain.com/support/tickets/list?token=eyJhbGciOiJIUzI1NiJ9...
```

---

### 3. View Ticket Detail (Detail Tiket)

**Endpoint:** `GET /api/integrated/tickets/{id}?token={jwt_token}`

API untuk mendapatkan detail tiket beserta semua pesan.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | JWT token dengan purpose `view_ticket`, `create_ticket`, atau `list_tickets` |

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "cmn5p5tgb000h9liefzv0o3cl",
    "ticketNumber": "TKT-12345",
    "subject": "Login tidak bisa",
    "status": "OPEN",
    "priority": "NORMAL",
    "createdAt": "2025-03-25T10:00:00Z",
    "updatedAt": "2025-03-25T10:30:00Z",
    "guestName": "John Doe",
    "guestEmail": "user@example.com",
    "messages": [
      {
        "id": "msg123",
        "message": "Saya tidak bisa login",
        "sender": "CUSTOMER",
        "isInternal": false,
        "createdAt": "2025-03-25T10:00:00Z",
        "attachments": []
      },
      {
        "id": "msg124",
        "message": "Apa pesan errornya?",
        "sender": "AGENT",
        "isInternal": false,
        "createdAt": "2025-03-25T10:15:00Z",
        "attachments": []
      }
    ],
    "attachments": []
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "TOKEN_REQUIRED",
  "message": "Token akses diperlukan"
}
```

```json
{
  "success": false,
  "error": "ACCESS_DENIED",
  "message": "Anda tidak memiliki akses ke tiket ini"
}
```

---

### 4. Public Ticket Detail Page

**URL:** `/support/tickets/{id}?token={jwt_token}`

Halaman publik untuk menampilkan detail tiket dengan UI.

**Contoh URL:**
```
https://your-domain.com/support/tickets/cmn5p5tgb000h9liefzv0o3cl?token=eyJhbGciOiJIUzI1NiJ9...
```

**Buka di New Tab:**
```javascript
window.open(`/support/tickets/${ticketId}?token=${token}`, '_blank');
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Configuration
const BASE_URL = "https://your-domain.com";
const CHANNEL_SLUG = "inapp-support";
const EXTERNAL_USER_ID = "user_123"; // atau email

// 1. Generate Token
async function generateToken(purpose: 'create_ticket' | 'view_ticket' | 'list_tickets') {
  const response = await fetch(`${BASE_URL}/api/integrated/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channelSlug: CHANNEL_SLUG,
      externalUserId: EXTERNAL_USER_ID,
      purpose
    })
  });
  const data = await response.json();
  return data.token;
}

// 2. Create Ticket
async function createTicket(subject: string, message: string) {
  const token = await generateToken('create_ticket');

  const response = await fetch(`${BASE_URL}/api/public/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      subject,
      message,
      priority: 'NORMAL'
    })
  });

  const ticket = await response.json();
  return ticket;
}

// 3. Get Ticket Detail (API)
async function getTicketDetail(ticketId: string) {
  const token = await generateToken('view_ticket');

  const response = await fetch(
    `${BASE_URL}/api/integrated/tickets/${ticketId}?token=${token}`
  );

  const data = await response.json();
  return data.ticket;
}

// 4. Add Message to Ticket
async function addMessage(ticketId: string, message: string) {
  const token = await generateToken('list_tickets'); // atau gunakan token yang ada

  const response = await fetch(
    `${BASE_URL}/api/integrated/tickets/${ticketId}/messages?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }
  );

  const data = await response.json();
  if (data.success) {
    console.log('Message sent:', data.message.id);
  }
  return data;
}

// 5. Open Ticket in New Tab (UI)
function openTicketDetail(ticketId: string) {
  const token = localStorage.getItem('support_token'); // atau fetch new token
  window.open(
    `${BASE_URL}/support/tickets/${ticketId}?token=${token}`,
    '_blank'
  );
}

// 6. List Tickets (UI Page)
function openTicketList() {
  const token = localStorage.getItem('support_token');
  window.open(
    `${BASE_URL}/support/tickets/list?token=${token}`,
    '_blank'
  );
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
}

export function useSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/integrated/tickets?token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const openTicket = useCallback((ticketId: string, token: string) => {
    window.open(`/support/tickets/${ticketId}?token=${token}`, '_blank');
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    openTicket
  };
}
```

### cURL Examples

```bash
# Generate Token
curl -X POST https://your-domain.com/api/integrated/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "channelSlug": "inapp-support",
    "externalUserId": "user_123",
    "purpose": "list_tickets"
  }'

# Create Ticket
curl -X POST https://your-domain.com/api/public/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "subject": "Help needed",
    "message": "I need help with my account",
    "priority": "NORMAL"
  }'

# Get Ticket Detail
curl https://your-domain.com/api/integrated/tickets/cmn5p5tgb000h9liefzv0o3cl?token=eyJhbGciOiJIUzI1NiJ9...
```

---

## Integration Guide

### Step 1: Generate Token untuk User

```javascript
// Saat user login ke aplikasi Anda
const token = await generateToken('list_tickets');
localStorage.setItem('support_token', token);
```

### Step 2: Tampilkan Daftar Tiket

```javascript
// Buka halaman daftar tiket di iframe atau new tab
window.open(
  `${BASE_URL}/support/tickets/list?token=${token}`,
  '_blank'
);
```

### Step 3: Buka Detail Tiket

```javascript
// Dari daftar tiket, buka detail tiket
function onTicketClick(ticketId: string) {
  window.open(
    `${BASE_URL}/support/tickets/${ticketId}?token=${token}`,
    '_blank'
  );
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `TOKEN_REQUIRED` | 401 | Token tidak tersedia |
| `TOKEN_EXPIRED` | 401 | Token telah kadaluarsa |
| `INVALID_TOKEN` | 401 | Token tidak valid |
| `INVALID_TOKEN_PURPOSE` | 401 | Token tidak valid untuk operasi ini |
| `ACCESS_DENIED` | 403 | Tidak memiliki akses ke tiket |
| `TICKET_NOT_FOUND` | 404 | Tiket tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Data tidak valid |
| `INTERNAL_ERROR` | 500 | Error server |

---

## Security Notes

1. **Token Expiry**: Token berlaku 30 menit. Generate ulang setelah expiry.
2. **HTTPS**: Selalu gunakan HTTPS untuk production.
3. **Token Storage**: Jangan expose token di URL path (gunakan query parameter).
4. **User Isolation**: Setiap user hanya bisa mengakses tiket mereka sendiri.
5. **Channel Isolation**: Tiket diisolasi per channel/app.

---

## URL Patterns

| Purpose | URL Pattern |
|---------|-------------|
| Create Ticket | `POST /api/public/tickets` |
| Add Message | `POST /api/integrated/tickets/{id}/messages?token={token}` |
| List Tickets (Page) | `/support/tickets/list?token={token}` |
| Ticket Detail (Page) | `/support/tickets/{id}?token={token}` |
| Ticket Detail (API) | `GET /api/integrated/tickets/{id}?token={token}` |
| Messages (API) | `GET /api/integrated/tickets/{id}/messages?token={token}` |
| Generate Token | `POST /api/integrated/auth/token` |
| Validate Token | `POST /api/integrated/validate-token` |
