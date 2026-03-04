# Installation

Get the Enterprise Next.js Boilerplate up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher
- **pnpm** 8 or higher ([install pnpm](https://pnpm.io/installation))
- **PostgreSQL** 14 or higher (or use Docker)
- **AWS S3 bucket** or compatible storage (for file uploads)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo, including:

- `apps/backoffice` - Admin dashboard application
- `apps/landing` - Public landing page
- `packages/*` - Shared packages

## Step 3: Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` and set the following required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/yourdb"

# NextAuth
AUTH_SECRET="your-secret-key-here"

# File Storage (S3-compatible)
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="us-east-1"
S3_ENDPOINT="https://s3.amazonaws.com" # or your S3-compatible endpoint
```

See [Configuration](/docs/getting-started/configuration) for all available options.

## Step 4: Database Setup

### Option A: Using Docker (Recommended)

```bash
docker-compose up -d postgres
```

### Option B: Using Existing PostgreSQL

Create a new database:

```sql
CREATE DATABASE yourdb;
```

## Step 5: Run Migrations

```bash
pnpm --filter backoffice db:push
```

This creates all required tables in your database.

## Step 6: Seed Initial Data (Optional)

```bash
pnpm --filter backoffice db:seed
```

This creates:
- Admin user (email: `admin@yourdomain.com`, password: `admin123`)
- Default roles and permissions

## Step 7: Start Development Server

```bash
pnpm dev
```

The applications will be available at:

- Backoffice: http://localhost:3001
- Landing: http://localhost:3002

## Troubleshooting

### Port Already in Use

If ports are already in use, you can modify them in `apps/backoffice/.env`:

```bash
PORT=3001  # Change default port
```

### Database Connection Issues

Ensure your PostgreSQL server is running and the connection string in `DATABASE_URL` is correct.

### Build Errors

Try clearing the Turborepo cache:

```bash
rm -rf .turbo
pnpm install
```

## Next Steps

- [Configuration](/docs/getting-started/configuration) - Configure environment variables
- [Running Locally](/docs/getting-started/running-locally) - Development commands
