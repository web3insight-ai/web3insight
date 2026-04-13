"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Github } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()

  const handleScrollTo = (event: React.MouseEvent, targetId: string) => {
    event.preventDefault()
    setIsMenuOpen(false)
    const target = document.getElementById(targetId)
    if (!target) return
    const headerOffset = 80
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: y, behavior: "smooth" })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-[2px]">
      {/* ruler strip */}
      <div
        aria-hidden
        className="h-1.5 w-full text-border-soft"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px 24px)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/web3insight_logo.svg"
              alt="Web3Insight"
              width={229}
              height={26}
              className="h-6 w-auto"
              priority
            />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
              /ai
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-7 md:flex">
            <a
              href="#features"
              onClick={(e) => handleScrollTo(e, "features")}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.features")}
            </a>
            <a
              href="#use-cases"
              onClick={(e) => handleScrollTo(e, "use-cases")}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.useCases")}
            </a>
            <Link
              href="https://dash.web3insight.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.dashboard")}
            </Link>
            <span className="h-4 w-px bg-border-soft" aria-hidden />
            <Link
              href="https://github.com/web3insight-ai/web3insight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="https://x.com/intent/follow?screen_name=Web3insightAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="X"
            >
              <XIcon className="h-[16px] w-[16px]" />
            </Link>
            <LanguageSwitcher />
          </nav>

          <button
            className="ml-auto p-2 text-foreground md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border-soft py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={(e) => handleScrollTo(e, "features")}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.features")}
              </a>
              <a
                href="#use-cases"
                onClick={(e) => handleScrollTo(e, "use-cases")}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.useCases")}
              </a>
              <Link
                href="https://dash.web3insight.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.dashboard")}
              </Link>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="https://github.com/web3insight-ai/web3insight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="https://x.com/intent/follow?screen_name=Web3insightAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="X"
                >
                  <XIcon className="h-5 w-5" />
                </Link>
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
