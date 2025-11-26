"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { AnimatePresence, motion } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"

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
    <section id="use-cases" className="relative py-24 border-b border-border overflow-hidden">
      {/* Background text */}
      <div className="absolute top-8 left-0 w-full flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[80px] sm:text-[120px] lg:text-[180px] font-bold text-foreground/[0.05] leading-none select-none whitespace-nowrap">
          Use Cases
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 pt-16">
        <ScrollReveal className="text-center mb-16" margin="-15% 0px -10% 0px">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">{t("useCases.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("useCases.description")}</p>
        </ScrollReveal>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          variants={stagger(0.16)}
        >
          {/* Left - Navigation */}
          <motion.div className="space-y-2" variants={stagger(0.08)}>
            {useCases.map((useCase) => (
              <motion.button
                key={useCase.id}
                onClick={() => setActiveCase(useCase.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 group ${
                  activeCase === useCase.id
                    ? "bg-card border-accent/50"
                    : "bg-transparent border-border hover:border-accent/30"
                }`}
                variants={fadeInUp()}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                layout
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
              </motion.button>
            ))}
          </motion.div>

          {/* Right - Content */}
          <motion.div className="relative" variants={fadeInUp(0.1)} layout>
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                {activeData && (
                  <motion.div
                    key={activeData.id}
                    className="p-8 bg-card border border-border rounded-lg"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    layout
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-foreground mb-4">{t(activeData.titleKey)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(activeData.descriptionKey)}</p>
                    </div>

                    {activeData.partners && activeData.partners.length > 0 && (
                      <div className="pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                          {t("useCases.partnersLabel")}
                        </p>
                        <motion.div
                          className="flex flex-wrap gap-2"
                          variants={stagger(0.06)}
                          initial="hidden"
                          animate="visible"
                        >
                          {activeData.partners.map((partner, idx) => (
                            <motion.span
                              key={partner}
                              className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                              variants={fadeInUp(0.03 * idx, 8)}
                              layout
                            >
                              {partner}
                            </motion.span>
                          ))}
                        </motion.div>
                      </div>
                    )}

                    {/* Dotted pattern */}
                    <div className="absolute bottom-0 left-0 w-24 h-24 dotted-pattern text-border opacity-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
