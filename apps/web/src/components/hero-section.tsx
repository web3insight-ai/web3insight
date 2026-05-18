"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { motion } from "framer-motion"
import { fadeInUp, stagger } from "@/components/ui/motion"
import { orpc } from "@/lib/query/utils"
import { useAnimatedNumber, formatNumber } from "@/lib/hooks/useAnimatedNumber"
import {
  Panel,
  Trace,
  OutlinedDisplay,
  HandLabel,
  TerminalPanel,
  type Line,
} from "@/components/blueprint"

function MonoCursor() {
  return (
    <span
      aria-hidden
      className="animate-cursor ml-0.5 inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-teal-500 align-middle"
    />
  )
}

function HeroNumber({
  value,
  isLoading,
  format,
}: {
  value: number
  isLoading?: boolean
  format?: "raw" | "M+"
}) {
  const { displayValue } = useAnimatedNumber(value, isLoading, { duration: 1200 })
  const formatter = format === "M+"
    ? (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M+` : formatNumber(n))
    : formatNumber

  if (isLoading || (displayValue === 0 && value > 0)) {
    return (
      <span className="font-mono text-2xl text-muted-foreground">
        —<MonoCursor />
      </span>
    )
  }
  return (
    <span className="font-mono text-2xl font-medium text-foreground tabular-nums">
      {formatter(displayValue)}
    </span>
  )
}

export function HeroSection() {
  const { t } = useI18n()
  const { data: statsData, isLoading } = useQuery(orpc.statistics.get.queryOptions())

  const terminalLines: Line[] = [
    [{ type: "comment", text: "// from claude code, cursor, or any mcp client" }],
    [
      { type: "prompt", text: "> " },
      { type: "plain", text: "top contributors to ethereum?" },
    ],
    [{ type: "comment", text: "// tool call dispatched via mcp" }],
    [
      { type: "ident", text: "web3insight" },
      { type: "punct", text: "." },
      { type: "keyword", text: "rankContributors" },
      { type: "punct", text: "({ " },
      { type: "ident", text: "eco_name" },
      { type: "punct", text: ": " },
      { type: "string", text: "\"ethereum\"" },
      { type: "punct", text: ", " },
      { type: "ident", text: "limit" },
      { type: "punct", text: ": " },
      { type: "plain", text: "3" },
      { type: "punct", text: " })" },
    ],
    [{ type: "comment", text: "// streaming · 3 of 24 tools" }],
    [
      { type: "plain", text: "✓ vbuterin       " },
      { type: "string", text: "1,238" },
      { type: "punct", text: " " },
      { type: "comment", text: "commits" },
    ],
    [
      { type: "plain", text: "✓ pipermerriam   " },
      { type: "string", text: "  894" },
      { type: "punct", text: " " },
      { type: "comment", text: "commits" },
    ],
  ]

  return (
    <motion.section
      className="relative w-full overflow-hidden border-b border-border pt-16 pb-24 lg:pb-32"
      initial="hidden"
      animate="visible"
      variants={stagger(0.16, 0.1)}
    >
      {/* Blueprint grid background */}
      <div aria-hidden className="absolute inset-0 opacity-[0.04]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bp-grid" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M 72 0 L 0 0 0 72" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bp-grid)" className="text-foreground" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pt-14 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-20">
        {/* Left column — editorial hero */}
        <motion.div className="lg:col-span-7" variants={fadeInUp()}>
          <div className="mb-6 inline-flex items-center gap-2 border border-border-soft px-2 py-1">
            <span className="h-1.5 w-1.5 bg-teal-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("hero.badge")}
            </span>
          </div>

          <h1
            className={[
              "font-[family-name:var(--font-display)] font-extrabold leading-[0.92]",
              "text-[44px] sm:text-[64px] lg:text-[88px]",
              "text-foreground",
            ].join(" ")}
          >
            <span className="block">{t("hero.title1")}</span>
            <span className="mt-1 block">
              <OutlinedDisplay stack={4} offset={4} solidFront>
                {t("hero.title2")}
              </OutlinedDisplay>
            </span>
          </h1>

          <p className="mt-8 max-w-[58ch] text-base leading-[1.65] text-muted-foreground sm:text-lg">
            {t("hero.description")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild className="group">
              <Link href="https://dash.web3insight.ai">
                <span>{t("hero.exploreDashboard")}</span>
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/web3insight-ai/web3insight" target="_blank">
                {t("hero.viewGithub")}
              </Link>
            </Button>
            <div className="ml-1 hidden sm:inline-flex">
              <HandLabel>start</HandLabel>
            </div>
          </div>

          {/* schematic ruler */}
          <div className="relative mt-14 flex items-center gap-3 pl-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              rev · 0001
            </span>
            <div className="h-px flex-1 bg-border-soft" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              sheet 01/04
            </span>
          </div>
        </motion.div>

        {/* Right column — schematic panel grid */}
        <motion.div
          className="relative lg:col-span-5 lg:pt-4"
          variants={fadeInUp(0.18)}
        >
          {/* Trace connecting terminal → stats */}
          <Trace
            className="inset-0 z-0 h-full w-full"
            viewBox="0 0 100 100"
            d="M 50 48 L 50 62 L 22 62 L 22 72 M 50 62 L 78 62 L 78 72"
            length={280}
            delay={0.8}
            duration={1.6}
            nodes={[
              { x: 50, y: 48 },
              { x: 22, y: 72 },
              { x: 78, y: 72 },
            ]}
            color="teal"
          />

          <div className="relative z-10 flex flex-col gap-4">
            <Panel
              label={{ text: "mcp · tool-call", position: "tl" }}
              code="01"
              className="p-0"
            >
              <TerminalPanel
                title="claude > web3insight"
                lines={terminalLines}
                className="border-0"
              />
            </Panel>

            <div className="grid grid-cols-2 gap-4">
              <Panel
                ground="dotted"
                label={{ text: "core · devs", position: "tl" }}
                code="02"
                className="p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("hero.developers")}
                </p>
                <div className="mt-2 flex min-h-[36px] items-center">
                  <HeroNumber value={statsData?.coreDeveloper ?? 0} isLoading={isLoading} />
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground/80">
                  src: opendigger · 30d
                </p>
              </Panel>

              <Panel
                ground="hatched"
                label={{ text: "ecosystems", position: "tl" }}
                code="03"
                className="p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("hero.ecosystems")}
                </p>
                <div className="mt-2 flex min-h-[36px] items-center">
                  <HeroNumber value={statsData?.ecosystem ?? 0} isLoading={isLoading} />
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground/80">
                  live · indexed
                </p>
              </Panel>
            </div>

            <Panel
              label={{ text: "contributors · global", position: "tl" }}
              code="04"
              className="p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("hero.contributors")}
                  </p>
                  <div className="mt-2 flex min-h-[32px] items-center">
                    <HeroNumber
                      value={statsData?.developer ?? 0}
                      isLoading={isLoading}
                      format="M+"
                    />
                  </div>
                </div>
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 64 64" className="h-full w-full text-foreground">
                    <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1" fill="none" />
                    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                    <circle cx="32" cy="32" r="2" className="fill-teal-500" />
                    <line x1="32" y1="6" x2="32" y2="12" stroke="currentColor" strokeWidth="1" />
                    <line x1="32" y1="52" x2="32" y2="58" stroke="currentColor" strokeWidth="1" />
                    <line x1="6" y1="32" x2="12" y2="32" stroke="currentColor" strokeWidth="1" />
                    <line x1="52" y1="32" x2="58" y2="32" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </Panel>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
