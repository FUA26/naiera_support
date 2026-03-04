"use client";

import { Github, BookOpen, Layers, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/components/providers";

export function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    docs: [
      { label: "Getting Started", href: "/docs/getting-started" },
      { label: "Architecture", href: "/docs/architecture" },
      { label: "Patterns", href: "/docs/patterns" },
      { label: "Deployment", href: "/docs/deployment" },
    ],
    patterns: [
      { label: "API Routes", href: "/docs/patterns/api-routes" },
      { label: "Authentication", href: "/docs/patterns/auth" },
      { label: "File Uploads", href: "/docs/patterns/file-uploads" },
      { label: "Validation", href: "/docs/patterns/validation" },
    ],
    resources: [
      { label: "GitHub", href: "https://github.com/yourusername/yourrepo", external: true },
      { label: "Examples", href: "/docs/examples" },
      { label: "Changelog", href: "/docs/changelog" },
      { label: "Support", href: "/docs/support" },
    ],
  };

  return (
    <footer className="from-primary-hover to-primary-active text-primary-foreground bg-gradient-to-b">
      {/* Main Footer */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-12">
          {/* Brand Section - Spans 4 columns on large screens */}
          <div className="lg:col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-sm ring-1 ring-white/20">
                <Image
                  src={settings?.siteLogoUrl || "/naiera.png"}
                  alt={settings?.siteName || "YourBrand Logo"}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {settings?.siteName || "YourBrand"}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  {settings?.siteSubtitle || "Enterprise Next.js Boilerplate"}
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              {settings?.siteDescription ||
                "A production-ready Next.js boilerplate with authentication, RBAC, file uploads, and more. Skip the setup and focus on building your product."}
            </p>

            {/* Key Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-blue-400" />
                <span className="text-sm">Type-Safe & Secure</span>
              </div>
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-blue-400" />
                <span className="text-sm">Monorepo Architecture</span>
              </div>
            </div>
          </div>

          {/* Documentation - Spans 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <BookOpen size={20} className="text-blue-400" />
              Documentation
            </h3>
            <ul className="space-y-3">
              {footerLinks.docs.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-blue-100/80 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patterns - Spans 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Layers size={20} className="text-blue-400" />
              Patterns
            </h3>
            <ul className="space-y-3">
              {footerLinks.patterns.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-blue-100/80 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - Spans 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Github size={20} className="text-blue-400" />
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-blue-100/80 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-blue-100/80 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack - Spans 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-lg font-bold text-white">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Prisma", "PostgreSQL", "S3", "Turborepo"].map((tech) => (
                <span
                  key={tech}
                  className="bg-white/10 text-blue-100 rounded-full px-3 py-1 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-blue-950/50">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-center text-sm text-blue-200/70 md:text-left">
              {settings?.copyrightText || `© ${currentYear} YourBrand. Built with the Enterprise Next.js Boilerplate.`}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a
                href="https://github.com/yourusername/yourrepo/blob/main/LICENSE"
                className="text-blue-200/70 transition-colors hover:text-white"
              >
                MIT License
              </a>
            </div>
          </div>

          {/* Version & Build Info */}
          <div className="mt-4 border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-blue-200/50">
              {settings?.siteName || "YourBrand"} v{settings?.versionNumber || "1.0.0"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
