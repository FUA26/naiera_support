# Enterprise Next.js Boilerplate

A production-ready Next.js 16 boilerplate with authentication, RBAC, file uploads, and more.

## Features

- **Authentication** - NextAuth.js with OAuth and credential providers
- **RBAC** - Role-based access control with dynamic permissions
- **File Uploads** - S3-compatible storage with presigned URLs
- **Activity Logging** - Comprehensive audit trail
- **Type Safety** - Full TypeScript coverage with Zod validation
- **Responsive UI** - Beautiful, mobile-first design with dark mode
- **ISR Caching** - Incremental Static Regeneration
- **Service Layer** - Clean architecture pattern

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Applications:
# - Backoffice: http://localhost:3001
# - Landing: http://localhost:3002
```

## Documentation

For detailed documentation, see:

- [BOILERPLATE.md](./BOILERPLATE.md) - Boilerplate overview
- [docs/](./docs/) - Full documentation

### Documentation Sections

- [Getting Started](./docs/getting-started/) - Installation and setup
- [Architecture](./docs/architecture/) - System architecture
- [Patterns](./docs/patterns/) - Development patterns
- [Customization](./docs/customization/) - Tailoring to your needs
- [Deployment](./docs/deployment/) - Production deployment

## Project Structure

```
.
├── apps/
│   ├── backoffice/          # Admin dashboard
│   └── landing/             # Public website
├── packages/                # Shared packages
│   ├── ui/                  # Shared UI components
│   ├── hooks/               # Shared React hooks
│   ├── utils/               # Shared utilities
│   └── ...
└── docs/                    # Documentation
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma 6
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Monorepo**: Turborepo + pnpm

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Auth
AUTH_SECRET="your-secret-key-here"

# Storage (S3-compatible)
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket"
S3_REGION="us-east-1"
```

## Scripts

```bash
# Development
pnpm dev                    # Start all apps
pnpm --filter backoffice dev # Start backoffice only

# Building
pnpm build                  # Build all packages

# Database
pnpm --filter backoffice db:push   # Push schema
pnpm --filter backoffice db:seed    # Seed data
pnpm --filter backoffice db:studio  # Open Prisma Studio

# Quality
pnpm lint                   # Check for issues
pnpm format                 # Format code
```

## License

MIT License - feel free to use this boilerplate for your projects.
