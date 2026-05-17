"use client"

import { useRef } from "react"
import { Search, LineChart, Users, Database, TrendingUp, Award } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { motion, useInView } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"
import { Panel, OutlinedDisplay } from "@/components/blueprint"

type VisualType = "search" | "chart" | "metrics" | "integration" | "research" | "growth"

function FeatureVisual({ type }: { type: VisualType }) {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useInView(ref, { once: true, margin: "-10% 0px -5% 0px" })

  return (
    <div
      ref={ref}
      className="relative h-28 w-full overflow-hidden border border-border-soft bg-background"
    >
      {type === "search" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 border border-foreground bg-card px-3 py-1.5 font-mono text-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">ethereum devs</span>
            <span
              aria-hidden
              className="animate-cursor ml-0.5 inline-block h-[0.9em] w-[0.5ch] translate-y-[1px] bg-teal-500 align-middle"
            />
          </div>
        </div>
      )}

      {type === "chart" && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 60" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="120" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-border-soft" />
          <line x1="0" y1="35" x2="120" y2="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-border-soft" />
          <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-border-soft" />
          <path
            d="M 4 48 Q 25 40 48 30 T 96 16 T 116 8"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            className="text-teal-500 animate-draw"
            style={
              {
                "--draw-length": 220,
                "--draw-duration": "1.4s",
                animationPlayState: isVisible ? "running" : "paused",
              } as React.CSSProperties
            }
          />
          <circle cx="48" cy="30" r="1.5" className="fill-teal-500" />
          <circle cx="96" cy="16" r="1.5" className="fill-teal-500" />
        </svg>
      )}

      {type === "metrics" && (
        <div className="absolute inset-0 flex items-end gap-2 p-3">
          {[60, 80, 45, 90, 70, 55].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-foreground transition-[height] duration-700"
              style={{
                height: isVisible ? `${h}%` : "0%",
                transitionDelay: `${i * 80}ms`,
                backgroundColor: i === 3 ? "var(--teal-500)" : undefined,
              }}
            />
          ))}
        </div>
      )}

      {type === "integration" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 border border-foreground" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="h-4 w-4 text-teal-500" />
            </div>
            {[0, 90, 180, 270].map((rot, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background transition-opacity"
                style={{
                  transform: `translate(-50%, -50%) rotate(${rot}deg) translateX(28px)`,
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {type === "research" && (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4">
          {[85, 92, 78].map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 font-mono text-[10px] text-muted-foreground">{["L1", "L2", "L3"][i]}</span>
              <div className="h-2 flex-1 border border-border-soft">
                <div
                  className="h-full bg-foreground transition-[width] duration-700"
                  style={{
                    width: isVisible ? `${v}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                    backgroundColor: i === 1 ? "var(--teal-500)" : undefined,
                  }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[10px] tabular-nums text-muted-foreground">{v}%</span>
            </div>
          ))}
        </div>
      )}

      {type === "growth" && (
        <div className="absolute inset-0 flex flex-col">
          <svg className="w-full flex-1" viewBox="0 0 120 48" preserveAspectRatio="none">
            <line x1="10" y1="40" x2="110" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-border-soft" />
            <line x1="10" y1="26" x2="110" y2="26" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-border-soft" />
            <line x1="10" y1="12" x2="110" y2="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-border-soft" />
            <path
              d="M 12 38 L 32 33 L 52 25 L 72 17 L 92 10 L 108 6"
              stroke="currentColor"
              strokeWidth="1.25"
              fill="none"
              className="text-teal-500 animate-draw"
              style={
                {
                  "--draw-length": 180,
                  "--draw-duration": "1.4s",
                  animationPlayState: isVisible ? "running" : "paused",
                } as React.CSSProperties
              }
            />
            {[
              { x: 12, y: 38 },
              { x: 52, y: 25 },
              { x: 92, y: 10 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="1.5" className="fill-teal-500" />
            ))}
          </svg>
          <div className="flex justify-between px-3 pb-2 font-mono text-[10px] text-muted-foreground">
            <span>hack</span>
            <span>contrib</span>
            <span>core</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function FeaturesSection() {
  const { t } = useI18n()

  const features: Array<{
    icon: React.ComponentType<{ className?: string }>
    titleKey: string
    descriptionKey: string
    visual: VisualType
    code: string
    ground: "plain" | "dotted" | "hatched"
    source: string
  }> = [
    { icon: Search, titleKey: "features.devId.title", descriptionKey: "features.devId.description", visual: "search", code: "F01", ground: "dotted", source: "src: github · rss3" },
    { icon: LineChart, titleKey: "features.ecosystem.title", descriptionKey: "features.ecosystem.description", visual: "chart", code: "F02", ground: "plain", source: "src: opendigger · 30d" },
    { icon: Award, titleKey: "features.events.title", descriptionKey: "features.events.description", visual: "metrics", code: "F03", ground: "hatched", source: "src: hackathon logs" },
    { icon: Database, titleKey: "features.integration.title", descriptionKey: "features.integration.description", visual: "integration", code: "F04", ground: "plain", source: "src: public api" },
    { icon: TrendingUp, titleKey: "features.research.title", descriptionKey: "features.research.description", visual: "research", code: "F05", ground: "dotted", source: "src: oss-insight" },
    { icon: Users, titleKey: "features.growth.title", descriptionKey: "features.growth.description", visual: "growth", code: "F06", ground: "plain", source: "src: indexed · live" },
  ]

  return (
    <section id="features" className="relative overflow-hidden border-b border-border py-28">
      {/* Watermark — outlined display, not a gradient fill */}
      <div className="pointer-events-none absolute left-0 right-0 top-8 flex justify-center overflow-hidden">
        <div className="select-none text-[110px] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[160px] lg:text-[220px]">
          <OutlinedDisplay stack={1} offset={0} solidFront={false} as="span">
            Features
          </OutlinedDisplay>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 lg:px-8">
        <ScrollReveal className="mb-16 max-w-3xl" margin="-15% 0px -15% 0px">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            capability · matrix
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
            {t("features.description")}
          </p>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          variants={stagger(0.1)}
        >
          {features.map((feature, idx) => (
            <motion.div key={feature.titleKey} variants={fadeInUp()} className="relative">
              <Panel
                ground={feature.ground}
                label={{ text: feature.code, position: "tl" }}
                className={[
                  "h-full p-7",
                  // Merge adjacent panel borders into a single hairline grid
                  "border-r-0 border-b-0",
                  idx % 3 === 2 ? "md:border-r" : "",
                  idx >= features.length - 3 ? "lg:border-b" : "",
                  idx % 2 === 1 ? "md:border-r" : "",
                  idx >= features.length - 2 ? "md:border-b" : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-foreground">
                    <feature.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-foreground">
                    {t(feature.titleKey)}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-[1.6] text-muted-foreground">
                  {t(feature.descriptionKey)}
                </p>
                <div className="mt-5">
                  <FeatureVisual type={feature.visual} />
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  {feature.source}
                </p>
              </Panel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
