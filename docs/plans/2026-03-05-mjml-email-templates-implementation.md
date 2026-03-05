# MJML Email Template System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a file-based email template system using MJML with build-time compilation and a simple `sendTemplate()` utility for sending transactional emails via Resend.

**Architecture:** MJML templates stored in `email-templates/` are compiled to HTML at build-time. The `sendTemplate()` utility loads compiled HTML, interpolates variables using regex replacement, and sends via the existing ResendEmailService.

**Tech Stack:** MJML 4.x, TypeScript, Resend, ts-node

---

## Task 1: Install MJML Dependencies

**Files:**
- Modify: `apps/backoffice/package.json`

**Step 1: Add MJML dependencies to backoffice package.json**

Add to `devDependencies`:
```json
"mjml": "^4.15.0",
"@types/mjml": "^4.7.0",
"ts-node": "^10.9.2"
```

**Step 2: Install dependencies**

Run: `cd apps/backoffice && pnpm install`
Expected: Dependencies installed successfully

**Step 3: Commit**

```bash
git add apps/backoffice/package.json apps/backoffice/pnpm-lock.yaml
git commit -m "deps: add MJML and ts-node dependencies"
```

---

## Task 2: Create Email Template Directory Structure

**Files:**
- Create: `apps/backoffice/email-templates/auth/.gitkeep`
- Create: `apps/backoffice/email-templates/user/.gitkeep`
- Create: `apps/backoffice/email-templates/layouts/.gitkeep`
- Create: `apps/backoffice/lib/email/templates/.gitkeep`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p apps/backoffice/email-templates/auth
mkdir -p apps/backoffice/email-templates/user
mkdir -p apps/backoffice/email-templates/layouts
mkdir -p apps/backoffice/lib/email/templates
```

**Step 2: Create .gitkeep files**

Run:
```bash
touch apps/backoffice/email-templates/auth/.gitkeep
touch apps/backoffice/email-templates/user/.gitkeep
touch apps/backoffice/email-templates/layouts/.gitkeep
touch apps/backoffice/lib/email/templates/.gitkeep
```

**Step 3: Commit**

```bash
git add apps/backoffice/email-templates apps/backoffice/lib/email/templates
git commit -m "feat: create email template directory structure"
```

---

## Task 3: Create Base Layout Template

**Files:**
- Create: `apps/backoffice/email-templates/layouts/base.mjml`

**Step 1: Create base layout MJML template**

Create `apps/backoffice/email-templates/layouts/base.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
    <mj-style>
      .footer { color: #888888; font-size: 14px; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <!-- Header -->
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Content Slot -->
      {{content}}

      <!-- Footer -->
      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" class="footer">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 2: Commit**

```bash
git add apps/backoffice/email-templates/layouts/base.mjml
git commit -m "feat: add base MJML layout template"
```

---

## Task 4: Create Auth Templates

**Files:**
- Create: `apps/backoffice/email-templates/auth/password-reset.mjml`
- Create: `apps/backoffice/email-templates/auth/email-verification.mjml`
- Create: `apps/backoffice/email-templates/auth/magic-link.mjml`

**Step 1: Create password reset template**

Create `apps/backoffice/email-templates/auth/password-reset.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" padding="12px 24px" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" align="center">
            Reset Your Password
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text>
            {{#if userName}}Hi {{userName}},{{/if}}
            {{#ifNot userName}}Hello,{{/ifNot}}
          </mj-text>
          <mj-text>
            We received a request to reset your password. Click the button below to create a new password:
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-button href="{{resetUrl}}">
            Reset Password
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text color="#666666" font-size="14px">
            This link will expire in {{expiryHours}} hours.
          </mj-text>
          <mj-text color="#666666" font-size="14px" padding="10px 0 0">
            If you didn't request this, please ignore this email.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" color="#888888" font-size="14px">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 2: Create email verification template**

Create `apps/backoffice/email-templates/auth/email-verification.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" padding="12px 24px" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" align="center">
            Verify Your Email Address
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text>
            {{#if userName}}Hi {{userName}},{{/if}}
            {{#ifNot userName}}Hello,{{/ifNot}}
          </mj-text>
          <mj-text>
            Please verify your email address by clicking the button below:
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-button href="{{verifyUrl}}">
            Verify Email
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text color="#666666" font-size="14px">
            This link will expire in {{expiryHours}} hours.
          </mj-text>
          <mj-text color="#666666" font-size="14px" padding="10px 0 0">
            If you didn't create an account, please ignore this email.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" color="#888888" font-size="14px">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 3: Create magic link template**

Create `apps/backoffice/email-templates/auth/magic-link.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" padding="12px 24px" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" align="center">
            Sign In to {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text>
            {{#if userName}}Hi {{userName}},{{/if}}
            {{#ifNot userName}}Hello,{{/ifNot}}
          </mj-text>
          <mj-text>
            Click the button below to sign in to your account:
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-button href="{{magicLink}}">
            Sign In
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text color="#666666" font-size="14px">
            This link will expire in {{expiryHours}} hours.
          </mj-text>
          <mj-text color="#666666" font-size="14px" padding="10px 0 0">
            If you didn't request this, please ignore this email.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" color="#888888" font-size="14px">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 4: Commit**

```bash
git add apps/backoffice/email-templates/auth/
git commit -m "feat: add auth email templates (password-reset, verification, magic-link)"
```

---

## Task 5: Create User Templates

**Files:**
- Create: `apps/backoffice/email-templates/user/welcome.mjml`
- Create: `apps/backoffice/email-templates/user/account-verified.mjml`

**Step 1: Create welcome template**

Create `apps/backoffice/email-templates/user/welcome.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" padding="12px 24px" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" align="center">
            Welcome to {{appName}}!
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text>
            Hi {{userName}},
          </mj-text>
          <mj-text>
            We're excited to have you on board. Your account has been created successfully.
          </mj-text>
          <mj-text>
            Click the button below to get started:
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-button href="{{loginUrl}}">
            Get Started
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text color="#666666" font-size="14px">
            If you have any questions, feel free to reach out to our support team.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" color="#888888" font-size="14px">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 2: Create account verified template**

Create `apps/backoffice/email-templates/user/account-verified.mjml`:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, sans-serif" />
      <mj-button background-color="#5468ff" color="#ffffff" border-radius="4px" font-weight="bold" padding="12px 24px" />
      <mj-text color="#333333" font-size="16px" line-height="1.5" />
      <mj-container background-color="#ffffff" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f9fc">
    <mj-container width="600px" padding="40px 20px">
      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text align="center" font-size="24px" font-weight="bold" color="#333333">
            {{appName}}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" align="center">
            Email Verified Successfully!
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-text>
            Hi {{userName}},
          </mj-text>
          <mj-text>
            Your email address has been verified. You now have full access to all features.
          </mj-text>
          <mj-text>
            Click the button below to go to your dashboard:
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 0 20px">
        <mj-column>
          <mj-button href="{{dashboardUrl}}">
            Go to Dashboard
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section padding="40px 0 0">
        <mj-column>
          <mj-text align="center" color="#888888" font-size="14px">
            {{footerText}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```

**Step 3: Commit**

```bash
git add apps/backoffice/email-templates/user/
git commit -m "feat: add user email templates (welcome, account-verified)"
```

---

## Task 6: Create MJML Compiler

**Files:**
- Create: `apps/backoffice/lib/email/compiler.ts`

**Step 1: Create compiler script**

Create `apps/backoffice/lib/email/compiler.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const TEMPLATES_DIR = path.join(process.cwd(), 'email-templates');
const OUTPUT_DIR = path.join(process.cwd(), 'lib/email/templates');
const TYPES_FILE = path.join(process.cwd(), 'lib/email/types.ts');

interface TemplateFile {
  name: string;
  category: string;
  fullPath: string;
}

// Find all .mjml files
function findTemplates(dir: string, category: string = ''): TemplateFile[] {
  const files: TemplateFile[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip layouts directory
      if (item !== 'layouts') {
        files.push(...findTemplates(fullPath, item));
      }
    } else if (item.endsWith('.mjml')) {
      files.push({
        name: item.replace('.mjml', ''),
        category,
        fullPath,
      });
    }
  }

  return files;
}

// Compile MJML to HTML
async function compileTemplate(inputPath: string, outputPath: string): Promise<void> {
  const { stdout, stderr } = await execAsync(
    `npx mjml "${inputPath}" -o "${outputPath}"`
  );

  if (stderr && !stderr.includes('compiled successfully')) {
    console.error(`Error compiling ${inputPath}:`, stderr);
  }
}

// Generate TypeScript types
function generateTypes(templateNames: string[]): string {
  const names = templateNames.map((n) => `  | '${n}'`).join('\n');

  return `// Auto-generated by lib/email/compiler.ts
// Do not edit manually

export type EmailTemplate =
${names};

export interface SendOptions {
  to: string | string[];
  subject: string;
  data: Record<string, string | number | boolean | undefined>;
  from?: string;
  replyTo?: string;
}

export interface SendResult {
  success: boolean;
  error?: string;
  messageId?: string;
}
`;
}

// Main compilation function
async function compile(): Promise<void> {
  console.log('🔨 Compiling MJML templates...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Find all templates
  const templates = findTemplates(TEMPLATES_DIR);

  if (templates.length === 0) {
    console.log('No templates found');
    return;
  }

  console.log(`Found ${templates.length} template(s)`);

  // Compile each template
  const templateNames: string[] = [];
  for (const template of templates) {
    const outputPath = path.join(OUTPUT_DIR, `${template.name}.html`);
    await compileTemplate(template.fullPath, outputPath);
    templateNames.push(template.name);
    console.log(`  ✓ ${template.name}`);
  }

  // Generate types file
  fs.writeFileSync(TYPES_FILE, generateTypes(templateNames));
  console.log(`\n✅ Generated ${TYPES_FILE}`);

  console.log(`\n✅ Compiled ${templateNames.length} template(s)`);
}

// Watch mode
async function watch(): Promise<void> {
  console.log('👀 Watching MJML templates for changes...');

  let isRunning = false;
  const debounce = () => {
    if (isRunning) return;
    isRunning = true;

    compile().then(() => {
      isRunning = false;
    });
  };

  // Simple polling for watch mode
  setInterval(() => {
    const templates = findTemplates(TEMPLATES_DIR);
    for (const template of templates) {
      const outputPath = path.join(OUTPUT_DIR, `${template.name}.html`);
      if (!fs.existsSync(outputPath)) {
        debounce();
        break;
      }
      const inputMtime = fs.statSync(template.fullPath).mtime;
      const outputMtime = fs.statSync(outputPath).mtime;
      if (inputMtime > outputMtime) {
        debounce();
        break;
      }
    }
  }, 1000);

  // Initial compile
  await compile();
}

// CLI
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

if (watchMode) {
  watch();
} else {
  compile();
}
```

**Step 2: Add build scripts to package.json**

Add to `apps/backoffice/package.json` scripts:
```json
"build:email": "ts-node lib/email/compiler.ts",
"dev:email": "ts-node lib/email/compiler.ts --watch"
```

**Step 3: Test compiler**

Run: `cd apps/backoffice && pnpm build:email`
Expected: Output shows compiled templates and generated types file

**Step 4: Verify generated files**

Run: `ls -la apps/backoffice/lib/email/templates/`
Expected: HTML files for each template

Run: `cat apps/backoffice/lib/email/types.ts`
Expected: TypeScript union type with all template names

**Step 5: Commit**

```bash
git add apps/backoffice/lib/email/compiler.ts apps/backoffice/lib/email/types.ts apps/backoffice/lib/email/templates/ apps/backoffice/package.json
git commit -m "feat: add MJML compiler with type generation"
```

---

## Task 7: Create Sender Utility

**Files:**
- Create: `apps/backoffice/lib/email/sender.ts`
- Modify: `apps/backoffice/lib/email/index.ts`

**Step 1: Create sender utility**

Create `apps/backoffice/lib/email/sender.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import { env } from '@/lib/env';
import { ResendEmailService } from './service/resend';
import type { EmailTemplate, SendOptions, SendResult } from './types';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib/email/templates');

// Initialize Resend service (lazy load)
let emailService: ResendEmailService | null = null;

function getEmailService(): ResendEmailService | null {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === 'development') {
      console.warn('⚠️  RESEND_API_KEY not configured. Emails will not be sent.');
    }
    return null;
  }

  if (!emailService) {
    emailService = new ResendEmailService(
      env.RESEND_API_KEY,
      env.EMAIL_FROM
    );
  }

  return emailService;
}

// Interpolate variables in HTML template
function interpolateTemplate(html: string, data: Record<string, any>): string {
  let result = html;

  // Handle {{variable}} syntax
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      return match; // Keep placeholder if not found
    }
    return String(value);
  });

  // Handle conditional {{#if var}}...{{/if}} syntax
  result = result.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, key, content) => {
    return data[key] ? content : '';
  });

  // Handle {{#ifNot var}}...{{/ifNot}} syntax
  result = result.replace(/\{\{#ifNot (\w+)\}\}(.*?)\{\{\/ifNot\}\}/gs, (match, key, content) => {
    return !data[key] ? content : '';
  });

  return result;
}

// Load compiled template
function loadTemplate(name: EmailTemplate): string {
  const templatePath = path.join(TEMPLATES_DIR, `${name}.html`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${name}`);
  }

  return fs.readFileSync(templatePath, 'utf-8');
}

// Send email using template
export async function sendTemplate(
  template: EmailTemplate,
  options: SendOptions
): Promise<SendResult> {
  try {
    // Load template
    const html = loadTemplate(template);

    // Add default variables
    const data = {
      appName: env.NEXT_PUBLIC_APP_NAME,
      appUrl: env.NEXT_PUBLIC_APP_URL,
      footerText: `© ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.`,
      ...options.data,
    };

    // Interpolate variables
    const finalHtml = interpolateTemplate(html, data);

    // Send email
    const service = getEmailService();
    if (!service) {
      // Return success in development without API key
      if (env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          template,
          to: options.to,
          subject: options.subject,
        });
        return { success: true };
      }
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const result = await service.send({
      to: options.to,
      subject: options.subject,
      html: finalHtml,
      from: options.from,
      replyTo: options.replyTo,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: (result.data as any)?.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 2: Update email index exports**

Modify `apps/backoffice/lib/email/index.ts` to:
```typescript
export * from "./service/email-service";
export * from "./service/resend";
export * from "./types";
export { sendTemplate } from "./sender";

// Keep old exports for backward compatibility (will be removed)
export { PasswordResetEmail } from "./templates/password-reset";
export { VerificationEmail } from "./templates/verification";
export { WelcomeEmail } from "./templates/welcome";
export * from "./utils";
```

**Step 3: Commit**

```bash
git add apps/backoffice/lib/email/sender.ts apps/backoffice/lib/email/index.ts
git commit -m "feat: add sendTemplate utility for MJML templates"
```

---

## Task 8: Update Auth Routes to Use New Templates

**Files:**
- Modify: `apps/backoffice/app/api/auth/forgot-password/route.ts`
- Modify: `apps/backoffice/app/api/auth/verify-email/route.ts`

**Step 1: Update forgot password route**

Find and replace the email sending in `apps/backoffice/app/api/auth/forgot-password/route.ts`:
```typescript
// Old code using React Email - replace with:
import { sendTemplate } from "@/lib/email";

// In the route handler, replace the email sending with:
const result = await sendTemplate('password-reset', {
  to: user.email,
  subject: 'Reset Your Password',
  data: {
    userName: user.name,
    resetUrl: `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
    expiryHours: 1,
  },
});

if (!result.success) {
  console.error('Failed to send password reset email:', result.error);
}
```

**Step 2: Update verify email route**

Find and replace the email sending in `apps/backoffice/app/api/auth/verify-email/route.ts`:
```typescript
// Old code using React Email - replace with:
import { sendTemplate } from "@/lib/email";

// In the route handler, replace the email sending with:
const result = await sendTemplate('email-verification', {
  to: user.email,
  subject: 'Verify Your Email Address',
  data: {
    userName: user.name,
    verifyUrl: `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
    expiryHours: 24,
  },
});

if (!result.success) {
  console.error('Failed to send verification email:', result.error);
}
```

**Step 3: Test forgot password**

Run: `cd apps/backoffice && pnpm build:email`
Expected: Templates compiled

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/auth/forgot-password/route.ts apps/backoffice/app/api/auth/verify-email/route.ts
git commit -m "feat: use MJML templates for auth emails"
```

---

## Task 9: Add Welcome Email to Registration

**Files:**
- Modify: `apps/backoffice/app/api/auth/register/route.ts`

**Step 1: Add welcome email after registration**

In the success path of registration, add:
```typescript
import { sendTemplate } from "@/lib/email";

// After user is created successfully:
await sendTemplate('welcome', {
  to: user.email,
  subject: `Welcome to ${env.NEXT_PUBLIC_APP_NAME}!`,
  data: {
    userName: user.name || 'there',
    loginUrl: `${env.NEXT_PUBLIC_APP_URL}/login`,
  },
}).catch((error) => {
  // Log but don't fail registration
  console.error('Failed to send welcome email:', error);
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/auth/register/route.ts
git commit -m "feat: send welcome email after registration"
```

---

## Task 10: Update Documentation

**Files:**
- Create: `apps/backoffice/docs/features/email-templates.md`

**Step 1: Create email templates documentation**

Create `apps/backoffice/docs/features/email-templates.md`:
```markdown
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

\`\`\`typescript
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
\`\`\`

## Adding New Templates

1. Create `.mjml` file in `email-templates/`
2. Run \`pnpm build:email\` to compile
3. Use immediately with \`sendTemplate('new-template', { ... })\`

## Development

- \`pnpm dev:email\` - Watch and auto-compile templates
- \`pnpm build:email\` - Compile templates for production

Template names are type-safe - TypeScript will only allow valid template names.
```

**Step 2: Update main README**

Add to features list in `docs/README.md`:
```markdown
- **Email Templates** - MJML-based transactional emails with Resend
```

**Step 3: Commit**

```bash
git add apps/backoffice/docs/features/email-templates.md docs/README.md
git commit -m "docs: add email templates documentation"
```

---

## Task 11: Add Build Step to Turbo

**Files:**
- Modify: `turbo.json`

**Step 1: Add email build task to turbo config**

Add to `turbo.json` in the tasks:
```json
"build:email": {
  "dependsOn": ["^build:email"],
  "outputs": ["lib/email/templates/**", "lib/email/types.ts"]
}
```

And add to the `build` task's `dependsOn`:
```json
"build": {
  "dependsOn": ["^build", "build:email"],
  ...
}
```

**Step 2: Commit**

```bash
git add turbo.json
git commit -m "build: add email templates to turbo pipeline"
```

---

## Task 12: Clean Up Old React Email Templates

**Files:**
- Delete: `apps/backoffice/lib/email/templates/password-reset.tsx`
- Delete: `apps/backoffice/lib/email/templates/verification.tsx`
- Delete: `apps/backoffice/lib/email/templates/welcome.tsx`

**Step 1: Remove old template files**

Run:
```bash
rm -f apps/backoffice/lib/email/templates/password-reset.tsx
rm -f apps/backoffice/lib/email/templates/verification.tsx
rm -f apps/backoffice/lib/email/templates/welcome.tsx
```

**Step 2: Update index.ts to remove old exports**

Modify `apps/backoffice/lib/email/index.ts` to remove the old exports:
```typescript
export * from "./service/email-service";
export * from "./service/resend";
export * from "./types";
export { sendTemplate } from "./sender";
```

**Step 3: Remove unused dependencies**

If `@react-email/components` is no longer needed:
```bash
cd apps/backoffice && pnpm remove @react-email/components
```

**Step 4: Test build**

Run: `pnpm --filter backoffice build`
Expected: Build succeeds without errors

**Step 5: Commit**

```bash
git add apps/backoffice/lib/email/index.ts apps/backoffice/package.json pnpm-lock.yaml
git commit -m "chore: remove old React Email templates"
```

---

## Task 13: Final Verification

**Files:**
- None (verification only)

**Step 1: Verify all templates compile**

Run: `cd apps/backoffice && pnpm build:email`
Expected: All templates compile successfully

**Step 2: Verify TypeScript types**

Run: `cd apps/backoffice && npx tsc --noEmit`
Expected: No type errors

**Step 3: Verify build**

Run: `pnpm --filter backoffice build`
Expected: Build succeeds

**Step 4: Check generated files**

Run: `ls -la apps/backoffice/lib/email/templates/`
Expected: `.html` files for all templates

Run: `cat apps/backoffice/lib/email/types.ts`
Expected: All template names in union type

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification and cleanup for MJML email templates"
```

---

## Summary

This implementation creates a complete MJML-based email template system:

- **5 email templates**: password-reset, email-verification, magic-link, welcome, account-verified
- **Build-time compilation**: MJML → HTML via compiler script
- **Type-safe API**: `sendTemplate()` with generated TypeScript types
- **Simple extension**: Add new `.mjml` files and compile
- **Integrated with Resend**: Uses existing email service
- **Development friendly**: Watch mode for template changes
