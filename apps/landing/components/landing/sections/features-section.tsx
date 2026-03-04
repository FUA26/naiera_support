"use client";

import { Shield, Zap, Users, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeaturesSection() {
  const t = useTranslations("Features");

  const features: Feature[] = [
    {
      icon: Zap,
      title: t("items.fast.title"),
      description: t("items.fast.desc"),
    },
    {
      icon: Shield,
      title: t("items.secure.title"),
      description: t("items.secure.desc"),
    },
    {
      icon: Clock,
      title: t("items.available.title"),
      description: t("items.available.desc"),
    },
    {
      icon: Users,
      title: t("items.easy.title"),
      description: t("items.easy.desc"),
    },
  ];

  return (
    <section className="bg-background py-16 md:py-24" id="tentang">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="bg-primary-light text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            {t("label")}
          </span>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-base md:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 sm:flex-row">
            <button className="bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105">
              {t("ctaStart")}
            </button>
            <button className="border-border bg-card text-foreground hover:bg-muted rounded-lg border-2 px-8 py-3 font-semibold transition-all duration-300">
              {t("ctaLearn")}
            </button>
          </div>
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
