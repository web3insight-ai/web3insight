"use client"

import Link from "next/link"
import Image from "next/image"
import { Github } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="py-16 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Web3Insight Logo" width={32} height={32} className="w-8 h-8" />
              <span className="font-semibold text-foreground">Web3Insight</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{t("footer.description")}</p>
            <div className="flex items-center gap-4">
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
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://dash.web3insight.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="#use-cases"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.useCases")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://github.com/web3insight-ai/web3insight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://api.web3insight.ai/doc/api#/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.apiDocs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
