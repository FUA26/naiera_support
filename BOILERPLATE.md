# Enterprise Next.js Boilerplate

A production-ready Next.js 15 boilerplate for building enterprise applications.

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/yourrepo.git

# Install
pnpm install

# Configure
cp .env.example .env
# Edit .env with your values

# Setup database
pnpm --filter backoffice db:push
pnpm --filter backoffice db:seed

# Start
pnpm dev
```

## What's Included

### Core Features

- **Authentication**: NextAuth.js with OAuth and credentials
- **RBAC**: Role-based access control with dynamic permissions
- **File Uploads**: S3-compatible storage with presigned URLs
- **Activity Logging**: Comprehensive audit trail
- **Type Safety**: Full TypeScript coverage
- **Responsive UI**: Mobile-first design with dark mode
- **ISR Caching**: Incremental Static Regeneration
- **Service Layer**: Clean architecture pattern

### Applications

- **Backoffice**: Admin dashboard (`/`)
- **Landing**: Public website (`/`)

### Packages

- **@workspace/ui**: Shared UI components
- **@workspace/hooks**: Shared React hooks
- **@workspace/utils**: Shared utilities
- **@workspace/types**: Shared TypeScript types
- **@workspace/api**: API utilities
- **@workspace/logger**: Logging utilities
- **@workspace/config**: ESLint/TypeScript configs

## Project Structure

```
.
├── apps/
│   ├── backoffice/          # Admin dashboard
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React components
│   │   └── lib/            # Server utilities
│   └── landing/            # Public website
├── packages/               # Shared packages
├── prisma/                 # Database schema
├── docs/                   # Documentation
└── turbo.json              # Turborepo config
```

## Documentation

- [Getting Started](/docs/getting-started)
  - [Installation](/docs/getting-started/installation)
  - [Configuration](/docs/getting-started/configuration)
  - [Running Locally](/docs/getting-started/running-locally)

- [Architecture](/docs/architecture)
  - [Overview](/docs/architecture/overview)
  - [Monorepo Structure](/docs/architecture/monorepo-structure)
  - [Technology Stack](/docs/architecture/technology-stack)
  - [Data Flow](/docs/architecture/data-flow)

- [Patterns](/docs/patterns)
  - [API Routes](/docs/patterns/api-routes)
  - [Pages + Permissions](/docs/patterns/pages-permissions)
  - [Components](/docs/patterns/components-packages)
  - [Database Migrations](/docs/patterns/database-migrations)
  - [File Uploads](/docs/patterns/file-uploads)
  - [Validation](/docs/patterns/validation)
  - [Revalidation](/docs/patterns/revalidation)
  - [Service Layer](/docs/patterns/service-layer)
  - [Activity Logs](/docs/patterns/activity-logs)

- [Customization](/docs/customization)
  - [Branding](/docs/customization/branding)
  - [Adding Modules](/docs/customization/adding-modules)
  - [Removing Features](/docs/customization/removing-features)
  - [Package Renaming](/docs/customization/package-renaming)

- [Deployment](/docs/deployment)
  - [Docker](/docs/deployment/docker)
  - [Vercel](/docs/deployment/vercel)
  - [Custom Server](/docs/deployment/custom-server)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL with Prisma |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS + shadcn/ui |
| Monorepo | Turborepo |
| Storage | S3-compatible |

## Default Credentials

After seeding the database:

```
Email: admin@yourdomain.com
Password: admin123
```

**Important:** Change these credentials immediately after first login.

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Auth
AUTH_SECRET="your-secret-key"

# Storage
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket"
S3_REGION="us-east-1"
```

See [Configuration](/docs/getting-started/configuration) for all variables.

## Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm --filter backoffice dev  # Start backoffice only
pnpm --filter landing dev     # Start landing only

# Building
pnpm build            # Build all packages
pnpm build:prod       # Production build

# Database
pnpm --filter backoffice db:push    # Push schema
pnpm --filter backoffice db:migrate  # Create migration
pnpm --filter backoffice db:reset    # Reset database
pnpm --filter backoffice db:seed     # Seed data
pnpm --filter backoffice db:studio   # Open Prisma Studio

# Quality
pnpm lint             # Check for issues
pnpm lint:fix         # Fix issues
pnpm format           # Format code
```

## License

MIT License - feel free to use this boilerplate for your projects.

## Support

- Documentation: [./docs](./docs)
- Issues: GitHub Issues
- Discussions: GitHub Discussions
