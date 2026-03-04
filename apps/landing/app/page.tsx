import { TopBar } from "@/components/landing/layout/top-bar";
import { Header } from "@/components/landing/layout/landing-header";
import { Footer } from "@/components/landing/layout/landing-footer";
import { HeroSection } from "@/components/landing/boilerplate/hero-section";
import { FeaturesSection } from "@/components/landing/boilerplate/features-section";
import { QuickstartSection } from "@/components/landing/boilerplate/quickstart-section";
import { ArchitectureSection } from "@/components/landing/boilerplate/architecture-section";
import { CtaSection } from "@/components/landing/boilerplate/cta-section";

export default async function Page() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <QuickstartSection />
        <ArchitectureSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
