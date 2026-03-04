import type { Metadata } from "next";
import { TopBar } from "@/components/landing/layout/top-bar";
import { Header } from "@/components/landing/layout/landing-header";
import { Footer } from "@/components/landing/layout/landing-footer";
import { AccessibilityWidget } from "@/components/shared/accessibility-widget";
import { getVisibleServicesGroupedByCategory } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Super App Naiera - Layanan Digital Kabupaten Naiera",
  description:
    "Akses ratusan layanan pemerintahan dengan mudah, cepat, dan aman dalam satu platform digital. Kabupaten Naiera menuju digitalisasi pelayanan publik.",
  keywords: [
    "super app",
    "naiera",
    "kabupaten naiera",
    "layanan digital",
    "pemerintahan",
    "e-government",
  ],
  openGraph: {
    title: "Super App Naiera - Layanan Digital Kabupaten Naiera",
    description:
      "Akses ratusan layanan pemerintahan dengan mudah, cepat, dan aman dalam satu platform digital.",
    type: "website",
  },
};

export default async function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch services data for this section
  const servicesByCategory = await getVisibleServicesGroupedByCategory();

  return (
    <div className="min-h-screen">
      <TopBar />
      <Header servicesByCategory={servicesByCategory} />
      {children}
      <Footer />
      <AccessibilityWidget />
    </div>
  );
}
