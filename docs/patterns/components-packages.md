# Components & Packages Pattern

How to create and use shared components across the monorepo.

## When to Use

Use shared components when you need to:
- Reuse UI across multiple applications
- Maintain consistent design system
- Share business logic components
- Reduce code duplication

## Architecture

```
┌─────────────────────────────────────────┐
│         Monorepo Packages               │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   ui     │  │  hooks   │  │  utils ││
│  │ (shared  │  │ (shared  │  │(shared││
│  │  comps) │  │  logic)  │  │  code)││
│  └──────────┘  └──────────┘  └────────┘│
│        ↓             ↓             ↓    │
│  ┌──────────────────────────────────┐  │
│  │     Applications Consume         │  │
│  │  (backoffice, landing, etc.)     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Create Shared Component

Create components in the `packages/ui` directory:

```typescript
// packages/ui/src/components/button/button.tsx
import * as React from "react";
import { cn } from "@workspace/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-muted": variant === "ghost",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

### 2. Export from Package Index

Make the component available for import:

```typescript
// packages/ui/src/index.ts
export { Button } from "./components/button";
export { Input } from "./components/input";
export { Dialog } from "./components/dialog";
// ... more exports
```

### 3. Configure Package Exports

Update `package.json` for proper importing:

```json
// packages/ui/package.json
{
  "name": "@workspace/ui",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/components/button/button.tsx",
    "./input": "./src/components/input/input.tsx"
  }
}
```

### 4. Use in Application

Import and use in any application:

```typescript
// apps/backoffice/components/users/users-table.tsx
import { Button } from "@workspace/ui";

export function UsersTable() {
  return (
    <div>
      <Button variant="primary" size="md">
        Create User
      </Button>
    </div>
  );
}
```

## Component Patterns

### Compound Components

Create related components that work together:

```typescript
// packages/ui/src/components/card/card.tsx
import * as React from "react";
import { cn } from "@workspace/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card", className)}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

export { Card, CardHeader, CardTitle, CardContent };
```

Usage:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui";

<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Polymorphic Components

Components that can render as different HTML elements:

```typescript
import * as React from "react";
import { cn } from "@workspace/utils";

type As = keyof JSX.IntrinsicElements;
type Props<T extends As> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
};

export function Box<T extends As = "div">({ as, className, ...props }: Props<T>) {
  const Component = as || "div";
  return <Component className={cn(className)} {...props} />;
}

// Usage
<Box as="button" className="bg-primary">Click me</Box>
<Box as="a" href="/about">About</Box>
```

### Controlled/Uncontrolled Components

Support both controlled and uncontrolled modes:

```typescript
import * as React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const finalChecked = isControlled ? checked : internalChecked;

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={finalChecked}
        onChange={(e) => {
          if (!isControlled) {
            setInternalChecked(e.target.checked);
          }
          onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
    );
  }
);
```

### Context-Based Components

Use context for component state:

```typescript
// packages/ui/src/components/tabs/tabs.tsx
import * as React from "react";
import { cn } from "@workspace/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used within Tabs");
  return context;
}

export const Tabs = ({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex gap-2", className)}>{children}</div>
);

export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 rounded-lg",
        activeTab === value ? "bg-primary text-primary-foreground" : "bg-muted"
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return <div>{children}</div>;
};
```

## Shared Hooks

Create reusable hooks in `packages/hooks`:

```typescript
// packages/hooks/src/use-local-storage.ts
import * as React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
```

## Shared Utilities

Create utilities in `packages/utils`:

```typescript
// packages/utils/src/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// packages/utils/src/format.ts
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
```

## Examples from shadcn/ui

The boilerplate uses shadcn/ui components which demonstrate these patterns:

- Radix UI primitives for accessibility
- Tailwind CSS for styling
- TypeScript for type safety
- Compound components for complex UIs

## Best Practices

1. **Keep Components Focused**: Each component should do one thing well
2. **Use Composition**: Prefer composition over inheritance
3. **Provide Escape Hatches**: Allow className and style props
4. **Type Everything**: Use TypeScript for all props
5. **Document Props**: Use JSDoc for complex components
6. **Test Components**: Test in consuming applications

## Variations

### Application-Specific Components

For app-specific components, keep them in the app's components directory:

```
apps/backoffice/components/
├── dashboard/          # Dashboard-specific
├── users/              # User management-specific
└── shared/             # Shared within backoffice
```

### Feature Modules

For large features, create feature-specific component packages:

```
packages/
├── ui/                 # Generic UI components
├── user-components/    # User-related components
└── analytics-components/ # Analytics-specific components
```

## See Also

- [API Routes](/docs/patterns/api-routes) - Creating API endpoints
- [Validation](/docs/patterns/validation) - Component prop validation
- [Customization](/docs/customization/branding) - Tailoring components to your brand
