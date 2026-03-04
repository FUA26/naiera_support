# General Settings Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand SystemSettings with site identity, contact info, social media, and footer settings. Create public API for landing page.

**Architecture:**
1. Update Prisma schema with new fields (siteLogo, siteSubtitle, citizenName, contact info, social media, footer)
2. Expand backoffice SystemSettingsForm with tabs and dynamic fields
3. Create public API endpoint for landing
4. Update landing components to fetch from API

**Tech Stack:** Prisma ORM, Next.js 16, React Hook Form, Zod, TypeScript

---

## Task 1: Create Prisma Migration

**Files:**
- Create: `apps/backoffice/prisma/migrations/XXXXXX_general_settings_expansion/migration.sql`

**Step 1: Generate migration**

Run from backoffice directory:
```bash
cd apps/backoffice
npx prisma migrate dev --name general_settings_expansion
```

**Step 2: Edit generated migration file**

Find the generated migration file in `prisma/migrations/` and modify to add:

```sql
-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN "siteLogoId" TEXT,
ADD COLUMN "siteSubtitle" TEXT,
ADD COLUMN "citizenName" TEXT DEFAULT 'Warga',
ADD COLUMN "contactAddress" TEXT,
ADD COLUMN "contactPhones" JSONB,
ADD COLUMN "contactEmails" JSONB,
ADD COLUMN "socialFacebook" TEXT,
ADD COLUMN "socialTwitter" TEXT,
ADD COLUMN "socialInstagram" TEXT,
ADD COLUMN "socialYouTube" TEXT,
ADD COLUMN "copyrightText" TEXT,
ADD COLUMN "versionNumber" TEXT DEFAULT '1.0.0';

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_siteLogoId_key" ON "SystemSettings"("siteLogoId");

-- Add foreign key for siteLogo
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_siteLogoId_fkey" FOREIGN KEY ("siteLogoId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

**Step 3: Apply migration**

```bash
npx prisma migrate deploy
```

**Step 4: Verify schema updated**

```bash
npx prisma generate
```

**Step 5: Commit**

```bash
git add apps/backoffice/prisma/migrations
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat(db): add general settings expansion fields

- Add siteLogoId, siteSubtitle, citizenName
- Add contactAddress, contactPhones, contactEmails (JSON)
- Add social media links (Facebook, Twitter, Instagram, YouTube)
- Add copyrightText, versionNumber

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Update Validation Schemas

**Files:**
- Modify: `apps/backoffice/lib/validations/system-settings.ts`

**Step 1: Update systemSettingsSchema**

Replace entire file content:

```typescript
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
  siteLogoId: z.string().cuid().optional(),
  siteSubtitle: z.string().max(100).optional(),
  citizenName: z.string().max(50).optional(),

  // Contact Info (new)
  contactAddress: z.string().optional(),
  contactPhones: z.array(z.string().max(50)).optional(),
  contactEmails: z.array(z.string().email().max(100)).optional(),

  // Social Media (new)
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialYouTube: z.string().url().optional().or(z.literal("")),

  // Footer (new)
  copyrightText: z.string().max(200).optional(),
  versionNumber: z.string().max(20).optional(),
});

export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;

// Public-facing settings (safe to expose)
export const publicSettingsSchema = z.object({
  siteName: z.string(),
  siteSubtitle: z.string().nullable(),
  siteDescription: z.string().nullable(),
  siteLogoUrl: z.string().url().nullable(),
  citizenName: z.string().nullable(),
  contactAddress: z.string().nullable(),
  contactPhones: z.array(z.string()),
  contactEmails: z.array(z.string()),
  socialFacebook: z.string().nullable(),
  socialTwitter: z.string().nullable(),
  socialInstagram: z.string().nullable(),
  socialYouTube: z.string().nullable(),
  copyrightText: z.string().nullable(),
  versionNumber: z.string().nullable(),
});

export type PublicSettings = z.infer<typeof publicSettingsSchema>;
```

**Step 2: Verify TypeScript compiles**

```bash
cd apps/backoffice && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/backoffice/lib/validations/system-settings.ts
git commit -m "feat(validations): expand system settings validation schema

- Add site identity, contact, social media, footer fields
- Support empty strings for social media URLs
- Add PublicSettings type for API response

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Update System Settings API

**Files:**
- Modify: `apps/backoffice/app/api/system-settings/route.ts`

**Step 1: Read existing implementation**

Current implementation handles PUT for updating settings. Need to expand to include new fields.

**Step 2: Update PUT handler**

Modify the handler to accept new fields. Find the data processing section and add:

```typescript
// After existing field processing, add:
const siteLogoId = body.siteLogoId ?? currentSettings.siteLogoId;
const siteSubtitle = body.siteSubtitle ?? currentSettings.siteSubtitle;
const citizenName = body.citizenName ?? currentSettings.citizenName;
const contactAddress = body.contactAddress ?? currentSettings.contactAddress;
const contactPhones = body.contactPhones ?? currentSettings.contactPhones;
const contactEmails = body.contactEmails ?? currentSettings.contactEmails;
const socialFacebook = body.socialFacebook ?? currentSettings.socialFacebook;
const socialTwitter = body.socialTwitter ?? currentSettings.socialTwitter;
const socialInstagram = body.socialInstagram ?? currentSettings.socialInstagram;
const socialYouTube = body.socialYouTube ?? currentSettings.socialYouTube;
const copyrightText = body.copyrightText ?? currentSettings.copyrightText;
const versionNumber = body.versionNumber ?? currentSettings.versionNumber;

// Update the prisma.systemSettings.update call to include these fields
```

**Step 3: Verify TypeScript compiles**

```bash
cd apps/backoffice && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/system-settings/route.ts
git commit -m "feat(api): expand system settings update handler

- Handle new fields: siteLogoId, siteSubtitle, citizenName
- Handle contact info: address, phones, emails
- Handle social media and footer fields

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Create Public Settings API

**Files:**
- Create: `apps/backoffice/app/api/public/settings/route.ts`

**Step 1: Create public API endpoint**

```typescript
/**
 * Public Settings API Route
 *
 * GET /api/public/settings - Get public-facing settings (no auth, CORS enabled)
 */

import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * GET /api/public/settings
 * Get public-facing settings (no auth required)
 */
export const GET = async () => {
  try {
    const settings = await prisma.systemSettings.findFirst({
      include: {
        siteLogo: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Build response with logo URL
    const response = {
      siteName: settings.siteName,
      siteSubtitle: settings.siteSubtitle || null,
      siteDescription: settings.siteDescription,
      siteLogoUrl: settings.siteLogo?.cdnUrl || null,
      citizenName: settings.citizenName || "Warga",
      contactAddress: settings.contactAddress || null,
      contactPhones: settings.contactPhones as string[] || null,
      contactEmails: settings.contactEmails as string[] || null,
      socialFacebook: settings.socialFacebook || null,
      socialTwitter: settings.socialTwitter || null,
      socialInstagram: settings.socialInstagram || null,
      socialYouTube: settings.socialYouTube || null,
      copyrightText: settings.copyrightText || null,
      versionNumber: settings.versionNumber || "1.0.0",
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
```

**Step 2: Verify TypeScript compiles**

```bash
cd apps/backoffice && npx tsc --noEmit
```

**Step 3: Test API manually**

```bash
curl http://localhost:3001/api/public/settings
```

Expected: JSON with settings data

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/public/settings/route.ts
git commit -m "feat(api): add public settings endpoint

- No auth required, CORS enabled
- Returns site identity, contact, social media, footer settings
- Includes logo CDN URL

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Update System Settings Form UI

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/manage/system-settings/system-settings-form.tsx`

**Step 1: Add imports**

Add to imports:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, TrashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
```

**Step 2: Update interface**

Add to `SystemSettingsData` interface:
```typescript
interface SystemSettingsData {
  // ... existing fields ...
  siteLogoId?: string | null;
  siteLogo?: { id: string; cdnUrl: string } | null;
  siteSubtitle?: string | null;
  citizenName?: string | null;
  contactAddress?: string | null;
  contactPhones?: string[] | null;
  contactEmails?: string[] | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialYouTube?: string | null;
  copyrightText?: string | null;
  versionNumber?: string | null;
}
```

**Step 3: Update form default values**

Add to defaultValues in useForm:
```typescript
siteLogoId: "",
siteSubtitle: "",
citizenName: "Warga",
contactAddress: "",
contactPhones: [],
contactEmails: [],
socialFacebook: "",
socialTwitter: "",
socialInstagram: "",
socialYouTube: "",
copyrightText: "",
versionNumber: "1.0.0",
```

**Step 4: Add field arrays for dynamic fields**

```typescript
const phonesArray = useFieldArray({
  control: form.control,
  name: "contactPhones" as any,
});

const emailsArray = useFieldArray({
  control: form.control,
  name: "contactEmails" as any,
});
```

**Step 5: Wrap form in Tabs**

Replace the form content with tabbed structure. See design doc for full implementation.

**Step 6: Verify TypeScript compiles**

```bash
cd apps/backoffice && npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/system-settings/system-settings-form.tsx
git commit -m "feat(ui): add tabbed system settings form

- Separate tabs: Registration, Security, Site Identity, Contact, Social, Footer
- Dynamic add/remove for phones and emails
- File upload for site logo

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Create Landing Settings Data Fetcher

**Files:**
- Create: `apps/landing/lib/settings-data.ts`

**Step 1: Create settings data module**

```typescript
/**
 * Public Settings Data Module
 *
 * Fetches public settings from Backoffice API
 */

export interface PublicSettings {
  siteName: string;
  siteSubtitle: string | null;
  siteDescription: string | null;
  siteLogoUrl: string | null;
  citizenName: string;
  contactAddress: string | null;
  contactPhones: string[] | null;
  contactEmails: string[] | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYouTube: string | null;
  copyrightText: string | null;
  versionNumber: string | null;
}

const BACKOFFICE_API_URL = process.env.BACKOFFICE_API_URL || 'http://localhost:3001';

const cache = new Map<string, { data: PublicSettings; expires: number }>();
const CACHE_DURATION = 300; // 5 minutes

export async function getPublicSettings(): Promise<PublicSettings> {
  const cached = cache.get('settings');
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const response = await fetch(`${BACKOFFICE_API_URL}/api/public/settings`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set('settings', {
      data,
      expires: Date.now() + CACHE_DURATION * 1000,
    });

    return data;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    // Return defaults
    return {
      siteName: 'Super App Naiera',
      siteSubtitle: 'Kabupaten Naiera',
      siteDescription: null,
      siteLogoUrl: null,
      citizenName: 'Warga Naiera',
      contactAddress: null,
      contactPhones: null,
      contactEmails: null,
      socialFacebook: null,
      socialTwitter: null,
      socialInstagram: null,
      socialYouTube: null,
      copyrightText: null,
      versionNumber: '1.0.0',
    };
  }
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd apps/landing && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/landing/lib/settings-data.ts
git commit -m "feat(landing): add public settings fetcher

- Fetch settings from backoffice API
- 5-minute cache with fallback to defaults
- Type-safe PublicSettings interface

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Update Landing Layout

**Files:**
- Modify: `apps/landing/app/layout.tsx`

**Step 1: Import settings fetcher**

```typescript
import { getPublicSettings } from "@/lib/settings-data";
```

**Step 2: Fetch settings in layout**

```typescript
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const settings = await getPublicSettings(); // Add this

  return (
    <html lang={locale} className="light">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers settings={settings}> {/* Pass settings */}
            <NuqsAdapter>{children}</NuqsAdapter>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 3: Update Providers to accept settings**

Modify `Providers` component to receive and pass settings to context.

**Step 4: Verify TypeScript compiles**

```bash
cd apps/landing && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add apps/landing/app/layout.tsx
git add apps/landing/components/providers/index.tsx
git commit -m "feat(landing): fetch and pass settings to providers

- Fetch settings server-side in layout
- Pass to Providers for global access
- Prepare for SettingsContext

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Update Landing Header

**Files:**
- Modify: `apps/landing/components/landing/layout/landing-header.tsx`

**Step 1: Accept settings as prop**

```typescript
interface HeaderProps {
  servicesByCategory?: Array<ServiceCategory & { services: any[] }>;
  settings?: {
    siteName: string;
    siteSubtitle: string;
    siteLogoUrl: string | null;
  };
}
```

**Step 2: Use settings instead of translations**

Update header to use `settings?.siteName` instead of `t("brandName")`, etc.

**Step 3: Update logo to use settings.siteLogoUrl**

```typescript
<Image
  src={settings?.siteLogoUrl || "/naiera.png"}
  alt={settings?.siteName || "Naiera"}
  fill
  className="object-contain p-1.5"
/>
```

**Step 4: Commit**

```bash
git add apps/landing/components/landing/layout/landing-header.tsx
git commit -m "feat(landing): use settings for header branding

- Use siteName, siteSubtitle, siteLogoUrl from settings
- Fallback to defaults if not available

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Update Landing Footer

**Files:**
- Modify: `apps/landing/components/landing/layout/landing-footer.tsx`

**Step 1: Accept settings prop**

```typescript
interface FooterProps {
  settings?: PublicSettings;
}
```

**Step 2: Use settings in footer**

Replace hardcoded values with settings:
- Contact address, phones, emails
- Social media links
- Copyright text
- Version number

**Step 3: Commit**

```bash
git add apps/landing/components/landing/layout/landing-footer.tsx
git commit -m "feat(landing): use settings for footer

- Use contact info from settings
- Use social media links from settings
- Use copyright and version from settings

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Update Top Bar

**Files:**
- Modify: `apps/landing/components/landing/layout/top-bar.tsx`

**Step 1: Accept settings prop**

```typescript
interface TopBarProps {
  settings?: PublicSettings;
}
```

**Step 2: Use citizenName in greeting**

```typescript
{t(`greeting.${greetingKey}`)}, {settings?.citizenName || t("citizen")}
```

**Step 3: Commit**

```bash
git add apps/landing/components/landing/layout/top-bar.tsx
git commit -m "feat(landing): use citizenName from settings

- Use settings.citizenName in greeting

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

This implementation:
1. Expands SystemSettings with 13 new fields
2. Creates public API endpoint for landing
3. Updates backoffice UI with tabbed form
4. Integrates settings into landing page components

All changes follow existing patterns and maintain backward compatibility.
