# Pisky Design System Migration - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate entire Naiera Support admin dashboard from Teal-based theme to Pisky Design System (Blue #1B53D9) while preserving 100% of existing functionality.

**Architecture:** Direct replacement approach - replace design tokens, update component styling, remove multi-tenant branding, adopt Pisky design patterns throughout.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, custom theme system

---

## File Structure Overview

**Theme Files:**
- `apps/backoffice/app/app-theme.css` - Main theme file (COMPLETE REWRITE)
- `apps/backoffice/app/globals.css` - Global styles (minor updates)
- `packages/ui/styles/globals.css` - Base UI styles (minor updates)

**Shared Components to Update:**
- `apps/backoffice/components/shared/app-card.tsx` - Update to Pisky styling
- `apps/backoffice/components/shared/app-button.tsx` - Update to Pisky styling
- `apps/backoffice/components/shared/app-identity-banner.tsx` - Simplify to solid blue

**Dashboard Components:**
- `apps/backoffice/components/dashboard/sidebar.tsx` - Remove gradients, use solid blue
- `apps/backoffice/components/dashboard/header.tsx` - Update styling
- `apps/backoffice/components/dashboard/app-switcher.tsx` - Simplify to Pisky blue

**All pages** will automatically inherit new theme through CSS variables

---

## Task 1: Preparation & Backup

**Files:**
- Backup: `apps/backoffice/app/app-theme.css` → `app-theme-teal-backup.css`

- [ ] **Step 1: Create git commit for current state**

```bash
git add .
git commit -m "feat: commit state before Pisky design system migration"
```

Expected: Clean commit with no uncommitted changes

- [ ] **Step 2: Backup current theme file**

```bash
cp apps/backoffice/app/app-theme.css apps/backoffice/app/app-theme-teal-backup.css
```

Expected: Backup file created successfully

- [ ] **Step 3: Verify backup exists**

```bash
ls -lh apps/backoffice/app/app-theme-teal-backup.css
```

Expected: File exists with same size as original

- [ ] **Step 4: Commit backup**

```bash
git add apps/backoffice/app/app-theme-teal-backup.css
git commit -m "chore: backup teal theme before migration"
```

Expected: Backup committed to git

---

## Task 2: Create Pisky Theme File

**Files:**
- Create: `apps/backoffice/app/app-theme.css` (complete replacement)

- [ ] **Step 1: Delete old theme file**

```bash
rm apps/backoffice/app/app-theme.css
```

Expected: File deleted

- [ ] **Step 2: Create new Pisky theme with CSS variables**

Create `apps/backoffice/app/app-theme.css`:

```css
/* ========================================
   PISKY DESIGN SYSTEM - NAIERA SUPPORT
   ========================================

   Primary Color: #1B53D9 (Pisky Blue)
   Secondary: #E07A5F (Coral)
   Success: #10B981
   Warning: #F59E0B
   Error: #EF4444

   Design Philosophy: Professional, Clean, Consistent
   - Single brand color (no multi-tenant gradients)
   - Neutral shadows (no colored shadows)
   - Consistent spacing and radius
   - Clean typography with Inter font

   ======================================== */

@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  /* ========================================
     PISKY BRAND COLORS
     ======================================== */

  /* Primary - Pisky Blue */
  --primary: #1B53D9;
  --primary-hover: #1542b3;
  --primary-active: #1e40af;
  --primary-light: #dbeafe;
  --primary-lighter: #eff6ff;
  --primary-foreground: #ffffff;

  /* Secondary - Coral/Terracotta */
  --secondary: #E07A5F;
  --secondary-hover: #d46a4e;
  --secondary-light: #fef2f2;

  /* Semantic Colors */
  --success: #10B981;
  --success-light: #d1fae5;

  --warning: #F59E0B;
  --warning-light: #fef3c7;

  --error: #EF4444;
  --error-light: #fee2e2;

  /* ========================================
     NEUTRAL COLORS
     ======================================== */

  /* Gray Scale */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Base Colors */
  --background: #ffffff;
  --foreground: #111827;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;

  /* ========================================
     BORDER SYSTEM
     ======================================== */

  --border: #e5e7eb;
  --border-subtle: #f3f4f6;
  --border-strong: #d1d5db;
  --border-light: #f3f4f6;
  --border-medium: #e5e7eb;
  --border-dark: #d1d5db;

  /* ========================================
     TICKET STATUS COLORS (Pisky-styled)
     ======================================== */

  --ticket-open: #1B53D9;
  --ticket-pending: #F59E0B;
  --ticket-resolved: #10B981;
  --ticket-closed: #6b7280;

  /* ========================================
     CHANNEL COLORS (Simplified Blue Variants)
     ======================================== */

  --channel-webform: #1B53D9;
  --channel-widget: #2563EB;
  --channel-integrated: #1D4ED8;

  /* ========================================
     SHADOW SYSTEM (Neutral only)
     ======================================== */

  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.07);
  --shadow-xl: 0 8px 24px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.10);

  /* ========================================
     RADIUS SYSTEM
     ======================================== */

  --radius: 0.5rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* ========================================
     SIDEBAR COLORS (Solid Blue)
     ======================================== */

  --sidebar-bg: #1B53D9;
  --sidebar-bg-top: #1e40af;
  --sidebar-border: rgba(255, 255, 255, 0.2);
  --sidebar-item-hover: rgba(255, 255, 255, 0.1);
  --sidebar-item-active: #ffffff;
  --sidebar-item-active-bg: rgba(255, 255, 255, 0.15);
  --sidebar-text: #ffffff;
  --sidebar-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-divider: rgba(255, 255, 255, 0.15);
}

/* ========================================
   DARK MODE COLORS
   ======================================== */

.dark {
  /* Primary - Brighter for dark mode */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-active: #1d4ed8;
  --primary-light: #1e3a8a;
  --primary-lighter: #172554;
  --primary-foreground: #ffffff;

  /* Base Colors */
  --background: #111827;
  --foreground: #f9fafb;
  --muted: #1f2937;
  --muted-foreground: #9ca3af;

  /* Borders */
  --border: #374151;
  --border-subtle: #1f2937;
  --border-strong: #4b5563;
  --border-light: #1f2937;
  --border-medium: #374151;
  --border-dark: #4b5563;

  /* Sidebar - Dark Mode */
  --sidebar-bg: #1e3a8a;
  --sidebar-bg-top: #1e40af;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-item-hover: rgba(255, 255, 255, 0.1);
  --sidebar-item-active: #60a5fa;
  --sidebar-item-active-bg: rgba(96, 165, 250, 0.15);
  --sidebar-text: #ffffff;
  --sidebar-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-divider: rgba(255, 255, 255, 0.1);
}

/* ========================================
   TAILWIND THEME MAPPING
   ======================================== */

@theme inline {
  /* Primary Colors */
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-active: var(--primary-active);
  --color-primary-light: var(--primary-light);
  --color-primary-lighter: var(--primary-lighter);
  --color-primary-foreground: var(--primary-foreground);

  /* Secondary Colors */
  --color-secondary: var(--secondary);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-light: var(--secondary-light);

  /* Semantic Colors */
  --color-success: var(--success);
  --color-success-light: var(--success-light);
  --color-warning: var(--warning);
  --color-warning-light: var(--warning-light);
  --color-error: var(--error);
  --color-error-light: var(--error-light);

  /* Neutral Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  /* Border Colors */
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
  --color-border-strong: var(--border-strong);
  --color-border-light: var(--border-light);
  --color-border-medium: var(--border-medium);
  --color-border-dark: var(--border-dark);

  /* Ticket & Channel Colors */
  --color-ticket-open: var(--ticket-open);
  --color-ticket-pending: var(--ticket-pending);
  --color-ticket-resolved: var(--ticket-resolved);
  --color-ticket-closed: var(--ticket-closed);
  --color-channel-webform: var(--channel-webform);
  --color-channel-widget: var(--channel-widget);
  --color-channel-integrated: var(--channel-integrated);

  /* Radius */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  /* Sidebar colors */
  --color-sidebar-bg: var(--sidebar-bg);
  --color-sidebar-text: var(--sidebar-text);
  --color-sidebar-text-muted: var(--sidebar-text-muted);
  --color-sidebar-divider: var(--sidebar-divider);
}

/* ========================================
   BASE OVERRIDES
   ======================================== */

@layer base {
  * {
    border-color: var(--border);
  }

  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  /* Inputs - Pisky styling */
  input:not([type="radio"]):not([type="checkbox"]),
  textarea,
  select {
    border: 1px solid var(--border);
    background: var(--background);
    border-radius: var(--radius-md);
    padding: 0.5rem 0.75rem;
    transition: all 0.15s ease;
  }

  input:not([type="radio"]):not([type="checkbox"]):focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(27, 83, 217, 0.1);
  }

  .dark input:not([type="radio"]):not([type="checkbox"]),
  .dark textarea,
  .dark select {
    background: var(--gray-800);
    border-color: var(--border);
  }
}

/* ========================================
   UTILITY CLASSES (Pisky-styled)
   ======================================== */

@layer utilities {
  /* Gradients */
  .bg-app-gradient {
    background: linear-gradient(135deg, #1B53D9 0%, #1e40af 100%);
  }

  .bg-surface-gradient {
    background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  }

  .bg-sidebar-gradient {
    background: linear-gradient(180deg, #1B53D9 0%, #1e40af 100%);
  }

  /* Card Styles */
  .card-pisky {
    @apply bg-background rounded-lg;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-xs);
    transition: all 0.15s ease;
  }

  .card-pisky:hover {
    border-color: var(--border-medium);
    box-shadow: var(--shadow-sm);
  }

  .card-pisky-interactive {
    @apply bg-background rounded-lg cursor-pointer;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-xs);
    transition: all 0.15s ease;
  }

  .card-pisky-interactive:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  /* Button Styles */
  .btn-pisky-primary {
    @apply text-white font-medium rounded-lg;
    background: #1B53D9;
    border: none;
    box-shadow: var(--shadow-sm);
    transition: all 0.15s ease;
  }

  .btn-pisky-primary:hover {
    background: #1542b3;
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .btn-pisky-secondary {
    @apply bg-background text-foreground rounded-lg;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-xs);
    transition: all 0.15s ease;
  }

  .btn-pisky-secondary:hover {
    border-color: var(--border-strong);
    background: var(--gray-50);
    box-shadow: var(--shadow-sm);
  }

  /* Badge Styles */
  .badge-pisky {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-ticket-open {
    @apply badge-pisky;
    color: #1B53D9;
    background: #dbeafe;
    border: 1px solid #93c5fd;
  }

  .badge-ticket-pending {
    @apply badge-pisky;
    color: #b45309;
    background: #fef3c7;
    border: 1px solid #fcd34d;
  }

  .badge-ticket-resolved {
    @apply badge-pisky;
    color: #047857;
    background: #d1fae5;
    border: 1px solid #6ee7b7;
  }

  .badge-ticket-closed {
    @apply badge-pisky;
    color: #4b5563;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
  }

  /* Channel Badges */
  .badge-channel-webform {
    @apply badge-pisky;
    color: #1B53D9;
    background: #dbeafe;
    border: 1px solid #93c5fd;
  }

  .badge-channel-widget {
    @apply badge-pisky;
    color: #1d4ed8;
    background: #dbeafe;
    border: 1px solid #93c5fd;
  }

  .badge-channel-integrated {
    @apply badge-pisky;
    color: #1e40af;
    background: #dbeafe;
    border: 1px solid #93c5fd;
  }

  /* Sidebar Styles */
  .sidebar-pisky {
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    color: var(--sidebar-text);
  }

  .sidebar-item-pisky {
    @apply rounded-lg transition-all;
    color: var(--sidebar-text-muted);
    border: 1px solid transparent;
  }

  .sidebar-item-pisky:hover {
    background: var(--sidebar-item-hover);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--sidebar-text);
  }

  .sidebar-item-pisky-active {
    background: var(--sidebar-item-active-bg);
    color: var(--sidebar-item-active);
    font-weight: 600;
    border-color: var(--sidebar-item-active);
    box-shadow: var(--shadow-sm);
  }

  .sidebar-heading-pisky {
    color: var(--sidebar-text);
    font-weight: 600;
    opacity: 0.9;
  }

  .sidebar-divider-pisky {
    background: var(--sidebar-divider);
  }

  /* Header Styles */
  .header-pisky {
    @apply bg-background/80 backdrop-blur-md;
    border-bottom: 1px solid var(--border);
  }

  /* Table Styles */
  .table-row-pisky {
    @apply transition-colors;
    border-bottom: 1px solid var(--border-subtle);
  }

  .table-row-pisky:hover {
    background: var(--gray-50);
  }

  .dark .table-row-pisky:hover {
    background: var(--gray-800);
  }

  /* Divider Styles */
  .divider-pisky {
    height: 1px;
    background: var(--border);
  }

  /* Input Styles */
  .input-pisky {
    @apply rounded-lg;
    border: 1px solid var(--border);
    background: var(--background);
    transition: all 0.15s ease;
  }

  .input-pisky:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(27, 83, 217, 0.1);
  }

  /* Dialog Styles */
  .dialog-pisky {
    @apply bg-background rounded-xl;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-xl);
  }
}

/* ========================================
   SPECIAL UTILITY CLASSES
   ======================================== */

/* Stat card */
.stat-card-pisky {
  @apply bg-background rounded-xl p-5;
  border: 1px solid var(--border);
  transition: all 0.15s ease;
}

.stat-card-pisky:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

/* Floating card */
.float-card-pisky {
  @apply bg-background rounded-xl p-6;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}

/* Page header */
.page-header-pisky {
  @apply pb-4;
  border-bottom: 1px solid var(--border-subtle);
}
```

Expected: File created with 600+ lines of Pisky theme CSS

- [ ] **Step 3: Verify theme file syntax**

```bash
cd apps/backoffice && npx tailwindcss -i app/app-theme.css -o /tmp/test-theme.css --minify
```

Expected: No syntax errors, output file generated

- [ ] **Step 4: Commit new theme**

```bash
git add apps/backoffice/app/app-theme.css
git commit -m "feat: replace teal theme with Pisky design system

- Replace teal primary with Pisky blue (#1B53D9)
- Add coral secondary color
- Update all design tokens to Pisky standards
- Remove gradient-based styling
- Simplify to single brand color"
```

Expected: Commit successful

---

## Task 3: Update AppCard Component

**Files:**
- Modify: `apps/backoffice/components/shared/app-card.tsx`

- [ ] **Step 1: Read current AppCard component**

```bash
cat apps/backoffice/components/shared/app-card.tsx
```

Expected: See current teal-themed card component

- [ ] **Step 2: Update AppCard to use Pisky utility classes**

Replace entire file content with:

```typescript
/**
 * App-Branded Card Component (Pisky Style)
 *
 * Clean cards with Pisky blue accents and neutral shadows.
 */

import * as React from "react";
import { cn } from "@workspace/utils";

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "floating" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * App-branded card (Pisky style)
 *
 * - default: Subtle shadow, visible border
 * - interactive: Hover effect with lift
 * - floating: More prominent shadow, elevated look
 * - glass: Glass morphism effect
 */
export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    };

    const variantStyles = {
      default: "card-pisky",
      interactive: "card-pisky-interactive",
      floating: "shadow-lg border-border",
      glass: "bg-background/80 backdrop-blur-md border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-background",
          paddingStyles[padding],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppCard.displayName = "AppCard";

/**
 * Card header with clean styling
 */
export function AppCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

/**
 * Card title
 */
export function AppCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

/**
 * Card description
 */
export function AppCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Card content
 */
export function AppCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

/**
 * Card footer
 */
export function AppCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  );
}

/**
 * Stat card - for dashboard metrics (Pisky-styled)
 */
export function AppStatCard({
  value,
  label,
  icon: Icon,
  trend,
  className,
}: {
  value: string | number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive?: boolean };
  className?: string;
}) {
  return (
    <AppCard variant="interactive" padding="lg" className={className}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs",
                trend.positive ? "text-success" : "text-error"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>
    </AppCard>
  );
}

/**
 * Divider - subtle line for visual separation
 */
export function AppDivider({ className }: { className?: string }) {
  return <div className={cn("divider-pisky my-4", className)} />;
}
```

Expected: File updated with Pisky styling

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit AppCard changes**

```bash
git add apps/backoffice/components/shared/app-card.tsx
git commit -m "feat: update AppCard to Pisky design system

- Replace teal utility classes with Pisky equivalents
- Use neutral shadows instead of colored shadows
- Update card variants to Pisky patterns
- Maintain all existing props and functionality"
```

Expected: Commit successful

---

## Task 4: Update AppButton Component

**Files:**
- Modify: `apps/backoffice/components/shared/app-button.tsx`

- [ ] **Step 1: Update AppButton to use Pisky utility classes**

Replace entire file content with:

```typescript
/**
 * App-Branded Button Component (Pisky Style)
 *
 * Clean buttons with Pisky blue primary and neutral shadows.
 */

import * as React from "react";
import { Button, type ButtonProps } from "@workspace/ui";
import { cn } from "@workspace/utils";

export interface AppButtonProps extends ButtonProps {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline";
}

/**
 * App-branded button (Pisky style)
 *
 * - default/primary: Pisky blue with neutral shadow
 * - secondary: White with border
 * - ghost: Transparent with subtle hover
 * - outline: Border only, transparent background
 */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = "default", size, ...props }, ref) => {
    const getVariantProps = () => {
      switch (variant) {
        case "primary":
        case "default":
          return {
            variant: "default" as const,
            className: cn(
              "btn-pisky-primary rounded-lg px-4 py-2",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          };
        case "secondary":
          return {
            variant: "default" as const,
            className: cn(
              "btn-pisky-secondary rounded-lg px-4 py-2",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          };
        case "ghost":
          return {
            variant: "ghost" as const,
            className: cn(
              "rounded-lg hover:bg-muted",
              className
            ),
          };
        case "outline":
          return {
            variant: "outline" as const,
            className: cn(
              "rounded-lg border-border hover:bg-muted hover:border-border-medium",
              className
            ),
          };
        default:
          return {
            variant: variant as ButtonProps["variant"],
            className,
          };
        }
    };

    const { variant: mappedVariant, className: mappedClassName } = getVariantProps();

    return <Button ref={ref} variant={mappedVariant} className={mappedClassName} {...props} />;
  }
);

AppButton.displayName = "AppButton";

/**
 * Action button for cards/tables
 */
export function AppActionButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      size="sm"
      className={cn(
        "btn-pisky-primary rounded-lg text-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Icon button - soft hover
 */
export function AppIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "rounded-lg transition-all hover:bg-muted hover:scale-105",
        className
      )}
      {...props}
    />
  );
}

/**
 * Group of buttons
 */
export function AppButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
```

Expected: File updated with Pisky styling

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 3: Commit AppButton changes**

```bash
git add apps/backoffice/components/shared/app-button.tsx
git commit -m "feat: update AppButton to Pisky design system

- Replace teal gradient buttons with Pisky blue
- Use neutral shadows instead of colored shadows
- Update button variants to Pisky patterns
- Maintain all existing props and functionality"
```

Expected: Commit successful

---

## Task 5: Update AppIdentityBanner Component

**Files:**
- Modify: `apps/backoffice/components/shared/app-identity-banner.tsx`

- [ ] **Step 1: Read current AppIdentityBanner**

```bash
cat apps/backoffice/components/shared/app-identity-banner.tsx
```

Expected: See current banner with multi-tenant branding

- [ ] **Step 2: Simplify AppIdentityBanner to solid Pisky blue**

Replace entire file content with:

```typescript
/**
 * App Identity Banner (Pisky Style)
 *
 * Simplified banner with solid Pisky blue branding.
 * No multi-tenant colors or gradients.
 */

import { ReactNode } from "react";
import { cn } from "@workspace/utils";

interface AppIdentityBannerProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AppIdentityBanner({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AppIdentityBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary to-primary-hover p-6",
        className
      )}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
            <Icon className="size-6 text-white" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-sm text-white/90">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
```

Expected: File updated with simplified Pisky blue design

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit AppIdentityBanner changes**

```bash
git add apps/backoffice/components/shared/app-identity-banner.tsx
git commit -m "feat: simplify AppIdentityBanner to Pisky blue

- Remove multi-tenant color logic
- Use solid Pisky blue gradient
- Simplify to single brand color
- Remove app-specific customization"
```

Expected: Commit successful

---

## Task 6: Update Sidebar Component

**Files:**
- Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

- [ ] **Step 1: Update sidebar class names to Pisky styles**

In `apps/backoffice/components/dashboard/sidebar.tsx`, update line 115:

Change:
```typescript
<Sidebar className="sidebar-startup">
```

To:
```typescript
<Sidebar className="sidebar-pisky">
```

Update line 120:
```typescript
className="hover:bg-white/20"
```

To:
```typescript
className="hover:bg-white/10"
```

Update lines 162-165:
```typescript
className={active
  ? "sidebar-item-startup-active"
  : "sidebar-item-startup"
}
```

To:
```typescript
className={active
  ? "sidebar-item-pisky-active"
  : "sidebar-item-pisky"
}
```

Update line 148:
```typescript
className="sidebar-heading px-2 py-1.5 text-xs"
```

To:
```typescript
className="sidebar-heading-pisky px-2 py-1.5 text-xs"
```

Expected: Sidebar updated to use Pisky utility classes

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 3: Commit sidebar changes**

```bash
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: update sidebar to Pisky design system

- Replace teal gradient with solid Pisky blue
- Use Pisky utility classes for nav items
- Simplify active/hover states
- Remove multi-tenant color variations"
```

Expected: Commit successful

---

## Task 7: Update Header Component

**Files:**
- Modify: `apps/backoffice/components/dashboard/header.tsx`

- [ ] **Step 1: Read current header component**

```bash
cat apps/backoffice/components/dashboard/header.tsx
```

Expected: See current header with teal styling

- [ ] **Step 2: Update header to use Pisky styles**

Find and replace any instances of:
- `header-startup` → `header-pisky`
- Any teal color references → remove or use primary

Expected: Header updated with Pisky styling

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit header changes**

```bash
git add apps/backoffice/components/dashboard/header.tsx
git commit -m "feat: update header to Pisky design system

- Replace teal styling with neutral Pisky patterns
- Use Pisky border and shadow utilities
- Maintain all functionality"
```

Expected: Commit successful

---

## Task 8: Update Ticketing Components

**Files:**
- Modify: `apps/backoffice/components/admin/tickets-data-table.tsx`
- Modify: Any other ticketing components with custom badge classes

- [ ] **Step 1: Find all files with ticket badge references**

```bash
grep -r "badge-ticket-" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -l
```

Expected: List of files using ticket badge classes

- [ ] **Step 2: Update ticket badge classes in each file**

For each file found, ensure badge classes reference Pisky theme:
- `badge-ticket-open` → Keep name, already updated in theme
- `badge-ticket-pending` → Keep name, already updated in theme
- `badge-ticket-resolved` → Keep name, already updated in theme
- `badge-ticket-closed` → Keep name, already updated in theme

No changes needed - CSS classes already defined in new theme

- [ ] **Step 3: Update any channel badge references**

```bash
grep -r "badge-channel-" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -l
```

Expected: List of files using channel badge classes

- [ ] **Step 4: Verify channel badges work with new theme**

Channel badge classes already defined in Pisky theme, no code changes needed

- [ ] **Step 5: Commit any ticketing component updates**

```bash
git add apps/backoffice/components/admin/tickets-data-table.tsx
git add apps/backoffice/components/ticketing/
git commit -m "feat: update ticketing components to Pisky design system

- Ticket status badges use Pisky color tokens
- Channel badges simplified to blue variants
- All styling follows Pisky patterns"
```

Expected: Commit successful (or no changes if already compatible)

---

## Task 9: Update Admin Table Components

**Files:**
- Modify: `apps/backoffice/components/admin/data-table/data-table.tsx`
- Modify: Any other admin table components

- [ ] **Step 1: Find all data table components**

```bash
grep -r "table-row-startup" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -l
```

Expected: List of files using table row classes

- [ ] **Step 2: Update table row class references**

Replace `table-row-startup` with `table-row-pisky` in all files

Expected: Tables updated to use Pisky hover styles

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit table component updates**

```bash
git add apps/backoffice/components/admin/
git commit -m "feat: update admin tables to Pisky design system

- Replace teal table styles with Pisky patterns
- Use neutral hover backgrounds
- Maintain all table functionality"
```

Expected: Commit successful

---

## Task 10: Update App Switcher Component

**Files:**
- Modify: `apps/backoffice/components/dashboard/app-switcher.tsx`

- [ ] **Step 1: Read current app switcher**

```bash
cat apps/backoffice/components/dashboard/app-switcher.tsx
```

Expected: See current switcher with multi-tenant colors

- [ ] **Step 2: Simplify app switcher to Pisky blue**

Remove any app-specific color logic. Use primary blue for all apps.

Update the component to use solid Pisky blue styling instead of per-app colors.

Expected: App switcher simplified to single blue brand

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit app switcher changes**

```bash
git add apps/backoffice/components/dashboard/app-switcher.tsx
git commit -m "feat: simplify app switcher to Pisky blue

- Remove per-app color logic
- Use single Pisky blue for all apps
- Simplify dropdown styling"
```

Expected: Commit successful

---

## Task 11: Update Utility Class References in All Components

**Files:**
- Modify: All component files with old utility class references

- [ ] **Step 1: Find all files with old utility classes**

```bash
grep -r "card-attio\|card-soft\|btn-primary\|btn-secondary\|sidebar-startup" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -l
```

Expected: List of files using old utility classes

- [ ] **Step 2: Replace old utility classes with Pisky equivalents**

For each file found, replace:
- `card-attio` → `card-pisky`
- `card-attio-interactive` → `card-pisky-interactive`
- `btn-primary` → `btn-pisky-primary`
- `btn-secondary` → `btn-pisky-secondary`
- `sidebar-startup` → `sidebar-pisky`
- `sidebar-item-startup` → `sidebar-item-pisky`
- `sidebar-item-startup-active` → `sidebar-item-pisky-active`
- `sidebar-heading` → `sidebar-heading-pisky`

Expected: All utility classes updated

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 4: Commit utility class updates**

```bash
git add apps/backoffice/components/
git commit -m "feat: replace all utility classes with Pisky equivalents

- Update all component references to Pisky classes
- Remove teal-themed utility classes
- Ensure consistent Pisky styling throughout"
```

Expected: Commit successful

---

## Task 12: Update Global Styles

**Files:**
- Modify: `apps/backoffice/app/globals.css`

- [ ] **Step 1: Read current globals.css**

```bash
cat apps/backoffice/app/globals.css
```

Expected: See current global styles

- [ ] **Step 2: Update globals.css to import Pisky theme**

Ensure the file imports the new theme:

```css
@import "./app-theme.css";

/* Additional global styles */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

Expected: Global styles updated

- [ ] **Step 3: Commit globals.css changes**

```bash
git add apps/backoffice/app/globals.css
git commit -m "feat: update global styles for Pisky theme

- Import new Pisky theme
- Ensure proper theme inheritance"
```

Expected: Commit successful

---

## Task 13: Start Development Server

**Files:**
- None (verification step)

- [ ] **Step 1: Start dev server**

```bash
pnpm --filter backoffice dev
```

Expected: Server starts on port 3001

- [ ] **Step 2: Wait for compilation**

Expected: No compilation errors

- [ ] **Step 3: Open browser to http://localhost:3001**

Expected: Application loads with new Pisky blue theme

- [ ] **Step 4: Take visual snapshot**

Note: Visually verify that Pisky blue is showing throughout the app

---

## Task 14: Manual Testing Checklist

**Files:**
- None (verification step)

- [ ] **Step 1: Test Dashboard page**

Navigate to http://localhost:3001

Verify:
- [ ] Stat cards display with Pisky blue accents
- [ ] Sidebar shows solid Pisky blue background
- [ ] No teal colors visible
- [ ] All cards use neutral shadows

- [ ] **Step 2: Test Tickets page**

Navigate to http://localhost:3001/tickets

Verify:
- [ ] Table rows use Pisky hover styles
- [ ] Status badges show correct colors (blue, amber, green, gray)
- [ ] Action buttons use Pisky blue
- [ ] Filters and inputs use Pisky styling

- [ ] **Step 3: Test Ticket Detail page**

Click on any ticket

Verify:
- [ ] Detail cards use Pisky card styling
- [ ] Message bubbles use Pisky colors
- [ ] Attachments display correctly
- [ ] All buttons and forms work

- [ ] **Step 4: Test Apps page**

Navigate to http://localhost:3001/apps

Verify:
- [ ] App cards use Pisky styling
- [ ] App switcher shows blue branding
- [ ] No per-app color variations

- [ ] **Step 5: Test Admin pages**

Navigate to http://localhost:3001/manage/users

Verify:
- [ ] Data tables use Pisky styles
- [ ] Forms use Pisky input styling
- [ ] Modals and dialogs use Pisky patterns
- [ ] All CRUD operations work

- [ ] **Step 6: Test dark mode (if applicable)**

Toggle dark mode

Verify:
- [ ] Colors adjust properly
- [ ] No teal colors in dark mode
- [ ] All components readable

- [ ] **Step 7: Test responsive design**

Resize browser to mobile width

Verify:
- [ ] Sidebar collapses properly
- [ ] Cards stack correctly
- [ ] No layout breaks

- [ ] **Step 8: Test forms and interactions**

Try creating/editing various entities

Verify:
- [ ] All forms submit correctly
- [ ] Validation messages display
- [ ] No broken functionality
- [ ] All API calls work

---

## Task 15: Final Verification & Cleanup

**Files:**
- None (verification step)

- [ ] **Step 1: Check for any remaining teal color references**

```bash
grep -r "oklch.*190\|teal\|turquoise" apps/backoffice/app/ apps/backoffice/components/ --include="*.tsx" --include="*.ts" --include="*.css" -n
```

Expected: No teal/turquoise color references (except in backup file)

- [ ] **Step 2: Check for any remaining gradient references that should be solid**

```bash
grep -r "gradient-sidebar\|gradient-primary" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -n
```

Expected: Only acceptable gradient references remain

- [ ] **Step 3: Verify app identity color logic is removed**

```bash
grep -r "getAppIdentity\|app-identity" apps/backoffice/components/ --include="*.tsx" --include="*.ts" -l
```

Expected: Only AppIdentityBanner component uses app identity (simplified)

- [ ] **Step 4: Run TypeScript check**

```bash
cd apps/backoffice && npx tsc --noEmit --pretty
```

Expected: No type errors

- [ ] **Step 5: Check for console errors**

Check browser console for any errors or warnings

Expected: No console errors

- [ ] **Step 6: Verify all pages load without errors**

Navigate through all major pages:
- Dashboard
- Tickets (list and detail)
- Apps
- Users, Roles, Permissions
- Settings

Expected: All pages load successfully

---

## Task 16: Final Commit

**Files:**
- None (final commit)

- [ ] **Step 1: Add all remaining changes**

```bash
git add .
```

Expected: All changes staged

- [ ] **Step 2: Create final migration commit**

```bash
git commit -m "feat: complete Pisky design system migration

BREAKING CHANGE: Complete design system migration from teal to Pisky blue

Changes:
- Replaced entire theme with Pisky design tokens
- Updated all components to use Pisky styling
- Removed multi-tenant app identity colors
- Simplified to single Pisky blue brand
- Updated all utility classes to Pisky patterns
- Maintained 100% of existing functionality

Theme Details:
- Primary: #1B53D9 (Pisky Blue)
- Secondary: #E07A5F (Coral)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Neutral shadows (no colored shadows)
- Simplified sidebar (solid blue, no gradients)

Migration Type: Direct replacement (big bang)
Rollback: git revert HEAD or restore app-theme-teal-backup.css

Testing:
- Manual testing completed on all major pages
- All CRUD operations verified
- No functionality broken
- No console errors"
```

Expected: Commit successful

- [ ] **Step 3: Verify commit history**

```bash
git log --oneline -10
```

Expected: See migration commits in sequence

- [ ] **Step 4: Optional - Create tag for easy rollback**

```bash
git tag -a pisky-migration -m "Pisky design system migration complete"
```

Expected: Tag created

---

## Success Criteria Verification

After completing all tasks, verify:

**Functional Requirements:**
- ✅ All existing features work identically
- ✅ No broken API calls or data flows
- ✅ All forms submit correctly
- ✅ All modals and dialogs function
- ✅ Tables filter, sort, and paginate properly
- ✅ Authentication and authorization unaffected
- ✅ File uploads work correctly
- ✅ All navigation links work

**Design Requirements:**
- ✅ All UI uses Pisky blue (#1B53D9) as primary
- ✅ No teal/turquoise colors remain
- ✅ Consistent spacing using Pisky scale
- ✅ Consistent shadows using Pisky system
- ✅ Consistent border radius using Pisky values
- ✅ Typography follows Pisky scale
- ✅ All components match Pisky aesthetic

**Quality Requirements:**
- ✅ No console errors
- ✅ No visual layout breaks
- ✅ Responsive design maintained
- ✅ Accessible color contrast maintained
- ✅ Smooth transitions and animations

---

## Rollback Instructions

If critical issues are found after migration:

**Option 1: Revert migration commit**
```bash
git revert HEAD
```

**Option 2: Restore backup theme**
```bash
cp apps/backoffice/app/app-theme-teal-backup.css apps/backoffice/app/app-theme.css
git add apps/backoffice/app/app-theme.css
git commit -m "revert: restore teal theme from backup"
```

**Option 3: Reset to pre-migration state**
```bash
git log --oneline  # Find commit before migration
git reset --hard <commit-hash>
```

---

## Notes

- This migration affects **presentation layer only**
- **Zero changes** to business logic, services, or API routes
- **Zero changes** to database schema or migrations
- **Zero changes** to authentication or authorization logic
- All changes are in CSS and component styling
- Functionality is preserved 100%

---

**End of Implementation Plan**
