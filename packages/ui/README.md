# @workspace/ui

Shared UI components library for the workspace.

## Purpose

This package contains reusable UI components built on top of [shadcn/ui](https://ui.shadcn.com/). All components follow the existing design system and are fully typed with TypeScript.

## Installation

This package is automatically included in workspace apps. No additional installation needed.

## Usage

```tsx
import { Button } from "@workspace/ui/button";
import { Dialog } from "@workspace/ui/dialog";

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

## Available Components

- **Form Components**: Button, Input, Label, Select, Checkbox, Radio, Switch, Textarea
- **Layout**: Dialog, Sheet, Tabs, Accordion, Collapsible
- **Feedback**: Alert, Badge, Progress, Skeleton, Spinner
- **Navigation**: Menu, Dropdown, Navigation, Breadcrumb, Pagination
- **Data Display**: Table, Card, Avatar, Badge, Separator
- **Overlays**: Popover, Tooltip, Toast

## Component Patterns

All components follow these patterns:
- Compound component structure for flexibility
- Consistent API with `asChild` prop for composition
- Full TypeScript support with proper exports
- Tailwind CSS styling with CSS variables for theming
- Accessible by default (ARIA attributes, keyboard navigation)

## Customization

Components use CSS variables for theming. Customize via `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        secondary: { /* ... */ },
      },
    },
  },
}
```

## See Also

- [shadcn/ui Documentation](https://ui.shadcn.com)
- `apps/backoffice/components/` for app-specific component usage
