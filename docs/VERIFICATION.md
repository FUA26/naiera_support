# Boilerplate Verification Checklist

Use this checklist to verify the boilerplate is ready for use before starting a new project.

## Pre-Use Checklist

### ✅ Business Content Removed
- [ ] No project-specific services, news, events content
- [ ] No hardcoded branding (logo, colors, names)
- [ ] Placeholder "YourBrand" branding applied throughout

### ✅ Documentation Complete
- [ ] Getting Started guides exist and are accurate
- [ ] Architecture documentation is complete
- [ ] Pattern documentation references Tasks module examples
- [ ] Customization guides are clear and actionable
- [ ] Deployment guides are provided

### ✅ Code Quality
- [ ] Auth module is documented and working
- [ ] RBAC system is documented and working
- [ ] File upload system is documented and working
- [ ] Tasks module demonstrates all patterns
- [ ] Shared packages have README files

### ✅ Configuration
- [ ] `.env.example` is complete with all variables
- [ ] `package.json` scripts are correct
- [ ] `turbo.json` pipeline is configured
- [ ] `pnpm-workspace.yaml` is correct

### ✅ Functionality
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts all apps successfully
- [ ] `pnpm build` completes without errors
- [ ] Database migrations can be created
- [ ] Authentication flow works
- [ ] Permission checking works

## Customization Steps Before First Use

1. **Rename branding** - Follow `docs/customization/branding.md`
2. **Update environment variables** - Copy `.env.example` to `.env.local`
3. **Set up OAuth providers** - Configure in `.env.local`
4. **Run database migrations** - `pnpm prisma migrate deploy`
5. **Seed initial data** - Create admin user, roles, permissions

## After Starting a New Project

1. Remove unnecessary modules from `apps/backoffice/`
2. Remove unused components from `packages/ui/`
3. Update color scheme in Tailwind config
4. Replace placeholder content
5. Add project-specific features

## Issues?

Refer to:
- `docs/` - Comprehensive documentation
- `docs/customization/` - Customization guides
- `BOILERPLATE.md` - Quick start guide
