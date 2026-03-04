"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useSettings } from "@/components/providers";

export function Header() {
  const t = useTranslations("Navigation");
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { label: "Home", href: "/", active: true },
    { label: "Documentation", href: "/docs", active: false },
    { label: "Features", href: "#features", active: false },
    {
      label: "GitHub",
      href: "https://github.com/yourusername/yourrepo",
      active: false,
      external: true,
    },
  ];

  return (
    <>
      <header className="border-border bg-background/90 sticky top-0 z-50 h-20 border-b shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-card ring-border relative flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ring-1">
              {settings?.siteLogoUrl ? (
                <Image
                  src={settings.siteLogoUrl}
                  alt={settings.siteName || "YourBrand"}
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                  unoptimized
                />
              ) : (
                <Image
                  src="/naiera.png"
                  alt="YourBrand"
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-xl font-bold">
                {settings?.siteName || "YourBrand"}
              </span>
              <span className="text-muted-foreground hidden text-xs sm:block">
                {settings?.siteSubtitle || "Enterprise Next.js Boilerplate"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Section */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary-hover hidden items-center justify-center rounded-lg px-6 py-2 font-medium shadow-lg transition-all duration-300 sm:inline-flex"
            >
              Login
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:text-primary text-muted-foreground p-2 transition-colors md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="bg-background/50 absolute inset-0 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="bg-card absolute top-0 right-0 h-full w-80 max-w-[85vw] shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Drawer Header */}
              <div className="border-border flex items-center justify-between border-b p-6">
                <span className="text-foreground text-lg font-bold">
                  Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary text-muted-foreground p-2 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`border-border block border-b px-6 py-4 font-medium transition-colors ${
                      item.active
                        ? "bg-primary-lighter text-primary"
                        : "hover:text-primary text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="border-border border-t p-6">
                <Link
                  href="/login"
                  className="bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary-hover block w-full rounded-lg px-6 py-3 text-center font-medium shadow-lg transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
