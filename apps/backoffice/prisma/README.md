# Database Setup Guide

## Prerequisites

1. PostgreSQL database running (Docker or native)
2. Node.js and pnpm installed

## Quick Setup

### 1. Create Database

```bash
# If using Docker
docker exec -i naiera-postgres psql -U naiera -d postgres -c "CREATE DATABASE backoffice_db;"

# If using native PostgreSQL
createdb backoffice_db
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and update:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"
```

### 3. Run Migrations

```bash
# Apply all migrations
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx prisma migrate deploy

# Or for development (creates migrations)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx prisma migrate dev
```

### 4. Seed Data

```bash
# Seed permissions (32 permissions)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx tsx prisma/seed-permissions.ts

# Seed roles (5 roles: ADMIN, EDITOR, MODERATOR, USER, VIEWER)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx tsx prisma/seed-roles.ts

# Seed system settings
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx tsx prisma/seed-system-settings.ts

# Create admin user (admin@example.com / admin123)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx tsx prisma/seed-admin.ts
```

## Migrations

### Applied Migrations

1. **20250211000000_init** - Initial schema
2. **20260211230000_add_password_reset_fields** - Password reset functionality
3. **20260211234111_add_profile_fields** - User profile fields
4. **20260212140934_add_system_settings** - System settings table
5. **20260224120000_add_file_columns_and_enums** - File upload schema

### Creating New Migrations

```bash
# Development (creates migration file)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx prisma migrate dev --name migration_name

# Production (applies existing migrations)
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx prisma migrate deploy
```

## Database Schema

### Key Tables

#### User
- Authentication and user data
- Role-based access control
- Avatar support via File relation

#### Role
- 5 default roles: ADMIN, EDITOR, MODERATOR, USER, VIEWER
- Permission-based access

#### Permission
- 32 granular permissions
- Organized by category

#### File
- File upload tracking
- Support for images, documents, videos, audio, archives
- S3/MinIO integration ready
- Soft delete support

## Default Admin Account

```
Email: admin@example.com
Password: admin123
Role: ADMIN
```

## Troubleshooting

### Reset Database

```bash
# Drop and recreate database
docker exec -i naiera-postgres psql -U naiera -d postgres -c "DROP DATABASE IF EXISTS backoffice_db;"
docker exec -i naiera-postgres psql -U naiera -d postgres -c "CREATE DATABASE backoffice_db;"

# Re-run migrations and seeds
./scripts/setup-db.sh
```

### Regenerate Prisma Client

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/backoffice_db" npx prisma generate
```

### View Database

```bash
# Using psql
docker exec -it naiera-postgres psql -U naiera -d backoffice_db

# List tables
\dt

# Describe table
\d "User"

# Quit
\q
```

## File Categories

- `AVATAR` - User profile pictures
- `IMAGE` - General images
- `DOCUMENT` - PDF, Word, etc.
- `VIDEO` - Video files
- `AUDIO` - Audio files
- `ARCHIVE` - Compressed files
- `OTHER` - Other file types
