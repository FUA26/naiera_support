# @workspace/types

Shared TypeScript type definitions for the workspace.

## Purpose

This package contains commonly used TypeScript types and interfaces that are shared across all applications in the workspace.

## Available Types

### Common Types
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API response with metadata
- `PaginationParams` - Pagination query parameters

### Entity Types
- `EntityStatus` - Base status enum (DRAFT, PUBLISHED, ARCHIVED)
- `UserReference` - User reference in responses
- `FileReference` - File reference in responses

## Usage

```ts
import type { ApiResponse, PaginatedResponse } from "@workspace/types";

interface TaskListResponse extends PaginatedResponse<Task> {
  // ...
}
```

## Adding Types

1. Add new types to appropriate files in `src/`
2. Export from `src/index.ts`
3. Update this README

## See Also

- `packages/utils/` - Utility functions
- `apps/backoffice/prisma/schema.prisma` - Database schema types
