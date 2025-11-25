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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Web3Insight Logo" width={32} height={32} className="w-8 h-8" />
            <span className="font-semibold text-foreground">Web3Insight</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.features")}
            </Link>
            <Link href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.useCases")}
            </Link>
            <Link
              href="https://dash.web3insight.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="https://github.com/web3insight-ai/web3insight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://x.com/intent/follow?screen_name=Web3insightAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.features")}
              </Link>
              <Link href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.useCases")}
              </Link>
              <Link
                href="https://dash.web3insight.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.dashboard")}
              </Link>
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="https://github.com/web3insight-ai/web3insight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link
                  href="https://x.com/intent/follow?screen_name=Web3insightAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="w-5 h-5" />
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
