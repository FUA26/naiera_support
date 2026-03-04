# Branding Customization

How to customize the visual identity of your application.

## Overview

The boilerplate includes a system settings table that stores branding configuration. You can customize logos, colors, names, and more through the admin interface or by modifying the default settings.

## Customization Options

### Application Name

Change the application name throughout the system:

1. Via Database (Recommended):
   - Navigate to Settings > General
   - Update "Site Name" and "Site Subtitle"

2. Via Code:
```typescript
// apps/backoffice/lib/settings/defaults.ts
export const defaultSettings = {
  siteName: "YourBrand",
  siteSubtitle: "Enterprise Next.js Boilerplate",
  // ...
};
```

### Logo

Replace the default logo:

1. Via Admin Panel:
   - Navigate to Settings > Branding
   - Upload your logo
   - The system will use the uploaded logo

2. Via File Replacement:
   - Replace `apps/landing/public/naiera.png` with your logo
   - Update references in components

3. Via Environment Variable (for deployment):
```bash
NEXT_PUBLIC_LOGO_URL="https://your-cdn.com/logo.png"
```

### Colors

Customize the color scheme:

1. **Tailwind Configuration**:
```typescript
// apps/backoffice/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          // Custom values
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        // Add more custom colors
      },
    },
  },
};
```

2. **CSS Variables**:
```css
/* apps/backoffice/app/globals.css */
@layer base {
  :root {
    --primary: 220 90% 56%; /* Custom primary color */
    --primary-foreground: 0 0% 100%;
    /* More variables */
  }
}
```

### Theme Modes

The boilerplate supports light and dark modes. The default theme can be set:

```typescript
// apps/backoffice/components/providers/theme-provider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // or "system" or "dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Favicon

Replace the favicon:

1. Replace `apps/backoffice/app/favicon.ico`
2. Replace `apps/landing/app/favicon.ico`
3. Update metadata in `layout.tsx`:
```typescript
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
```

### Meta Tags

Customize SEO metadata:

```typescript
// apps/backoffice/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "YourBrand Dashboard",
    template: "%s | YourBrand",
  },
  description: "Enterprise dashboard built with Next.js",
  keywords: ["nextjs", "dashboard", "boilerplate"],
  authors: [{ name: "Your Name", url: "https://yourdomain.com" }],
  openGraph: {
    title: "YourBrand",
    description: "Enterprise dashboard built with Next.js",
    url: "https://yourdomain.com",
    siteName: "YourBrand",
    images: [{
      url: "https://yourdomain.com/og-image.png",
      width: 1200,
      height: 630,
    }],
  },
};
```

### Email Templates

Customize email branding:

```typescript
// apps/backoffice/lib/email/templates/base.tsx
export function EmailTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://yourdomain.com/logo.png"
              width="120"
              height="50"
              alt="YourBrand"
            />
          </Section>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} YourBrand. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

## System Settings

The boilerplate includes a system settings table for runtime customization:

```prisma
model SystemSetting {
  id                String  @id @default(cuid())
  key               String  @unique
  value             Json
  category          String  @default("general")
  description       String?
  updatedAt         DateTime @updatedAt
}
```

Available settings categories:

- **General**: Site name, description, tagline
- **Branding**: Logo URL, hero background, colors
- **Contact**: Address, phone, email
- **Social**: Facebook, Twitter, Instagram, YouTube
- **Legal**: Privacy policy, terms, disclaimer
- **Features**: Feature flags, maintenance mode

## Customization Checklist

- [ ] Update application name
- [ ] Replace logo
- [ ] Customize color scheme
- [ ] Update favicon
- [ ] Set up email templates
- [ ] Configure social links
- [ ] Update footer information
- [ ] Add custom fonts (optional)
- [ ] Configure meta tags for SEO

## Fonts

To use custom fonts:

1. Add fonts to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
};
```

2. Update `layout.tsx`:
```typescript
import { Inter, Roboto } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

3. Update Tailwind config:
```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui"],
        heading: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
};
```

## See Also

- [Adding Modules](/docs/customization/adding-modules) - Extending functionality
- [Package Renaming](/docs/customization/package-renaming) - Changing package names
