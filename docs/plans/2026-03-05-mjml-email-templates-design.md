# MJML Email Template System Design

## Overview

A file-based email template system using MJML for the Naiera Admin boilerplate. Templates are compiled at build-time to HTML, with a simple `sendTemplate()` utility for sending transactional emails via Resend.

## Goals

- Replace React Email components with file-based MJML templates
- Provide a simple, extensible email system for the boilerplate
- Support auth emails (password reset, verification, magic link)
- Support user onboarding emails (welcome)
- Make it easy to add new templates

## File Structure

```
apps/backoffice/
├── email-templates/
│   ├── auth/
│   │   ├── password-reset.mjml
│   │   ├── email-verification.mjml
│   │   └── magic-link.mjml
│   ├── user/
│   │   ├── welcome.mjml
│   │   └── account-verified.mjml
│   └── layouts/
│       └── base.mjml          # Shared header/footer/styles
├── lib/email/
│   ├── templates/             # Compiled HTML (generated, .gitkeep)
│   ├── compiler.ts            # MJML build script
│   ├── sender.ts              # sendTemplate() utility
│   ├── types.ts               # Template types (generated)
│   ├── service/               # Existing (unchanged)
│   │   ├── email-service.ts
│   │   └── resend.ts
│   └── index.ts
└── package.json               # mjml build scripts
```

## Template Syntax

Templates use `{{variable}}` interpolation:

```mjml
<mjml>
  <mj-body>
    <mj-container>
      <mj-text>Hello {{userName}},</mj-text>
      <mj-button href="{{resetUrl}}">Reset Password</mj-button>
      <mj-text>Expires in: {{expiryHours}} hours</mj-text>
    </mj-container>
  </mj-body>
</mjml>
```

## Sending API

```typescript
import { sendTemplate } from '@/lib/email'

await sendTemplate('password-reset', {
  to: 'user@example.com',
  subject: 'Reset your password',
  data: { userName: 'John', resetUrl: '...', expiryHours: 1 }
})

// With custom from
await sendTemplate('welcome', {
  to: 'newuser@example.com',
  subject: 'Welcome to Naiera!',
  data: { userName: 'Sarah', appName: 'Naiera' },
  from: 'Team <hello@naiera.com>'
})
```

### Return Type

```typescript
interface SendResult {
  success: boolean;
  error?: string;
  messageId?: string;
}
```

## Build Process

### Package Scripts

```json
{
  "scripts": {
    "build:email": "ts-node lib/email/compiler.ts",
    "dev:email": "ts-node lib/email/compiler.ts --watch"
  }
}
```

### Compiler Behavior

1. Reads all `.mjml` files from `email-templates/`
2. Compiles each to HTML using `mjml` package
3. Outputs to `lib/email/templates/`
4. Generates `types.ts` with template name union type

### Development Workflow

- Run `pnpm dev:email` to watch and auto-compile
- Restart dev server to pick up template changes

### Production Build

- `pnpm build:email` runs during build
- Compiled HTML can be committed or built during deployment

## Type Safety

```typescript
// lib/email/types.ts (generated)
export type EmailTemplate =
  | 'password-reset'
  | 'email-verification'
  | 'magic-link'
  | 'welcome'
  | 'account-verified'

// sender.ts signature
export function sendTemplate(
  template: EmailTemplate,
  options: SendOptions
): Promise<SendResult>
```

## Included Templates

### Auth Templates

| Template | File | Variables |
|----------|------|-----------|
| Password Reset | `password-reset.mjml` | `userName`, `resetUrl`, `expiryHours` |
| Email Verification | `email-verification.mjml` | `userName`, `verifyUrl`, `expiryHours` |
| Magic Link | `magic-link.mjml` | `userName`, `magicLink`, `expiryHours` |

### User Templates

| Template | File | Variables |
|----------|------|-----------|
| Welcome | `welcome.mjml` | `userName`, `appName`, `loginUrl` |
| Account Verified | `account-verified.mjml` | `userName`, `appName`, `dashboardUrl` |

### Shared Layout

- `layouts/base.mjml` - Consistent header, footer, styles, branding
- Uses CSS variables for theming (primary color, fonts, etc.)

## Error Handling

- Errors logged to `@workspace/logger`
- Returns `{ success: false, error: string }` instead of throwing
- Development mode: Silent failure if `RESEND_API_KEY` missing (with console warning)
- Production mode: All errors properly logged

## Migration Path

Replace existing React Email templates:
- `lib/email/templates/password-reset.tsx` → `email-templates/auth/password-reset.mjml`
- `lib/email/templates/verification.tsx` → `email-templates/auth/email-verification.mjml`
- `lib/email/templates/welcome.tsx` → `email-templates/user/welcome.mjml`

The `ResendEmailService` and `EmailService` interface remain unchanged.

## Dependencies

```json
{
  "mjml": "^4.15.0",
  "@types/mjml": "^4.7.0"
}
```

## Environment Variables

No new variables required. Uses existing:
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Default from address

## Extensibility

Adding new templates:

1. Create `.mjml` file in `email-templates/`
2. Run `pnpm dev:email` to compile
3. Use immediately with `sendTemplate('new-template', { ... })`

Template names auto-discovered from file names.
