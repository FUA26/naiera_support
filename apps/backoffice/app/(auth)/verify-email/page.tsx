/**
 * Email Verification Page
 *
 * Page for verifying user email from email link
 * Server-side validates token and shows appropriate message
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
  };
}

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

async function verifyToken(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch {
    return { success: false, data: null };
  }
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams.token;

  // If no token provided, show error
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Invalid Verification Link</h1>
          <p className="text-muted-foreground">
            The verification link is invalid. Please make sure you clicked the correct link from
            your email.
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Register
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Verify token on server
  const result = await verifyToken(token);

  // Success - already verified
  if (result.success && result.data?.alreadyVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Already Verified</h1>
          <p className="text-muted-foreground">
            Your email has already been verified. You can now log in to your account.
          </p>
        </div>

        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Login
        </a>
      </div>
    );
  }

  // Success
  if (result.success) {
    // Auto-redirect to login after 3 seconds
    setTimeout(() => {
      redirect("/login?verified=true");
    }, 3000);

    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been successfully verified. You can now log in to your account.
          </p>
        </div>

        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Login
        </a>

        <p className="text-xs text-muted-foreground">Redirecting automatically in 3 seconds...</p>
      </div>
    );
  }

  // Error
  const errorMessage = result.data?.error || "Verification Failed";
  const message = result.data?.message || "The verification link is invalid or has expired";

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{errorMessage}</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-4">
        <a
          href="/register"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Register
        </a>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
