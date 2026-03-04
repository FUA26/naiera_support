# Running Locally

Learn how to run the Enterprise Next.js Boilerplate in development mode.

## Development Server

Start all applications in development mode:

```bash
pnpm dev
```

This starts:
- **Backoffice** at http://localhost:3000
- **Landing** at http://localhost:3001

## Individual Applications

Start a specific application:

```bash
# Backoffice only
pnpm --filter backoffice dev

# Landing only
pnpm --filter landing dev
```

## Database Commands

### Push Schema Changes

Apply Prisma schema changes to the database:

```bash
pnpm --filter backoffice db:push
```

### Create Migration

Create a new migration file:

```bash
pnpm --filter backoffice db:migrate
```

### Reset Database

Reset the database (WARNING: deletes all data):

```bash
pnpm --filter backoffice db:reset
```

### Seed Database

Populate the database with initial data:

```bash
pnpm --filter backoffice db:seed
```

### Open Prisma Studio

Browse your database with a GUI:

```bash
pnpm --filter backoffice db:studio
```

## Build Commands

### Development Build

Build for development (with source maps and debugging):

```bash
pnpm build
```

### Production Build

Build optimized production bundles:

```bash
pnpm build:prod
```

## Linting and Formatting

### Lint Code

Check for code issues:

```bash
pnpm lint
```

### Fix Lint Issues

Automatically fix linting issues:

```bash
pnpm lint:fix
```

### Format Code

Format code with Prettier:

```bash
pnpm format
```

## Testing

### Run Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

## Turborepo Commands

### Clear Cache

Clear the Turborepo cache:

```bash
pnpm turbo clean
```

### View Task Status

See the status of Turborepo tasks:

```bash
pnpm turbo status
```

### Force Rebuild

Force rebuild all packages:

```bash
pnpm turbo run build --force
```

## Troubleshooting

### Port Conflicts

If a port is already in use, you can change it:

1. Edit `apps/backoffice/.env`:
   ```bash
   PORT=3001
   ```

2. Or specify the port when running:
   ```bash
   PORT=3001 pnpm --filter backoffice dev
   ```

### Hot Reload Not Working

If hot reload isn't working:

1. Clear the Turborepo cache:
   ```bash
   rm -rf .turbo
   ```

2. Restart the dev server:
   ```bash
   pnpm dev
   ```

### Database Connection Errors

1. Verify PostgreSQL is running:
   ```bash
   psql postgresql://user:password@localhost:5432/db
   ```

2. Check your `DATABASE_URL` in `.env`

3. Try resetting the database:
   ```bash
   pnpm --filter backoffice db:reset
   ```

### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   pnpm install
   ```

2. Clear Turborepo cache:
   ```bash
   rm -rf .turbo
   ```

3. Try building again:
   ```bash
   pnpm build
   ```

## Debugging

### Debug Server-Side Code

Attach a debugger to the Next.js server:

1. Start with debug flag:
   ```bash
   NODE_OPTIONS='--inspect' pnpm dev
   ```

2. Open Chrome DevTools and connect to the debugger

### Debug Client-Side Code

Use the React DevTools browser extension for debugging React components.

## Next Steps

- [Architecture](/docs/architecture) - Understand the codebase
- [Patterns](/docs/patterns) - Learn development patterns
