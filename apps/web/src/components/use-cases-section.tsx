"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const useCases = [
  {
    id: "dev-outreach",
    titleKey: "useCases.devOutreach.title",
    descriptionKey: "useCases.devOutreach.description",
    partners: ["CAMP Network Dev Card", "Monad Mainnet Launch", "KiteAI Devs Airdrop"],
  },
  {
    id: "ecosystem",
    titleKey: "useCases.ecosystem.title",
    descriptionKey: "useCases.ecosystem.description",
    partners: ["Gmonadcc Community"],
  },
  {
    id: "events",
    titleKey: "useCases.events.title",
    descriptionKey: "useCases.events.description",
    partners: ["ETH Shenzhen Hackathon", "Monad Blitz IRL", "Mantle Global Hackathon"],
  },
  {
    id: "integration",
    titleKey: "useCases.integration.title",
    descriptionKey: "useCases.integration.description",
    partners: ["OpenBuild Dev Profile", "Monad Mojo Platform"],
  },
  {
    id: "research",
    titleKey: "useCases.research.title",
    descriptionKey: "useCases.research.description",
    partners: [],
  },
  {
    id: "growth",
    titleKey: "useCases.growth.title",
    descriptionKey: "useCases.growth.description",
    partners: ["Chinese Web3 Developer Report"],
  },
]

export function UseCasesSection() {
  const [activeCase, setActiveCase] = useState(useCases[0].id)
  const activeData = useCases.find((c) => c.id === activeCase)
  const { t } = useI18n()

  return (
    <section id="use-cases" className="relative py-24 border-b border-border">
      {/* Background text */}
      <div className="absolute top-8 left-0 w-full flex items-center justify-center pointer-events-none">
        <div className="text-[120px] sm:text-[180px] font-bold text-foreground/[0.05] leading-none select-none whitespace-nowrap">
          Use Cases
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.description")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Navigation */}
          <div className="space-y-2">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setActiveCase(useCase.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 group ${
                  activeCase === useCase.id
                    ? "bg-card border-accent/50"
                    : "bg-transparent border-border hover:border-accent/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3
                      className={`font-medium transition-colors ${
                        activeCase === useCase.id
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {t(useCase.titleKey)}
                    </h3>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all ${
                      activeCase === useCase.id
                        ? "text-accent rotate-90"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Right - Content */}
          <div className="relative">
            <div className="sticky top-24 p-8 bg-card border border-border rounded-lg">
              {/* Decorative corner */}
              <div className="absolute -top-px -right-px w-16 h-16 overflow-hidden rounded-tr-lg">
                <div className="absolute top-0 right-0 w-full h-px bg-accent" />
                <div className="absolute top-0 right-0 h-full w-px bg-accent" />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-4">{activeData && t(activeData.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{activeData && t(activeData.descriptionKey)}</p>
              </div>

              {activeData?.partners && activeData.partners.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    {t("useCases.partnersLabel")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeData.partners.map((partner) => (
                      <span
                        key={partner}
                        className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dotted pattern */}
              <div className="absolute bottom-0 left-0 w-24 h-24 dotted-pattern text-border opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
