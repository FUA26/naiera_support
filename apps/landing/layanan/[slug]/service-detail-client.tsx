"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  CreditCard,
  Users,
  FileText,
  FileCheck,
  FileDown,
  ArrowRight,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  HelpCircle,
  IdCard,
  GraduationCap,
  HeartPulse,
  Bus,
  Home,
  TreePine,
  MapPin,
  ShieldAlert,
  Award,
  Factory,
  Heart,
  Sprout,
  FileSearch,
  Building,
  Cloud,
  MessageCircle,
  Link as LinkIcon,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

// Icon mapping - same as in services-data
const iconMap: Record<string, LucideIcon> = {
  Users,
  HeartPulse,
  GraduationCap,
  Palmtree: TreePine,
  Building2,
  Heart,
  TreePine,
  Landmark: Building,
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

interface DownloadForm {
  name: string;
  url: string;
}

interface ContactInfo {
  office: string;
  phone: string;
  email: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceDetailClientProps {
  service: {
    slug: string;
    iconName: string;
    name: string;
    description: string;
    detailedDescription: string;
    category: {
      name: string;
      slug: string;
    };
    badge?: string | null;
    stats?: string | null;
    isIntegrated?: boolean;
    requirements: string[];
    process: string[];
    duration: string;
    cost: string;
    contactInfo: ContactInfo;
    downloadForms: DownloadForm[];
    relatedServices: Array<{
      slug: string;
      iconName: string;
      name: string;
    }>;
    faqs: FAQ[];
  };
}

export function ServiceDetailClient({
  service,
}: ServiceDetailClientProps) {
  const ServiceIcon = iconMap[service.iconName] || FileText;
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  return (
    <main className="bg-muted">
      {/* Hero Section */}
      <section className="from-primary to-primary-hover bg-gradient-to-br py-16 text-white">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Breadcrumb */}
          <nav className="text-primary-light mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-white">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/layanan" className="hover:text-white">
              Layanan
            </Link>
            <span>/</span>
            <Link
              href={`/layanan?category=${service.category.slug}`}
              className="hover:text-white"
            >
              {service.category.name}
            </Link>
            <span>/</span>
            <span className="text-white">{service.name}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <ServiceIcon size={40} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold md:text-4xl">
                  {service.name}
                </h1>
                {service.badge && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      service.badge === "Baru"
                        ? "bg-amber-400 text-amber-900"
                        : service.badge === "Penting"
                          ? "bg-red-400 text-red-900"
                          : "bg-primary-light text-primary-dark"
                    }`}
                  >
                    {service.badge}
                  </span>
                )}
                {service.isIntegrated !== undefined && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 ${
                      service.isIntegrated
                        ? "bg-green-400 text-green-900"
                        : "bg-slate-400 text-slate-900"
                    }`}
                  >
                    {service.isIntegrated ? (
                      <>
                        <LinkIcon size={12} />
                        Layanan Terintegrasi SSO
                      </>
                    ) : (
                      <>
                        <ExternalLink size={12} />
                        Layanan Eksternal (Login Manual)
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-primary-lighter mb-4 text-lg">
                {service.description}
              </p>
              <p className="text-primary-lighter mb-6 text-base">
                {service.detailedDescription}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>{service.cost}</span>
                </div>
                {service.stats && (
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{service.stats} pengguna</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Info */}
            <div className="space-y-8 lg:col-span-2">
              {/* Requirements */}
              {service.requirements.length > 0 && (
                <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                  <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                    <FileText className="text-primary" size={24} />
                    Persyaratan Dokumen
                  </h2>
                  <ul className="space-y-3">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <ChevronRight
                          className="text-primary mt-0.5 shrink-0"
                          size={18}
                        />
                        <span className="text-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                  <FileCheck className="text-primary" size={24} />
                  Alur Proses
                </h2>
                <ol className="space-y-4">
                  {service.process.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="bg-primary-lighter text-primary-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Download Forms */}
              {service.downloadForms && service.downloadForms.length > 0 && (
                <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                  <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                    <FileDown className="text-primary" size={24} />
                    Unduh Formulir & Dokumen
                  </h2>
                  <div className="space-y-3">
                    {service.downloadForms.map((form, index) => (
                      <a
                        key={index}
                        href={form.url}
                        className="hover:border-primary-light hover:bg-primary-lighter border-border flex items-center justify-between rounded-lg border p-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileDown className="text-primary" size={20} />
                          <span className="text-foreground font-medium">
                            {form.name}
                          </span>
                        </div>
                        <ArrowRight className="text-muted-foreground" size={20} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                  <Building2 className="text-primary" size={24} />
                  Informasi Kontak
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="text-muted-foreground mt-0.5" size={20} />
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Kantor
                      </p>
                      <p className="text-foreground">{service.contactInfo.office}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-muted-foreground mt-0.5" size={20} />
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Telepon
                      </p>
                      <p className="text-foreground">{service.contactInfo.phone}</p>
                    </div>
                  </div>
                  {service.contactInfo.email && service.contactInfo.email !== "-" && (
                    <div className="flex items-start gap-3">
                      <Mail className="text-muted-foreground mt-0.5" size={20} />
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Email
                        </p>
                        <p className="text-foreground">{service.contactInfo.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FAQs */}
              {service.faqs && service.faqs.length > 0 && (
                <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                  <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                    <HelpCircle className="text-primary" size={24} />
                    Pertanyaan Umum (FAQ)
                  </h2>
                  <div className="space-y-3">
                    {service.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border-border rounded-lg border"
                      >
                        <button
                          onClick={() =>
                            setOpenFaqIndex(openFaqIndex === index ? null : index)
                          }
                          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                        >
                          <span className="text-foreground font-medium">
                            {faq.question}
                          </span>
                          <ChevronRight
                            className={`text-muted-foreground transition-transform ${
                              openFaqIndex === index ? "rotate-90" : ""
                            }`}
                            size={18}
                          />
                        </button>
                        {openFaqIndex === index && (
                          <div className="border-border border-t px-4 pb-4 pt-4">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 font-bold">
                  Informasi Cepat
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm font-medium">
                      <Clock size={16} />
                      Waktu Proses
                    </div>
                    <p className="text-foreground">{service.duration}</p>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm font-medium">
                      <CreditCard size={16} />
                      Biaya
                    </div>
                    <p className="text-foreground">{service.cost}</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/login"
                className="bg-primary shadow-primary/30 hover:bg-primary-hover block w-full rounded-xl px-6 py-4 text-center font-semibold text-white shadow-lg transition-all"
              >
                Ajukan Layanan Sekarang
              </Link>

              {/* Alert */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
                <div className="mb-2 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400">
                  <AlertCircle size={20} />
                  Perhatian
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Pastikan semua persyaratan sudah lengkap sebelum mengajukan
                  layanan untuk mempercepat proses.
                </p>
              </div>

              {/* Related Services */}
              {service.relatedServices && service.relatedServices.length > 0 && (
                <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                  <h3 className="text-foreground mb-4 font-bold">
                    Layanan Terkait
                  </h3>
                  <div className="space-y-2">
                    {service.relatedServices.map((relatedService) => {
                      const RelatedIcon = iconMap[relatedService.iconName] || FileText;
                      return (
                        <Link
                          key={relatedService.slug}
                          href={`/layanan/${relatedService.slug}`}
                          className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                        >
                          <div className="bg-primary-lighter text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                            <RelatedIcon size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground text-sm font-medium">
                              {relatedService.name}
                            </p>
                          </div>
                          <ArrowRight className="text-muted-foreground" size={16} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
