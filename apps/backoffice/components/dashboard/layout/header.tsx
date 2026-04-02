import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg shadow-md">
            <img
              src="/images/logo_bandanaiera.png"
              alt="Bandanaiera Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="hidden font-bold sm:inline-block">Task Manager</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="/components"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Components
          </Link>
          <Link
            href="/examples"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Examples
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/yourusername/boilerplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <ThemeToggle />

          <Button size="sm" variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>

          <Button size="sm" className="hidden sm:flex" asChild>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
