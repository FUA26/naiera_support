/**
 * Email Utilities
 *
 * Utilities for sending emails using Resend
 */

import { env } from "@/lib/env";
import { render } from "@react-email/render";
import { ReactElement } from "react";
import { Resend } from "resend";

// Initialize Resend client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Generic email sender function
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}) {
  if (!resend) {
    console.error("Resend not configured. Please set RESEND_API_KEY environment variable.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const emailHtml = await render(react);

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "noreply@yourdomain.com",
      to: Array.isArray(to) ? to : [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  resetLink,
}: {
  to: string;
  userName: string;
  resetLink: string;
}) {
  const subject = "Reset Your Password";

  const react = (
    <html>
      <head />
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                color: "#333333",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Reset Your Password
            </h1>

            <p style={{ color: "#666666", marginBottom: "15px" }}>Hi {userName},</p>

            <p style={{ color: "#666666", marginBottom: "20px" }}>
              We received a request to reset your password. Click the button below to create a new
              password:
            </p>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <a
                href={resetLink}
                style={{
                  backgroundColor: "#007bff",
                  color: "#ffffff",
                  padding: "12px 30px",
                  textDecoration: "none",
                  borderRadius: "5px",
                  display: "inline-block",
                  fontWeight: "bold",
                }}
              >
                Reset Password
              </a>
            </div>

            <p style={{ color: "#666666", fontSize: "14px", marginBottom: "10px" }}>
              Or copy and paste this link into your browser:
            </p>

            <p
              style={{
                color: "#007bff",
                fontSize: "12px",
                wordBreak: "break-all",
                marginBottom: "20px",
              }}
            >
              {resetLink}
            </p>

            <p style={{ color: "#999999", fontSize: "14px", marginBottom: "10px" }}>
              This link will expire in 1 hour.
            </p>

            <p style={{ color: "#999999", fontSize: "14px", marginBottom: "20px" }}>
              If you didn&apos;t request a password reset, you can safely ignore this email.
            </p>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eeeeee",
                margin: "20px 0",
              }}
            />

            <p style={{ color: "#999999", fontSize: "12px", margin: "0" }}>
              © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME || "Naiera"}. All rights
              reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  ) as ReactElement;

  return sendEmail({ to, subject, react });
}

/**
 * Send password reset success email
 */
export async function sendPasswordResetSuccessEmail({
  to,
  userName,
}: {
  to: string;
  userName: string;
}) {
  const subject = "Password Successfully Reset";

  const react = (
    <html>
      <head />
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                color: "#28a745",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Password Successfully Reset
            </h1>

            <p style={{ color: "#666666", marginBottom: "15px" }}>Hi {userName},</p>

            <p style={{ color: "#666666", marginBottom: "20px" }}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <a
                href={`${env.NEXT_PUBLIC_APP_URL}/login`}
                style={{
                  backgroundColor: "#007bff",
                  color: "#ffffff",
                  padding: "12px 30px",
                  textDecoration: "none",
                  borderRadius: "5px",
                  display: "inline-block",
                  fontWeight: "bold",
                }}
              >
                Log In
              </a>
            </div>

            <p style={{ color: "#999999", fontSize: "14px", marginBottom: "20px" }}>
              If you didn&apos;t request this change, please contact support immediately.
            </p>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eeeeee",
                margin: "20px 0",
              }}
            />

            <p style={{ color: "#999999", fontSize: "12px", margin: "0" }}>
              © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME || "Naiera"}. All rights
              reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  ) as ReactElement;

  return sendEmail({ to, subject, react });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail({
  to,
  userName,
  verificationLink,
}: {
  to: string;
  userName: string;
  verificationLink: string;
}) {
  const subject = "Verify Your Email Address";

  const react = (
    <html>
      <head />
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                color: "#333333",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Verify Your Email Address
            </h1>

            <p style={{ color: "#666666", marginBottom: "15px" }}>
              Welcome to {env.NEXT_PUBLIC_APP_NAME || "Naiera"}, {userName}!
            </p>

            <p style={{ color: "#666666", marginBottom: "20px" }}>
              Please verify your email address by clicking the button below:
            </p>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <a
                href={verificationLink}
                style={{
                  backgroundColor: "#007bff",
                  color: "#ffffff",
                  padding: "12px 30px",
                  textDecoration: "none",
                  borderRadius: "5px",
                  display: "inline-block",
                  fontWeight: "bold",
                }}
              >
                Verify Email
              </a>
            </div>

            <p style={{ color: "#666666", fontSize: "14px", marginBottom: "10px" }}>
              Or copy and paste this link into your browser:
            </p>

            <p
              style={{
                color: "#007bff",
                fontSize: "12px",
                wordBreak: "break-all",
                marginBottom: "20px",
              }}
            >
              {verificationLink}
            </p>

            <p style={{ color: "#999999", fontSize: "14px", marginBottom: "20px" }}>
              This link will expire in 24 hours.
            </p>

            <p style={{ color: "#999999", fontSize: "14px", marginBottom: "20px" }}>
              If you didn&apos;t create an account, you can safely ignore this email.
            </p>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eeeeee",
                margin: "20px 0",
              }}
            />

            <p style={{ color: "#999999", fontSize: "12px", margin: "0" }}>
              © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME || "Naiera"}. All rights
              reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  ) as ReactElement;

  return sendEmail({ to, subject, react });
}
