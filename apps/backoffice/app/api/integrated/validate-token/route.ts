/**
 * Token Validation API Route
 * POST /api/integrated/validate-token
 *
 * Validates a JWT access token and returns user info and channel info.
 * This endpoint is used by the support ticket creation page to pre-fill
 * the user's information when accessed via an external app integration.
 *
 * Request body:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Response (email-based):
 * {
 *   "email": "user@example.com",
 *   "channelSlug": "support",
 *   "appId": "xxx"
 * }
 *
 * Response (externalUserId-based):
 * {
 *   "externalUserId": "user_123",
 *   "channelSlug": "support",
 *   "appId": "xxx"
 * }
 *
 * Error response:
 * {
 *   "error": "TOKEN_EXPIRED",
 *   "message": "Token has expired"
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
        {
          error: "INVALID_REQUEST",
          message: "Token is required",
        },
        { status: 400 }
      );
    }

    // Verify token - accepts any purpose for form access
    const payload = await verifyAccessToken(token);

    // Return appropriate data based on identifier type
    const responseData: {
      email?: string;
      externalUserId?: string;
      externalUserName?: string;
      channelSlug: string;
      appId: string;
    } = {
      channelSlug: payload.channelSlug,
      appId: payload.appId,
    };

    if (payload.externalUserId) {
      responseData.externalUserId = payload.externalUserId;
    } else if (payload.email) {
      responseData.email = payload.email;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error validating token:", error);

    // Handle known errors
    if (error instanceof Error) {
      const errorMap: Record<string, { code: string; message: string; status: number }> = {
        TOKEN_EXPIRED: { code: "TOKEN_EXPIRED", message: "Token has expired. Please request a new access link.", status: 401 },
        INVALID_TOKEN: { code: "INVALID_TOKEN", message: "Invalid token. Please request a new access link.", status: 401 },
        INVALID_TOKEN_PURPOSE: { code: "INVALID_TOKEN_PURPOSE", message: "Token is not valid for this action.", status: 403 },
        CHANNEL_NOT_FOUND: { code: "CHANNEL_NOT_FOUND", message: "Channel not found or inactive", status: 404 },
        CHANNEL_INACTIVE: { code: "CHANNEL_INACTIVE", message: "Channel is not active", status: 400 },
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
        message: "Failed to validate token",
      },
      { status: 500 }
    );
  }
}
