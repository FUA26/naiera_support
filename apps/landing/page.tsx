import { TopBar } from "@/components/landing/layout/top-bar";
import { Header } from "@/components/landing/layout/landing-header";
import { Footer } from "@/components/landing/layout/landing-footer";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { ServicesSection } from "@/components/landing/sections/services-section-server";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { NewsSection } from "@/components/landing/sections/news-section-server";
import { EventsSection } from "@/components/landing/sections/events-section-server";
import { AppDownloadSection } from "@/components/landing/sections/app-download-section";
import { getVisibleServicesGroupedByCategory } from "@/lib/services-data";

export default async function Page() {
  // Fetch services data for the header menu
  const servicesByCategory = await getVisibleServicesGroupedByCategory();

  return (
    <div className="min-h-screen">
      <TopBar />
      <Header servicesByCategory={servicesByCategory} />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <NewsSection />
        <EventsSection />
        <AppDownloadSection />
      </main>
      <Footer />
    </div>
  );
}
