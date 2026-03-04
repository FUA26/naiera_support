"use client";

import {
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  MessageCircle,
  Bus,
  Home,
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Landmark,
  TreePine,
  MapPin,
  ShieldAlert,
  Palmtree,
  Award,
  Factory,
  Heart,
  Sprout,
  FileSearch,
  Building,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ServiceCategory as ServiceCategoryData } from "@/lib/services-data";

// Icon mapping for string names from JSON
const iconMap: Record<string, LucideIcon> = {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Palmtree,
  Building2,
  Heart,
  TreePine,
  Landmark,
  FileSearch,
  ShieldAlert,
  IdCard,
  FileText,
  FileCheck,
  Home,
  MessageCircle,
  Bus,
  MapPin,
  Award,
  Factory,
  Sprout,
  Building,
  Cloud,
  CreditCard,
};

interface Service {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
  href: string;
  badge?: string;
  stats?: string;
  category: string;
}

interface ServiceCategory {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  services: Service[];
}

interface ServicesSectionClientProps {
  serviceCategories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    slug: string;
    services: Array<{
      slug: string;
      icon: string;
      name: string;
      description: string;
      categoryId: string;
      badge?: string;
      stats?: string;
    }>;
  }>;
}

export function ServicesSectionClient({
  serviceCategories: rawData,
}: ServicesSectionClientProps) {
  const t = useTranslations("Services");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Transform raw data to include icon components
  const serviceCategories = useMemo(() => {
    return rawData.map((category) => ({
      name: category.name,
      icon: iconMap[category.icon] || Users,
      color: category.color,
      bgColor: category.bgColor,
      services: category.services.map((service) => ({
        slug: service.slug,
        icon: iconMap[service.icon] || FileText,
        name: service.name,
        description: service.description,
        href: `/layanan/${service.slug}`,
        badge: service.badge,
        stats: service.stats,
        category: category.name,
      })),
    }));
  }, [rawData]);

  const allServices = serviceCategories.flatMap((cat) => cat.services);

  const displayedCategories = showAllCategories
    ? serviceCategories
    : serviceCategories.slice(0, 6);

  const displayedServices =
    selectedCategory === null
      ? allServices.slice(0, 9)
      : serviceCategories.find((cat) => cat.name === selectedCategory)
          ?.services || [];

  return (
    <section className="bg-muted py-16 md:py-20" id="layanan">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="bg-primary-light text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            {t("label")}
          </span>
          <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-5 py-2.5 font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-primary/30 shadow-lg"
                  : "hover:border-primary/30 hover:text-primary border-border bg-card text-foreground border"
              }`}
            >
              {t("allServices")}
            </button>
            {displayedCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground shadow-primary/30 shadow-lg"
                      : "hover:border-primary/30 hover:text-primary border-border bg-card text-foreground border"
                  }`}
                >
                  <CategoryIcon size={16} />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">
                    {category.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {serviceCategories.length > 6 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                {showAllCategories ? t("showLess") : t("showAll")}
                <ArrowRight
                  size={16}
                  className={`transition-transform ${showAllCategories ? "rotate-90" : ""}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {displayedServices.map((service, index) => (
            <ServiceCard
              key={service.name}
              service={service}
              index={index}
              tAccess={t("access")}
            />
          ))}
        </div>

        {/* Empty State */}
        {displayedServices.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">{t("empty")}</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="border-border bg-card mt-16 rounded-2xl border p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCard
              number="100+"
              label={t("stats.services")}
              icon={Building2}
              color="primary"
            />
            <StatCard
              number="50K+"
              label={t("stats.users")}
              icon={Users}
              color="blue"
            />
            <StatCard
              number="15K+"
              label={t("stats.transactions")}
              icon={CreditCard}
              color="purple"
            />
            <StatCard
              number="4.8/5"
              label={t("stats.rating")}
              icon={HeartPulse}
              color="amber"
            />
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <a
            href="#semua-layanan"
            className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold transition-colors"
          >
            {t("explore")}
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: Service;
  index: number;
  tAccess: string;
}

function ServiceCard({ service, index, tAccess }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <a
      href={service.href}
      className="group animate-fade-in-up hover:border-primary/30 border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`Layanan ${service.name} - ${service.description}`}
    >
      {/* Decorative gradient background */}
      <div className="from-primary-lighter absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* Badge */}
      {service.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              service.badge === "Baru" || service.badge === "New"
                ? "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                : service.badge === "Penting" || service.badge === "Important"
                  ? "border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "border-primary/30 bg-primary-lighter text-primary border"
            }`}
          >
            {service.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="bg-primary-lighter text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={28} strokeWidth={2} />
        </div>

        {/* Service Name */}
        <h3 className="group-hover:text-primary text-foreground mb-2 text-lg font-bold transition-colors">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          {service.description}
        </p>

        {/* Stats & Action */}
        <div className="border-border flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground text-xs font-medium">
            {service.stats}
          </span>
          <div className="text-primary flex items-center gap-1 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
            {tAccess}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </a>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

function StatCard({ number, label, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary-lighter",
    blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    purple:
      "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30",
    amber:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30",
  };

  const selectedColor =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className="text-center">
      <div
        className={`h-12 w-12 ${selectedColor} mx-auto mb-3 flex items-center justify-center rounded-xl`}
      >
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="text-foreground mb-1 text-2xl font-bold md:text-3xl">
        {number}
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
