# Technology Stack

Detailed explanation of the technologies used in the Enterprise Next.js Boilerplate.

## Core Technologies

### Next.js 15

**Why Next.js?**

- **App Router**: React Server Components for better performance
- **File-based Routing**: Simple and intuitive routing
- **API Routes**: Backend and frontend in one codebase
- **ISR & SSR**: Flexible rendering options
- **Edge Runtime**: Deploy to edge networks

**Key Features Used:**
- Server Components by default
- Route Groups (`(dashboard)`, `(auth)`)
- Middleware for auth protection
- Server Actions for mutations
- Parallel Routes for layouts

### TypeScript

**Why TypeScript?**

- **Type Safety**: Catch errors at compile time
- **Better DX**: IntelliSense and autocompletion
- **Refactoring**: Safe code changes
- **Documentation**: Types as documentation

**Usage Patterns:**
- Strict mode enabled
- No implicit any
- Type-only imports
- Generics for reusable components

### Turborepo

**Why Turborepo?**

- **Fast Builds**: Intelligent caching
- **Parallel Tasks**: Run tasks concurrently
- **Remote Caching**: Share cache across team
- **Monorepo**: Manage multiple packages

**Configuration:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Database

### PostgreSQL

**Why PostgreSQL?**

- **Relational**: ACID compliance, transactions
- **Features**: JSON support, full-text search
- **Mature**: Stable, well-documented
- **Scalable**: Handles large datasets

### Prisma

**Why Prisma?**

- **Type-Safe**: Generated types match schema
- **Migrations**: Easy schema evolution
- **Query Builder**: Intuitive API
- **Relations**: First-class relation support

**Schema Example:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
}
```

## Authentication

### NextAuth.js v5

**Why NextAuth.js?**

- **Flexible**: Multiple providers
- **Secure**: Built-in security best practices
- **TypeScript**: Full type support
- **Sessions**: JWT or database sessions

**Providers Supported:**
- Credentials (email/password)
- OAuth (Google, GitHub, etc.)
- Magic links (email)

## Authorization

### Custom RBAC System

**Why Custom RBAC?**

- **Flexible**: Dynamic permissions
- **Scalable**: Works with any auth provider
- **Type-Safe**: TypeScript throughout
- **Universal**: Works client and server

**Features:**
- Role-based access
- Permission-based actions
- Resource-level checks (OWN vs ANY)
- Client-side permission context

## File Storage

### S3-Compatible Storage

**Why S3?**

- **Scalable**: Infinite storage
- **Fast**: CDN integration
- **Universal**: Many providers
- **Presigned URLs**: Direct uploads

**Compatible Providers:**
- AWS S3
- Cloudflare R2
- MinIO
- DigitalOcean Spaces
- Wasabi

## Styling

### Tailwind CSS

**Why Tailwind?**

- **Utility-First**: Rapid development
- **Responsive**: Mobile-first approach
- **Dark Mode**: Built-in support
- **Customizable**: Theme configuration

### shadcn/ui

**Why shadcn/ui?**

- **Copy-Paste**: Own the code
- **Accessible**: Radix UI primitives
- **Customizable**: Easy to modify
- **TypeScript**: Fully typed

## Form Handling

### React Hook Form + Zod

**Why This Combination?**

- **Performant**: Minimal re-renders
- **Type-Safe**: Zod schema validation
- **DX**: Excellent developer experience
- **Flexible**: Complex form handling

## State Management

### Zustand

**Why Zustand?**

- **Simple**: Easy to learn
- **Lightweight**: Small bundle size
- **Type-Safe**: TypeScript support
- **Flexible**: No boilerplate

**Used For:**
- UI state (modals, sidebars)
- Client-side data caching
- Form state

### Server State

**React Query / Server Components**

- Server Components for data fetching
- Revalidation for cache updates
- Suspense for loading states

## Deployment

### Vercel (Recommended)

**Why Vercel?**

- **Next.js Creators**: Best integration
- **Edge Network**: Global CDN
- **Zero Config**: Automatic optimization
- **Preview Deployments**: Branch previews

### Alternative: Docker

**Why Docker?**

- **Portable**: Run anywhere
- **Consistent**: Same env everywhere
- **Scalable**: Container orchestration

## Development Tools

### ESLint

**Why ESLint?**

- **Code Quality**: Catch bugs
- **Consistency**: Team standards
- **Fixable**: Auto-fix issues

### Prettier

**Why Prettier?**

- **Formatting**: Consistent style
- **No Debate**: Opinionated
- **Integration**: Works with ESLint

### Husky + lint-staged

**Why?**

- **Pre-commit**: Check before commit
- **Fast**: Only staged files
- **Quality**: Maintain code quality

## Monitoring & Logging

### Custom Logger

**Features:**
- Structured logging
- Log levels
- Error tracking
- Request logging

## Next Steps

- [Data Flow](/docs/architecture/data-flow) - How data moves through the system
- [Patterns](/docs/patterns) - Development patterns
