"use client";

import {
  FolderOpen,
  Package,
  Layers,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface ArchitectureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

export function ArchitectureSection() {
  const items: ArchitectureItem[] = [
    {
      icon: FolderOpen,
      title: "Monorepo Structure",
      description:
        "Turborepo-powered monorepo with shared packages and multiple applications.",
      path: "apps/",
    },
    {
      icon: Package,
      title: "Shared Packages",
      description:
        "Reusable UI components, utilities, and configurations shared across all apps.",
      path: "packages/",
    },
    {
      icon: Layers,
      title: "Layered Architecture",
      description:
        "Clean separation between API routes, service layer, and data access.",
      path: "Service Layer Pattern",
    },
  ];

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="bg-primary-light text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            Architecture
          </span>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Built to Scale
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-base md:text-lg">
            A well-organized codebase that scales with your team and product.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {items.map((item) => (
            <ArchitectureCard key={item.title} item={item} />
          ))}
        </div>

        {/* Simple Diagram */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h3 className="text-foreground mb-6 text-center text-xl font-bold">
            Monorepo Structure
          </h3>
          <div className="mx-auto max-w-2xl overflow-x-auto">
            <pre className="bg-muted text-muted-foreground rounded-lg p-6 text-sm font-mono">
              {`.
├── apps/
│   ├── backoffice/     # Admin dashboard
│   ├── landing/        # Public website
│   └── api/           # Optional API server
├── packages/
│   ├── ui/            # Shared components
│   ├── config/        # ESLint, TypeScript, etc.
│   └── database/      # Prisma schema & client
└── docs/              # Project documentation`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ArchitectureCardProps {
  item: ArchitectureItem;
}

function ArchitectureCard({ item }: ArchitectureCardProps) {
  const Icon = item.icon;

  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <div className="bg-primary-light text-primary mb-5 flex h-12 w-12 items-center justify-center rounded-xl">
        <Icon size={24} strokeWidth={2} />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-bold">{item.title}</h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {item.description}
      </p>
      <code className="bg-muted text-primary rounded px-2 py-1 text-xs font-mono">
        {item.path}
      </code>
    </div>
  );
}
