/**
 * Forgot Password API Route
 *
 * POST /api/auth/forgot-password - Send password reset email
 */

import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { createSecureToken } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 * - Validates email format
 * - Generates secure reset token
 * - Stores token in database
 * - Sends reset email
 * - Always returns success (for security - don't reveal if email exists)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Always return success, even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with that email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate secure reset token
    const { token, hashed, expires } = createSecureToken(1); // 1 hour expiration

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashed,
        passwordResetExpires: expires,
      },
    });

    // Generate reset link
    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // Send reset email
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name ?? user.email?.split("@")[0] ?? "User",
      resetLink,
    });

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process request" },
      { status: 500 }
    );
  }
}
