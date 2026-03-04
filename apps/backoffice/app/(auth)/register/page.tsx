/**
 * Registration Page
 *
 * @pattern Authentication/Authorization
 * @pattern Page Route
 *
 * Public-facing registration page that allows new users to create accounts.
 * Displays branding and registration form with validation.
 *
 * Dependencies:
 * - @/components/auth/register-form: The registration form component
 *
 * Features:
 * - Displays application branding (logo, name, subtitle)
 * - Renders the RegisterForm component with validation
 * - SEO metadata for search engines
 * - Uses Next.js App Router file-based routing
 *
 * Route: /register
 * Access: Public (no authentication required)
 *
 * @see @/components/auth/register-form.tsx for form implementation
 * @see @/lib/auth/config.ts for authentication configuration
 * @see @/lib/validations/auth.ts for validation schemas
 */

import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

/**
 * Page metadata for SEO
 * Appears in search results and browser tabs
 */
export const metadata: Metadata = {
  title: "Daftar Akun Baru - Super App Naiera",
  description: "Buat akun baru untuk menggunakan layanan digital Naiera",
};

/**
 * Registration page component
 *
 * Renders the registration page with branding header and registration form.
 * This is a server component that composes the client-side RegisterForm.
 */
export default function RegisterPage() {
  return (
    <div className="w-full">
      {/* Branding header with logo and app name */}
      <div className="flex items-center gap-3 mb-10">
        <img
          src="/logo.svg"
          alt="Logo Naiera"
          width={40}
          height={40}
          className="object-contain"
        />
        <div>
          <h2 className="text-base font-bold leading-tight">Super App Naiera</h2>
          <p className="text-xs text-muted-foreground leading-tight">Kabupaten Naiera</p>
        </div>
      </div>

      {/* Page heading */}
      <div className="space-y-2 mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Daftar Akun Baru</h1>
        <p className="text-sm text-muted-foreground">Lengkapi data di bawah untuk membuat akun Anda</p>
      </div>

      {/* Registration form component */}
      <RegisterForm />
    </div>
  );
}
