# Email Templates

File-based email template system using MJML for transactional emails.

## Overview

Email templates are stored as MJML files in `email-templates/` and compiled to HTML at build-time. Use the `sendTemplate()` utility to send emails.

## Available Templates

| Template | Name | Variables |
|----------|------|-----------|
| Password Reset | `password-reset` | `userName`, `resetUrl`, `expiryHours` |
| Email Verification | `email-verification` | `userName`, `verifyUrl`, `expiryHours` |
| Magic Link | `magic-link` | `userName`, `magicLink`, `expiryHours` |
| Welcome | `welcome` | `userName`, `loginUrl` |
| Account Verified | `account-verified` | `userName`, `dashboardUrl` |

## Usage

```typescript
import { sendTemplate } from '@/lib/email'

await sendTemplate('password-reset', {
  to: 'user@example.com',
  subject: 'Reset Your Password',
  data: {
    userName: 'John',
    resetUrl: 'https://example.com/reset?token=...',
    expiryHours: 1,
  },
})
```

## Adding New Templates

1. Create `.mjml` file in `email-templates/`
2. Run `pnpm build:email` to compile
3. Use immediately with `sendTemplate('new-template', { ... })`

## Development

- `pnpm dev:email` - Watch and auto-compile templates
- `pnpm build:email` - Compile templates for production

Template names are type-safe - TypeScript will only allow valid template names.
