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
import { ZodError } from "zod";
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
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
