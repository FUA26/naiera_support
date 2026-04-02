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
import { SignJWT, jwtVerify, decodeJwt } from "jose";

const TOKEN_EXPIRY_MINUTES = 30;
const TOKEN_ISSUER = "naiera-support";

// Secret key for signing (will use channel API key)
type TokenPurpose = "create_ticket" | "view_ticket" | "list_tickets";

export interface TokenPayload {
  email?: string; // Optional: email-based identification
  externalUserId?: string; // Optional: external user ID-based identification
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

// Type for Channel with relations
type ChannelWithApp = {
  id: string;
  appId: string;
  type: string;
  name: string;
  apiKey: string | null;
  isActive: boolean;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
  app: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
};

// Type for Channel with slug (for when schema is updated)
// Currently using apiKey as slug until Task 8 adds the slug field

/**
 * Generate a signed JWT token for external app access
 *
 * @param channelSlug - Channel identifier from external app config (currently uses apiKey)
 * @param identifier - Email or externalUserId for ticket filtering
 * @param purpose - What the token will be used for
 * @param ticketId - Required for view_ticket purpose
 * @param identifierType - Type of identifier ('email' or 'externalUserId')
 * @returns Signed JWT token
 * @throws Error if channel not found or inactive
 */
export async function generateAccessToken(
  channelSlug: string,
  identifier: string,
  purpose: TokenPurpose,
  ticketId?: string,
  identifierType: "email" | "externalUserId" = "email"
): Promise<GeneratedToken> {
  // Validate channel exists and is active via slug
  const channel = await prisma.channel.findFirst({
    where: {
      slug: channelSlug,
      isActive: true,
    },
    include: { app: true },
  }) as ChannelWithApp | null;

  if (!channel) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  if (!channel.app.isActive) {
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

  // Build payload - include identifier type for proper filtering
  const payload: TokenPayload = {
    channelId: channel.id,
    channelSlug: (channel as any).slug || channelSlug, // Store slug for reference
    appId: channel.appId,
    purpose,
  };

  // Set the appropriate identifier field
  if (identifierType === "externalUserId") {
    payload.externalUserId = identifier;
  } else {
    payload.email = identifier;
  }

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
    // First, decode the token without verification to get the channel ID
    const decoded = decodeJwt(token);
    const channelId = decoded.aud as string;

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
      email: verifiedPayload.email as string | undefined,
      externalUserId: verifiedPayload.externalUserId as string | undefined,
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
  const keysToDelete: string[] = [];

  rateLimitMap.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    rateLimitMap.delete(key);
  });
}
