import { z } from "zod";

/**
 * App Validation Schemas
 */
export const createAppSchema = z.object({
  name: z.string().min(2, "App name must be at least 2 characters").max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateAppSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Channel Validation Schemas
 */
export const createChannelSchema = z.object({
  appId: z.string().cuid(),
  name: z.string().min(2, "Channel name must be at least 2 characters").max(100),
  type: z.enum(["WEB_FORM", "PUBLIC_LINK", "WIDGET", "INTEGRATED_APP", "WHATSAPP", "TELEGRAM"], {
    errorMap: () => ({ message: "Invalid channel type" }),
  }),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const updateChannelSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(["WEB_FORM", "PUBLIC_LINK", "WIDGET", "INTEGRATED_APP", "WHATSAPP", "TELEGRAM"]).optional(),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});
