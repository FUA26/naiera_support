import type { Metadata } from "next";
import { TopBar } from "@/components/landing/layout/top-bar";
import { Header } from "@/components/landing/layout/landing-header";
import { Footer } from "@/components/landing/layout/landing-footer";
import { AccessibilityWidget } from "@/components/shared/accessibility-widget";
import { getVisibleServicesGroupedByCategory } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Informasi Publik - Super App Naiera",
  description: "Akses informasi publik Kabupaten Naiera secara transparan dan akuntabel",
};

export default async function InformasiPublikLayout({
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
