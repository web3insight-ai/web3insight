import { Header } from "@/components/header"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <AnnouncementBanner />
      <div className="pt-10">
        <HeroSection />
      </div>
      <StatsSection />
      <FeaturesSection />
      <UseCasesSection />
      <PartnersSection />
      <Footer />
    </main>
  )
}
