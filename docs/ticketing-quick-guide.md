# Panduan Cepat: Akses Tiket

## URL untuk Akses Tiket

### 1. Halaman Detail Tiket (UI)
```
/support/tickets/{ticketId}?token={jwt_token}
```

Halaman ini juga menyediakan **form untuk mengirim pesan** langsung dari browser.

### 2. Kirim Pesan ke Tiket (API)
```
POST /api/integrated/tickets/{ticketId}/messages?token={jwt_token}
```

**Request Body:**
```json
{
  "message": "Pesan tambahan Anda"
}
```

**Contoh:**
```
https://your-domain.com/support/tickets/cmn5p5tgb000h9liefzv0o3cl?token=eyJhbGciOiJIUzI1NiJ9...
```

### 2. API Detail Tiket
```
GET /api/integrated/tickets/{ticketId}?token={jwt_token}
```

### 3. Halaman Daftar Tiket
```
/support/tickets/list?token={jwt_token}
```

---

## Buka Tiket di New Tab (JavaScript)

```javascript
// Simpan token setelah user login
const token = await generateToken('list_tickets');
localStorage.setItem('support_token', token);

// Buka daftar tiket
window.open('/support/tickets/list?token=' + token, '_blank');

// Buka detail tiket spesifik
function openTicket(ticketId) {
  const token = localStorage.getItem('support_token');
  window.open(`/support/tickets/${ticketId}?token=${token}`, '_blank');
}
```

---

## Token Purpose yang Diperbolehkan

Untuk melihat detail tiket, token bisa memiliki purpose:
- `view_ticket` - Untuk melihat tiket tertentu
- `create_ticket` - Untuk melihat tiket yang baru dibuat
- `list_tickets` - Untuk melihat tiket dari daftar

---

## Contoh Integrasi React

### Ticket List dengan Detail
```tsx
import { ExternalLink } from 'lucide-react';

function TicketList({ tickets, token }) {
  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id} className="ticket-item">
          <span>{ticket.subject}</span>
          <button
            onClick={() => window.open(
              `/support/tickets/${ticket.id}?token=${token}`,
              '_blank'
            )}
          >
            <ExternalLink size={16} />
            Lihat Detail
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Kirim Pesan via API
```tsx
async function sendMessage(ticketId: string, token: string, message: string) {
  const response = await fetch(
    `/api/integrated/tickets/${ticketId}/messages?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }
  );

  const data = await response.json();
  if (data.success) {
    console.log('Pesan terkirim!');
    // Refresh tiket untuk melihat pesan baru
  }
  return data;
}
```

---

## Generate Token (Server-side)

```javascript
// Di server Anda, generate token untuk user
async function getSupportToken(userId) {
  const response = await fetch('https://your-domain.com/api/integrated/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channelSlug: 'inapp-support',
      externalUserId: userId,
      purpose: 'list_tickets'
    })
  });

  const { token } = await response.json();
  return token; // Kirim token ke client
}
```
