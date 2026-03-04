# Validation Pattern

How to use Zod for runtime type validation throughout the application.

## When to Use

Use validation when you need to:
- Validate user input from forms
- Type-check API request bodies
- Ensure data integrity
- Provide helpful error messages
- Validate environment variables

## Architecture

```
┌─────────────────────────────────────────┐
│           Validation Flow               │
│                                         │
│  Input → Zod Schema → Parse/Validate   │
│    ↓          ↓             ↓           │
│  User      Type         Success/Error  │
│  Input    Definition    + Typed Data   │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Define Validation Schema

Create schemas in `lib/validations/`:

```typescript
// apps/backoffice/lib/validations/user.ts
import { z } from "zod";

// Basic schema
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters")
                  .max(100, "Name must be less than 100 characters"),
  roleId: z.string().cuid("Invalid role ID"),
  avatarId: z.string().cuid().optional(),
});

// Update schema (all fields optional)
export const updateUserSchema = createUserSchema.partial();

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
                     .regex(/[A-Z]/, "Must contain uppercase letter")
                     .regex(/[a-z]/, "Must contain lowercase letter")
                     .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
```

### 2. Validate in API Routes

Use schema validation in API routes:

```typescript
// apps/backoffice/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createUserSchema } from "@/lib/validations/user";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Use validated data (now typed)
    const user = await createUser(validatedData);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. Validate in Server Actions

Use validation in Server Actions:

```typescript
// apps/backoffice/app/actions/user-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createUserSchema } from "@/lib/validations/user";
import { createUser } from "@/lib/services/user-service";
import { auth } from "@/lib/auth/config";

export async function createUserAction(formData: FormData) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Validate form data
  const validationResult = createUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    roleId: formData.get("roleId"),
  });

  if (!validationResult.success) {
    return {
      error: "Validation failed",
      details: validationResult.error.flatten(),
    };
  }

  // Create user
  const user = await createUser(validationResult.data);

  // Revalidate cache
  revalidatePath("/users");

  return { success: true, user };
}
```

### 4. Validate Environment Variables

Create schema for environment validation:

```typescript
// apps/backoffice/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),

  // S3
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().url().optional(),

  // Public
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Validate and export
export const env = envSchema.parse(process.env);
```

### 5. Custom Validators

Create custom validation functions:

```typescript
// apps/backoffice/lib/validations/custom.ts
import { z } from "zod";

// Custom password validator
export const passwordValidator = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  }, "Password must contain uppercase, lowercase, number, and special character");

// Custom slug validator
export const slugValidator = z.string()
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must be less than 100 characters")
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"),
    "Slug cannot start or end with a hyphen")
  .refine((slug) => !slug.includes("--"),
    "Slug cannot contain consecutive hyphens");

// Date range validator
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.startDate <= data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Unique field validator (async)
export async function isUniqueEmail(email: string, excludeId?: string) {
  const existing = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !existing;
}

// Use in schema
export const updateUserEmailSchema = z.object({
  email: z.string().email(),
  userId: z.string().cuid(),
}).superRefine(async (data, ctx) => {
  const unique = await isUniqueEmail(data.email, data.userId);
  if (!unique) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email already exists",
      path: ["email"],
    });
  }
});
```

### 6. Complex Schema Composition

Build complex schemas from smaller ones:

```typescript
// apps/backoffice/lib/validations/task.ts
import { z } from "zod";

// Base task schema
export const taskBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.coerce.date().optional(),
});

// Create task schema
export const createTaskSchema = taskBaseSchema.extend({
  status: z.enum(["TODO", "IN_PROGRESS"]).default("TODO"),
  assigneeId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).default([]),
});

// Update task schema (partial)
export const updateTaskSchema = taskBaseSchema.partial().extend({
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "ARCHIVED"]).optional(),
  assigneeId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

// Bulk update schema
export const bulkUpdateTaskSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1),
  updates: updateTaskSchema,
});

// Query params schema
export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

## Advanced Patterns

### Transformations

Transform data during validation:

```typescript
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
}).transform((data) => ({
  ...data,
  email: data.email.toLowerCase().trim(),
  name: data.name.trim(),
  role: data.role.toUpperCase(),
}));
```

### Default Values

Provide defaults for missing values:

```typescript
export const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
});
```

### Discriminated Unions

Validate different shapes based on a discriminator:

```typescript
export const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("webinar"),
    title: z.string(),
    webinarUrl: z.string().url(),
  }),
  z.object({
    type: z.literal("in-person"),
    title: z.string(),
    venue: z.string(),
    address: z.string(),
  }),
]);
```

### Refine with Context

Pass context to validation:

```typescript
export const updateTaskSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
}).superRefine((data, ctx) => {
  // Access context through closure
  if (data.status === "DONE" && !hasRequiredFields()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cannot complete task without required fields",
    });
  }
});
```

## Examples from Tasks Module

The Tasks module demonstrates validation patterns:

```typescript
// apps/backoffice/lib/validations/task.ts
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).default("TODO"),
  priority: z.nativeEnum(TaskPriority).default("MEDIUM"),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial();
```

## Error Handling

Standard error response format:

```typescript
if (!result.success) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: result.error.flatten(),
      // Output format:
      // {
      //   fieldErrors: { email: ["Invalid email"], name: ["Too short"] },
      //   formErrors: ["Some general error"]
      // }
    },
    { status: 400 }
  );
}
```

## Best Practices

1. **Centralize Schemas**: Keep all validation schemas in `lib/validations/`
2. **Reuse Types**: Export inferred types for use in components
3. **Custom Messages**: Provide helpful error messages
4. **Safe Parse**: Use `safeParse()` for better error handling
5. **Environment Validation**: Always validate env vars
6. **Type Inference**: Use `z.infer<>` instead of duplicating types

## See Also

- [API Routes](/docs/patterns/api-routes) - Validating API requests
- [Service Layer](/docs/patterns/service-layer) - Validating service inputs
- [Components](/docs/patterns/components-packages) - Form component validation
