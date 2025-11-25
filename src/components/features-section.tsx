"use client"

import { useRef, useEffect, useState } from "react"
import { Search, LineChart, Users, Database, TrendingUp, Award } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

function FeatureVisual({ type }: { type: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative h-32 bg-secondary rounded-md overflow-hidden">
      {type === "search" && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono">ethereum devs...</span>
            <div className="w-2 h-4 bg-accent animate-pulse" />
          </div>
        </div>
      )}
      {type === "chart" && (
        <div className={`absolute inset-0 p-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <svg className="w-full h-full" viewBox="0 0 100 50">
            <path
              d="M 0 40 Q 20 35 40 25 T 80 15 T 100 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-accent"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: isVisible ? 0 : 200,
                transition: "stroke-dashoffset 1.5s ease-out",
              }}
            />
            <circle
              cx="40"
              cy="25"
              r="3"
              className="fill-accent"
              style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease-out 0.5s" }}
            />
            <circle
              cx="80"
              cy="15"
              r="3"
              className="fill-accent"
              style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease-out 0.8s" }}
            />
          </svg>
        </div>
      )}
      {type === "metrics" && (
        <div
          className={`absolute inset-0 p-4 flex items-end gap-2 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {[60, 80, 45, 90, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-accent/20 rounded-t transition-all duration-500"
              style={{
                height: isVisible ? `${height}%` : "0%",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div
                className="w-full bg-accent rounded-t transition-all duration-500"
                style={{
                  height: isVisible ? "100%" : "0%",
                  transitionDelay: `${i * 100 + 200}ms`,
                }}
              />
            </div>
          ))}
        </div>
      )}
      {type === "integration" && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Database className="w-5 h-5 text-accent" />
            </div>
            {[0, 90, 180, 270].map((rotation, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-card border border-border rounded-full"
                style={{
                  transform: `rotate(${rotation}deg) translateX(32px)`,
                  transformOrigin: "center",
                  opacity: isVisible ? 1 : 0,
                  transition: `opacity 0.3s ease-out ${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      {type === "research" && (
        <div className={`absolute inset-0 p-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-full flex flex-col justify-center gap-2">
            {[85, 92, 78].map((value, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-20 h-2 bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{
                      width: isVisible ? `${value}%` : "0%",
                      transitionDelay: `${i * 200}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {type === "growth" && (
        <div className={`absolute inset-0 p-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <svg className="w-full h-full" viewBox="0 0 120 60">
            {/* Grid lines */}
            <line x1="10" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            <line
              x1="10"
              y1="35"
              x2="110"
              y2="35"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2"
              className="text-border"
            />
            <line
              x1="10"
              y1="20"
              x2="110"
              y2="20"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2"
              className="text-border"
            />

            {/* Growth line */}
            <path
              d="M 15 45 L 35 40 L 55 32 L 75 22 L 95 12 L 105 8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-accent"
              style={{
                strokeDasharray: 150,
                strokeDashoffset: isVisible ? 0 : 150,
                transition: "stroke-dashoffset 1.2s ease-out",
              }}
            />

            {/* Area fill */}
            <path
              d="M 15 45 L 35 40 L 55 32 L 75 22 L 95 12 L 105 8 L 105 50 L 15 50 Z"
              className="fill-accent/10"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.5s ease-out 0.8s",
              }}
            />

            {/* Data points */}
            {[
              { x: 15, y: 45 },
              { x: 35, y: 40 },
              { x: 55, y: 32 },
              { x: 75, y: 22 },
              { x: 95, y: 12 },
            ].map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="3"
                className="fill-accent"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: `opacity 0.3s ease-out ${0.3 + i * 0.15}s`,
                }}
              />
            ))}

            {/* Labels */}
            <text x="15" y="58" className="fill-muted-foreground text-[6px] font-mono">
              Hackathon
            </text>
            <text x="55" y="58" className="fill-muted-foreground text-[6px] font-mono">
              Contrib
            </text>
            <text x="95" y="58" className="fill-muted-foreground text-[6px] font-mono">
              Core
            </text>
          </svg>
        </div>
      )}
    </div>
  )
}

export function FeaturesSection() {
  const { t } = useI18n()

  const features = [
    {
      icon: Search,
      titleKey: "features.devId.title",
      descriptionKey: "features.devId.description",
      visual: "search",
    },
    {
      icon: LineChart,
      titleKey: "features.ecosystem.title",
      descriptionKey: "features.ecosystem.description",
      visual: "chart",
    },
    {
      icon: Award,
      titleKey: "features.events.title",
      descriptionKey: "features.events.description",
      visual: "metrics",
    },
    {
      icon: Database,
      titleKey: "features.integration.title",
      descriptionKey: "features.integration.description",
      visual: "integration",
    },
    {
      icon: TrendingUp,
      titleKey: "features.research.title",
      descriptionKey: "features.research.description",
      visual: "research",
    },
    {
      icon: Users,
      titleKey: "features.growth.title",
      descriptionKey: "features.growth.description",
      visual: "growth",
    },
  ]

  return (
    <section id="features" className="relative py-24 border-b border-border overflow-hidden">
      <div className="absolute top-8 left-0 w-full flex items-center justify-center pointer-events-none">
        <div className="text-[120px] sm:text-[180px] font-bold text-foreground/[0.05] leading-none select-none">
          Features
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">{t("features.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("features.description")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="group p-6 bg-card border border-border rounded-lg hover:border-accent/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground">{t(feature.titleKey)}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t(feature.descriptionKey)}</p>
              <FeatureVisual type={feature.visual} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
