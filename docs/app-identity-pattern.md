# App Identity Pattern

## Overview

This document defines the pattern for creating unique app identities within the Naiera ecosystem while maintaining consistency and familiarity across all applications.

## Philosophy

Each app in the ecosystem should:
1. **Be instantly recognizable** - Users should know which app they're in at a glance
2. **Feel familiar** - Interactions, patterns, and behaviors remain consistent
3. **Share a foundation** - Base components, spacing, and typography are universal

## The Three-Layer System

```
┌─────────────────────────────────────────────────────┐
│ LAYER 1: Base (packages/ui/styles/globals.css)      │
│ - Shared across all apps                             │
│ - Component behaviors                                │
│ - Semantic colors (success, warning, error)          │
│ - Neutral colors (background, foreground, borders)   │
│ - Spacing system                                     │
│ - Typography scale                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ LAYER 2: App Theme (apps/[app]/app/app-theme.css)   │
│ - App-specific brand colors                          │
│ - App gradients                                      │
│ - App-specific utility classes                       │
│ - CSS variable overrides                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ LAYER 3: App Identity (lib/config/app-identity.ts)  │
│ - Programmatic app config                            │
│ - App metadata                                       │
│ - Icon, colors, features                             │
│ - Used in components dynamically                     │
└─────────────────────────────────────────────────────┘
```

## Implementation Checklist

When creating a new app, follow these steps:

### Step 1: Define Your Color Palette

Choose a primary color that:
- Represents your app's purpose
- Is distinct from other apps in the ecosystem
- Works well with your target users

**Color Strategy Examples:**

| App Type | Color Family | Rationale |
|----------|-------------|-----------|
| Support/Ticketing | Teal/Turquoise | Calming, friendly, professional |
| Communication | Blue/Indigo | Trust, clarity, connection |
| Analytics/Reports | Purple/Violet | Insight, wisdom, data |
| Finance | Green/Emerald | Money, growth, positive |
| HR/People | Warm Orange | Human, friendly, approachable |
| Security | Red/Crimson | Alert, protection, important |
| Tasks/Productivity | Amber/Yellow | Energy, action, focus |

### Step 2: Create App Theme File

Create `apps/[your-app]/app/app-theme.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  /* Override primary colors with your app's brand */
  --primary: oklch(YOUR_VALUES);
  --primary-hover: oklch(YOUR_VALUES);
  --primary-active: oklch(YOUR_VALUES);
  --primary-light: oklch(YOUR_VALUES);
  --primary-lighter: oklch(YOUR_VALUES);

  /* Override accent for hover states */
  --accent: oklch(YOUR_VALUES);
  --accent-hover: oklch(YOUR_VALUES);

  /* Define app-specific gradient */
  --gradient-primary: linear-gradient(135deg, COLOR1, COLOR2);
}

.dark {
  /* Dark mode overrides */
  --primary: oklch(YOUR_DARK_MODE_VALUES);
  /* ... */
}

@theme inline {
  --color-primary: var(--primary);
  /* ... map all CSS vars to Tailwind colors */
}

@layer utilities {
  /* App-specific utility classes */
  .bg-app-gradient { background: var(--gradient-primary); }
}
```

### Step 3: Import in globals.css

Update `apps/[your-app]/app/globals.css`:

```css
@import "../../../packages/ui/styles/globals.css";
@import "./app-theme.css"; /* Must come AFTER base theme */
```

### Step 4: Create App Identity Config

Create `apps/[your-app]/lib/config/app-identity.ts`:

```typescript
import { YourIcon } from "lucide-react";

export const appIdentity = {
  name: "Your App Name",
  fullName: "Your App Full Name",
  shortName: "ShortName",
  tagline: "Brief description",

  icon: YourIcon,
  iconColor: "oklch(...)",

  description: "Longer description...",

  category: "your-category",
  industry: "government",

  version: "1.0.0",

  colors: {
    primary: "oklch(...)",
    primaryLight: "oklch(...)",
    primaryDark: "oklch(...)",
    accent: "oklch(...)",
  },

  features: ["Feature 1", "Feature 2"],

  targetUsers: ["User Type 1", "User Type 2"],

  theme: {
    style: "modern-friendly",
    mood: "professional-approachable",
    primaryColorFamily: "your-color",
    borderStyle: "rounded",
    animationStyle: "smooth",
  },
} as const;
```

### Step 5: Create App-Specific Components

Copy and customize these component templates:

#### App-Branded Button (`components/shared/app-button.tsx`)

```typescript
import { Button } from "@workspace/ui";

export const AppButton = (props) => {
  return <Button className="bg-app-gradient" {...props} />;
};
```

#### App Identity Banner (`components/shared/app-identity-banner.tsx`)

```typescript
import { getAppIdentity } from "@/lib/config/app-identity";

export function AppIdentityBanner() {
  const appIdentity = getAppIdentity();
  return (
    <div className="bg-app-gradient">
      <appIdentity.icon />
      <h1>{appIdentity.name}</h1>
    </div>
  );
}
```

### Step 6: Update Sidebar with App Identity

Update `components/dashboard/sidebar.tsx`:

```typescript
import { getAppIdentity } from "@/lib/config/app-identity";

export function AppSidebar() {
  const appIdentity = getAppIdentity();
  const AppIcon = appIdentity.icon;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="bg-app-gradient">
              <AppIcon />
            </div>
            <div>
              <span>{appIdentity.shortName}</span>
              <span>{appIdentity.tagline}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      {/* ... */}
    </Sidebar>
  );
}
```

## What Stays Consistent

These elements MUST remain the same across all apps:

| Element | Value | Location |
|---------|-------|----------|
| Border Radius | `--radius: 0.75rem` | Base theme |
| Font Family | Space Grotesk + JetBrains Mono | Base theme |
| Spacing Scale | Tailwind default | Base theme |
| Semantic Colors | Success, Warning, Error, Info | Base theme |
| Neutral Colors | Background, Foreground, Muted | Base theme |
| Component Behavior | All shadcn/ui components | @workspace/ui |

## What Can Vary

These elements CAN be different per app:

| Element | Location |
|---------|----------|
| Primary Color | app-theme.css |
| Accent Color | app-theme.css |
| App Icon | app-identity.ts |
| App Name | app-identity.ts |
| Gradients | app-theme.css |
| Category-specific colors | app-theme.css |
| Illustration style | App-specific |

## Visual Identity Checklist

When reviewing your app's identity:

- [ ] Primary color is distinct from other apps
- [ ] App icon is visible in sidebar
- [ ] Gradient buttons use app-specific colors
- [ ] Page headers show app identity
- [ ] Dark mode preserves app identity
- [ ] Components use consistent spacing from base
- [ ] Typography follows base scale
- [ ] Status colors (success/error) match base
- [ ] Border radius matches base (0.75rem)

## Examples

See these files for reference implementations:

- **Naiera Support**: `/apps/backoffice/`
  - `app/app-theme.css` - Teal/Turquoise theme
  - `lib/config/app-identity.ts` - Ticketing app identity
  - `components/dashboard/sidebar.tsx` - Branded sidebar
  - `components/shared/app-button.tsx` - App-branded buttons

## Quick Reference: OKLCH Colors

Use OKLCH for consistent, accessible colors:

```css
/* Format: oklch(lightness chroma hue) */
/* Lightness: 0-1 (0=black, 1=white) */
/* Chroma: 0-0.4 (0=gray, higher=more saturated) */
/* Hue: 0-360 (color wheel) */

/* Teal example */
--primary: oklch(0.58 0.16 190);

/* Purple example */
--primary: oklch(0.55 0.2 300);

/* Orange example */
--primary: oklch(0.65 0.2 50);
```

Find more at: [oklch.com](https://oklch.com)
