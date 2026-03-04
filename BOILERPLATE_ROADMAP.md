# Boilerplate Roadmap

**Created:** 2026-03-04
**Status:** Phase 1 Complete - Template Branch Created

## Vision

Transform the codebase into a standardized boilerplate that can be used as a starting point for future projects, progressing through three phases:

1. **Template Branch** ✅ - Isolated branch with cleaned codebase
2. **Template Repository** - Standalone repository for template
3. **Project Generator CLI** - `npx create-yourbrand-app` tool

---

## Progress Timeline

### ✅ Phase 1: Template Branch (COMPLETE)

**Status:** Done - Branch `template` created and pushed to remote

**Deliverables:**
- Cleaned codebase with business-specific modules removed
- Tasks example module demonstrating all patterns
- Comprehensive documentation (patterns, architecture, customization)
- Boilerplate landing page
- Code annotations throughout

**Files Created:**
- `docs/plans/2026-03-04-boilerplate-template-design.md` - Design document
- `docs/plans/2026-03-04-boilerplate-template-implementation.md` - Implementation plan
- `BOILERPLATE.md` - Quick start guide
- Pattern documentation in `docs/patterns/`

**Branch:** `origin/template` in `FUA26/bandanaiera` repository

---

### 🔄 Phase 2: Template Repository (NEXT)

**Status:** Ready to start

**Goal:** Create a standalone template repository that can be forked or cloned

**Approach Options:**

#### Option A: Fork Main Repository
1. Fork `FUA26/bandanaiera` to new organization (e.g., `yourname/boilerplate`)
2. Remove all git history
3. Clean up to only essential boilerplate files
4. Set up as template repository

#### Option B: Extract to New Repository
1. Create new repository `yourname/nextjs-rbac-boilerplate`
2. Copy template branch content
3. Set up as template repository
4. Document usage instructions

#### Option C: GitHub Template Repository
1. Create as GitHub Template repository
2. Enable "Template repository" feature
3. Add template choices (full, minimal, etc.)

**Deliverables:**
- Standalone template repository
- Professional README
- Contributing guidelines (if open source)
- License file
- Usage examples

**Files to Create:**
- `LICENSE` - MIT or Apache 2.0
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- Improved `README.md` with:
  - Features list
  - Tech stack
  - Quick start
  - Screenshots
  - Use cases

---

### 📋 Phase 3: Project Generator CLI (FUTURE)

**Status:** Planned

**Goal:** Create `create-your-brand-app` CLI tool for scaffolding new projects

**CLI Features:**
```bash
npx create-your-brand-app my-project
```

**Interactive Prompts:**
- Project name
- Which features to include:
  - [ ] Authentication (NextAuth)
  - [ ] RBAC system
  - [ ] File uploads
  - [ ] Analytics
  - [ ] Tasks module (as example)
  - [ ] Database setup
- Package naming (`@workspace` → custom)
- Primary color selection
- Database selection (PostgreSQL, MySQL, SQLite)

**What It Does:**
1. Creates project directory
2. Initializes git repository
3. Copies selected template files
4. Runs `pnpm install`
5. Sets up environment variables
6. Initializes database
7. Creates first admin user
8. Prints next steps

**Implementation:**
- Based on `create-next-app` or `npm-init`
- Can use libraries like:
  - `commander` / `inquirer` for CLI
  - `chalk` for colors
  - `ora` for spinners
  - `fs-extra` for file operations

**Package Name Options:**
- `create-naiera-app` - Specific to Naiera brand
- `create-rbac-admin` - Generic descriptive name
- `create-enterprise-app` - Broad enterprise template

---

## Phase 2: Template Repository - Detailed Plan

### Step 1: Create New Repository

```bash
# Create new repo
mkdir nextjs-rbac-boilerplate
cd nextjs-rbac-boilerplate
git init

# Copy from template branch
git remote add template https://github.com/FUA26/bandanaiera.git
git fetch template
git checkout template

# Clean git history
rm -rf .git
git init

# Start fresh
git add .
git commit -m "Initial commit: Next.js RBAC Boilerplate v1.0"
```

### Step 2: Repository Structure

```
nextjs-rbac-boilerplate/
├── apps/
│   ├── backoffice/           # Admin dashboard
│   └── landing/              # Boilerplate landing
├── packages/                 # Shared packages
│   ├── ui/
│   ├── api/
│   ├── utils/
│   ├── types/
│   ├── hooks/
│   └── logger/
├── docs/                     # Documentation
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── LICENSE
├── README.md
└── BOILERPLATE.md
```

### Step 3: Documentation Updates

Create/improve:
- `README.md` - Professional README with:
  - Project title and description
  - Features list (Auth, RBAC, File Upload, ISR)
  - Screenshots
  - Quick start
  - Documentation links
  - License
- `LICENSE` - MIT License
- `CONTRIBUTING.md` - Guidelines for contributors
- `CHANGELOG.md` - Version history

### Step 4: Tagging and Release

```bash
git tag -a v1.0.0 -m "First stable release"
git push origin main --tags
```

---

## Phase 3: CLI Generator - Detailed Plan

### Implementation Approach

**Option A: Using `plop` / `hygen` (Template Based)**
- Define templates in `templates/` directory
- Use inquirer for prompts
- Copy and transform files based on user choices

**Option B: Using `create-next-app` Pattern**
- Follow Next.js official create pattern
- Use `tar` for template extraction
- Install packages and run setup

**Option C: Using `npm init` Hooks**
- `npm init <name>` triggers our initializer
- Download and setup template

### CLI Structure

```
create-naiera-app/
├── package.json           # CLI package
├── bin/
│   └── index.js           # CLI entry point
├── templates/             # Project templates
│   ├── base/              # Base template
│   ├── minimal/           # Minimal variant
│   └── full/              # Full variant
├── lib/
│   ├── prompts.js         # Inquirer prompts
│   ├── template.js        # Template engine
│   └── git.js            # Git operations
└── README.md
```

### CLI Flow

```
User runs: npx create-naiera-app my-app

1. [Welcome Screen]
   - Welcome message
   - Feature overview
   - Press Enter to continue

2. [Project Setup]
   - Project name: my-app ✓
   - Location: ./my-app ✓

3. [Feature Selection]
   - Which features do you need?
     ◯ Authentication (NextAuth, OAuth)
     ◯ RBAC system (roles, permissions)
     ◯ File uploads (S3, CDN)
     ◯ ISR cache revalidation
     ◯ Tasks module (example)
     ◯ Analytics dashboard

4. [Configuration]
   - Package scope: @my-company
   - Primary color: [blue ◯]
   - Database: PostgreSQL ◯

5. [Setup]
   - Creating project...
   - Installing packages...
   - Initializing database...
   - Creating admin user...
   - ✓ Done!

6. [Next Steps]
   - cd my-app
   - pnpm dev
   - Open http://localhost:3001
```

---

## Current Status

| Phase | Status | Branch/Repo | Completion |
|-------|--------|------------|------------|
| Phase 1: Template Branch | ✅ Complete | `FUA26/bandanaiera:template` | 100% |
| Phase 2: Template Repo | 🔄 Ready | TBD | 0% |
| Phase 3: CLI Generator | 📋 Planned | TBD | 0% |

---

## Quick Reference

### Use Template Now (Current Method)

```bash
# Option 1: Copy from branch
git clone -b template --single-branch https://github.com/FUA26/bandanaiera.git my-project

# Option 2: Copy worktree
cp -r /path/to/bandanaiera/.worktrees/template my-project
```

### Future Usage

```bash
# After Phase 2: Clone template repo
git clone https://github.com/yourname/nextjs-rbac-boilerplate.git my-project

# After Phase 3: Use CLI
npx create-naiera-app my-project
```

---

## Next Steps

1. **Complete Phase 2** - Create standalone template repository
2. **Design Phase 3** - Plan CLI tool architecture
3. **Implement Phase 3** - Build and publish CLI tool
4. **Publish to npm** - `npx create-naiera-app`

---

## Notes

- Template branch in main repo serves as development environment
- Separate repo is for distribution
- CLI tool is for user-friendly scaffolding
- Progress through phases allows iterative improvement

**Keywords:** boilerplate, template, monorepo, Next.js, RBAC, create-app, CLI, scaffolding
