/**
 * Email Sender Utility
 *
 * Handles loading compiled MJML templates and sending emails via Resend.
 * Supports variable interpolation and conditional blocks.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "@/lib/env";
import { ResendEmailService } from "./service/resend";
import type { EmailTemplate, SendOptions, SendResult } from "./types";

// Default variables that are available in all templates
const DEFAULT_VARIABLES = {
  appName: env.NEXT_PUBLIC_APP_NAME,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  footerText: `© ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.`,
};

// Cache for loaded templates
const templateCache = new Map<string, string>();

/**
 * Load a compiled HTML template from disk
 */
async function loadTemplate(templateName: EmailTemplate): Promise<string> {
  // Check cache first
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = join(
    process.cwd(),
    "lib",
    "email",
    "templates",
    `${templateName}.html`
  );

  try {
    const html = await readFile(templatePath, "utf-8");
    templateCache.set(templateName, html);
    return html;
  } catch (error) {
    throw new Error(`Failed to load template: ${templateName}`);
  }
}

/**
 * Check if a value is truthy for conditional rendering
 */
function isTruthy(value: unknown): boolean {
  if (value === undefined || value === null || value === false) {
    return false;
  }
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }
  if (typeof value === "number" && value === 0) {
    return false;
  }
  return true;
}

/**
 * Process conditional blocks in the template
 * Supports {{#if var}}...{{/if}} and {{#ifNot var}}...{{/ifNot}}
 */
function processConditionals(html: string, data: Record<string, unknown>): string {
  // Process {{#if var}}...{{/if}} blocks
  html = html.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (_, varName, content) => {
    return isTruthy(data[varName]) ? content : "";
  });

  // Process {{#ifNot var}}...{{/ifNot}} blocks
  html = html.replace(/\{\{#ifNot\s+(\w+)\}\}(.*?)\{\{\/ifNot\}\}/gs, (_, varName, content) => {
    return !isTruthy(data[varName]) ? content : "";
  });

  return html;
}

/**
 * Interpolate variables into the HTML template
 * Replaces {{variable}} with the corresponding value from data
 */
function interpolateVariables(
  html: string,
  data: Record<string, unknown>
): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const value = data[varName];
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  });
}

/**
 * Render a template with the provided data
 */
function renderTemplate(
  templateHtml: string,
  data: Record<string, unknown>
): string {
  // Merge user data with default variables (user data takes precedence)
  const mergedData = { ...DEFAULT_VARIABLES, ...data };

  // Process conditionals first
  let html = processConditionals(templateHtml, mergedData);

  // Then interpolate variables
  html = interpolateVariables(html, mergedData);

  return html;
}

/**
 * Create the email service instance
 */
function createEmailService(): ResendEmailService {
  return new ResendEmailService(
    env.RESEND_API_KEY || "",
    env.EMAIL_FROM
  );
}

/**
 * Send an email using a compiled MJML template
 *
 * @param templateName - The name of the template to use
 * @param options - Email sending options (to, subject, data, from, replyTo)
 * @returns Promise<SendResult> - Result with success status and optional messageId
 *
 * @example
 * ```ts
 * const result = await sendTemplate("email-verification", {
 *   to: "user@example.com",
 *   subject: "Verify your email",
 *   data: {
 *     userName: "John",
 *     verifyUrl: "https://example.com/verify?token=abc",
 *     expiryHours: 24,
 *   },
 * });
 * ```
 */
export async function sendTemplate(
  templateName: EmailTemplate,
  options: SendOptions
): Promise<SendResult> {
  // Handle missing RESEND_API_KEY in development
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === "development") {
      console.log("📧 [Email Mock] RESEND_API_KEY not set - skipping email send");
      console.log(`  Template: ${templateName}`);
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  Data:`, options.data);
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }
    return {
      success: false,
      error: "RESEND_API_KEY is not configured",
    };
  }

  try {
    // Load the template
    const templateHtml = await loadTemplate(templateName);

    // Render with data
    const renderedHtml = renderTemplate(templateHtml, options.data);

    // Send via Resend
    const service = createEmailService();
    const result = await service.send({
      to: options.to,
      subject: options.subject,
      html: renderedHtml,
      from: options.from,
      replyTo: options.replyTo,
    });

    if (result.success) {
      // Extract message ID from Resend response
      const messageId = extractMessageId(result.data);
      return {
        success: true,
        messageId,
      };
    }

    return {
      success: false,
      error: result.error || "Failed to send email",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract message ID from Resend response
 */
function extractMessageId(data: unknown): string | undefined {
  if (typeof data === "object" && data !== null) {
    const responseData = data as { id?: string };
    return responseData.id;
  }
  return undefined;
}

/**
 * Clear the template cache (useful for testing)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}
