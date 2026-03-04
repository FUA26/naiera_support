# System Architecture

High-level overview of the Enterprise Next.js Boilerplate architecture.

## Overview

The boilerplate follows a modular monorepo architecture with clear separation of concerns. It's designed to scale from small teams to large organizations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Monorepo Root                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   apps/          │  │   packages/      │                   │
│  │                   │  │                   │                   │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                   │
│  │  │backoffice  │  │  │  │    ui      │  │                   │
│  │  │  (Admin)   │  │  │  │  (Shared)  │  │                   │
│  │  └────────────┘  │  │  └────────────┘  │                   │
│  │                   │  │                   │                   │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                   │
│  │  │  landing   │  │  │  │   config   │  │                   │
│  │  │ (Website)  │  │  │  │  (Shared)  │  │                   │
│  │  └────────────┘  │  │  └────────────┘  │                   │
│  │                   │  │                   │                   │
│  └──────────────────┘  │  ┌────────────┐  │                   │
│                         │  │   types    │  │                   │
│                         │  │  (Shared)  │  │                   │
│                         │  └────────────┘  │                   │
│                         └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       External Services                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │  S3 Storage │  │   OAuth     │            │
│  │  Database   │  │             │  │  Providers  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

### 1. Monorepo Structure

- **Single Repository**: All code lives in one repository
- **Shared Packages**: Common code extracted to reusable packages
- **Turborepo**: Efficient build system with caching
- **Workspace Protocol**: Internal imports use `@workspace/*`

### 2. Layered Architecture

Each application follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← UI Components, Pages
├─────────────────────────────────────┤
│          API Layer                  │  ← API Routes, Actions
├─────────────────────────────────────┤
│         Service Layer               │  ← Business Logic
├─────────────────────────────────────┤
│         Data Access Layer           │  ← Prisma, Database
└─────────────────────────────────────┘
```

### 3. Separation of Concerns

- **Client/Server Split**: Clear separation between client and server code
- **Feature Modules**: Each feature is self-contained
- **Shared Libraries**: Common functionality in packages

### 4. Type Safety

- **Full TypeScript**: Complete type coverage
- **Zod Validation**: Runtime type checking
- **Generated Types**: Types from Prisma schema

## Data Flow

### Authentication Flow

```
User → Login Page → NextAuth → OAuth Provider
                          ↓
                    Session Created
                          ↓
              Permission Provider
                          ↓
                  Dashboard Access
```

### API Request Flow

```
Client Component → API Route → Permission Check
                                       ↓
                                  Service Layer
                                       ↓
                                   Prisma
                                       ↓
                                  Database
```

### File Upload Flow

```
User selects file → Client validation → Presigned URL
                                              ↓
                                    Direct upload to S3
                                              ↓
                                      File record created
```

## Security Architecture

### Authentication

- NextAuth.js handles session management
- OAuth providers for external login
- Credentials provider for email/password
- JWT tokens for API authentication

### Authorization

- RBAC (Role-Based Access Control)
- Permission-based access
- Page-level protection
- API route guards

### Data Security

- Environment variable secrets
- Prisma prepared statements
- Input validation with Zod
- SQL injection prevention

## Technology Choices

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Framework | Next.js 16 | App Router, Server Components |
| Language | TypeScript | Type safety, developer experience |
| Database | PostgreSQL | Relational, mature, feature-rich |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | NextAuth.js | Flexible, well-maintained |
| Styling | Tailwind CSS | Utility-first, responsive |
| Monorepo | Turborepo | Fast builds, caching |
| Storage | S3-compatible | Scalable, universal |

## Scalability Considerations

### Horizontal Scaling

- Stateless application design
- Session storage can be externalized
- File uploads go directly to S3
- Database connection pooling

### Vertical Scaling

- Efficient bundle size with Turborepo
- Server components reduce client JS
- ISR for cacheable content
- Lazy loading where appropriate

## Next Steps

- [Monorepo Structure](/docs/architecture/monorepo-structure) - Folder organization
- [Technology Stack](/docs/architecture/technology-stack) - Detailed tech choices
- [Data Flow](/docs/architecture/data-flow) - How data moves through the system
