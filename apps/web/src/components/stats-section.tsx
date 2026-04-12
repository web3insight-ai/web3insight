"use client"

import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n-context"
import { motion } from "framer-motion"
import { fadeInUp, stagger } from "@/components/ui/motion"
import { orpc } from "@/lib/query/utils"
import { useAnimatedNumber, formatNumber } from "@/lib/hooks/useAnimatedNumber"
import { Panel, Trace } from "@/components/blueprint"

function StatNumber({
  value,
  highlighted,
  isLoading,
}: {
  value: number
  highlighted?: boolean
  isLoading?: boolean
}) {
  const { displayValue, ref, isInView } = useAnimatedNumber(value, isLoading, {
    waitForInView: true,
    duration: 2000,
  })
  const pending = isLoading || !isInView || value <= 0 || (displayValue === 0 && value > 0)
  return (
    <div
      ref={ref}
      className={[
        "font-mono text-4xl sm:text-5xl font-medium tabular-nums leading-none",
        highlighted ? "text-teal-500" : "text-foreground",
      ].join(" ")}
    >
      {pending ? (
        <span className="text-muted-foreground">——</span>
      ) : (
        formatNumber(displayValue)
      )}
    </div>
  )
}

export function StatsSection() {
  const { t } = useI18n()
  const { data: statsData, isLoading } = useQuery(orpc.statistics.get.queryOptions())

  // One of four panels is teal-highlighted — "the one the eye should follow."
  const stats = [
    { labelKey: "stats.contributors", code: "01", value: statsData?.developer ?? 0 },
    { labelKey: "stats.developers", code: "02", value: statsData?.coreDeveloper ?? 0, highlighted: true },
    { labelKey: "stats.ecosystems", code: "03", value: statsData?.ecosystem ?? 0 },
    { labelKey: "stats.repositories", code: "04", value: statsData?.repository ?? 0 },
  ]

  return (
    <section className="relative border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              signal · density
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              At a glance
            </h2>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline-block">
            sheet 02/04
          </span>
        </div>

        <motion.div
          className="relative grid grid-cols-2 gap-0 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          variants={stagger(0.12)}
        >
          {/* Horizontal traces connecting the four panels.
              Desktop only — renders above borders, drawn on mount. */}
          <Trace
            className="inset-x-0 top-1/2 z-0 hidden h-[2px] w-full -translate-y-1/2 lg:block"
            viewBox="0 0 1000 2"
            preserveAspectRatio="none"
            d="M 0 1 L 1000 1"
            length={1000}
            delay={0.5}
            duration={1.4}
            strokeWidth={0.5}
            color="soft"
          />

          {stats.map((stat, idx) => (
            <motion.div key={stat.labelKey} variants={fadeInUp(0.05 * idx)} className="relative">
              <Panel
                label={{ text: t(stat.labelKey), position: "tl" }}
                code={stat.code}
                ground={idx === 1 ? "dotted" : "plain"}
                className="min-h-[180px] border-r-0 p-6 last:border-r lg:[&:nth-child(4)]:border-r"
                hairline="solid"
              >
                <div className="mt-5 flex h-full items-end">
                  <StatNumber
                    value={stat.value}
                    highlighted={stat.highlighted}
                    isLoading={isLoading}
                  />
                </div>
                {stat.highlighted && (
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 bg-teal-500" aria-hidden />
                )}
              </Panel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
