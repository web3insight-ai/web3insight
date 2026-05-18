import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"

// Dynamic imports for below-the-fold components to reduce initial bundle size
const FeaturesSection = dynamic(
  () => import("@/components/features-section").then((mod) => mod.FeaturesSection),
  { ssr: true }
)
const UseCasesSection = dynamic(
  () => import("@/components/use-cases-section").then((mod) => mod.UseCasesSection),
  { ssr: true }
)
const McpSection = dynamic(
  () => import("@/components/mcp-section").then((mod) => mod.McpSection),
  { ssr: true }
)
const ToolsCatalogSection = dynamic(
  () => import("@/components/tools-catalog-section").then((mod) => mod.ToolsCatalogSection),
  { ssr: true }
)
const PartnersSection = dynamic(
  () => import("@/components/partners-section").then((mod) => mod.PartnersSection),
  { ssr: true }
)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div className="pt-[72px]">
        <Suspense fallback={<div className="h-96" />}>
          <HeroSection />
        </Suspense>
      </div>
      <Suspense fallback={<div className="h-48" />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={null}>
        <McpSection />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={null}>
        <UseCasesSection />
      </Suspense>
      <Suspense fallback={null}>
        <ToolsCatalogSection />
      </Suspense>
      <Suspense fallback={null}>
        <PartnersSection />
      </Suspense>
      <Footer />
    </main>
  )
}
