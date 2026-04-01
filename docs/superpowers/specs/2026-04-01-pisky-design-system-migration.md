# Pisky Design System Migration - Design Specification

**Date:** 2026-04-01
**Project:** Naiera Support Admin Dashboard
**Goal:** Migrate from current Teal-based theme to Pisky Design System (Blue-based)

---

## Executive Summary

Complete design system migration from custom Teal/Turquoise theme to Pisky Design System. This is a direct replacement approach that will update all UI components, design tokens, and styling while maintaining 100% of existing functionality.

**Key Changes:**
- Replace Teal primary color with Pisky Blue (#1B53D9)
- Remove multi-tenant app identity colors → single Pisky blue brand
- Migrate all custom components to Pisky design patterns
- Update typography, spacing, and shadows to Pisky standards
- Preserve all business logic, API calls, and state management

---

## Architecture & Strategy

### High-Level Approach

**Direct Replacement (Big Bang)**
- Single comprehensive migration replacing entire design system
- Maintain all existing functionality while changing only presentation layer
- Keep same component structure but replace styling approach
- No feature flags or gradual rollout

**Migration Scope:**
```
app-theme.css              → Replace with Pisky tokens
components/shared/         → Update to Pisky styles
components/dashboard/      → Update styling
components/ticketing/      → Update styling
components/admin/          → Update styling
All pages                  → Automatic inheritance via theme
```

### Risk Mitigation

1. **Git commit before migration** - Easy rollback if needed
2. **Manual testing checklist** - Verify all functionality post-migration
3. **Component classification** - Clear mapping of what changes where
4. **Preserve variable names** - Maintain CSS variable names for compatibility

---

## Design Tokens Migration

### Color System

**Current (Teal-based):**
```css
--primary: oklch(0.58 0.16 190); /* Teal */
--primary-hover: oklch(0.52 0.15 190);
--primary-light: oklch(0.94 0.04 190);
--gradient-primary: linear-gradient(135deg, teal variants);
--gradient-sidebar: linear-gradient(180deg, teal gradient);
```

**New (Pisky Blue):**
```css
--primary: #1B53D9; /* Pisky Blue */
--primary-hover: #1542b3;
--primary-light: #dbeafe;
--secondary: #E07A5F; /* Coral/Terracotta */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### Semantic Colors Mapping

| Usage | Current (Teal) | New (Pisky) |
|-------|---------------|-------------|
| Primary actions | Teal | #1B53D9 (Blue) |
| Secondary actions | Teal light | #E07A5F (Coral) |
| Success | Green | #10B981 |
| Warning | Amber | #F59E0B |
| Error | Red | #EF4444 |

**Ticket Status Colors:**
```
Open      → Primary Blue (#1B53D9)
Pending   → Warning/Amber (#F59E0B)
Resolved  → Success/Green (#10B981)
Closed    → Neutral/Gray (#6B7280)
```

**Channel Types (Simplified):**
```
Webform     → Primary Blue (#1B53D9)
Widget      → Blue-600 (#2563EB)
Integrated  → Blue-700 (#1D4ED8)
```

### Typography

**Pisky Font Scale:**
```css
10px, 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 61px
```

**Font Families:**
- Body: Inter (already in use)
- Headings: Inter or Merriweather (optional)
- Code: Fira Code (if needed)

**Line Height:** 1.5 (consistent across all text)

### Spacing

**Radius System:**
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

**Spacing Scale:** Multiples of 4px
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px`

### Shadows

**Pisky Shadow System:**
```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
--shadow-md: 0 2px 8px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.07);
--shadow-xl: 0 8px 24px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.10);
```

**No colored shadows** - Pisky uses neutral shadows only

---

## Component Migration Strategy

### Three-Tier Approach

**Tier 1: Direct Pisky Replacement**
- Components that exist in Pisky with equivalent functionality
- Action: Replace with Pisky component directly

**Tier 2: Custom Logic + Pisky Styling**
- Components with custom business logic but standard UI
- Action: Keep component, apply Pisky design tokens

**Tier 3: Unique Components - Adapt to Pisky**
- Components unique to Naiera with no Pisky equivalent
- Action: Rewrite styles using Pisky design patterns

---

### Component Classification

#### Tier 1: Direct Replacement

| Current Component | Pisky Component | Action |
|-------------------|-----------------|--------|
| Button | Pisky Button | Replace |
| Card (basic) | Pisky Card | Replace |
| Input | Pisky Input | Replace |
| Select | Pisky Select | Replace |
| Badge | Pisky Badge | Replace |
| Table | Pisky Table | Replace |
| Dialog/Modal | Pisky Dialog | Replace |
| Alert | Pisky Alert | Replace |
| Tabs | Pisky Tabs | Replace |
| Checkbox | Pisky Checkbox | Replace |
| Form | Pisky Form | Replace |

#### Tier 2: Custom Logic + Pisky Styling

| Component | Why Custom | Action |
|-----------|-----------|--------|
| AppStatCard | Has trend, icon, value props | Keep logic, use Pisky card styling |
| AppActionButton | Convenience wrapper | Use Pisky button variants |
| AppIconButton | Size variant | Use Pisky icon button style |
| TicketDataTable | Has filtering, pagination | Keep logic, apply Pisky table styles |
| AttachmentUpload | File handling logic | Keep logic, Pisky-styled UI |
| Data Table (Admin) | Server-side pagination | Keep logic, apply Pisky table styles |

#### Tier 3: Unique Components - Adapt to Pisky

| Component | Unique Feature | Pisky Adaptation |
|-----------|---------------|------------------|
| AppIdentityBanner | Multi-tenant branding | Simplify to solid Pisky blue, no gradients |
| AppSwitcher | App selection dropdown | Pisky dropdown styling |
| TicketMessageBubble | Chat message display | Pisky colors, radius, shadows |
| TicketTimeline | Ticket status history | Pisky design tokens for timeline |
| AppChannelBadge | Channel type indicator | Simplify to Pisky blue variants |
| MultiSelectFilter | Custom filter dropdown | Pisky-styled dropdown and tags |
| AppDivider | Custom divider styles | Use Pisky border colors |

---

## Page Updates

### Dashboard (`/app/(dashboard)/page.tsx`)

**Changes:**
- Stat cards: Use Pisky card styling with blue accents
- Charts: Update colors to Pisky palette
- Layout: No changes to structure

**Components to Update:**
- AppStatCard → Pisky-styled cards
- Stat value colors → Pisky blue
- Trend indicators → Pisky success/warning colors

### Tickets List (`/app/(dashboard)/tickets/page.tsx`)

**Changes:**
- Table: Use Pisky Table component styling
- Filters: Pisky input/select styling
- Action buttons: Pisky buttons and dialogs
- Status badges: Pisky Badge with semantic colors

**Components to Update:**
- TicketDataTable → Apply Pisky table styles
- Filter inputs → Pisky input styling
- Status badges → Pisky badge variants
- Action dropdown → Pisky dropdown menu

### Ticket Detail (`/app/(dashboard)/tickets/[id]/page.tsx`)

**Changes:**
- Cards: Pisky card components
- Messages: Pisky-styled message bubbles
- Attachments: Pisky-styled upload component
- Timeline: Pisky design tokens

**Components to Update:**
- Ticket detail cards → Pisky cards
- Message bubbles → Pisky colors and radius
- Attachment list → Pisky list styling
- Timeline → Pisky border and spacing

### Apps Management (`/app/(dashboard)/apps/page.tsx`)

**Changes:**
- Remove app identity color logic
- Standardize all apps to Pisky blue
- Update app cards to Pisky styling

**Components to Update:**
- App switcher → Simplify to Pisky blue
- App cards → Pisky card styling
- Channel badges → Simplified blue variants

### Public Support Pages

**Changes:**
- Apply Pisky styling to public-facing pages
- Maintain brand consistency with admin

**Pages:**
- `/support/tickets/new` → Pisky form styling
- `/support/tickets/[id]` → Pisky card and badge styling

### Admin Pages

**Changes:**
- Forms: Pisky form components
- Data tables: Pisky table styling
- Modals: Pisky dialog component

**Pages:**
- `/manage/users` → Pisky table and forms
- `/manage/roles` → Pisky table and forms
- `/manage/permissions` → Pisky table and forms
- `/manage/system-settings` → Pisky forms

---

## Sidebar Transformation

### Current State

**Multi-tenant sidebar with gradient:**
```css
background: linear-gradient(180deg,
  oklch(0.94 0.06 190) 0%,   /* Teal light */
  oklch(0.97 0.04 190) 50%,  /* Teal medium */
  oklch(0.995 0.002 264) 100% /* Gray */
);
```

**App-specific colors:** Each app has its own brand color

### New State

**Single-brand Pisky blue sidebar:**
```css
background: #1B53D9; /* Solid Pisky blue */
/* OR subtle gradient */
background: linear-gradient(180deg, #1B53D9 0%, #1e40af 100%);
```

**Changes:**
1. Remove app identity color logic
2. Standardize all apps to Pisky blue
3. Update nav items to Pisky styling
4. Simplify active state styling

---

## Implementation Steps

### Phase 1: Preparation

1. **Commit current state**
   ```bash
   git add .
   git commit -m "feat: commit state before Pisky migration"
   ```

2. **Backup current theme**
   - Rename `app-theme.css` → `app-theme-teal-backup.css`

3. **Audit all components**
   - List all components in `apps/backoffice/components/`
   - Classify into Tier 1, 2, or 3
   - Create migration checklist

### Phase 2: Theme Migration

4. **Create new Pisky theme**
   - Copy Pisky design tokens to `app-theme.css`
   - Map all existing CSS variables to Pisky values
   - Maintain same variable names for compatibility
   - Remove gradient-based styles
   - Update utility classes to Pisky patterns

5. **Update global styles**
   - Remove teal-specific utility classes
   - Add Pisky utility classes
   - Update base layer styles

### Phase 3: Component Migration

6. **Update shared components** (Tier 1)
   - Replace Button with Pisky button
   - Replace Card with Pisky card
   - Replace Input with Pisky input
   - Replace Badge with Pisky badge

7. **Update shared components** (Tier 2)
   - AppStatCard: Apply Pisky card styling
   - AppActionButton: Use Pisky button variants
   - AppIconButton: Use Pisky icon button style

8. **Adapt unique components** (Tier 3)
   - AppIdentityBanner: Simplify to Pisky blue
   - TicketMessageBubble: Pisky colors and radius
   - AppSwitcher: Pisky dropdown styling
   - Custom badges: Pisky color tokens

### Phase 4: Page Updates

9. **Update specialized components**
   - Ticket components: Update badge colors
   - Admin components: Update table/form styling
   - Dashboard components: Update stat cards

10. **Remove app-specific branding**
    - Remove app identity color logic from sidebar
    - Remove multi-tenant color utilities
    - Standardize all to Pisky blue

### Phase 5: Verification

11. **Start dev server**
    ```bash
    pnpm --filter backoffice dev
    ```

12. **Manual testing checklist**
    - [ ] Dashboard loads and displays correctly
    - [ ] All ticket pages functional
    - [ ] Admin pages work correctly
    - [ ] Forms submit successfully
    - [ ] Modals/dialogs open and close
    - [ ] Tables render and filter
    - [ ] Responsive design works
    - [ ] Dark mode works (if applicable)

13. **Visual regression check**
    - Compare key pages before/after
    - Verify spacing and alignment
    - Check color consistency

14. **Final commit**
    ```bash
    git add .
    git commit -m "feat: migrate to Pisky design system

    - Replace teal theme with Pisky blue
    - Migrate all components to Pisky design tokens
    - Remove multi-tenant app identity colors
    - Standardize to single Pisky blue brand
    - Preserve all existing functionality"
    ```

---

## Pisky Design Patterns Reference

### Custom Component Guidelines

When adapting custom components not in Pisky, apply these patterns:

**Colors:**
- Primary actions: `#1B53D9` (Pisky blue)
- Hover: `#1542b3` (darker blue)
- Active: `#1e40af` (even darker)
- Background tints: `#1B53D9` with opacity (0.05, 0.08, 0.12)
- Secondary: `#E07A5F` (coral)

**Borders:**
- Width: `1px`
- Colors: `#E5E7EB` (gray-200), `#D1D5DB` (gray-300)
- Radius: `4px` (sm), `8px` (md), `12px` (lg), `16px` (xl)

**Shadows:**
- Subtle: `0 1px 2px rgba(0,0,0,0.05)`
- Medium: `0 2px 8px rgba(0,0,0,0.08)`
- Strong: `0 4px 16px rgba(0,0,0,0.12)`

**Typography:**
- Font family: `Inter`, sans-serif
- Sizes: `12px, 14px, 16px, 18px, 20px, 24px`
- Weights: `400` (normal), `500` (medium), `600` (semibold), `700` (bold)
- Line height: `1.5`

**Spacing:**
- Padding: `4px, 8px, 12px, 16px, 20px, 24px, 32px`
- Gaps: `4px, 8px, 12px, 16px, 24px`

**States:**
- Hover: Lighten background by 5-10%
- Active: Add subtle shadow or darker background
- Focus: Blue outline ring (`0 0 0 3px rgba(27, 83, 217, 0.1)`)

**Transitions:**
- Duration: `150ms` or `200ms`
- Easing: `ease` or `ease-in-out`
- Properties: `all`, `background-color`, `border-color`, `box-shadow`

---

## Success Criteria

### Functional Requirements

- ✅ All existing features work identically
- ✅ No broken API calls or data flows
- ✅ All forms submit correctly
- ✅ All modals and dialogs function
- ✅ Tables filter, sort, and paginate properly
- ✅ Authentication and authorization unaffected
- ✅ File uploads work correctly
- ✅ All navigation links work

### Design Requirements

- ✅ All UI uses Pisky blue (#1B53D9) as primary
- ✅ No teal/turquoise colors remain
- ✅ Consistent spacing using Pisky scale
- ✅ Consistent shadows using Pisky system
- ✅ Consistent border radius using Pisky values
- ✅ Typography follows Pisky scale
- ✅ All components match Pisky aesthetic

### Quality Requirements

- ✅ No console errors
- ✅ No visual layout breaks
- ✅ Responsive design maintained
- ✅ Accessible color contrast maintained
- ✅ Smooth transitions and animations

---

## Rollback Plan

If critical issues are found:

1. **Immediate rollback:**
   ```bash
   git revert HEAD
   ```

2. **Or restore backup:**
   ```bash
   git checkout <commit-before-migration>
   ```

3. **Document issues** for next migration attempt

---

## Notes

- This migration affects **presentation layer only**
- **Zero changes** to business logic, services, or API routes
- **Zero changes** to database schema or migrations
- **Zero changes** to authentication or authorization logic
- All changes are in CSS and component styling
- Functionality is preserved 100%

---

## Appendix: Component Inventory

### Files to Modify

**Theme & Styling:**
- `apps/backoffice/app/app-theme.css`
- `apps/backoffice/app/globals.css`
- `packages/ui/styles/globals.css`

**Shared Components:**
- `apps/backoffice/components/shared/app-card.tsx`
- `apps/backoffice/components/shared/app-button.tsx`
- `apps/backoffice/components/shared/app-identity-banner.tsx`

**Dashboard Components:**
- `apps/backoffice/components/dashboard/header.tsx`
- `apps/backoffice/components/dashboard/sidebar.tsx`

**Ticketing Components:**
- `apps/backoffice/components/ticketing/attachment-upload.tsx`
- `apps/backoffice/components/admin/tickets-data-table.tsx`
- All ticket list/detail components

**Admin Components:**
- `apps/backoffice/components/admin/data-table/data-table.tsx`
- All admin management pages

**Pages (automatic inheritance):**
- All pages in `apps/backoffice/app/` will inherit new theme automatically

---

**Document Version:** 1.0
**Last Updated:** 2026-04-01
**Status:** Ready for Implementation
