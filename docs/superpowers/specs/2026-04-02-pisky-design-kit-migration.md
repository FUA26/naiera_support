# Pisky Design Kit Migration - Design Document

**Date:** 2026-04-02
**Project:** Naiera Support
**Objective:** Migrate UI/Design System from Feedback project to Naiera Support
**Approach:** Direct Copy & Integrate (Approach 1)

---

## Overview

Migrate seluruh design system dan struktur komponen UI dari project `feedback` ke project `naiera_support`. Feedback project menggunakan **Pisky Design Kit** dengan warna Blue (#1B53D9) sebagai primary dan Coral (#E07A5F) sebagai secondary, lengkap dengan komponen dashboard modern dan pattern yang teruji.

**Scope:**
- Copy seluruh design system (theme, colors, components) dari feedback
- Update dashboard layout dan sidebar navigation
- Migrasi semua UI components secara gradual
- Preserve semua fitur yang sudah ada di naiera_support

**Out of Scope:**
- Business logic changes
- Database schema changes
- API route modifications
- Landing page app migration (backoffice only)
- Adding new features

---

## Architecture

### Source Structure (Feedback Project)

```
feedback/
├── components/
│   ├── dashboard/              # Target: Copy
│   │   ├── dashboard-sidebar.tsx
│   │   ├── dashboard-header.tsx
│   │   └── dashboard-layout.tsx
│   ├── ui/                     # Target: Copy
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ... (shadcn components)
│   └── ... (app components)
├── lib/
│   └── utils.ts               # Target: Copy cn() function
├── app/
│   └── globals.css            # Target: Copy
├── tailwind.config.ts         # Target: Copy
└── components.json            # Reference: shadcn config
```

### Target Structure (Naiera Support - After Migration)

```
naiera_support/
├── apps/
│   └── backoffice/
│       ├── components/
│       │   ├── dashboard/              # Copied from feedback
│       │   │   ├── dashboard-sidebar.tsx
│       │   │   ├── dashboard-header.tsx
│       │   │   └── dashboard-layout.tsx
│       │   └── ui/                     # Updated with feedback components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── table.tsx
│       │       └── ... (all shadcn components)
│       ├── lib/
│       │   └── utils.ts               # Updated cn() function
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   └── layout.tsx          # Updated to use new dashboard layout
│       │   └── globals.css             # Copied from feedback
│       └── tailwind.config.ts          # Copied from feedback
```

### Key Architectural Decisions

1. **Complete Copy, Not Extend**: Replace seluruh theme system, bukan merge dengan existing
2. **Preserve Routing**: Tidak ada perubahan ke routing structure
3. **Preserve Services**: Business logic tetap sama
4. **Preserve RBAC**: Integrate new components dengan existing permission system
5. **Gradual Component Migration**: Copy components phase by phase, test di setiap phase

---

## Theme & Design Tokens

### Color Palette Migration

**Current (Crimson/Orange):**
```css
--primary: 220 20.6% 47.8%;        /* Crimson (#DC143C) */
--secondary: 25 95% 53%;           /* Orange (#F97316) */
```

**Target (Pisky - Blue/Coral):**
```css
--primary: 219 75% 44%;            /* Blue (#1B53D9) */
--secondary: 6 68% 57%;            /* Coral (#E07A5F) */
```

### Complete Design Token Set

Dari feedback's `app/globals.css` dan `tailwind.config.ts`:

1. **Colors**
   - Primary: Blue scale (50-900)
   - Secondary: Coral scale (50-900)
   - Neutral: Gray scale (50-900)
   - Semantic: Success (#10B981), Warning (#F59E0B), Error (#EF4444), Info (#3B82F6)
   - Dark mode tokens

2. **Typography**
   - Font families: Inter (sans), Merriweather (serif), Fira Code (mono)
   - Font sizes: xs (10px) to 5xl (61px)
   - Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

3. **Spacing & Sizing**
   - Border radius: sm (4px), md (8px), lg (12px), xl (16px), token (24px)
   - Shadows: sm, md, lg variants
   - Spacing scale: Tailwind default

4. **Animation**
   - Standard transitions: 250ms
   - Fast transitions: 150ms

### Implementation

1. **Replace `globals.css`**: Copy seluruh file dari feedback, replace existing
2. **Replace `tailwind.config.ts`**: Copy seluruh config dari feedback
3. **No Customization**: Gunakan design system dari feedback apa adanya, tanpa modifikasi

---

## Component Migration Strategy

### Phase 1: Core Foundation (Priority 1)

**Components to Copy:**
1. `lib/utils.ts` - cn() function untuk class merging
2. `components/ui/button.tsx` - Foundation component
3. `components/ui/input.tsx` - Form input base
4. `components/ui/label.tsx` - Form labels
5. `components/ui/card.tsx` - Card container
6. `components/ui/badge.tsx` - Status badges
7. `components/ui/separator.tsx` - Visual separator

**Expected Outcome:**
- Foundation components terpasang
- Komponen lain bisa mulai menggunakan pattern baru
- No TypeScript errors

---

### Phase 2: Dashboard & Layout (Priority 2 - FOCUS)

**Components to Copy:**
1. `components/dashboard/dashboard-sidebar.tsx` - Sidebar dengan navigation
2. `components/dashboard/dashboard-header.tsx` - Top header bar
3. `components/dashboard/dashboard-layout.tsx` - Main layout wrapper
4. `components/dashboard/sidebar-nav.tsx` (atau nav-items) - Navigation items

**Adaptations Required:**

1. **RBAC Integration:**
   ```typescript
   // Inject permission checks ke setiap nav item
   import { useCan } from "@/lib/rbac-client"

   const navItems = [
     {
       title: "Users",
       href: "/manage/users",
       permission: "USER_VIEW"  // Check permission
     }
   ]
   ```

2. **App Switcher Integration:**
   ```typescript
   // Integrate existing multi-tenant app switcher ke sidebar
   <div className="sidebar-section">
     <AppSwitcher />  {/* Existing component */}
   </div>
   <div className="sidebar-section">
     <Navigation />  {/* From feedback */}
   </div>
   ```

3. **User Menu:**
   - Preserve existing auth logic
   - Preserve profile dropdown
   - Preserve signout functionality

4. **Layout Update:**
   - Update `app/(dashboard)/layout.tsx`
   - Gunakan dashboard layout baru dari feedback

**Expected Outcome:**
- Modern dashboard dengan sidebar dan header
- Permission-based navigation working
- App switcher integrated
- Responsive design (mobile sidebar collapse)

---

### Phase 3: Advanced UI Components (Priority 3)

**Components to Copy:**

1. **Data Display:**
   - `components/ui/table.tsx` - Enhanced table component
   - `components/ui/data-table.tsx` - Advanced table dengan filtering/sorting
   - `components/ui/pagination.tsx` - Pagination controls

2. **Form Components:**
   - `components/ui/form.tsx` - Form wrapper dengan react-hook-form
   - `components/ui/select.tsx` - Select dropdown
   - `components/ui/checkbox.tsx` - Checkbox input
   - `components/ui/radio-group.tsx` - Radio buttons
   - `components/ui/textarea.tsx` - Multi-line input

3. **Feedback/Overlay:**
   - `components/ui/dialog.tsx` - Modal dialogs
   - `components/ui/alert.tsx` - Alert messages
   - `components/ui/toast.tsx` - Toast notifications
   - `components/ui/tooltip.tsx` - Tooltips

**Expected Outcome:**
- Advanced UI components available
- Existing forms dan tables bisa menggunakan new components
- Enhanced user experience dengan better feedback components

---

### Phase 4: Feature-Specific Adaptation (Priority 4)

**Modules to Update:**

1. **Ticketing Module:**
   - Update ticket list page → gunakan new table component
   - Update ticket detail page → gunakan new card/dialog components
   - Update ticket forms → gunakan new form components
   - Preserve semua existing features

2. **Content Management:**
   - **Gallery**: Update forms dan tables
   - **News**: Update forms dan tables
   - **Events**: Update forms dan tables
   - **Settings**: Update forms

3. **Admin Pages:**
   - **User Management**: Update table dan forms
   - **Role Management**: Update table dan forms
   - **Permission Management**: Update table dan forms
   - **Profile**: Update forms

**Expected Outcome:**
- Semua modules menggunakan new UI components
- Consistent visual design di seluruh aplikasi
- All features preserved dan working

---

## Data & Integration

### RBAC & Permissions

**Current Naiera Support:**
- Permission-based access control di `lib/rbac-server/` dan `lib/rbac-client/`
- Hooks: `useCan()`, `useCanAccessOwn()`, `useCanAnyOf()`, `useCanAllOf()`
- Component: `<Can permissions={["PERM"]}>`

**Integration Strategy:**
- Preserve semua existing RBAC logic
- Inject permission checks ke new sidebar dari feedback
- Update nav items untuk check permissions sebelum render
- Server-side permission checks tetap sama

---

### Multi-Tenant App Switcher

**Current Naiera Support:**
- App switcher di sidebar bawah logo
- Apps: "All Apps", "Support", dll
- API: `/api/apps/accessible`, `/api/app-access-requests`

**Integration Strategy:**
- Preserve existing `AppSwitcher` component
- Integrate ke new sidebar layout dari feedback
- Location: Di bawah brand logo, sebelum main navigation
- Ensure filtering by selected app tetap berfungsi

---

### Authentication

**Current Naiera Support:**
- NextAuth.js v5
- Session management via `getSession()`, `requireAuth()`
- User menu dengan profile/signout

**Integration Strategy:**
- Preserve existing auth logic
- Copy user menu component dari feedback
- Adapt dengan existing session handling
- No changes ke auth configuration

---

### State Management

**Current Naiera Support:**
- Jotai atoms di `lib/state/atoms/`
- TanStack Query di `lib/state/queries/`

**Integration Strategy:**
- Preserve existing state management
- Copy hooks dari feedback jika ada yang useful
- No major changes ke state architecture

---

### Service Layer & API Routes

**Strategy:**
- **Tidak ada perubahan** ke service layer
- **Tidak ada perubahan** ke API routes
- Semua business logic tetap sama
- Hanya UI layer yang berubah

---

### Form Validation

**Current Naiera Support:**
- Zod schemas di `lib/validations/`
- React Hook Form

**Integration Strategy:**
- Copy form components dari feedback
- Preserve existing Zod schemas
- Preserve existing validation logic
- No changes ke validation rules

---

### File Uploads & Storage

**Current Naiera Support:**
- S3-compatible storage via presigned URLs
- Services di `lib/storage/`, `lib/file-upload/`

**Integration Strategy:**
- Preserve existing file upload system
- Jangan replace dengan pattern dari feedback (jika ada)
- No changes ke storage logic

---

### Routing Structure

**Preserve:**
- Route groups: `(auth)`, `(dashboard)`
- Sub-routes: `manage/`, `tasks/`, `tickets/`, `profile/`, `settings/`
- Middleware untuk route protection
- Semua existing routes

**Strategy:**
- **Jangan ubah routing structure**
- Hanya update layout components

---

## Risk & Mitigation

### Risk 1: Breaking Existing Functionality

**Description:**
Copying components might break existing features.

**Mitigation:**
- Run existing Playwright E2E tests after each phase
- Manual testing critical flows
- Keep git commits atomic per phase (easy rollback)
- Test di development environment

**Rollback:** Git revert per phase jika ada issue

---

### Risk 2: Styling Conflicts

**Description:**
CSS variables dari feedback mungkin conflict.

**Mitigation:**
- Replace globals.css secara total (bukan merge)
- Replace tailwind.config.ts secara total
- Visual regression test
- Check console untuk CSS warnings

**Rollback:** Revert globals.css dan tailwind.config.ts

---

### Risk 3: Permission/Access Control Issues

**Description:**
New sidebar might not respect existing RBAC.

**Mitigation:**
- Thorough testing dengan different user roles
- Manual test semua permission-protected routes
- Verify permission checks di setiap nav item

**Rollback:** Revert dashboard-layout dan dashboard-sidebar

---

### Risk 4: Multi-Tenant App Switcher Malfunction

**Description:**
Integrating app switcher ke new sidebar might break filtering.

**Mitigation:**
- Test app switching functionality
- Verify ticket list filter by selected app
- Test dengan user yang limited app access

**Rollback:** Keep existing sidebar sebagai fallback

---

### Risk 5: Dark Mode Issues

**Description:**
Dark mode might not work correctly.

**Mitigation:**
- Test light dan dark mode di setiap phase
- Check semua colors di both themes
- Verify theme switcher

**Rollback:** Fix CSS variables atau revert globals.css

---

### Risk 6: Performance Regression

**Description:**
New components might be heavier/slower.

**Mitigation:**
- Check bundle size sebelum dan sesudah
- Run Lighthouse performance audit
- Test di slow network

**Rollback:** Optimize components atau remove unused imports

---

### Risk 7: Component API Incompatibility

**Description:**
Existing components might call new components dengan wrong props.

**Mitigation:**
- TypeScript akan catch type errors
- Run `pnpm check-types` di setiap phase
- Fix type errors satu per satu

**Rollback:** Keep existing components sebagai wrapper

---

## Testing Strategy

### Automated Testing

- **E2E Tests:** `pnpm --filter backoffice test` - Run setiap phase
- **Type Check:** `pnpm check-types` - Run setiap phase
- **Build:** `pnpm --filter backoffice build` - Run setiap phase

### Manual Testing Checklist

Setelah setiap phase:

- [ ] Build berhasil
- [ ] Type check berhasil
- [ ] No console errors
- [ ] E2E tests pass
- [ ] Login/logout working
- [ ] Dashboard navigation working
- [ ] Ticketing flow working (list, detail, create)
- [ ] App switching working
- [ ] Theme switching working (light/dark)
- [ ] Visual check: Layout dan spacing

### Critical Paths untuk Manual Testing

1. **Auth Flow:** Login → Dashboard → Access pages → Logout
2. **Ticketing Flow:** Create ticket → View ticket → Add message → Close ticket
3. **App Switching:** Switch app → Verify filtered content → Switch back
4. **Permission Test:** Login sebagai regular user → Verify restricted access

---

## Implementation Timeline

**Total Estimate: 2-3 Weeks**

### Week 1: Foundation & Theme Setup

**Day 1-2: Phase 1 - Core Styling**
- Copy `globals.css` dari feedback
- Copy `tailwind.config.ts` dari feedback
- Update `lib/utils.ts`
- Build dan test
- Visual check: Colors dan basic styles

**Day 3-4: Phase 2 - Foundation Components**
- Copy core UI components (button, input, label, card, badge, separator)
- Copy ke `apps/backoffice/components/ui/`
- Replace existing components satu per satu
- Test setiap component
- Type check

**Day 5: Phase 3 - Dashboard Layout Setup (Start)**
- Copy `components/dashboard/` dari feedback
- Adaptasi dashboard-sidebar dengan RBAC
- Adaptasi dashboard-header dengan user menu
- Integrate app switcher ke sidebar
- Test dashboard layout

---

### Week 2: Component Migration & Dashboard

**Day 6-7: Phase 3 - Dashboard Layout (Complete)**
- Update `app/(dashboard)/layout.tsx`
- Test semua dashboard routes
- Verify permission checks
- Verify app switching
- Fix layout issues

**Day 8-9: Phase 4 - Advanced UI Components**
- Copy table, pagination, form, dialog, alert, toast, tooltip
- Test setiap component
- Update existing forms dan tables

**Day 10: Phase 5 - Ticketing Module Migration**
- Update ticket list, detail, forms
- Test ticketing flow end-to-end

---

### Week 3: Feature Migration & Polish

**Day 11-12: Phase 6 - Content Management Modules**
- Update Gallery, News, Events, Settings
- Test semua features

**Day 13: Phase 7 - Admin Pages**
- Update User, Role, Permission, Profile pages
- Test admin features

**Day 14: Phase 8 - Testing & Polish**
- Run full E2E test suite
- Manual testing semua critical flows
- Fix bugs
- Visual polish
- Performance check
- Dark mode test

**Day 15: Phase 9 - Documentation & Cleanup**
- Update CLAUDE.md
- Update component documentation
- Remove unused code
- Final build test
- Prepare untuk deployment

---

## Success Criteria

### Primary Success Criteria

1. ✅ **Visual Consistency**
   - Seluruh aplikasi menggunakan Pisky Design System
   - Colors: Blue primary dan Coral secondary
   - Consistent spacing, typography, border radius

2. ✅ **Dashboard & Sidebar Functionality**
   - Dashboard layout dari feedback working
   - Sidebar navigation dengan permission checks
   - App switcher integrated
   - Responsive design
   - Dark/light mode working

3. ✅ **All Existing Features Working**
   - Ticketing system fully functional
   - Gallery, News, Events working
   - Admin features working
   - Multi-tenant app switching working
   - File uploads working

4. ✅ **No Regressions**
   - All E2E tests passing
   - No TypeScript errors
   - Build berhasil
   - No console errors
   - Performance acceptable (<10% bundle increase)

5. ✅ **RBAC & Security**
   - Permission checks working
   - Access control working
   - Authentication flow unchanged

### Secondary Success Criteria

6. ✅ **Code Quality**
   - Clean git history
   - No unused code
   - Components properly typed

7. ✅ **Developer Experience**
   - Components easy to use
   - Clear props interface
   - CLAUDE.md updated

8. ✅ **Documentation**
   - Design document written
   - Implementation plan created

### Definition of Done

Migration complete ketika:
1. Semua primary success criteria terpenuhi
2. Minimal 80% secondary success criteria terpenuhi
3. Validation checklist all items checked
4. Design document approved
5. Ready untuk production deployment

---

## Non-Goals

Apa yang **TIDAK** akan dilakukan:

- ❌ Mengubah business logic atau service layer
- ❌ Menambah fitur baru
- ❌ Mengubah database schema
- ❌ Mengubah API routes
- ❌ Refactoring yang tidak related ke UI
- ❌ Migrasi landing page app (hanya backoffice)

---

## References

- **Source Project:** `/home/acn/code/feedback`
- **Target Project:** `/home/acn/code/naiera_support`
- **Design System:** Pisky Design Kit
- **Component Library:** shadcn/ui (new-york variant)
- **Framework:** Next.js 16 with App Router

---

## Next Steps

1. Review dan approve this design document
2. Invoke writing-plans skill untuk buat implementation plan detail
3. Execute implementation per phase
4. Test dan validate setiap phase
5. Deploy ke production

---

**Document Status:** Draft - Pending Approval
**Last Updated:** 2026-04-02
