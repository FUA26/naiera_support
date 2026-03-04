# Data Flow

Understanding how data moves through the Enterprise Next.js Boilerplate.

## Request Lifecycle

### Page Request Flow

```
User Request
    ↓
Middleware (Auth Check)
    ↓
Server Component/Layout
    ↓
Permission Check
    ↓
Data Fetching (Service Layer)
    ↓
Prisma Query
    ↓
Database
    ↓
Response (HTML/JSON)
```

### API Request Flow

```
Client Request
    ↓
API Route
    ↓
Authentication Check
    ↓
Permission Check
    ↓
Validation (Zod)
    ↓
Service Layer (Business Logic)
    ↓
Prisma Query
    ↓
Database
    ↓
Response (JSON)
```

## Authentication Flow

### Login Process

```
1. User enters credentials
   ↓
2. NextAuth validates credentials
   ↓
3. Session created (JWT/Database)
   ↓
4. Redirect to dashboard
   ↓
5. Permission context loaded
   ↓
6. User data displayed
```

### Session Management

```
Server Side (API Routes, Server Components)
    ↓
auth() from NextAuth
    ↓
Returns session with user

Client Side (Client Components)
    ↓
useSession() hook
    ↓
Returns session from client state
```

## Permission Check Flow

### Server-Side Permission Check

```
API Route / Server Component
    ↓
requireAuth() - Get current user
    ↓
requirePermission() - Check permission
    ↓
loadUserPermissions() - Load from database
    ↓
hasPermission() - Evaluate permission
    ↓
Allow or Deny access
```

### Client-Side Permission Check

```
usePermissions() Hook
    ↓
Load permissions from PermissionProvider
    ↓
hasPermission() - Evaluate permission
    ↓
Show/Hide UI elements
```

## Data Fetching Patterns

### Server Component Data Fetching

```typescript
// apps/backoffice/app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  // Direct data fetch in server component
  const users = await getUsers({ page: 1, pageSize: 20 });

  return <UsersList users={users} />;
}
```

### Client Component Data Fetching

```typescript
// With Server Actions
export function UsersTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return <table>{/* ... */}</table>;
}
```

### API Route Data Fetching

```typescript
// Client-side API call
const response = await fetch('/api/users');
const users = await response.json();
```

## Form Submission Flow

### Server Action Submission

```
User submits form
    ↓
Zod validation
    ↓
Server Action called
    ↓
Permission check
    ↓
Service layer processing
    ↓
Database update
    ↓
Revalidate cache
    ↓
Return result
```

### API Route Submission

```
User submits form
    ↓
Zod validation
    ↓
POST/PUT request
    ↓
API Route handler
    ↓
Permission check
    ↓
Service layer processing
    ↓
Database update
    ↓
JSON response
```

## File Upload Flow

### Direct Upload to S3

```
User selects file
    ↓
Client validation (size, type)
    ↓
Request presigned URL
    ↓
API Route generates presigned URL
    ↓
Direct upload to S3
    ↓
File record created in database
    ↓
Return file ID/URL
```

### Upload via API

```
User submits form with file
    ↓
API Route receives file
    ↓
Upload to S3
    ↓
Save file record
    ↓
Return file data
```

## Cache Revalidation Flow

### On-Demand Revalidation

```
Data updated via API/Action
    ↓
Service layer updates data
    ↓
revalidatePath() called
    ↓
Next.js cache invalidated
    ↓
Next request fetches fresh data
```

### Time-Based Revalidation

```
fetch(url, { next: { revalidate: 60 } })
    ↓
Data cached for 60 seconds
    ↓
Subsequent requests use cache
    ↓
After 60s, fresh data fetched
```

## Activity Logging Flow

```
User performs action
    ↓
Service layer processes action
    ↓
logActivity() called
    ↓
Activity record created
    ↓
Linked to entity and user
    ↓
Available in activity log
```

## Error Handling Flow

### Validation Error

```
Zod validation fails
    ↓
Return error details
    ↓
Form displays errors
    ↓
User corrects input
```

### Permission Error

```
Permission check fails
    ↓
Return 403 Forbidden
    ↓
Error page shown
    ↓
Or redirect with message
```

### Server Error

```
Unhandled exception
    ↓
Error logged
    ↓
Return 500 Internal Error
    ↓
Error page shown
```

## State Management Flow

### Server State (React Query / Server Components)

```
Data needed
    ↓
Fetch from server
    ↓
Cache in store
    ↓
Use in components
    ↓
Revalidate on changes
```

### Client State (Zustand)

```
State updated
    ↓
Store notifies subscribers
    ↓
Components re-render
    ↓
UI updated
```

## Next Steps

- [Patterns](/docs/patterns) - Development patterns and best practices
- [API Routes](/docs/patterns/api-routes) - API route patterns
- [Service Layer](/docs/patterns/service-layer) - Service layer abstraction
