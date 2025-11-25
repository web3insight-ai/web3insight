"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

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
    <section ref={containerRef} className="relative min-h-screen pt-16 overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="animate-fade-in-up">
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

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" asChild>
                <Link href="https://dash.web3insight.ai">
                  {t("hero.exploreDashboard")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/web3insight-ai/web3insight" target="_blank">
                  {t("hero.viewGithub")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right side - Bento grid preview */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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
                <p className="text-2xl font-bold text-foreground">34,702</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t("hero.ecosystems")}</p>
                <p className="text-2xl font-bold text-foreground">7,019</p>
              </div>

              {/* Dotted pattern card */}
              <div className="col-span-2 p-4 bg-card border border-border rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 dotted-pattern text-border opacity-30" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("hero.contributors")}</p>
                    <p className="text-xl font-bold text-foreground">1.2M+</p>
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
          </div>
        </div>
      </div>

      {/* Bottom border with nodes */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border">
        <div className="absolute left-1/4 -top-1.5 w-3 h-3 bg-background border border-border rounded-full" />
        <div className="absolute left-1/2 -top-1.5 w-3 h-3 bg-accent border border-accent rounded-full" />
        <div className="absolute left-3/4 -top-1.5 w-3 h-3 bg-background border border-border rounded-full" />
      </div>
    </section>
  )
}
