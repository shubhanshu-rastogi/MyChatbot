import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CareerHighlightsSection } from "@/components/sections/CareerHighlightsSection";
import { ChatbotSection } from "@/components/sections/ChatbotSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProfessionalSummarySection } from "@/components/sections/ProfessionalSummarySection";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-spotlight opacity-80" />
      <div className="pointer-events-none fixed inset-0 bg-grain [background-size:16px_16px] opacity-20" />

      <SiteHeader />

      <main className="relative z-10">
        <HeroSection />
        <ChatbotSection />
        <ProfessionalSummarySection />
        <FeaturedProjectsSection />
        <CareerHighlightsSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
