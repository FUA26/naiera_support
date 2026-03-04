"use client";

import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {/* Background Layers */}
      <div className="absolute inset-0 -z-10">
        {/* Base Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Overlay Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero Title */}
        <h1 className="animate-fade-in-up text-4xl leading-tight font-bold text-white drop-shadow-md md:text-5xl lg:text-6xl">
          YourBrand
        </h1>

        {/* Hero Subtitle */}
        <p className="animate-fade-in-up animation-delay-200 mx-auto max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg lg:text-xl">
          Enterprise Next.js Boilerplate
          <br />
          Production-ready monorepo with authentication, RBAC, file uploads, and
          more.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animation-delay-400 mx-auto flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight size={20} />
          </Link>
          <a
            href="https://github.com/yourusername/yourrepo"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-card/80 hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-lg border-2 px-8 py-3 font-semibold backdrop-blur-sm transition-all duration-300"
          >
            <Github size={20} />
            GitHub
          </a>
        </div>

        {/* Stats or Additional Info */}
        <div className="animate-fade-in-up animation-delay-600 mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 md:gap-8">
          <div className="text-center">
            <div className="text-primary text-2xl font-bold md:text-4xl">
              Next.js
            </div>
            <div className="mt-1 text-xs text-slate-300 md:text-sm">
              App Router
            </div>
          </div>
          <div className="border-x border-white/20 text-center">
            <div className="text-primary text-2xl font-bold md:text-4xl">
              Type
            </div>
            <div className="mt-1 text-xs text-slate-300 md:text-sm">
              Safe
            </div>
          </div>
          <div className="text-center">
            <div className="text-primary text-2xl font-bold md:text-4xl">
              Mono
            </div>
            <div className="mt-1 text-xs text-slate-300 md:text-sm">
              Repo
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-2">
          <div className="h-2 w-1 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
