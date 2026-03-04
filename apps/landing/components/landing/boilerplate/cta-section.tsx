"use client";

import { BookOpen, Github, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary-hover to-primary-active py-16 md:py-24 text-primary-foreground">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-primary-foreground/90 mb-10 text-lg leading-relaxed">
          Get started with our comprehensive documentation and join the
          community of developers building with this boilerplate.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="bg-background text-foreground hover:bg-background/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105"
          >
            <BookOpen size={20} />
            Read the Docs
            <ArrowRight size={20} />
          </Link>
          <a
            href="https://github.com/yourusername/yourrepo"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 inline-flex items-center gap-2 rounded-lg border-2 border-primary-foreground/30 px-8 py-3 font-semibold backdrop-blur-sm transition-all duration-300"
          >
            <Github size={20} />
            View on GitHub
          </a>
        </div>

        {/* Additional Links */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
          <a
            href="/docs/getting-started"
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Getting Started
          </a>
          <span className="text-primary-foreground/30">|</span>
          <a
            href="/docs/architecture"
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Architecture
          </a>
          <span className="text-primary-foreground/30">|</span>
          <a
            href="/docs/patterns"
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Patterns
          </a>
          <span className="text-primary-foreground/30">|</span>
          <a
            href="/docs/deployment"
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Deployment
          </a>
        </div>
      </div>
    </section>
  );
}
