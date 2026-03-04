# File Uploads Pattern

How to handle file uploads with S3-compatible storage.

## When to Use

Use file uploads when you need to:
- Accept user-uploaded images, documents, or media
- Store large files outside the database
- Generate presigned URLs for direct uploads
- Process images (resize, optimize) after upload

## Architecture

```
┌─────────────────────────────────────────┐
│           File Upload Flow              │
│                                         │
│  Client → Presigned URL → Direct S3     │
│    ↓            ↓             ↓         │
│  Select    Generate      Upload to     │
│  File      URL           Storage       │
│    ↓            ↓             ↓         │
│  Create    API Route     File Stored   │
│  Record    Returns       Create Record │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Configure S3 Storage

Set up environment variables:

```bash
# .env
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket"
S3_REGION="us-east-1"
S3_ENDPOINT="https://s3.amazonaws.com" # Or custom endpoint

# Public URL for accessing files
NEXT_PUBLIC_S3_PUBLIC_URL="https://your-bucket.s3.amazonaws.com"
```

### 2. Create File Schema

Define the File model in Prisma:

```prisma
// prisma/schema.prisma
model File {
  id           String   @id @default(cuid())
  fileName     String
  fileKey      String   @unique
  fileSize     Int
  mimeType     String
  uploadedBy   String
  uploadedByUser User   @relation(fields: [uploadedBy], references: [id])
  createdAt    DateTime @default(now())
}
```

### 3. Create S3 Utility

```typescript
// apps/backoffice/lib/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSize,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPublicUrl(key: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  return `${baseUrl}/${key}`;
}
```

### 4. Create Validation Schema

```typescript
// apps/backoffice/lib/validations/file.ts
import { z } from "zod";

export const uploadFileSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB
  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ]),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
```

### 5. Create API Route for Presigned URL

```typescript
// apps/backoffice/app/api/files/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { uploadFileSchema } from "@/lib/validations/file";
import { generatePresignedUploadUrl } from "@/lib/storage/s3";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { fileName, mimeType } = uploadFileSchema.parse(body);

    // Generate unique key
    const fileKey = `uploads/${session.user.id}/${randomUUID()}-${fileName}`;

    // Generate presigned URL
    const uploadUrl = await generatePresignedUploadUrl(fileKey, mimeType);

    return NextResponse.json({
      uploadUrl,
      fileKey,
      publicUrl: `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${fileKey}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 400 }
    );
  }
}
```

### 6. Create API Route to Confirm Upload

```typescript
// apps/backoffice/app/api/files/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const confirmUploadSchema = z.object({
  fileKey: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { fileKey, fileName, fileSize, mimeType } = confirmUploadSchema.parse(body);

    // Create file record
    const file = await prisma.file.create({
      data: {
        fileKey,
        fileName,
        fileSize,
        mimeType,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 400 }
    );
  }
}
```

### 7. Client Component for Upload

```typescript
"use client";

import { useState, useRef } from "react";
import { Button } from "@workspace/ui";

export function FileUpload({ onUpload }: { onUpload: (file: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      // 1. Get presigned URL
      const urlResponse = await fetch("/api/files/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      const { uploadUrl, fileKey, publicUrl } = await urlResponse.json();

      // 2. Upload directly to S3
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          // 3. Confirm upload
          const confirmResponse = await fetch("/api/files/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileKey,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            }),
          });

          const fileRecord = await confirmResponse.json();
          onUpload(fileRecord);
          setProgress(100);
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? `Uploading ${progress}%` : "Upload File"}
      </Button>
    </div>
  );
}
```

## Image Processing

For image optimization and processing:

```typescript
// apps/backoffice/lib/images/process.ts
import sharp from "sharp";

export async function processImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function generateThumbnail(buffer: Buffer) {
  return sharp(buffer)
    .resize(300, 200, { fit: "cover" })
    .jpeg({ quality: 70 })
    .toBuffer();
}
```

## File Type Validation

Validate file types by magic bytes:

```typescript
// apps/backoffice/lib/files/validation.ts
import fileType from "file-type";

export async function validateFile(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const type = await fileType.fromBuffer(Buffer.from(buffer));

  if (!type) return false;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  return allowedTypes.includes(type.mime);
}
```

## Best Practices

1. **Direct Uploads**: Upload directly to S3, not through your server
2. **Presigned URLs**: Generate temporary URLs for uploads
3. **File Size Limits**: Enforce size limits before upload
4. **Type Validation**: Validate both extension and MIME type
5. **Sanitize Filenames**: Remove special characters from filenames
6. **Access Control**: Use S3 bucket policies for access control
7. **CDN**: Use CloudFront or similar for faster delivery

## S3-Compatible Alternatives

The boilerplate works with any S3-compatible storage:

- **AWS S3**: `https://s3.amazonaws.com`
- **Cloudflare R2**: `https://<accountid>.r2.cloudflarestorage.com`
- **DigitalOcean Spaces**: `https://<region>.digitaloceanspaces.com`
- **Wasabi**: `https://s3.wasabisys.com`
- **MinIO**: Self-hosted `http://localhost:9000`

## See Also

- [API Routes](/docs/patterns/api-routes) - Creating upload endpoints
- [Validation](/docs/patterns/validation) - Validating file inputs
- [Storage](/docs/architecture/technology-stack) - Storage technology choices
