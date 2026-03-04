/**
 * Email Verification API Route
 *
 * POST /api/auth/verify-email - Verify email with token
 */

import { prisma } from "@/lib/db/prisma";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid token",
        },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: "Invalid Token",
          message: "The verification token is invalid or has already been used",
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(verificationToken.expires)) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          token: hashedToken,
        },
      });

      return NextResponse.json(
        {
          error: "Expired Token",
          message: "The verification token has expired. Please request a new one",
        },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User Not Found",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      // Delete the token anyway
      await prisma.verificationToken.delete({
        where: {
          token: hashedToken,
        },
      });

      return NextResponse.json(
        {
          message: "Email already verified",
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the verification token (one-time use)
    await prisma.verificationToken.delete({
      where: {
        token: hashedToken,
      },
    });

    console.log(`[Auth] Email verified successfully: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        message: "Email verified successfully",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email verification failed";
    console.error("[Auth] Email verification error:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message,
      },
      { status: 500 }
    );
  }
};
