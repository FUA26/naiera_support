"use client";

import {
  Shield,
  Upload,
  Zap,
  FileText,
  Smartphone,
  Code,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: Shield,
      title: "Auth & RBAC",
      description:
        "Complete authentication system with role-based access control, permissions, and page-level protection.",
    },
    {
      icon: Upload,
      title: "File Uploads",
      description:
        "S3-compatible file uploads with image optimization, validation, and CDN integration out of the box.",
    },
    {
      icon: Zap,
      title: "ISR Caching",
      description:
        "Incremental Static Regeneration for blazing-fast page loads with on-demand revalidation.",
    },
    {
      icon: FileText,
      title: "Activity Logging",
      description:
        "Comprehensive audit trail for all user actions with filterable logs and export capabilities.",
    },
    {
      icon: Smartphone,
      title: "Responsive UI",
      description:
        "Beautiful, mobile-first design system with dark mode support and accessible components.",
    },
    {
      icon: Code,
      title: "Type Safe",
      description:
        "Full TypeScript coverage with Zod validation, type-safe API routes, and Prisma ORM.",
    },
  ];

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="bg-primary-light text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            Features
          </span>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Everything You Need
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-base md:text-lg">
            A production-ready foundation for your next enterprise application.
            Skip the boilerplate and focus on your business logic.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className="group animate-fade-in-up hover:border-primary/30 border-border bg-card rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="bg-primary-light text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110">
        <Icon size={28} strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="group-hover:text-primary text-foreground mb-3 text-xl font-bold transition-colors">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}
