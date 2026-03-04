# Configuration

Configure the Enterprise Next.js Boilerplate using environment variables.

## Environment Files

The boilerplate uses multiple environment files:

- `.env.example` - Template with all available variables
- `.env` - Your local development configuration (not committed)
- `.env.production` - Production configuration
- `.env.test` - Test environment configuration

## Required Variables

These variables must be set for the application to run:

### Database

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### Authentication

```bash
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
```

### File Storage

```bash
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="us-east-1"
S3_ENDPOINT="https://s3.amazonaws.com"
```

## Optional Variables

### Application

```bash
# Application URL (for redirects, callbacks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# API URL (if using separate API server)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### NextAuth Configuration

```bash
# Session configuration
NEXTAUTH_SESSION_MAX_AGE="604800"  # 7 days in seconds

# Email (for magic links)
AUTH_EMAIL_FROM="noreply@yourdomain.com"
AUTH_EMAIL_REPLY_TO="support@yourdomain.com"
```

### OAuth Providers

```bash
# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### File Upload Configuration

```bash
# Maximum file size (in bytes)
NEXT_PUBLIC_MAX_FILE_SIZE="10485760"  # 10MB

# Allowed file types
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/*,application/pdf"
```

### Email Configuration (Resend)

```bash
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

## Environment-Specific Configuration

### Development

Variables in `.env` are used during development:

```bash
# Use local database
DATABASE_URL="postgresql://postgres:password@localhost:5432/devdb"

# Allow insecure cookies for localhost
NEXT_PUBLIC_ALLOW_INSECURE_COOKIES="true"
```

### Production

Variables in `.env.production` override `.env` in production builds:

```bash
# Use production database
DATABASE_URL="postgresql://user:password@prod-db.example.com:5432/proddb"

# Production app URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Require secure cookies
NEXT_PUBLIC_ALLOW_INSECURE_COOKIES="false"
```

## Accessing Environment Variables

### Server-Side

```typescript
// Available in API routes, server components, and server actions
const dbUrl = process.env.DATABASE_URL;
```

### Client-Side

Only variables prefixed with `NEXT_PUBLIC_` are available on the client:

```typescript
// Available in client components
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

## Type-Safe Environment Variables

The boilerplate includes type definitions for environment variables:

```typescript
// apps/backoffice/lib/env.ts
export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  authSecret: process.env.AUTH_SECRET!,
  // ... more variables
};
```

This provides:
- Autocomplete in your IDE
- Build-time validation for required variables
- Type safety throughout your application

## Adding New Environment Variables

1. Add the variable to `.env.example`
2. Add the variable to your local `.env`
3. Add type definition in `apps/backoffice/lib/env.ts`:
   ```typescript
   export const env = {
     // ... existing variables
     myNewVariable: process.env.MY_NEW_VARIABLE ?? "default-value",
   };
   ```

## Next Steps

- [Running Locally](/docs/getting-started/running-locally) - Start development
- [Deployment](/docs/deployment) - Production deployment
