# Ticket & Message Attachments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add image and document attachment support to ticketing system - both on ticket creation and in message replies.

**Architecture:** Use existing `File` model with S3-compatible storage. Add `TicketAttachment` model for ticket-level attachments. Reuse existing `attachments` (Json) field in `TicketMessage` for message attachments.

**Tech Stack:** Prisma (PostgreSQL), Next.js API Routes, S3-compatible storage, React Dropzone, shadcn/ui components

---

## Prerequisites

Check existing file upload infrastructure:
- `apps/backoffice/lib/file-upload/` - upload utilities
- `apps/backoffice/prisma/schema.prisma` - File model
- `apps/backoffice/lib/storage/` - S3 client configuration

---

## Task 1: Update Database Schema

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`
- Run: `pnpm --filter backoffice db:push`

**Step 1: Add TicketAttachment model and relations**

Add to schema.prisma after the Ticket model (around line 533):

```prisma
// Add this to Ticket model
model Ticket {
  ...
  attachments    TicketAttachment[]  // NEW: Add this line
  webhookLogs WebhookLog[]
  @@index([ticketNumber])
}

// Add this to File model (around line 226)
model File {
  ...
  taskAttachments TaskAttachment[]
  ticketAttachments TicketAttachment[]  // NEW: Add this line
}

// Add this new model after TicketMessage (around line 552)
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
```

**Step 2: Push schema to database**

```bash
pnpm --filter backoffice db:push
```

Expected output: `Database schema is up to date`

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add TicketAttachment model for ticket attachments"
```

---

## Task 2: Create Attachment Validation

**Files:**
- Create: `apps/backoffice/lib/file-upload/attachment-validation.ts`

**Step 1: Create validation constants and functions**

```typescript
// File size limits (5MB)
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_TICKET = 3;
export const MAX_ATTACHMENTS_PER_MESSAGE = 3;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
] as const;

export const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

export type AttachmentType = typeof ALLOWED_ATTACHMENT_TYPES[number];

// Validation functions
export function isAllowedAttachmentType(mimeType: string): mimeType is AttachmentType {
  return ALLOWED_ATTACHMENT_TYPES.includes(mimeType as AttachmentType);
}

export function isImageAttachment(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

export function validateAttachmentSize(size: number): boolean {
  return size <= MAX_ATTACHMENT_SIZE;
}

export function validateAttachmentCount(count: number): boolean {
  return count <= MAX_ATTACHMENTS_PER_TICKET;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Zod schema for attachment validation
import { z } from 'zod';

export const attachmentFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(MAX_ATTACHMENT_SIZE, `File size must be less than ${formatFileSize(MAX_ATTACHMENT_SIZE)}`),
  type: z.enum([...ALLOWED_ATTACHMENT_TYPES], {
    errorMap: () => ({ message: 'Invalid file type. Only images and PDF/Office documents allowed.' }),
  }),
});

export const attachmentMetadataSchema = z.object({
  url: z.string().url('Invalid URL'),
  name: z.string().min(1, 'File name is required'),
  type: z.string(),
  size: z.number(),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/file-upload/attachment-validation.ts
git commit -m "feat: add attachment validation utilities"
```

---

## Task 3: Create Attachment Upload API

**Files:**
- Create: `apps/backoffice/app/api/upload/ticket-attachment/route.ts`
- Create: `apps/backoffice/app/api/upload/message-attachment/route.ts`

**Step 1: Create ticket attachment upload endpoint**

Create `apps/backoffice/app/api/upload/ticket-attachment/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { uploadFile } from "@/lib/file-upload/upload";
import {
  attachmentFileSchema,
  MAX_ATTACHMENTS_PER_TICKET,
  isAllowedAttachmentType,
} from "@/lib/file-upload/attachment-validation";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_ATTACHMENTS_PER_TICKET) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS_PER_TICKET} files allowed` },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // Validate file
      const validationResult = attachmentFileSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors[0].message },
          { status: 400 }
        );
      }

      // Upload to S3
      const uploadedFile = await uploadFile(file, userId, "TICKET_ATTACHMENT");
      uploadedFiles.push({
        id: uploadedFile.id,
        url: uploadedFile.cdnUrl || uploadedFile.storagePath,
        name: uploadedFile.originalFilename,
        type: uploadedFile.mimeType,
        size: uploadedFile.size,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create message attachment upload endpoint**

Create `apps/backoffice/app/api/upload/message-attachment/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { uploadFile } from "@/lib/file-upload/upload";
import {
  attachmentFileSchema,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/file-upload/attachment-validation";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} files allowed` },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const validationResult = attachmentFileSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors[0].message },
          { status: 400 }
        );
      }

      const uploadedFile = await uploadFile(file, userId, "MESSAGE_ATTACHMENT");
      uploadedFiles.push({
        url: uploadedFile.cdnUrl || uploadedFile.storagePath,
        name: uploadedFile.originalFilename,
        type: uploadedFile.mimeType,
        size: uploadedFile.size,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/upload/ticket-attachment/ apps/backoffice/app/api/upload/message-attachment/
git commit -m "feat: add attachment upload endpoints"
```

---

## Task 4: Update Ticket Creation

**Files:**
- Modify: `apps/backoffice/app/api/tickets/route.ts`
- Modify: `apps/backoffice/lib/validations/ticket-validation.ts`

**Step 1: Update ticket validation schema**

Edit `apps/backoffice/lib/validations/ticket-validation.ts`, add `attachments` field:

```typescript
export const createTicketSchema = z.object({
  appId: z.string().cuid(),
  channelId: z.string().cuid(),
  subject: z.string().min(3).max(500),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional().default("NORMAL"),
  attachments: z.array(z.string().cuid()).optional().default([]), // NEW: File IDs
  // ... existing fields for guest/external user
});
```

**Step 2: Update ticket creation endpoint**

Edit `apps/backoffice/app/api/tickets/route.ts`, handle attachments:

After creating the ticket, add attachments:

```typescript
// After ticket is created, handle attachments
const attachmentIds = body.attachments || [];
if (attachmentIds.length > 0) {
  // Verify files exist and belong to user
  const files = await prisma.file.findMany({
    where: {
      id: { in: attachmentIds },
      uploadedById: session.user.id,
    },
  });

  if (files.length !== attachmentIds.length) {
    return NextResponse.json(
      { error: "Some files not found or invalid" },
      { status: 400 }
    );
  }

  // Create attachment relations
  await prisma.ticketAttachment.createMany({
    data: attachmentIds.map(fileId => ({
      ticketId: ticket.id,
      fileId: fileId,
    })),
  });
}

// Include attachments in response
const ticketWithAttachments = await prisma.ticket.findUnique({
  where: { id: ticket.id },
  include: {
    attachments: {
      include: {
        file: true,
      },
    },
    // ... other includes
  },
});
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/tickets/route.ts apps/backoffice/lib/validations/ticket-validation.ts
git commit -m "feat: add attachment support to ticket creation"
```

---

## Task 5: Update Message Creation

**Files:**
- Modify: `apps/backoffice/app/api/tickets/[id]/messages/route.ts`
- Modify: `apps/backoffice/lib/validations/ticket-validation.ts`

**Step 1: Update message validation schema**

Edit `apps/backoffice/lib/validations/ticket-validation.ts`:

```typescript
export const createMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  isInternal: z.boolean().optional().default(false),
  attachments: z.array(z.object({
    url: z.string().url(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional().default([]), // NEW: Attachment metadata
});
```

**Step 2: Update message creation endpoint**

Edit `apps/backoffice/app/api/tickets/[id]/messages/route.ts`:

```typescript
// In the message creation handler, include attachments from request body
const { message, isInternal, attachments = [] } = createMessageSchema.parse(body);

// Create message with attachments
const ticketMessage = await prisma.ticketMessage.create({
  data: {
    ticketId: params.id,
    sender: "AGENT",
    userId: session.user.id,
    message,
    isInternal,
    attachments: attachments.length > 0 ? attachments : null, // Store as JSON
  },
  include: {
    user: {
      select: { id: true, name: true, email: true, image: true },
    },
  },
});
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/tickets/[id]/messages/route.ts apps/backoffice/lib/validations/ticket-validation.ts
git commit -m "feat: add attachment support to message creation"
```

---

## Task 6: Create Attachment UI Component

**Files:**
- Create: `apps/backoffice/components/ticketing/attachment-upload.tsx`
- Create: `apps/backoffice/components/ticketing/attachment-preview.tsx`

**Step 1: Create attachment upload component**

Create `apps/backoffice/components/ticketing/attachment-upload.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileImage, File } from "lucide-react";
import { Button } from "@workspace/ui/button";
import { Progress } from "@workspace/ui/progress";
import { cn } from "@/lib/utils";
import {
  MAX_ATTACHMENTS_PER_TICKET,
  isAllowedAttachmentType,
  isImageAttachment,
  formatFileSize,
  MAX_ATTACHMENT_SIZE,
} from "@/lib/file-upload/attachment-validation";

type AttachmentFile = {
  file: File;
  preview?: string;
  uploadedUrl?: string;
  uploadProgress?: number;
  error?: string;
};

type AttachmentUploadProps = {
  maxFiles?: number;
  onFilesChange: (files: AttachmentFile[]) => void;
  disabled?: false;
  value?: AttachmentFile[];
};

export function AttachmentUpload({
  maxFiles = MAX_ATTACHMENTS_PER_TICKET,
  onFilesChange,
  disabled = false,
  value = [],
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<AttachmentFile[]>(value);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Process files
    const newFiles: AttachmentFile[] = acceptedFiles.map(file => {
      const preview = isImageAttachment(file.type)
        ? URL.createObjectURL(file)
        : undefined;

      return {
        file,
        preview,
        uploadProgress: 0,
      };
    });

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    // Upload files
    setUploading(true);
    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];
      const formData = new FormData();
      formData.append("files", fileData.file);

      try {
        const response = await fetch("/api/upload/ticket-attachment", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();

        // Update file with uploaded data
        setFiles(prev => prev.map((f, idx) =>
          idx === files.length + i
            ? { ...f, uploadedUrl: result.files[0].url, uploadProgress: 100 }
            : f
        ));

        const updatedWithUpload = files.map((f, idx) =>
          idx === files.length + i
            ? { ...f, uploadedUrl: result.files[0].url, uploadProgress: 100 }
            : f
        );
        onFilesChange(updatedWithUpload);

      } catch (error: any) {
        setFiles(prev => prev.map((f, idx) =>
          idx === files.length + i
            ? { ...f, error: error.message }
            : f
        ));
      }
    }
    setUploading(false);
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: MAX_ATTACHMENT_SIZE,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    disabled: disabled || files.length >= maxFiles || uploading,
  });

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((fileData, index) => (
            <AttachmentThumbnail
              key={index}
              file={fileData}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {/* Dropzone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            (disabled || uploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop files here..."
              : `Drag & drop or click to attach (max ${maxFiles} files, 5MB each)`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images: JPG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX, XLS, XLSX
          </p>
        </div>
      )}
    </div>
  );
}

function AttachmentThumbnail({ file, onRemove }: { file: AttachmentFile; onRemove: () => void }) {
  const isImage = file.preview || isImageAttachment(file.file.type);

  return (
    <div className="relative group w-20 h-20 bg-muted rounded-lg overflow-hidden border">
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <File className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="w-8 h-8" />
        </div>
      )}
      {file.error && (
        <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
          <span className="text-xs text-white p-1 text-center">Error</span>
        </div>
      )}
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-xs p-1 truncate">
        {file.file.name}
      </div>
    </div>
  );
}
```

**Step 2: Create attachment preview component**

Create `apps/backoffice/components/ticketing/attachment-preview.tsx`:

```typescript
"use client";

import { FileImage, File, Download } from "lucide-react";
import { Button } from "@workspace/ui/button";
import { cn } from "@/lib/utils";
import { isImageAttachment } from "@/lib/file-upload/attachment-validation";

type Attachment = {
  url: string;
  name: string;
  type: string;
  size?: number;
};

type AttachmentPreviewProps = {
  attachments: Attachment[];
  className?: string;
};

export function AttachmentPreview({ attachments, className }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map((attachment, index) => (
        <AttachmentItem key={index} attachment={attachment} />
      ))}
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: Attachment }) {
  const isImage = isImageAttachment(attachment.type);

  const handleDownload = () => {
    window.open(attachment.url, "_blank");
  };

  if (isImage) {
    return (
      <div className="group relative w-24 h-24 bg-muted rounded-lg overflow-hidden border">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => window.open(attachment.url, "_blank")}
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border group hover:bg-muted/70 transition-colors">
      <File className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={handleDownload}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/components/ticketing/attachment-upload.tsx apps/backoffice/components/ticketing/attachment-preview.tsx
git commit -m "feat: add attachment UI components"
```

---

## Task 7: Update Ticket Form with Attachments

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/tickets/components/ticket-form.tsx` (or create if doesn't exist)
- Or: Find the ticket creation component and update it

**Step 1: Locate ticket creation component**

```bash
find apps/backoffice -name "*.tsx" -type f | xargs grep -l "create.*ticket" | head -5
```

**Step 2: Integrate AttachmentUpload component**

Add to the ticket form:

```typescript
import { AttachmentUpload } from "@/components/ticketing/attachment-upload";
import type { AttachmentFile } from "@/components/ticketing/attachment-upload";

// In component state
const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

// In form JSX
<AttachmentUpload
  maxFiles={3}
  value={attachments}
  onFilesChange={setAttachments}
/>

// In submit handler
const attachmentIds = attachments
  .filter(a => a.uploadedUrl)
  .map(a => extractIdFromUrl(a.uploadedUrl!)); // or pass file IDs differently

// Include in create ticket request
await createTicket({
  ...formData,
  attachments: attachmentIds,
});
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tickets/components/ticket-form.tsx
git commit -m "feat: add attachment upload to ticket form"
```

---

## Task 8: Update Message Input with Attachments

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-messages.tsx`

**Step 1: Add attachment state and upload to message input**

```typescript
import { AttachmentUpload } from "@/components/ticketing/attachment-upload";
import { AttachmentPreview } from "@/components/ticketing/attachment-preview";
import type { AttachmentFile } from "@/components/ticketing/attachment-upload";

// Add state
const [messageAttachments, setMessageAttachments] = useState<AttachmentFile[]>([]);

// In message input JSX
<div className="space-y-2">
  {messageAttachments.length > 0 && (
    <AttachmentPreview
      attachments={messageAttachments.map(a => ({
        url: a.uploadedUrl || a.preview!,
        name: a.file.name,
        type: a.file.type,
        size: a.file.size,
      }))}
    />
  )}
  <AttachmentUpload
    maxFiles={3}
    value={messageAttachments}
    onFilesChange={setMessageAttachments}
  />
  {/* Message input */}
</div>

// In send handler
const attachmentMetadata = messageAttachments
  .filter(a => a.uploadedUrl)
  .map(a => ({
    url: a.uploadedUrl!,
    name: a.file.name,
    type: a.file.type,
    size: a.file.size,
  }));

await sendMessage({
  message,
  attachments: attachmentMetadata,
});

// Clear attachments after send
setMessageAttachments([]);
```

**Step 2: Show attachments in message display**

Update message rendering to show attachments:

```typescript
{message.attachments && message.attachments.length > 0 && (
  <AttachmentPreview attachments={message.attachments} />
)}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-messages.tsx
git commit -m "feat: add attachment support to message input and display"
```

---

## Task 9: Update Ticket Detail Display

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-detail.tsx`

**Step 1: Show attachments on ticket detail**

```typescript
import { AttachmentPreview } from "@/components/ticketing/attachment-preview";

// In ticket detail JSX
{ticket.attachments && ticket.attachments.length > 0 && (
  <div className="space-y-2">
    <h4 className="text-sm font-medium">Attachments</h4>
    <AttachmentPreview
      attachments={ticket.attachments.map(a => ({
        url: a.file.cdnUrl || a.file.storagePath,
        name: a.file.originalFilename,
        type: a.file.mimeType,
        size: a.file.size,
      }))}
    />
  </div>
)}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tickets/[id]/components/ticket-detail.tsx
git commit -m "feat: show attachments on ticket detail"
```

---

## Task 10: Update Ticket List Query

**Files:**
- Modify: `apps/backoffice/lib/services/ticketing/ticket-service.ts`

**Step 1: Include attachments in ticket queries**

Update findMany queries to include attachments:

```typescript
// In getTicket, getTickets, etc.
include: {
  // ... existing includes
  attachments: {
    include: {
      file: true,
    },
  },
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/ticket-service.ts
git commit -m "feat: include attachments in ticket queries"
```

---

## Task 11: Install Dependencies

**Files:**
- Modify: `apps/backoffice/package.json`

**Step 1: Install react-dropzone if not present**

```bash
pnpm --filter backoffice add react-dropzone
```

**Step 2: Verify installation**

```bash
grep react-dropzone apps/backoffice/package.json
```

Expected: `"react-dropzone": "^14.x.x"`

---

## Task 12: Testing

**Step 1: Test file upload validation**

1. Try uploading > 3 files - should show error
2. Try uploading 5MB+ file - should show error
3. Try uploading invalid file type - should show error

**Step 2: Test ticket creation with attachments**

1. Create ticket with 1 image attachment
2. Create ticket with 2 image + 1 document
3. Verify attachments show on ticket detail

**Step 3: Test message with attachments**

1. Send message with image attachment
2. Send message with document attachment
3. Verify attachments show in message thread

**Step 4: Test attachment preview**

1. Click on image attachment - should open in new tab
2. Download document attachment
3. Verify thumbnails render correctly

**Step 5: Test error handling**

1. Try uploading during network error
2. Try uploading very large file
3. Verify graceful error messages

---

## Final Checklist

- [ ] Database schema updated and migration run
- [ ] All API endpoints working
- [ ] Upload validation working
- [ ] Ticket form supports attachments
- [ ] Message input supports attachments
- [ ] Attachments display correctly
- [ ] Image previews working
- [ ] Download functionality working
- [ ] Error handling in place
- [ ] TypeScript compilation passes
- [ ] Linting passes

---

## Verification Commands

```bash
# Type check
pnpm --filter backoffice check-types

# Lint
pnpm --filter backoffice lint

# Build
pnpm --filter backoffice build
```
