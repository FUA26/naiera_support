# Ticket & Message Image Attachments Design

**Date:** 2026-03-06
**Status:** Approved
**Author:** Claude + User

## Overview

Add image and document attachment support to the ticketing system - both on ticket creation and in message replies.

## Requirements

- Support image attachments when creating a new ticket
- Support image/document attachments in message replies
- Max 3 attachments per ticket/message
- Supported formats: Images (jpg, png, gif, webp) + Documents (pdf, doc, docx, xls, xlsx)
- Max file size: 5MB per file
- Display image preview/thumbnail in chat
- Use existing S3-compatible storage

## Database Schema Changes

```prisma
// Add to Ticket model
model Ticket {
  ...
  attachments    TicketAttachment[]  // NEW
}

// Add to File model
model File {
  ...
  ticketAttachments TicketAttachment[]  // NEW
}

// New model
model TicketAttachment {
  id        String   @id @default(cuid())
  ticketId  String
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  fileId    String
  file      File     @relation(fields: [fileId], references: [id])

  createdAt DateTime @default(now())

  @@index([ticketId])
  @@index([fileId])
}

// TicketMessage - no schema change needed
// Field `attachments` (Json) already exists
```

## API Endpoints

### Upload Endpoints

```
POST /api/upload/ticket-attachment
- Upload files for ticket creation
- Multipart/form-data
- Max 3 files, 5MB each
- Returns: { files: [{ id, url, name, type, size }] }

POST /api/upload/message-attachment
- Upload files for message replies
- Multipart/form-data
- Max 3 files, 5MB each
- Returns: { files: [{ url, name, type, size }] }
```

### Ticket Endpoints (Updated)

```
POST /api/tickets
- Add `attachments: string[]` (file IDs) to request body

GET /api/tickets/:id
- Include attachments in response
```

### Message Endpoints (Updated)

```
POST /api/tickets/:id/messages
- Add `attachments: Array<{ url, name, type, size }>` to request body
```

### File Endpoints

```
GET /api/files/:id/download
- Download file by ID
- Supports range requests

GET /api/files/:id/preview
- Get thumbnail/preview URL for images
```

## UI Components

### Ticket Creation Form

```
┌─────────────────────────────────────┐
│ Subject: [________________]         │
│                                     │
│ Description:                        │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ Attachments (max 3):               │
│ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 📷   │ │ 📄   │ │  +   │      │
│ │ img1 │ │ doc1 │ │      │      │
│ └──────┘ └──────┘ └──────┘      │
│                                     │
│ [Create Ticket]                    │
└─────────────────────────────────────┘
```

### Message Input with Attachments

```
┌─────────────────────────────────────┐
│ 💬 Message                          │
│ ┌─────────────────────────────┐   │
│ │ Type your message...        │   │
│ └─────────────────────────────┘   │
│                                     │
│ 📎 [Attach]     [Send →]          │
└─────────────────────────────────────┘
```

### Image Preview in Message

```
Agent: Here is the screenshot
┌───────────────────────────────┐
│ ┌─────┐ ┌─────┐              │
│ │ 🖼️  │ │ 🖼️  │              │
│ │ img1 │ │ img2 │              │
│ └─────┘ └─────┘              │
│ [Click to enlarge]            │
└───────────────────────────────┘
```

## Service Layer

```
lib/services/ticketing/
├── ticket-service.ts          (update: handle attachments)
├── ticket-message-service.ts  (update: handle attachments)
└── ticket-attachment-service.ts (NEW: CRUD attachments)

lib/file-upload/
├── upload.ts    (reuse for ticket attachments)
└── validation.ts (update: add document types)
```

## Flow Diagrams

### Create Ticket with Attachments

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
│ User    │ -> │ Upload   │ -> │ Get     │ -> │ Create  │
│ selects │    │ files    │    │ file IDs│    │ Ticket  │
│ files   │    │ (S3)     │    │         │    │ w/ IDs  │
└─────────┘    └──────────┘    └─────────┘    └─────────┘
```

### Reply with Attachments

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
│ User    │ -> │ Upload   │ -> │ Get     │ -> │ Create  │
│ types   │    │ files    │    │ file URLs│   │ Message │
│ + attaches│  │ (S3)     │    │         │    │ w/ URLs │
└─────────┘    └──────────┘    └─────────┘    └─────────┘
```

## File Type Validation

```typescript
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 3;
```

## Permissions

```typescript
// Existing permissions - reuse
TICKET_MESSAGE_SEND    // For sending messages with attachments
TICKET_CREATE          // For creating tickets with attachments

// No new permissions needed
```

## Implementation Checklist

- [ ] Add `TicketAttachment` model to schema
- [ ] Update `File` model with relation
- [ ] Run migration
- [ ] Create upload validation service
- [ ] Create upload API endpoints
- [ ] Update ticket creation endpoint
- [ ] Update message creation endpoint
- [ ] Create attachment UI component
- [ ] Update ticket creation form
- [ ] Update message input component
- [ ] Add image preview in message list
- [ ] Add download functionality
- [ ] Add remove attachment functionality
- [ ] Test with various file types
- [ ] Test file size limits
- [ ] Test attachment count limits
