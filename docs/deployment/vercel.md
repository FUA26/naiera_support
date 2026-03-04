# Vercel Deployment

Deploy the boilerplate to Vercel.

## Overview

Vercel is the recommended deployment platform for Next.js applications. This guide covers deploying both the backoffice and landing applications.

## Prerequisites

- Vercel account
- GitHub repository
- Environment variables configured

## Project Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
cd /path/to/your/repo
vercel link
```

## Environment Variables

Set up environment variables in Vercel dashboard or via CLI:

```bash
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Your production URL
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `S3_REGION` - S3 region
- `NEXT_PUBLIC_APP_URL` - Public app URL

## Deployment Configuration

### vercel.json

Create `vercel.json` in the root:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "monorepo": true,
  "outputDirectory": "apps/backoffice/.next"
}
```

### Turborepo Integration

The boilerplate uses Turborepo which works with Vercel:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Deploying Applications

### Backoffice Only

To deploy just the backoffice:

```json
{
  "buildCommand": "pnpm --filter backoffice build",
  "outputDirectory": "apps/backoffice/.next",
  "installCommand": "pnpm install"
}
```

### Multiple Applications

For multiple apps, use Vercel's monorepo support or deploy as separate projects.

## Database

### Vercel Postgres (Recommended)

```bash
# Install Postgres SDK
pnpm add @vercel/postgres

# Use in code
import { sql } from '@vercel/postgres';

const result = await sql`SELECT * FROM users`;
```

### External PostgreSQL

Use any PostgreSQL provider (Supabase, Railway, etc.):

```bash
vercel env add DATABASE_URL production
# Paste your connection string
```

## Build Settings

Configure build settings in Vercel dashboard:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `pnpm build` |
| Install Command | `pnpm install` |
| Output Directory | `apps/backoffice/.next` |

## Custom Domains

### Add Domain

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records:
   - A record: `76.76.21.21` for Vercel
   - CNAME: `cname.vercel-dns.com`

### Subdomains

For separate apps on subdomains:
- `app.yourdomain.com` → Backoffice
- `www.yourdomain.com` → Landing

## Deployment Workflow

### Automatic Deployment

Deploy automatically on push to main:

```bash
git push origin main
```

### Preview Deployments

Each pull request gets a preview deployment:
- Auto-generated URL
- Fresh database copy (optional)
- Test before merging

### Production Branch

Configure production branch:
- Dashboard > Settings > Git
- Set "Production Branch" to `main`

## Environment-Specific Configs

### Production

```bash
# .env.production
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/proddb"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Preview

```bash
# .env.preview (for preview deployments)
DATABASE_URL="postgresql://user:pass@preview-db.example.com:5432/previewdb"
NEXTAUTH_URL="https://your-preview.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-preview.vercel.app"
```

## Post-Deployment Tasks

### Run Migrations

After deployment, run migrations:

```bash
vercel env add MIGRATION_REQUIRED production
```

Then in your app:
```typescript
// Check for pending migrations
if (process.env.MIGRATION_REQUIRED) {
  await runMigrations();
}
```

### Seed Initial Data

Seed admin user:
```bash
vercel env add SEED_DATABASE production
```

## Monitoring

### Vercel Analytics

Built-in analytics for:
- Page views
- Core Web Vitals
- Routes

### Logging

```typescript
// apps/backoffice/lib/logger/vercel.ts
import { Logger } from "@workspace/logger";

export const logger = new Logger({
  environment: process.env.NODE_ENV,
  // Vercel-specific logging
});
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs

# Common issues:
# - Missing environment variables
# - Memory limits (upgrade plan)
# - Timeout (increase build duration)
```

### Runtime Errors

```bash
# View function logs
vercel logs --follow

# Check environment variables
vercel env ls
```

### Database Connection

Ensure DATABASE_URL is correct and accessible from Vercel:
- Whitelist Vercel IPs
- Use connection pooling
- Check SSL requirements

## Performance Optimization

### Edge Functions

Use Edge Runtime for faster responses:

```typescript
export const runtime = "edge";
```

### Static Generation

Generate static pages where possible:

```typescript
export const revalidate = 3600; // 1 hour
```

### ISR

Use Incremental Static Regeneration:
```typescript
export const revalidate = 60; // 1 minute
```

## See Also

- [Docker Deployment](/docs/deployment/docker) - Docker deployment
- [Custom Server](/docs/deployment/custom-server) - VPS deployment
- [Configuration](/docs/getting-started/configuration) - Environment variables
