# Database Migrations Pattern

How to manage database schema changes with Prisma.

## When to Use

Use migrations when you need to:
- Add new tables or columns
- Modify existing schema
- Create indexes for performance
- Set up relationships between models

## Architecture

```
┌─────────────────────────────────────────┐
│            Prisma Workflow              │
│                                         │
│  Schema → Migration → DB Apply → Seed  │
│    ↓          ↓           ↓          ↓  │
│  Define    Generate    Apply     Initial│
│  Models    SQL File    Changes    Data  │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Define Schema

Edit `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model
model Task {
  id          String        @id @default(cuid())
  title       String
  description String?
  status      TaskStatus    @default(TODO)
  priority    TaskPriority  @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String?
  assignee    User?         @relation(fields: [assigneeId], references: [id])
  tags        TaskTag[]
  comments    TaskComment[]
  activities  TaskActivity[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model TaskTag {
  id      String @id @default(cuid())
  name    String @unique
  color   String?
  tasks   Task[]
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  ARCHIVED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### 2. Generate Migration

Create a migration file:

```bash
pnpm --filter backoffice db:migrate
```

This creates a migration in `prisma/migrations/`:

```sql
-- prisma/migrations/20240304_create_tasks/migration.sql

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "id" TEXT NOT NULL,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskTag_name_key" ON "TaskTag"("name");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 3. Apply Migration

Apply the migration to the database:

```bash
# Development (push schema without migration file)
pnpm --filter backoffice db:push

# Production (using migration file)
pnpm --filter backoffice db:deploy
```

### 4. Seed Initial Data

Create seed data in `prisma/seed.ts`:

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@yourdomain.com" },
    update: {},
    create: {
      email: "admin@yourdomain.com",
      name: "Admin User",
      password: hashedPassword,
      roleId: "admin-role-id",
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:

```bash
pnpm --filter backoffice db:seed
```

## Schema Design Patterns

### Soft Deletes

Instead of hard deletes, mark records as deleted:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  deletedAt DateTime?

  @@index([deletedAt])
}
```

Query non-deleted records:

```typescript
const users = await prisma.user.findMany({
  where: { deletedAt: null },
});
```

### Audit Fields

Track who created and modified records:

```prisma
model Post {
  id            String   @id @default(cuid())
  title         String
  createdBy     String
  createdByUser User     @relation("CreatedBy", fields: [createdBy], references: [id])
  updatedBy     String
  updatedByUser User     @relation("UpdatedBy", fields: [updatedBy], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Polymorphic Relations

Support relationships to multiple model types:

```prisma
model Comment {
  id          String   @id @default(cuid())
  content     String
  commentableId   String
  commentableType String // "Task" or "Post"
  createdAt   DateTime @default(now())
}

model Task {
  id        String    @id @default(cuid())
  title     String
  comments  Comment[]
}

model Post {
  id        String    @id @default(cuid())
  title     String
  comments  Comment[]
}
```

### Multi-Tenancy

Support multiple tenants in one database:

```prisma
model Tenant {
  id      String @id @default(cuid())
  name    String
  domains Domain[]
  users   User[]
}

model Domain {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  domain   String  @unique
}

model User {
  id       String  @id @default(cuid())
  email    String
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, email])
}
```

## Migration Strategies

### Dev: Schema Push

For rapid development, push schema without migration files:

```bash
pnpm --filter backoffice db:push
```

### Staging: Migrate & Reset

Reset and apply all migrations:

```bash
pnpm --filter backoffice db:reset
```

### Production: Deploy Migrations

Apply migrations safely in production:

```bash
pnpm --filter backoffice db:deploy
```

## Common Patterns

### Adding a Column

1. Update schema:
```prisma
model User {
  id    String @id
  phone String? // New field
}
```

2. Create migration:
```bash
pnpm --filter backoffice db:migrate
```

3. Apply:
```bash
pnpm --filter backoffice db:push
```

### Changing Column Type

```prisma
model User {
  id   String @id
  age  Int    // Was String
}
```

Create migration with default value for existing data:

```bash
pnpm --filter backoffice db:migrate --create-only
# Edit migration.sql to handle data conversion
pnpm --filter backoffice db:push
```

### Adding Indexes

```prisma
model User {
  id    String @id
  email String @unique

  @@index([email])
  @@index([createdAt])
}
```

### Renaming Fields

Prisma supports renaming:

```prisma
model User {
  id    String @id
  name  String @map("user_name") // Maps to "user_name" column
  email String

  @@map("users") // Table name
}
```

## Best Practices

1. **Version Control**: Always commit migration files
2. **Review Migrations**: Check generated SQL before applying
3. **Test Migrations**: Test on staging before production
4. **Backup First**: Always backup production before migrating
5. **Use Transactions**: Prisma wraps migrations in transactions
6. **Idempotent Seeds**: Seeds should handle existing data

## Troubleshooting

### Migration Conflicts

If multiple developers create migrations:

```bash
# Create migration with custom name
pnpm --filter backoffice db:migrate --name add_user_phone
```

### Schema Drift

If database doesn't match schema:

```bash
# Reset to match schema
pnpm --filter backoffice db:push --force-reset
```

### Seed Failures

Handle existing data in seeds:

```typescript
const existing = await prisma.user.findUnique({
  where: { email: "admin@yourdomain.com" },
});

if (!existing) {
  await prisma.user.create({ /* ... */ });
}
```

## See Also

- [Service Layer](/docs/patterns/service-layer) - Using Prisma in services
- [Data Flow](/docs/architecture/data-flow) - How data moves through the system
- [Validation](/docs/patterns/validation) - Validating database inputs
