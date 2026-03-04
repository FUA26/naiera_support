# General Settings Expansion Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand SystemSettings to include site identity, contact info, social media, and footer settings. Create public API for landing page to consume.

**Architecture:**
1. Update Prisma schema with new fields
2. Expand backoffice SystemSettingsForm with tabs and dynamic fields
3. Create public API endpoint
4. Update landing components to fetch from API

**Tech Stack:** Prisma ORM, Next.js 16, React Hook Form, Zod

---

## Database Schema Changes

```prisma
model SystemSettings {
  // Existing fields...
  id, allowRegistration, requireEmailVerification, defaultUserRoleId,
  emailVerificationExpiryHours, siteName, siteDescription,
  minPasswordLength, requireStrongPassword, createdAt, updatedAt

  // NEW: Site Identity
  siteLogoId       String?           @unique
  siteLogo         File?             @relation("SiteLogo", fields: [siteLogoId], references: [id])
  siteSubtitle     String?
  citizenName      String?  @default("Warga")

  // NEW: Contact Info
  contactAddress   String?
  contactPhones    Json?
  contactEmails    Json?

  // NEW: Social Media
  socialFacebook   String?
  socialTwitter    String?
  socialInstagram  String?
  socialYouTube    String?

  // NEW: Footer
  copyrightText    String?
  versionNumber    String?  @default("1.0.0")
}
```

---

## API Routes

### Public Settings Endpoint

**GET /api/public/settings** - No auth required

Response:
```json
{
  "siteName": "Super App Naiera",
  "siteSubtitle": "Kabupaten Naiera",
  "siteDescription": "...",
  "siteLogoUrl": "https://cdn.example.com/logo.png",
  "citizenName": "Warga Naiera",
  "contactAddress": "Jl. ...",
  "contactPhones": ["(021) 1234-5678"],
  "contactEmails": ["info@naiera.go.id"],
  "socialFacebook": "https://facebook.com/...",
  "socialTwitter": "https://twitter.com/...",
  "socialInstagram": "https://instagram.com/...",
  "socialYouTube": "https://youtube.com/...",
  "copyrightText": "© 2026 ...",
  "versionNumber": "1.0.0"
}
```

---

## Backoffice UI - System Settings Form

**Tab Structure:**

| Tab | Fields |
|-----|-------|
| Registration | allowRegistration, requireEmailVerification, defaultUserRoleId, emailVerificationExpiryHours |
| Security | minPasswordLength, requireStrongPassword |
| Site Identity | siteName, siteLogo (file upload), siteSubtitle, siteDescription, citizenName |
| Contact | contactAddress, contactPhones[], contactEmails[] |
| Social Media | socialFacebook, socialTwitter, socialInstagram, socialYouTube |
| Footer | copyrightText, versionNumber |

**Dynamic Fields (phones/emails):**
- Use `useFieldArray` for add/remove functionality
- Same pattern as service form requirements/process

---

## Landing Page Integration

**New file:** `apps/landing/lib/settings-data.ts`
```typescript
export async function getPublicSettings(): Promise<PublicSettings>
```

**Components to update:**
- `layout.tsx` - Fetch settings server-side, pass to providers
- `landing-header.tsx` - Use settings.brandName, settings.siteLogoUrl
- `top-bar.tsx` - Use settings.citizenName
- `landing-footer.tsx` - Use all contact/social fields

---

## Migration Strategy

1. Create migration for new SystemSettings fields
2. Update validation schemas
3. Update API routes
4. Update backoffice form with tabs
5. Create public settings API
6. Update landing components
7. Remove hardcoded values from messages files
