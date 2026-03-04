# @workspace/api

API client library for the workspace.

## Purpose

This package provides a type-safe API client for making requests to the backend services. It includes:

- Typed API clients
- Request/response validation
- Error handling
- Authentication headers injection

## Usage

```tsx
import { apiClient } from "@workspace/api/client";

const tasks = await apiClient.tasks.list({ status: "TODO" });
const task = await apiClient.tasks.get({ id: "123" });
```

## See Also

- `apps/backoffice/app/api/` - API route implementations
