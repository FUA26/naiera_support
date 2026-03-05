# Enterprise Next.js Boilerplate

A production-ready Next.js 16 boilerplate with authentication, role-based access control (RBAC), file uploads, activity logging, and more. Built as a monorepo with Turborepo for optimal development experience.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/yourrepo.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Features

- **Authentication** - NextAuth.js with OAuth and credential providers
- **RBAC** - Role-based access control with dynamic permissions
- **Task Management** - Full CRUD tasks with tags, comments, and activity logging
- **Email Templates** - MJML-based transactional emails with Resend
- **File Uploads** - S3-compatible storage with image optimization
- **Activity Logging** - Comprehensive audit trail for all actions
- **Type Safety** - Full TypeScript coverage with Zod validation
- **Responsive UI** - Beautiful, mobile-first design with dark mode
- **ISR Caching** - Incremental Static Regeneration for performance
- **Service Layer** - Clean architecture with separation of concerns

## Documentation

- [Getting Started](/docs/getting-started) - Installation and setup
- [Features](/docs/features) - Feature documentation
  - [Task Management](/docs/features/task-management) - Task CRUD, tags, comments
  - [Email Templates](/docs/features/email-templates) - MJML transactional emails
- [Architecture](/docs/architecture) - System architecture and structure
- [Patterns](/docs/patterns) - Development patterns and best practices
- [Customization](/docs/customization) - Tailoring to your needs
- [Deployment](/docs/deployment) - Production deployment guides

## Tech Stack

- **Framework** - Next.js 16 (App Router)
- **Language** - TypeScript
- **Database** - PostgreSQL with Prisma ORM
- **Storage** - S3-compatible object storage
- **Styling** - Tailwind CSS with shadcn/ui
- **Monorepo** - Turborepo
- **Auth** - NextAuth.js v5

## License

MIT License - feel free to use this boilerplate for your projects.
