import { z } from "zod";

export const systemSettingsSchema = z.object({
  // Registration & Security (existing)
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  defaultUserRoleId: z.string().cuid(),
  emailVerificationExpiryHours: z.number().int().min(1).max(168),
  minPasswordLength: z.number().int().min(6).max(128),
  requireStrongPassword: z.boolean(),

  // Site Identity (existing + new)
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().max(500).optional(),
  siteLogoId: z.union([z.literal(""), z.string().cuid()]).optional(),
  siteSubtitle: z.string().max(100).optional(),
  citizenName: z.string().max(50).optional(),
  heroBackgroundId: z.union([z.literal(""), z.string().cuid()]).optional(),

  // Contact Info (new)
  contactAddress: z.string().optional(),
  contactPhones: z.array(z.string().max(50)),
  contactEmails: z.array(z.string().email().max(100)),

  // Social Media (new) - optional URLs (empty string or valid URL)
  socialFacebook: z.union([z.literal(""), z.string().url()]).optional(),
  socialTwitter: z.union([z.literal(""), z.string().url()]).optional(),
  socialInstagram: z.union([z.literal(""), z.string().url()]).optional(),
  socialYouTube: z.union([z.literal(""), z.string().url()]).optional(),

  // Footer (new)
  copyrightText: z.string().max(200).optional(),
  versionNumber: z.string().max(20).optional(),
});

// Type definition for the form - explicitly defining array types as mutable
export interface SystemSettingsInput {
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRoleId: string;
  emailVerificationExpiryHours: number;
  minPasswordLength: number;
  requireStrongPassword: boolean;
  siteName: string;
  siteDescription?: string;
  siteLogoId?: string;
  siteSubtitle?: string;
  citizenName?: string;
  heroBackgroundId?: string;
  contactAddress?: string;
  contactPhones: string[];
  contactEmails: string[];
  socialFacebook?: string | "";
  socialTwitter?: string | "";
  socialInstagram?: string | "";
  socialYouTube?: string | "";
  copyrightText?: string;
  versionNumber?: string;
}

// Public-facing settings (safe to expose)
export const publicSettingsSchema = z.object({
  siteName: z.string(),
  siteSubtitle: z.string().nullable(),
  siteDescription: z.string().nullable(),
  siteLogoUrl: z.string().url().or(z.literal("")).or(z.literal(null)).nullable(),
  citizenName: z.string(),
  contactAddress: z.string().nullable(),
  contactPhones: z.array(z.string()),
  contactEmails: z.array(z.string()),
  socialFacebook: z.string().nullable(),
  socialTwitter: z.string().nullable(),
  socialInstagram: z.string().nullable(),
  socialYouTube: z.string().nullable(),
  copyrightText: z.string().nullable(),
  versionNumber: z.string().nullable(),
  heroBackgroundUrl: z.string().url().or(z.literal("")).or(z.literal(null)).nullable(),
});

export type PublicSettings = z.infer<typeof publicSettingsSchema>;
