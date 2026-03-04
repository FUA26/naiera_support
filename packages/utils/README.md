# @workspace/utils

Shared utility functions for the workspace.

## Purpose

This package contains commonly used utility functions that are shared across all applications in the workspace.

## Available Utilities

### String Utilities
- `slugify(text)` - Convert text to URL-friendly slug
- `truncate(text, length)` - Truncate text with ellipsis
- `capitalize(text)` - Capitalize first letter

### Date Utilities
- `formatDate(date)` - Format date to readable string
- `formatRelative(date)` - Format relative time (e.g., "2 hours ago")
- `isValidDate(date)` - Validate date objects

### Number Utilities
- `formatCurrency(amount)` - Format as currency
- `formatNumber(num)` - Format with thousands separator
- `clamp(num, min, max)` - Clamp number between bounds

### Array Utilities
- `unique(array)` - Remove duplicates
- `groupBy(array, key)` - Group array by key
- `sortBy(array, key)` - Sort array by key

## Usage

```ts
import { slugify, formatDate, formatCurrency } from "@workspace/utils";

const slug = slugify("Hello World"); // "hello-world"
const formatted = formatDate(new Date()); // "January 1, 2026"
const price = formatCurrency(1234.56); // "$1,234.56"
```

## Adding Utilities

1. Create a new file in `src/` named after the utility category
2. Export named functions from `src/index.ts`
3. Update this README with the new utilities

## See Also

- `packages/types/` - Shared TypeScript types
