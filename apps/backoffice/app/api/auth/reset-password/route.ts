/**
 * Reset Password API Route
 *
 * POST /api/auth/reset-password - Reset password with valid token
 */

import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetSuccessEmail } from "@/lib/email";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Resets user password with valid token
 * - Validates request body
 * - Verifies token exists and hasn't expired
 * - Hashes new password
 * - Clears reset token
 * - Sends confirmation email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const { token } = body as { token: string };
    const { password } = validatedData;

    if (!token) {
      return NextResponse.json(
        { error: "Bad Request", message: "Reset token is required" },
        { status: 400 }
      );
    }

    // Hash the token to match with stored token
    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid Token",
          message: "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(user.passwordResetExpires)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return NextResponse.json(
        {
          error: "Expired Token",
          message: "Reset token has expired. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Send confirmation email
    await sendPasswordResetSuccessEmail({
      to: user.email,
      userName: user.name ?? user.email?.split("@")[0] ?? "User",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
