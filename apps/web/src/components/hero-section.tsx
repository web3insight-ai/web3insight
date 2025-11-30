"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { motion } from "framer-motion"
import { fadeInUp, stagger } from "@/components/ui/motion"
import type { StatisticsData } from "@/services/api/typing"

// Utility function to format numbers with comma separators
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
}

// Loading animation component
function LoadingNumber() {
  return (
    <div className="flex items-center">
      <div className="flex space-x-1.5">
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Animated number component for hero stats
function AnimatedHeroNumber({ value, suffix = "", isLoading }: { value: number; suffix?: string; isLoading?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Reset animation when loading or value changes
    if (isLoading) {
      setDisplayValue(0)
      hasAnimated.current = false
      return
    }

    if (value === 0) {
      setDisplayValue(0)
      hasAnimated.current = false
      return
    }

    if (hasAnimated.current) return
    hasAnimated.current = true

    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, isLoading])

  // Show loading dots when loading or waiting for data
  if (isLoading || (displayValue === 0 && value > 0)) {
    return <LoadingNumber />
  }

  return (
    <span className="text-2xl font-bold text-foreground tabular-nums">
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}

// Animated contributors with M+ format
function AnimatedContributors({ value, isLoading }: { value: number; isLoading?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Reset animation when loading or value changes
    if (isLoading) {
      setDisplayValue(0)
      hasAnimated.current = false
      return
    }

    if (value === 0) {
      setDisplayValue(0)
      hasAnimated.current = false
      return
    }

    if (hasAnimated.current) return
    hasAnimated.current = true

    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, isLoading])

  // Show loading dots when loading or waiting for data
  if (isLoading || (displayValue === 0 && value > 0)) {
    return <LoadingNumber />
  }

  const formattedValue = displayValue >= 1000000
    ? `${(displayValue / 1000000).toFixed(1)}M+`
    : formatNumber(displayValue)

  return (
    <span className="text-xl font-bold text-foreground tabular-nums">
      {formattedValue}
    </span>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const [statsData, setStatsData] = useState<StatisticsData>({
    ecosystem: 0,
    repository: 0,
    developer: 0,
    coreDeveloper: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch statistics data on component mount
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/statistics')
        const result = await response.json()

        if (result.success && result.data) {
          setStatsData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
        // Keep default values if API fails
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      container.style.setProperty("--mouse-x", `${x}px`)
      container.style.setProperty("--mouse-y", `${y}px`)
    }

    container.addEventListener("mousemove", handleMouseMove)
    return () => container.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.section
      ref={containerRef}
      className="relative pt-16 pb-20 lg:pb-32 overflow-hidden w-full max-w-full"
      initial="hidden"
      animate="visible"
      variants={stagger(0.18, 0.05)}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 0 400 Q 400 350 800 400 T 1600 400"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-border animate-draw"
          style={{ opacity: 0.3 }}
        />
        <path
          d="M 0 500 Q 300 450 600 500 T 1200 500 T 1800 500"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-border animate-draw"
          style={{ opacity: 0.2, animationDelay: "0.3s" }}
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 pt-20 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div variants={fadeInUp()}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              {t("hero.title1")}
              <br />
              <span className="relative">
                {t("hero.title2")}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C47.6667 2.16667 141 -2.1 199 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-accent"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">{t("hero.description")}</p>

            <div className="mt-8 flex flex-row gap-3">
              <Button size="lg" className="group flex-1 sm:flex-initial" asChild>
                <Link href="https://dash.web3insight.ai">
                  <span className="hidden sm:inline">{t("hero.exploreDashboard")}</span>
                  <span className="sm:hidden">Dashboard</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="flex-1 sm:flex-initial" asChild>
                <Link href="https://github.com/web3insight-ai/web3insight" target="_blank">
                  <span className="hidden sm:inline">{t("hero.viewGithub")}</span>
                  <span className="sm:hidden">GitHub</span>
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right side - Bento grid preview */}
          <motion.div className="relative" variants={fadeInUp(0.15)}>
            <div className="grid grid-cols-2 gap-3">
              {/* Main card */}
              <div className="col-span-2 p-6 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("hero.askAnything")}</p>
                    <p className="text-xs text-muted-foreground">{t("hero.aiPowered")}</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-md p-3 font-mono text-xs text-muted-foreground">
                  <span className="text-accent">{">"}</span> top contributors of ethereum
                </div>
              </div>

              {/* Stats cards */}
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t("hero.developers")}</p>
                <div className="min-h-[32px] flex items-center">
                  <AnimatedHeroNumber value={statsData.coreDeveloper} isLoading={isLoading} />
                </div>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t("hero.ecosystems")}</p>
                <div className="min-h-[32px] flex items-center">
                  <AnimatedHeroNumber value={statsData.ecosystem} isLoading={isLoading} />
                </div>
              </div>

              {/* Dotted pattern card */}
              <div className="col-span-2 p-4 bg-card border border-border rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 dotted-pattern text-border opacity-30" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("hero.contributors")}</p>
                    <div className="min-h-[28px] flex items-center">
                      <AnimatedContributors value={statsData.developer} isLoading={isLoading} />
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                    <Globe className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 border border-border rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 border border-border rounded-sm rotate-45" />
          </motion.div>
        </div>
      </div>

      {/* Bottom border with nodes */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border">
        <div className="absolute left-1/4 -top-1.5 w-3 h-3 bg-background border border-border rounded-full" />
        <div className="absolute left-1/2 -top-1.5 w-3 h-3 bg-accent border border-accent rounded-full" />
        <div className="absolute left-3/4 -top-1.5 w-3 h-3 bg-background border border-border rounded-full" />
      </div>
    </motion.section>
  )
}
