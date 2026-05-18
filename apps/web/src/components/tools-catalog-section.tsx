"use client"

import { ExternalLinkIcon } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { motion } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"
import { Panel } from "@/components/blueprint"

interface ToolDef {
  name: string
  descKey: string
  group: "platform" | "ecosystem" | "repo" | "developer" | "donation" | "event" | "sql"
}

const TOOLS: ToolDef[] = [
  // Platform
  { name: "getPlatformOverview", descKey: "tools.getPlatformOverview", group: "platform" },
  { name: "countEcosystems", descKey: "tools.countEcosystems", group: "platform" },

  // Ecosystem
  { name: "countRepositories", descKey: "tools.countRepositories", group: "ecosystem" },
  { name: "countContributors", descKey: "tools.countContributors", group: "ecosystem" },
  { name: "rankEcosystems", descKey: "tools.rankEcosystems", group: "ecosystem" },
  { name: "rankRepositories", descKey: "tools.rankRepositories", group: "ecosystem" },
  { name: "rankContributors", descKey: "tools.rankContributors", group: "ecosystem" },
  { name: "getRecentContributorTrends", descKey: "tools.getRecentContributorTrends", group: "ecosystem" },
  { name: "getContributorGrowth", descKey: "tools.getContributorGrowth", group: "ecosystem" },
  { name: "getCountryDistribution", descKey: "tools.getCountryDistribution", group: "ecosystem" },
  { name: "compareEcosystems", descKey: "tools.compareEcosystems", group: "ecosystem" },

  // Repo discovery
  { name: "getTrendingRepositories", descKey: "tools.getTrendingRepositories", group: "repo" },
  { name: "getHotRepositories", descKey: "tools.getHotRepositories", group: "repo" },
  { name: "getRepositoryActiveDevelopers", descKey: "tools.getRepositoryActiveDevelopers", group: "repo" },

  // Developer
  { name: "getDeveloperProfile", descKey: "tools.getDeveloperProfile", group: "developer" },
  { name: "getDeveloperTopRepositories", descKey: "tools.getDeveloperTopRepositories", group: "developer" },
  { name: "getDeveloperRecentActivity", descKey: "tools.getDeveloperRecentActivity", group: "developer" },
  { name: "getDeveloperEcosystems", descKey: "tools.getDeveloperEcosystems", group: "developer" },
  { name: "getEventDeveloperProfile", descKey: "tools.getEventDeveloperProfile", group: "developer" },

  // Donation
  { name: "getDonationRepositories", descKey: "tools.getDonationRepositories", group: "donation" },
  { name: "getDonationRepositoryByName", descKey: "tools.getDonationRepositoryByName", group: "donation" },

  // Event / reports
  { name: "getPublicEventInsights", descKey: "tools.getPublicEventInsights", group: "event" },
  { name: "getYearlyReport", descKey: "tools.getYearlyReport", group: "event" },

  // SQL escape hatch
  { name: "queryWeb3Data", descKey: "tools.queryWeb3Data", group: "sql" },
]

const GROUP_LABELS: Record<ToolDef["group"], string> = {
  platform: "platform",
  ecosystem: "ecosystem",
  repo: "repo · discovery",
  developer: "developer",
  donation: "donation · x402",
  event: "events · reports",
  sql: "sql · escape",
}

const GROUP_ORDER: ToolDef["group"][] = [
  "platform",
  "ecosystem",
  "repo",
  "developer",
  "donation",
  "event",
  "sql",
]

const SKILL_URL =
  "https://github.com/web3insight-ai/web3insight/blob/main/skills/web3insight/SKILL.md"

export function ToolsCatalogSection() {
  const { t } = useI18n()

  const groupedTools = GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    tools: TOOLS.filter((tool) => tool.group === group),
  }))

  return (
    <section
      id="tools"
      className="relative border-b border-border py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-12 flex items-end justify-between gap-6" margin="-15% 0px -10% 0px">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              05 · tools · catalog
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("tools.title")}
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-[1.65] text-muted-foreground">
              {t("tools.description")}
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline-block">
            n = {TOOLS.length}
          </span>
        </ScrollReveal>

        <motion.div
          className="space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px -5% 0px" }}
          variants={stagger(0.08)}
        >
          {groupedTools.map(({ group, label, tools }, groupIdx) => (
            <motion.div key={group} variants={fadeInUp(0.02 * groupIdx)}>
              <Panel
                label={{ text: label, position: "tl" }}
                code={`T${String(groupIdx + 1).padStart(2, "0")}`}
                ground={groupIdx % 2 === 1 ? "dotted" : "plain"}
                className="p-0"
              >
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool, idx) => {
                    const isLastCol = (idx + 1) % 3 === 0
                    const isLastColMd = (idx + 1) % 2 === 0
                    const total = tools.length
                    const isLastRowLg = idx >= total - (total % 3 === 0 ? 3 : total % 3)
                    return (
                      <div
                        key={tool.name}
                        className={[
                          "border-border-soft p-5",
                          "border-r border-b",
                          isLastColMd ? "md:border-r-0" : "md:border-r",
                          isLastCol ? "lg:border-r-0" : "lg:border-r",
                          isLastRowLg ? "lg:border-b-0" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[11px] text-teal-500">
                            ·
                          </span>
                          <code className="font-mono text-[13px] font-medium text-foreground">
                            {tool.name}
                          </code>
                        </div>
                        <p className="mt-2 text-[12.5px] leading-[1.55] text-muted-foreground">
                          {t(tool.descKey)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </motion.div>
          ))}
        </motion.div>

        <ScrollReveal className="mt-10 flex flex-wrap items-center gap-4" margin="-10% 0px">
          <a
            href={SKILL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
          >
            {t("tools.cta")}
            <ExternalLinkIcon className="size-3.5" />
          </a>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("tools.footnote")}
          </span>
        </ScrollReveal>
      </div>
    </section>
  )
}
