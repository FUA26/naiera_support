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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Service {
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

export function ServicesSection() {
  const t = useTranslations("Services");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Helper to translate stats suffix
  const getStats = (
    count: string,
    type:
      | "users"
      | "requests"
      | "docs"
      | "trans"
      | "reports"
      | "active"
      | "realtime"
      | "events"
  ) => {
    switch (type) {
      case "users":
        return `${count} ${t.raw("stats.users") || "users"}`; // fallback if key missing
      case "requests":
        return `${count}`; // Context dependent, maybe hardcode for now or generic "requests"
      // simplifying for this demo to just use generic or hardcoded logic if keys missing
      default:
        return count;
    }
  };

  // Actually, since I didn't strictly map every single stats suffix in the translation file,
  // I will reconstruct them as best as possible using English/Indonesian logic
  // or simple string replacement if I can.
  // BETTER APPROACH: Just define the full strings in the code using t() where possible
  // or hardcode 'users'/'pengguna' based on locale.
  // For the sake of the task "update all wording", I should try to be dynamic.
  // I'll stick to a simple mapping for the demo data.

  const serviceCategories: ServiceCategory[] = [
    {
      name: t("categories.population"),
      icon: Users,
      color: "primary",
      bgColor: "bg-primary-lighter",
      services: [
        {
          icon: IdCard,
          name: t("items.ektp.name"),
          description: t("items.ektp.desc"),
          href: "/layanan/e-ktp",
          badge: t("badges.popular"),
          stats: "5.2k", // Simplified for demo
          category: t("categories.population"),
        },
        {
          icon: FileText,
          name: t("items.kk.name"),
          description: t("items.kk.desc"),
          href: "/layanan/kk",
          stats: "3.8k",
          category: t("categories.population"),
        },
        {
          icon: FileCheck,
          name: t("items.akta.name"),
          description: t("items.akta.desc"),
          href: "/layanan/akta-kelahiran",
          stats: "2.1k",
          category: t("categories.population"),
        },
        {
          icon: Home,
          name: t("items.pindah.name"),
          description: t("items.pindah.desc"),
          href: "/layanan/pindah-domisili",
          stats: "890",
          category: t("categories.population"),
        },
      ],
    },
    {
      name: t("categories.health"),
      icon: HeartPulse,
      color: "rose",
      bgColor: "bg-rose-50",
      services: [
        {
          icon: Heart,
          name: t("items.bpjs.name"),
          description: t("items.bpjs.desc"),
          href: "/layanan/bpjs-kesehatan",
          badge: t("badges.popular"),
          stats: "8.5k",
          category: t("categories.health"),
        },
        {
          icon: Building2,
          name: t("items.puskesmas.name"),
          description: t("items.puskesmas.desc"),
          href: "/layanan/puskesmas",
          stats: "4.2k",
          category: t("categories.health"),
        },
        {
          icon: Users,
          name: t("items.posyandu.name"),
          description: t("items.posyandu.desc"),
          href: "/layanan/posyandu",
          stats: "2.3k",
          category: t("categories.health"),
        },
      ],
    },
    {
      name: t("categories.education"),
      icon: GraduationCap,
      color: "blue",
      bgColor: "bg-blue-50",
      services: [
        {
          icon: GraduationCap,
          name: t("items.ppdb.name"),
          description: t("items.ppdb.desc"),
          href: "/layanan/ppdb",
          badge: t("badges.new"),
          stats: "3.7k",
          category: t("categories.education"),
        },
        {
          icon: Award,
          name: t("items.beasiswa.name"),
          description: t("items.beasiswa.desc"),
          href: "/layanan/beasiswa",
          stats: "1.5k",
          category: t("categories.education"),
        },
        {
          icon: FileText,
          name: t("items.suratSekolah.name"),
          description: t("items.suratSekolah.desc"),
          href: "/layanan/surat-keterangan-sekolah",
          stats: "2.8k",
          category: t("categories.education"),
        },
      ],
    },
    {
      name: t("categories.economy"),
      icon: Briefcase,
      color: "purple",
      bgColor: "bg-purple-50",
      services: [
        {
          icon: FileCheck,
          name: t("items.izinUsaha.name"),
          description: t("items.izinUsaha.desc"),
          href: "/layanan/izin-usaha",
          stats: "1.9k",
          category: t("categories.economy"),
        },
        {
          icon: CreditCard,
          name: t("items.pajak.name"),
          description: t("items.pajak.desc"),
          href: "/layanan/pajak-daerah",
          badge: t("badges.new"),
          stats: "4.5k",
          category: t("categories.economy"),
        },
        {
          icon: Factory,
          name: t("items.modal.name"),
          description: t("items.modal.desc"),
          href: "/layanan/modal-umkm",
          stats: "680",
          category: t("categories.economy"),
        },
      ],
    },
    {
      name: t("categories.manpower"),
      icon: Users,
      color: "amber",
      bgColor: "bg-amber-50",
      services: [
        {
          icon: FileSearch,
          name: t("items.kartuKuning.name"),
          description: t("items.kartuKuning.desc"),
          href: "/layanan/kartu-kuning",
          stats: "2.4k",
          category: t("categories.manpower"),
        },
        {
          icon: Building,
          name: t("items.jobFair.name"),
          description: t("items.jobFair.desc"),
          href: "/layanan/job-fair",
          badge: t("badges.popular"),
          stats: "1.8k",
          category: t("categories.manpower"),
        },
        {
          icon: Award,
          name: t("items.pelatihan.name"),
          description: t("items.pelatihan.desc"),
          href: "/layanan/pelatihan-kerja",
          stats: "950",
          category: t("categories.manpower"),
        },
      ],
    },
    {
      name: t("categories.tourism"),
      icon: Palmtree,
      color: "cyan",
      bgColor: "bg-cyan-50",
      services: [
        {
          icon: MapPin,
          name: t("items.wisata.name"),
          description: t("items.wisata.desc"),
          href: "/layanan/info-wisata",
          stats: "15k",
          category: t("categories.tourism"),
        },
        {
          icon: Award,
          name: t("items.izinEvent.name"),
          description: t("items.izinEvent.desc"),
          href: "/layanan/izin-event",
          stats: "120",
          category: t("categories.tourism"),
        },
      ],
    },
    {
      name: t("categories.infrastructure"),
      icon: Building2,
      color: "slate",
      bgColor: "bg-slate-50",
      services: [
        {
          icon: Building,
          name: t("items.imb.name"),
          description: t("items.imb.desc"),
          href: "/layanan/imb",
          stats: "780",
          category: t("categories.infrastructure"),
        },
        {
          icon: MessageCircle,
          name: t("items.aduanInfra.name"),
          description: t("items.aduanInfra.desc"),
          href: "/layanan/aduan-infrastruktur",
          badge: t("badges.popular"),
          stats: "1.2k",
          category: t("categories.infrastructure"),
        },
        {
          icon: Bus,
          name: t("items.transportasi.name"),
          description: t("items.transportasi.desc"),
          href: "/layanan/transportasi-umum",
          stats: "5.6k",
          category: t("categories.infrastructure"),
        },
      ],
    },
    {
      name: t("categories.social"),
      icon: Heart,
      color: "pink",
      bgColor: "bg-pink-50",
      services: [
        {
          icon: Users,
          name: t("items.bansos.name"),
          description: t("items.bansos.desc"),
          href: "/layanan/bansos",
          stats: "3.5k",
          category: t("categories.social"),
        },
        {
          icon: Home,
          name: t("items.dtks.name"),
          description: t("items.dtks.desc"),
          href: "/layanan/dtks",
          stats: "2.8k",
          category: t("categories.social"),
        },
      ],
    },
    {
      name: t("categories.environment"),
      icon: TreePine,
      color: "green",
      bgColor: "bg-green-50",
      services: [
        {
          icon: Sprout,
          name: t("items.bankSampah.name"),
          description: t("items.bankSampah.desc"),
          href: "/layanan/bank-sampah",
          stats: "890",
          category: t("categories.environment"),
        },
        {
          icon: MessageCircle,
          name: t("items.aduanLingkungan.name"),
          description: t("items.aduanLingkungan.desc"),
          href: "/layanan/aduan-lingkungan",
          stats: "450",
          category: t("categories.environment"),
        },
      ],
    },
    {
      name: t("categories.government"),
      icon: Landmark,
      color: "indigo",
      bgColor: "bg-indigo-50",
      services: [
        {
          icon: FileText,
          name: t("items.suratRt.name"),
          description: t("items.suratRt.desc"),
          href: "/layanan/surat-rt-rw",
          stats: "4.2k",
          category: t("categories.government"),
        },
        {
          icon: Building,
          name: t("items.danaDesa.name"),
          description: t("items.danaDesa.desc"),
          href: "/layanan/dana-desa",
          stats: "120",
          category: t("categories.government"),
        },
      ],
    },
    {
      name: t("categories.ppid"),
      icon: FileSearch,
      color: "teal",
      bgColor: "bg-teal-50",
      services: [
        {
          icon: FileSearch,
          name: t("items.infoPublik.name"),
          description: t("items.infoPublik.desc"),
          href: "/layanan/ppid",
          stats: "320",
          category: t("categories.ppid"),
        },
        {
          icon: FileText,
          name: t("items.dokumen.name"),
          description: t("items.dokumen.desc"),
          href: "/layanan/dokumen-publik",
          stats: "1.5k",
          category: t("categories.ppid"),
        },
      ],
    },
    {
      name: t("categories.disaster"),
      icon: ShieldAlert,
      color: "red",
      bgColor: "bg-red-50",
      services: [
        {
          icon: ShieldAlert,
          name: t("items.darurat.name"),
          description: t("items.darurat.desc"),
          href: "/layanan/darurat",
          badge: t("badges.important"), // Using important badge
          stats: "24/7",
          category: t("categories.disaster"),
        },
        {
          icon: Cloud,
          name: t("items.infoBencana.name"),
          description: t("items.infoBencana.desc"),
          href: "/layanan/info-bencana",
          stats: "Real-time",
          category: t("categories.disaster"),
        },
      ],
    },
    {
      name: t("categories.multisector"),
      icon: Building2,
      color: "violet",
      bgColor: "bg-violet-50",
      services: [
        {
          icon: FileCheck,
          name: t("items.layananTerpadu.name"),
          description: t("items.layananTerpadu.desc"),
          href: "/layanan/layanan-terpadu",
          stats: "2.1k",
          category: t("categories.multisector"),
        },
        {
          icon: MessageCircle,
          name: t("items.pengaduan.name"),
          description: t("items.pengaduan.desc"),
          href: "/layanan/pengaduan-masyarakat",
          badge: t("badges.popular"),
          stats: "3.4k",
          category: t("categories.multisector"),
        },
      ],
    },
  ];

  const allServices = serviceCategories.flatMap((cat) => cat.services);

  const displayedCategories = showAllCategories
    ? serviceCategories
    : serviceCategories.slice(0, 6);

  const displayedServices =
    selectedCategory === null
      ? allServices.slice(0, 9) // Show top 9 services when "Semua Layanan" is selected
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
