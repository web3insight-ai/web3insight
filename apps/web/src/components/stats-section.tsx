"use client"

import { useEffect, useState, useRef } from "react"
import { useI18n } from "@/lib/i18n-context"

// Utility function to format numbers with comma separators
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
}

// Define StatisticsData type locally to match API response
interface StatisticsData {
  ecosystem: number;
  repository: number;
  developer: number;
  coreDeveloper: number;
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function LoadingNumber() {
  return (
    <div className="text-3xl sm:text-4xl font-bold text-foreground/60 tabular-nums flex items-center">
      <span className="animate-pulse">0</span>
      {/* Loading dots animation */}
      <div className="ml-3 flex space-x-1">
        <div className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function AnimatedNumber({ value, suffix, isLoading }: { value: number; suffix: string; isLoading?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Reset animation when loading state changes or value changes
    if (isLoading) {
      setDisplayValue(0)
      hasAnimated.current = false
      return
    }

    // If value is 0, set display value immediately
    if (value === 0) {
      setDisplayValue(0)
      hasAnimated.current = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current && value > 0) {
          hasAnimated.current = true
          const duration = 2000
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
        } else if (!entries[0].isIntersecting && !hasAnimated.current && value > 0) {
          // If not intersecting but has value, show the final value immediately
          setDisplayValue(value)
          hasAnimated.current = true
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, isLoading])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
      {formatNumber(displayValue)}
      {suffix}
    </div>
  )
}

export function StatsSection() {
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

  const stats = [
    { labelKey: "stats.developers", value: statsData.developer, suffix: "", icon: CodeIcon },
    { labelKey: "stats.contributors", value: statsData.coreDeveloper, suffix: "+", icon: UsersIcon },
    { labelKey: "stats.ecosystems", value: statsData.ecosystem, suffix: "", icon: GlobeIcon },
    { labelKey: "stats.repositories", value: statsData.repository, suffix: "", icon: PackageIcon },
  ]

  return (
    <section className="relative py-20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.labelKey}
              className="relative p-6 bg-card border border-border rounded-lg group hover:border-accent/50 transition-colors"
            >
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-border opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-sm bg-secondary flex items-center justify-center text-muted-foreground">
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t(stat.labelKey)}</span>
              </div>
              <div className="min-h-[48px] flex items-center">
                {isLoading ? (
                  <LoadingNumber />
                ) : (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isLoading={isLoading} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
