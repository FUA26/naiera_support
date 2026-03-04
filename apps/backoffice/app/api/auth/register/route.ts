/**
 * Registration API Route
 *
 * POST /api/auth/register - Register a new user
 */

import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { createSecureToken } from "@/lib/tokens";
import { registerSchema } from "@/lib/validations/auth";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/register
 * Register a new user
 */
export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Get system settings
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "System settings not configured",
        },
        { status: 500 }
      );
    }

    // Check if registration is allowed
    if (!settings.allowRegistration) {
      return NextResponse.json(
        {
          error: "Registration Disabled",
          message: "Public registration is currently disabled",
        },
        { status: 403 }
      );
    }

    // Validate password length against system settings
    if (validatedData.password.length < settings.minPasswordLength) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: `Password must be at least ${settings.minPasswordLength} characters`,
        },
        { status: 400 }
      );
    }

    // Check if email already exists (but don't reveal this for security)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // Always return success to prevent email enumeration
      // But log the attempt
      console.log(`[Auth] Registration attempt with existing email: ${validatedData.email}`);

      // Return generic success message
      return NextResponse.json(
        {
          message: settings.requireEmailVerification
            ? "Registration successful. Please check your email to verify your account."
            : "Registration successful.",
          requireEmailVerification: settings.requireEmailVerification,
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        roleId: settings.defaultUserRoleId,
        emailVerified: settings.requireEmailVerification ? null : new Date(),
      },
    });

    // Send verification email if required
    if (settings.requireEmailVerification) {
      // Generate verification token
      const { token, hashed, expires } = createSecureToken(settings.emailVerificationExpiryHours);

      // Store verification token
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: hashed,
          expires,
        },
      });

      // Send verification email
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

      try {
        await sendVerificationEmail({
          to: user.email,
          userName: user.name || user.email,
          verificationLink: verificationUrl,
        });

        console.log(`[Auth] Verification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("[Auth] Failed to send verification email:", emailError);

        // Continue anyway - user is created, they can request a new email
      }
    }

    console.log(`[Auth] New user registered: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        message: settings.requireEmailVerification
          ? "Registration successful. Please check your email to verify your account."
          : "Registration successful. You can now log in.",
        requireEmailVerification: settings.requireEmailVerification,
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: "errors" in error ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      // Always return generic success to prevent email enumeration
      console.log(`[Auth] Registration attempt with existing email`);

      // Get settings to determine the message
      const settings = await prisma.systemSettings.findFirst();

      return NextResponse.json(
        {
          message: settings?.requireEmailVerification
            ? "Registration successful. Please check your email to verify your account."
            : "Registration successful.",
          requireEmailVerification: settings?.requireEmailVerification || false,
        },
        { status: 200 }
      );
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("[Auth] Registration error:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message,
      },
      { status: 500 }
    );
  }
};
