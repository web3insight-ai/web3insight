"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { AnimatePresence, motion } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"
import { Panel, OutlinedDisplay } from "@/components/blueprint"

const useCases = [
  { id: "dev-outreach", code: "U01", titleKey: "useCases.devOutreach.title", descriptionKey: "useCases.devOutreach.description", partners: ["CAMP Network Dev Card", "Monad Mainnet Launch", "KiteAI Devs Airdrop"] },
  { id: "ecosystem", code: "U02", titleKey: "useCases.ecosystem.title", descriptionKey: "useCases.ecosystem.description", partners: ["Gmonadcc Community"] },
  { id: "events", code: "U03", titleKey: "useCases.events.title", descriptionKey: "useCases.events.description", partners: ["ETH Shenzhen Hackathon", "Monad Blitz IRL", "Mantle Global Hackathon"] },
  { id: "integration", code: "U04", titleKey: "useCases.integration.title", descriptionKey: "useCases.integration.description", partners: ["OpenBuild Dev Profile", "Monad Mojo Platform"] },
  { id: "research", code: "U05", titleKey: "useCases.research.title", descriptionKey: "useCases.research.description", partners: [] },
  { id: "growth", code: "U06", titleKey: "useCases.growth.title", descriptionKey: "useCases.growth.description", partners: ["Chinese Web3 Developer Report"] },
]

export function UseCasesSection() {
  const [activeCase, setActiveCase] = useState(useCases[0].id)
  const activeData = useCases.find((c) => c.id === activeCase)
  const { t } = useI18n()

  return (
    <section id="use-cases" className="relative overflow-hidden border-b border-border py-28">
      <div className="pointer-events-none absolute left-0 right-0 top-8 flex justify-center overflow-hidden">
        <div className="select-none text-[110px] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[160px] lg:text-[220px]">
          <OutlinedDisplay stack={1} offset={0} solidFront={false} as="span">
            Use Cases
          </OutlinedDisplay>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 lg:px-8">
        <ScrollReveal className="mb-14 max-w-3xl" margin="-15% 0px -10% 0px">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            04 · deployments · live
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("useCases.title")}
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
            {t("useCases.description")}
          </p>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 gap-0 lg:grid-cols-[340px_1fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          variants={stagger(0.14)}
        >
          {/* Index column */}
          <motion.ul variants={stagger(0.06)} className="border border-border lg:border-r-0">
            {useCases.map((useCase) => {
              const active = activeCase === useCase.id
              return (
                <motion.li
                  key={useCase.id}
                  variants={fadeInUp(0, 8)}
                  className="border-b border-border-soft last:border-b-0"
                >
                  <button
                    onClick={() => setActiveCase(useCase.id)}
                    className={[
                      "group relative flex w-full items-center gap-3 px-5 py-4 text-left transition-colors",
                      active
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {active && (
                      <motion.span
                        layoutId="usecase-tick"
                        className="absolute left-0 top-0 h-full w-[3px] bg-teal-500"
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <span className="w-10 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {useCase.code}
                    </span>
                    <span className="flex-1 font-[family-name:var(--font-display)] text-sm font-medium">
                      {t(useCase.titleKey)}
                    </span>
                    <span
                      aria-hidden
                      className={[
                        "font-mono text-sm transition-colors",
                        active ? "text-teal-500" : "text-muted-foreground/50 group-hover:text-foreground",
                      ].join(" ")}
                    >
                      →
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* Content panel */}
          <motion.div variants={fadeInUp(0.1)}>
            <Panel
              ground="dotted"
              label={{ text: activeData?.code ?? "", position: "tl" }}
              className="h-full p-8 lg:p-10"
            >
              <AnimatePresence mode="wait">
                {activeData && (
                  <motion.div
                    key={activeData.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      case · {activeData.code.toLowerCase()}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl">
                      {t(activeData.titleKey)}
                    </h3>
                    <p className="mt-4 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
                      {t(activeData.descriptionKey)}
                    </p>

                    {activeData.partners.length > 0 && (
                      <div className="mt-8 border-t border-border-soft pt-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {t("useCases.partnersLabel")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeData.partners.map((partner) => (
                            <span
                              key={partner}
                              className="border border-foreground px-3 py-1 font-mono text-[11px] text-foreground"
                            >
                              {partner}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
