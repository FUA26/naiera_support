# In-App Integration API with Token Authentication Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable external apps to list their support tickets and open backoffice pages (create/view) with secure token-based authentication

**Architecture:**
- External app backend requests signed JWT token from backoffice API
- External app frontend opens backoffice URL with token in query param
- Backoffice validates token signature, extracts email, grants access
- Rate limiting on token generation to prevent abuse

**Tech Stack:**
- `jose` - JWT signing/verification (lightweight, no dependencies)
- Existing Prisma schema with `guestEmail` for ticket filtering
- Token expiry: 30 minutes (configurable)

---

## File Structure

```
apps/backoffice/
├── app/
│   ├── api/
│   │   └── integrated/
│   │       ├── auth/
│   │       │   └── token/
│   │       │       └── route.ts           # NEW: Generate JWT token
│   │       └── tickets/
│   │           ├── route.ts                # MODIFY: Add email filter
│   │           └── [id]/
│   │               └── route.ts            # NEW: Get ticket by id with token
│   ├── support/
│   │   ├── tickets/
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # MODIFY: Accept token, pre-fill email
│   │   │   └── [id]/
│   │   │       └── page.tsx               # NEW: Public ticket detail page
│   └── (dashboard)/tasks/
│       ├── components/
│       │   └── kanban-board.tsx           # Existing: From Kanban feature
│       └── tasks-client.tsx                # Existing: Modified for Kanban
├── lib/
│   ├── services/
│   │   └── ticketing/
│   │       └── integration-service.ts     # NEW: Token generation/validation
│   └── validations/
│       └── ticket-validation.ts           # MODIFY: Add token request schema
└── package.json                             # MODIFY: Add jose dependency
```

---

## Chunk 1: Setup and Token Service

### Task 1: Install jose dependency

**Files:**
- Modify: `apps/backoffice/package.json`

- [ ] **Step 1: Add jose to dependencies**

```bash
cd apps/backoffice && pnpm add jose
```

- [ ] **Step 2: Verify installation**

Run: `grep jose apps/backoffice/package.json`
Expected: `"jose": "^latest"`

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/package.json pnpm-lock.yaml
git commit -m "deps: add jose for JWT token generation/validation"
```

---

### Task 2: Create integration service with token functions

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/integration-service.ts`

- [ ] **Step 1: Create the integration service file**

```typescript
/**
 * Integration Service
 *
 * Handles token generation and validation for external app integration.
 * Uses JWT tokens signed with channel API keys for secure access.
 *
 * Token payload includes:
 * - email: User's email for ticket filtering
 * - channelId: Channel identifier
 * - purpose: Token usage (create_ticket, view_ticket, list_tickets)
 * - exp: Expiration timestamp (default 30 minutes)
 */

import { prisma } from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";

const TOKEN_EXPIRY_MINUTES = 30;
const TOKEN_ISSUER = "naiera-support";

// Secret key for signing (will use channel API key)
type TokenPurpose = "create_ticket" | "view_ticket" | "list_tickets";

export interface TokenPayload {
  email: string;
  channelId: string;
  channelSlug: string;
  appId: string;
  purpose: TokenPurpose;
  ticketId?: string; // Required for view_ticket purpose
}

export interface GeneratedToken {
  token: string;
  expiresIn: number; // seconds
}

/**
 * Generate a signed JWT token for external app access
 *
 * @param channelSlug - Channel identifier from external app config
 * @param email - User email from external app
 * @param purpose - What the token will be used for
 * @param ticketId - Required for view_ticket purpose
 * @returns Signed JWT token
 * @throws Error if channel not found or inactive
 */
export async function generateAccessToken(
  channelSlug: string,
  email: string,
  purpose: TokenPurpose,
  ticketId?: string
): Promise<GeneratedToken> {
  // Validate channel exists and is active
  const channel = await prisma.channel.findUnique({
    where: { slug: channelSlug },
    include: { app: true },
  });

  if (!channel) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  if (!channel.isActive || !channel.app.isActive) {
    throw new Error("CHANNEL_INACTIVE");
  }

  if (channel.type !== "INTEGRATED_APP") {
    throw new Error("INVALID_CHANNEL_TYPE");
  }

  // For view_ticket purpose, ticketId is required
  if (purpose === "view_ticket" && !ticketId) {
    throw new Error("TICKET_ID_REQUIRED");
  }

  // For view_ticket, validate ticket exists and belongs to channel
  if (purpose === "view_ticket" && ticketId) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.channelId !== channel.id) {
      throw new Error("TICKET_NOT_FOUND");
    }
  }

  // Use API key as signing secret
  const apiKey = channel.apiKey;
  if (!apiKey) {
    throw new Error("CHANNEL_NO_API_KEY");
  }

  // Create secret key from API key
  const secret = new TextEncoder().encode(apiKey);

  // Calculate expiration
  const expiresInSeconds = TOKEN_EXPIRY_MINUTES * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // Build payload
  const payload: TokenPayload = {
    email,
    channelId: channel.id,
    channelSlug: channel.slug,
    appId: channel.appId,
    purpose,
  };

  if (ticketId) {
    payload.ticketId = ticketId;
  }

  // Sign token
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(channel.id)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  return {
    token,
    expiresIn: expiresInSeconds,
  };
}

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token to verify
 * @param expectedPurpose - Expected token purpose
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyAccessToken(
  token: string,
  expectedPurpose?: TokenPurpose
): Promise<TokenPayload & { channelId: string; appId: string }> {
  try {
    // Extract channel ID from token without verifying yet
    // We need the channel's API key to verify the signature
    const { payload } = await jwtVerify(token, undefined, {
      issuer: TOKEN_ISSUER,
      // Skip signature verification for now to get the audience (channelId)
    });

    const channelId = payload.aud as string;

    if (!channelId) {
      throw new Error("INVALID_TOKEN");
    }

    // Get channel to get API key for verification
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { app: true },
    });

    if (!channel || !channel.apiKey) {
      throw new Error("CHANNEL_NOT_FOUND");
    }

    if (!channel.isActive || !channel.app.isActive) {
      throw new Error("CHANNEL_INACTIVE");
    }

    // Now verify with proper secret
    const secret = new TextEncoder().encode(channel.apiKey);
    const { payload: verifiedPayload } = await jwtVerify(token, secret, {
      issuer: TOKEN_ISSUER,
      audience: channelId,
    });

    // Validate purpose if expected
    if (expectedPurpose && verifiedPayload.purpose !== expectedPurpose) {
      throw new Error("INVALID_TOKEN_PURPOSE");
    }

    return {
      email: verifiedPayload.email as string,
      channelId: verifiedPayload.channelId as string,
      channelSlug: verifiedPayload.channelSlug as string,
      appId: verifiedPayload.appId as string,
      purpose: verifiedPayload.purpose as TokenPurpose,
      ticketId: verifiedPayload.ticketId as string | undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "JWTExpired") {
      throw new Error("TOKEN_EXPIRED");
    }
    if (error instanceof Error && error.name === "JWTInvalid") {
      throw new Error("INVALID_TOKEN");
    }
    throw error;
  }
}

/**
 * Rate limiting for token generation
 * Uses a simple in-memory counter (for production, use Redis)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10, // Max 10 tokens
  windowMs: 60 * 1000, // Per minute
};

export function checkRateLimit(identifier: string): { success: boolean; resetAt?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { success: true };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { success: false, resetAt: record.resetTime };
  }

  record.count++;
  return { success: true };
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
```

- [ ] **Step 2: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors in integration-service.ts

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/integration-service.ts
git commit -m "feat: add integration service for token generation/validation"
```

---

### Task 3: Add validation schemas

**Files:**
- Modify: `apps/backoffice/lib/validations/ticket-validation.ts`

- [ ] **Step 1: Add token request schema**

Add to the end of the file (before TypeScript exports):

```typescript
// ============================================================================
// Integration Token Schemas
// ============================================================================

export const tokenPurposeEnum = z.enum([
  "create_ticket",
  "view_ticket",
  "list_tickets",
]);

/**
 * Schema for requesting an access token
 */
export const tokenRequestSchema = z.object({
  channelSlug: z.string().min(1, "Channel slug is required"),
  email: z.string().email("Invalid email address"),
  purpose: tokenPurposeEnum,
  ticketId: z.string().optional(),
}).refine(
  (data) => {
    // ticketId is required for view_ticket purpose
    if (data.purpose === "view_ticket" && !data.ticketId) {
      return false;
    }
    return true;
  },
  {
    message: "ticketId is required for view_ticket purpose",
    path: ["ticketId"],
  }
);
```

Also add to TypeScript exports at the end:

```typescript
export type TokenRequestInput = z.infer<typeof tokenRequestSchema>;
```

- [ ] **Step 2: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/lib/validations/ticket-validation.ts
git commit -m "feat: add token request validation schema"
```

---

## Chunk 2: Token API Endpoint

### Task 4: Create token generation endpoint

**Files:**
- Create: `apps/backoffice/app/api/integrated/auth/token/route.ts`

- [ ] **Step 1: Create the token API endpoint**

```typescript
/**
 * Token Generation API Route
 * POST /api/integrated/auth/token
 *
 * Generates a signed JWT token for external app integration.
 * The token allows external apps to securely access backoffice pages.
 *
 * Rate limiting: 10 requests per minute per channel slug
 *
 * Request body:
 * {
 *   "channelSlug": "support",
 *   "email": "user@example.com",
 *   "purpose": "create_ticket" | "view_ticket" | "list_tickets",
 *   "ticketId": "xxx" (required for view_ticket)
 * }
 *
 * Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "expiresIn": 1800
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { tokenRequestSchema } from "@/lib/validations/ticket-validation";
import { generateAccessToken, checkRateLimit, cleanupRateLimits } from "@/lib/services/ticketing/integration-service";

// Clean up rate limits periodically (every request is fine for low traffic)
cleanupRateLimits();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = tokenRequestSchema.parse(body);

    // Rate limiting by channel slug
    const rateLimitKey = `${validated.channelSlug}:${validated.email}`;
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.success) {
      const resetAt = rateLimit.resetAt ? new Date(rateLimit.resetAt) : null;
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many token requests. Please try again later.",
          resetAt: resetAt?.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Reset": rateLimit.resetAt ? String(rateLimit.resetAt) : "",
            "Retry-After": rateLimit.resetAt ? String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) : "60",
          },
        }
      );
    }

    // Generate token
    const result = await generateAccessToken(
      validated.channelSlug,
      validated.email,
      validated.purpose,
      validated.ticketId
    );

    return NextResponse.json(
      {
        token: result.token,
        expiresIn: result.expiresIn,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: (error as { errors: unknown[] }).errors,
        },
        { status: 400 }
      );
    }

    console.error("Error generating token:", error);

    // Handle known errors
    if (error instanceof Error) {
      const errorMap: Record<string, { code: string; message: string; status: number }> = {
        CHANNEL_NOT_FOUND: { code: "CHANNEL_NOT_FOUND", message: "Channel not found or inactive", status: 404 },
        CHANNEL_INACTIVE: { code: "CHANNEL_INACTIVE", message: "Channel is not active", status: 400 },
        INVALID_CHANNEL_TYPE: { code: "INVALID_CHANNEL_TYPE", message: "Invalid channel type", status: 400 },
        CHANNEL_NO_API_KEY: { code: "CHANNEL_NO_API_KEY", message: "Channel not configured for API access", status: 500 },
        TICKET_ID_REQUIRED: { code: "TICKET_ID_REQUIRED", message: "ticketId is required for view_ticket purpose", status: 400 },
        TICKET_NOT_FOUND: { code: "TICKET_NOT_FOUND", message: "Ticket not found", status: 404 },
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        return NextResponse.json(
          {
            error: mapped.code,
            message: mapped.message,
          },
          { status: mapped.status }
        );
      }
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Failed to generate token",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors

- [ ] **Step 3: Test the endpoint manually**

Run:
```bash
curl -X POST http://localhost:3100/api/integrated/auth/token \
  -H "Content-Type: application/json" \
  -d '{"channelSlug":"support","email":"test@example.com","purpose":"list_tickets"}'
```

Expected:
```json
{"error":"CHANNEL_NOT_FOUND","message":"Channel not found or inactive"}
```
(Because we haven't seeded the channel with a slug yet)

- [ ] **Step 4: Commit**

```bash
git add apps/backoffice/app/api/integrated/auth/token/route.ts
git commit -m "feat: add token generation endpoint with rate limiting"
```

---

## Chunk 3: List Tickets by Email

### Task 5: Modify integrated tickets API to support email filter

**Files:**
- Modify: `apps/backoffice/app/api/integrated/tickets/route.ts`

- [ ] **Step 1: Add email-based filtering**

Replace the GET handler to support both `externalUserId` and `email`:

```typescript
/**
 * GET /api/integrated/tickets - List tickets for an external user
 *
 * Headers:
 *   X-API-Key: <your_channel_api_key>
 *
 * Query params (one required):
 *   externalUserId: <user_id_from_your_app>  (for backward compatibility)
 *   email: <user_email>                      (new: filter by guest email)
 *   status: Filter by ticket status (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Use X-API-Key header." },
        { status: 401 }
      );
    }

    const channel = await verifyApiKey(apiKey);
    if (!channel) {
      return NextResponse.json(
        { error: "Invalid API key or inactive channel" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const externalUserId = searchParams.get("externalUserId");
    const email = searchParams.get("email");
    const status = searchParams.get("status");

    // Require either externalUserId or email
    if (!externalUserId && !email) {
      return NextResponse.json(
        { error: "Either externalUserId or email is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {
      appId: channel.appId,
      channelId: channel.id,
    };

    if (externalUserId) {
      where.externalUserId = externalUserId;
    } else if (email) {
      where.guestEmail = email;
    }

    if (status) {
      where.status = status;
    }

    // Get tickets
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1,
          where: { isInternal: false }, // Only public messages for preview
        },
        _count: {
          select: {
            messages: {
              where: { isInternal: false } // Exclude internal messages from count
            }
          },
        },
      },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt,
        closedAt: t.closedAt,
        messageCount: t._count.messages,
        lastMessage: t.messages[0]?.message || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching integrated tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
```

Note: The existing `verifyApiKey` function should remain unchanged.

- [ ] **Step 2: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/app/api/integrated/tickets/route.ts
git commit -m "feat: support email filter in integrated tickets list API"
```

---

## Chunk 4: Public Support Pages with Token

### Task 6: Update support ticket creation page to accept token

**Files:**
- Modify: `apps/backoffice/app/support/tickets/new/page.tsx`

- [ ] **Step 1: Add token validation and email pre-fill**

Add token handling to the component. After the existing imports and before the `TicketForm` function, add:

```typescript
// Token validation helper (client-side only, actual validation on server)
async function validateTokenAndGetEmail(token: string): Promise<{ email: string; channelSlug: string } | null> {
  try {
    const res = await fetch(`/api/integrated/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
```

Then modify the `TicketForm` component to handle the token parameter. Update the state section to add token validation:

```typescript
function TicketForm() {
  const searchParams = useSearchParams();
  const appSlug = searchParams.get("app");
  const channelParam = searchParams.get("channel");
  const embed = searchParams.get("embed") === "true";
  const tokenParam = searchParams.get("token"); // NEW

  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false); // NEW

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // Token validation effect
  useEffect(() => {
    if (tokenParam) {
      validateTokenAndGetEmail(tokenParam).then(result => {
        if (result) {
          setTokenValid(true);
          setGuestEmail(result.email);
          // Use channelSlug from token if appSlug not provided
          if (!appSlug) {
            // Fetch app info by channel slug
            fetch(`/api/apps/by-slug/${result.channelSlug}`)
              .then(res => res.ok ? res.json() : Promise.reject())
              .then(data => {
                setAppInfo(data);
                setAppLoading(false);
              })
              .catch(() => {
                setError("Invalid or expired token");
                setAppLoading(false);
              });
          }
        } else {
          setError("Invalid or expired token");
          setAppLoading(false);
        }
      });
    }
  }, [tokenParam, appSlug]);

  // Fetch app info (only if no token)
  useEffect(() => {
    if (appSlug && !tokenParam) {
      // ... existing app fetch logic ...
```

And update the form to show read-only email when token is valid. Find the guest email input section and modify:

```typescript
// In the guest information section, around line 218
<div className="space-y-2">
  <Label htmlFor="guestEmail">
    <Mail className="h-4 w-4 inline mr-1" />
    Email *
  </Label>
  {tokenValid ? (
    <Input
      id="guestEmail"
      type="email"
      value={guestEmail}
      disabled
      className="bg-muted"
    />
  ) : (
    <Input
      id="guestEmail"
      type="email"
      placeholder="your@email.com"
      value={guestEmail}
      onChange={(e) => setGuestEmail(e.target.value)}
      required
    />
  )}
</div>
```

- [ ] **Step 2: Create token validation endpoint**

Create `apps/backoffice/app/api/integrated/validate-token/route.ts`:

```typescript
/**
 * Token Validation API Route (Internal)
 * POST /api/integrated/validate-token
 *
 * Validates a JWT token and returns the extracted email.
 * Used by the support form to pre-fill user information.
 *
 * Request body:
 * {
 *   "token": "jwt_token_string"
 * }
 *
 * Response:
 * {
 *   "email": "user@example.com",
 *   "channelSlug": "support"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify token - any purpose is valid for form access
    const payload = await verifyAccessToken(token);

    return NextResponse.json({
      email: payload.email,
      channelSlug: payload.channelSlug,
    });
  } catch (error) {
    console.error("Error validating token:", error);

    if (error instanceof Error) {
      if (error.message === "TOKEN_EXPIRED") {
        return NextResponse.json(
          { error: "TOKEN_EXPIRED", message: "Token has expired. Please request a new token." },
          { status: 401 }
        );
      }
      if (error.message === "INVALID_TOKEN" || error.message === "INVALID_TOKEN_PURPOSE") {
        return NextResponse.json(
          { error: "INVALID_TOKEN", message: "Invalid token" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/backoffice/app/support/tickets/new/page.tsx apps/backoffice/app/api/integrated/validate-token/route.ts
git commit -m "feat: add token support to support ticket creation page"
```

---

### Task 7: Create public ticket detail page

**Files:**
- Create: `apps/backoffice/app/support/tickets/[id]/page.tsx`
- Create: `apps/backoffice/app/support/tickets/[id]/components/ticket-detail-public.tsx`

- [ ] **Step 1: Create the page component**

```typescript
/**
 * Public Ticket Detail Page
 * /support/tickets/[id]?token=xxx
 *
 * Allows external app users to view ticket details using a signed token.
 * Token validation happens server-side for security.
 */

import { Suspense } from "react";
import { TicketDetailPublic } from "./components/ticket-detail-public";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PublicTicketDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">A valid token is required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <TicketDetailPublic ticketId={id} token={token} />
    </Suspense>
  );
}
```

- [ ] **Step 2: Create the ticket detail component**

```typescript
/**
 * Public Ticket Detail Component
 *
 * Displays ticket details for external app users.
 * Validates token server-side and fetches ticket data.
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, MessageSquare, User, Calendar, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  message: string;
  sender: "CUSTOMER" | "AGENT";
  isInternal: boolean;
  attachments: Array<{ url: string; name: string; type: string; size: number }>;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  assignee?: {
    name: string;
    email: string;
  };
  messages: Message[];
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  RESOLVED: "bg-green-500/10 text-green-500 border-green-500/20",
  CLOSED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  NORMAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface TicketDetailPublicProps {
  ticketId: string;
  token: string;
}

export function TicketDetailPublic({ ticketId, token }: TicketDetailPublicProps) {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/integrated/tickets/${ticketId}?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error === "TOKEN_EXPIRED") {
            setError("Token telah kadaluarsa. Silakan request token baru dari aplikasi.");
          } else if (data.error === "INVALID_TOKEN") {
            setError("Token tidak valid. Akses ditolak.");
          } else if (data.error === "TICKET_NOT_FOUND") {
            setError("Tiket tidak ditemukan.");
          } else {
            setError(data.message || "Gagal memuat tiket.");
          }
          return;
        }

        setTicket(data);
      } catch (err) {
        setError("Terjadi kesalahan saat memuat tiket.");
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [ticketId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Tiket tidak ditemukan"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4" />
              Ticket #{ticket.ticketNumber}
            </div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex flex-wrap gap-2">
          <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
          <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
        </div>

        {/* Description */}
        {ticket.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Percakapan</CardTitle>
            <CardDescription>
              {ticket.messages.length} pesan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "CUSTOMER" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === "CUSTOMER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <User className="h-4 w-4" />
                </div>
                <div className={`flex-1 max-w-[80%] ${message.sender === "CUSTOMER" ? "text-right" : ""}`}>
                  <div className="text-sm text-muted-foreground mb-1">
                    {message.sender === "CUSTOMER"
                      ? "Anda"
                      : message.createdBy?.name || "Support Agent"}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.sender === "CUSTOMER"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          📎 {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Dibuat: {new Date(ticket.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Update: {new Date(ticket.updatedAt).toLocaleDateString("id-ID")}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolved: {new Date(ticket.resolvedAt).toLocaleDateString("id-ID")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Untuk membalas tiket, silakan buka melalui aplikasi Anda.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the ticket detail API endpoint**

Create `apps/backoffice/app/api/integrated/tickets/[id]/route.ts`:

```typescript
/**
 * Public Ticket Detail API Route
 * GET /api/integrated/tickets/[id]?token=xxx
 *
 * Returns ticket details for external app users using a signed token.
 * Token must be valid for the 'view_ticket' purpose.
 *
 * Response includes ticket info and all non-internal messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "TOKEN_REQUIRED", message: "Token is required" },
        { status: 401 }
      );
    }

    // Verify token - must be for view_ticket purpose
    const payload = await verifyAccessToken(token, "view_ticket");

    // Validate ticket belongs to the channel from token
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "TICKET_NOT_FOUND", message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Validate ticket belongs to channel from token
    if (ticket.channelId !== payload.channelId) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch messages (exclude internal)
    const messages = await prisma.ticketMessage.findMany({
      where: {
        ticketId: id,
        isInternal: false,
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Format messages
    const formattedMessages = messages.map((msg) => {
      let createdBy: { name: string; email: string } | undefined;

      if (msg.sender === "AGENT" && msg.user) {
        createdBy = {
          name: msg.user.name || "Support Agent",
          email: msg.user.email,
        };
      } else if (msg.sender === "CUSTOMER") {
        // For customer messages, use guest info from ticket
        createdBy = {
          name: ticket.guestName || "Customer",
          email: ticket.guestEmail || "guest@example.com",
        };
      }

      return {
        id: msg.id,
        message: msg.message,
        sender: msg.sender,
        isInternal: msg.isInternal,
        attachments: msg.attachments as Array<{ url: string; name: string; type: string; size: number }>,
        createdAt: msg.createdAt.toISOString(),
        createdBy,
      };
    });

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString() || null,
      closedAt: ticket.closedAt?.toISOString() || null,
      assignee: ticket.assignee ? {
        name: ticket.assignee.name,
        email: ticket.assignee.email,
      } : undefined,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching ticket detail:", error);

    if (error instanceof Error) {
      if (error.message === "TOKEN_EXPIRED") {
        return NextResponse.json(
          { error: "TOKEN_EXPIRED", message: "Token has expired" },
          { status: 401 }
        );
      }
      if (error.message === "INVALID_TOKEN" || error.message === "INVALID_TOKEN_PURPOSE") {
        return NextResponse.json(
          { error: "INVALID_TOKEN", message: "Invalid token" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Run type check**

Run: `cd apps/backoffice && pnpm check-types`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/app/support/tickets/[id]/ apps/backoffice/app/api/integrated/tickets/[id]/route.ts
git commit -m "feat: add public ticket detail page with token authentication"
```

---

## Chunk 5: Database Migration

### Task 8: Add channel slug and seed API key

**Files:**
- Modify: `apps/backoffice/prisma/seed-ticketing.ts`
- Modify: `apps/backoffice/prisma/schema.prisma` (if needed for slug field)

- [ ] **Step 1: Check if Channel has slug field**

Run: `grep -A 10 "model Channel" apps/backoffice/prisma/schema.prisma`

If there's no `slug` field, add it:
```prisma
model Channel {
  id        String     @id @default(cuid())
  appId     String
  app       App        @relation(fields: [appId], references: [id], onDelete: Cascade)
  type      ChannelType
  name      String
  slug      String?    @unique // NEW: Add this line
  apiKey    String?    @unique
  config    Json
  isActive  Boolean    @default(true)
  tickets   Ticket[]
```

- [ ] **Step 2: Update seed to generate slug and API key**

```typescript
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// Generate API key
function generateApiKey(): string {
  return randomBytes(32).toString("hex");
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedTicketing() {
  console.log("🌱 Seeding ticketing module...\n");

  // Create or update the app
  const app = await prisma.app.upsert({
    where: { slug: "support" },
    update: {},
    create: {
      name: "Support",
      slug: "support",
      description: "General support tickets",
      isActive: true,
    },
  });

  console.log(`✅ App: ${app.slug} (${app.name})`);

  // Check existing channels
  const existingChannels = await prisma.channel.findMany({
    where: { appId: app.id },
  });

  // Create channels if they don't exist
  const channelConfigs = [
    {
      type: "WEB_FORM" as const,
      name: "Website Form",
      slug: "web-form",
      config: { welcomeMessage: "How can we help you today?" },
      isActive: true,
    },
    {
      type: "INTEGRATED_APP" as const,
      name: "In-App Support",
      slug: "app-support", // This will be used by external app
      config: {},
      isActive: true,
    },
  ];

  let createdCount = 0;

  for (const config of channelConfigs) {
    const exists = existingChannels.some(
      (c) => c.type === config.type && c.slug === config.slug
    );

    if (!exists) {
      // Generate API key for INTEGRATED_APP channel
      const apiKey = config.type === "INTEGRATED_APP" ? generateApiKey() : null;

      await prisma.channel.create({
        data: {
          type: config.type,
          name: config.name,
          slug: config.slug,
          apiKey,
          config: config.config,
          isActive: config.isActive,
          appId: app.id,
        },
      });
      console.log(`   ✅ Created channel: ${config.name} (${config.type})`);
      if (apiKey) {
        console.log(`      API Key: ${apiKey}`);
      }
      createdCount++;
    } else {
      console.log(`   ℹ️  Channel already exists: ${config.name} (${config.type})`);
    }
  }

  const allChannels = await prisma.channel.findMany({
    where: { appId: app.id },
  });

  console.log(`\n   Total channels: ${allChannels.length}\n`);

  // Print API keys for INTEGRATED_APP channels
  const integratedChannels = allChannels.filter(c => c.type === "INTEGRATED_APP");
  if (integratedChannels.length > 0) {
    console.log("   🔑 API Keys for INTEGRATED_APP channels:");
    integratedChannels.forEach(ch => {
      console.log(`      ${ch.slug}: ${ch.apiKey}`);
    });
    console.log("");
  }

  console.log("🎉 Ticketing seeding completed!\n");
}

seedTicketing()
  .catch((e) => {
    console.error("❌ Error seeding ticketing:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Run migration (if schema changed)**

Run: `cd apps/backoffice && pnpm --filter backoffice db:push`

- [ ] **Step 4: Re-seed ticketing data**

Run: `cd apps/backoffice && pnpm --filter backoffice db:seed:ticketing`

Expected: Output showing API key for app-support channel

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/prisma/
git commit -m "feat: add channel slug and API key generation"
```

---

## Chunk 6: Testing

### Task 9: Test the complete flow

- [ ] **Step 1: Test token generation**

Run:
```bash
curl -X POST http://localhost:3100/api/integrated/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "channelSlug": "app-support",
    "email": "test@example.com",
    "purpose": "list_tickets"
  }'
```

Expected:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800
}
```

- [ ] **Step 2: Test list tickets by email**

Run (replace TOKEN from step 1):
```bash
curl "http://localhost:3100/api/integrated/tickets?email=test@example.com" \
  -H "X-API-Key: YOUR_API_KEY_FROM_SEED"
```

Expected:
```json
{
  "tickets": []
}
```
(Empty if no tickets for that email yet)

- [ ] **Step 3: Test create ticket page with token**

Open in browser:
```
http://localhost:3100/support/tickets/new?token=YOUR_TOKEN
```

Expected: Form loads with email pre-filled and read-only

- [ ] **Step 4: Test expired token handling**

Create an expired token (modify integration-service.ts temporarily to set expiry to -1 second), then access the page.

Expected: Shows "Token telah kadaluarsa" error message

- [ ] **Step 5: Test rate limiting**

Run token generation 11 times rapidly:

```bash
for i in {1..11}; do
  curl -X POST http://localhost:3100/api/integrated/auth/token \
    -H "Content-Type: application/json" \
    -d '{"channelSlug":"app-support","email":"test@example.com","purpose":"list_tickets"}'
  echo ""
done
```

Expected: First 10 succeed, 11th returns 429 with rate limit error

- [ ] **Step 6: Create end-to-end test**

1. Generate token with `create_ticket` purpose
2. Open `/support/tickets/new?token=xxx` in browser
3. Submit a ticket form
4. Generate token with `view_ticket` purpose + ticketId
5. Open `/support/tickets/{id}?token=xxx` in browser
6. Verify ticket detail page shows the ticket

- [ ] **Step 7: Commit (no changes, just verify)**

```bash
git status
```

---

## Summary

After completing all tasks, the external app integration will have:

1. **Token Generation API**: `POST /api/integrated/auth/token`
2. **List Tickets by Email**: `GET /api/integrated/tickets?email=xxx`
3. **Public Ticket Creation Page**: `/support/tickets/new?token=xxx`
4. **Public Ticket Detail Page**: `/support/tickets/{id}?token=xxx`

### External App Integration Guide

```javascript
// 1. Generate token for listing tickets
const tokenResponse = await fetch('http://backoffice/api/integrated/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelSlug: process.env.BACKOFFICE_CHANNEL_SLUG,
    email: user.email,
    purpose: 'list_tickets'
  })
});
const { token } = await tokenResponse.json();

// 2. List tickets for user
const ticketsResponse = await fetch(`http://backoffice/api/integrated/tickets?email=${user.email}`, {
  headers: { 'X-API-Key': process.env.BACKOFFICE_API_KEY }
});
const { tickets } = await ticketsResponse.json();

// 3. Open create ticket page in new tab
window.open(`http://backoffice/support/tickets/new?token=${token}`, '_blank');

// 4. Open ticket detail page in new tab
const viewTokenResponse = await fetch('http://backoffice/api/integrated/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelSlug: process.env.BACKOFFICE_CHANNEL_SLUG,
    email: user.email,
    purpose: 'view_ticket',
    ticketId: ticketId
  })
});
const { token: viewToken } = await viewTokenResponse.json();
window.open(`http://backoffice/support/tickets/${ticketId}?token=${viewToken}`, '_blank');
```
