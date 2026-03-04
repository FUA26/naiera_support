# @workspace/hooks

Shared React hooks for the workspace.

## Purpose

This package contains custom React hooks that are shared across all applications in the workspace.

## Available Hooks

### `useMobile()`
Detect if the current viewport is mobile-sized.

```tsx
import { useMobile } from "@workspace/hooks/mobile";

function Component() {
  const isMobile = useMobile();
  return <div className={isMobile ? "text-sm" : "text-base"} />;
}
```

### `useCmdK()`
Keyboard shortcut handler for command palette.

```tsx
import { useCmdK } from "@workspace/hooks/use-cmd-k";

useCmdK(() => {
  // Open command palette
}, ["k", "K"]);
```

### `useDataTableState()`
State management hook for data tables with pagination, sorting, filtering.

```tsx
import { useDataTableState } from "@workspace/hooks/use-data-table-state";

function TasksTable() {
  const table = useDataTableState({ pageSize: 20 });
  // ...
}
```

## Adding Hooks

1. Create a new file in `src/` named `use-[hook-name].ts`
2. Export the hook from `src/index.ts`
3. Add usage examples and documentation

## See Also

- `packages/ui/` - UI components that work with these hooks
