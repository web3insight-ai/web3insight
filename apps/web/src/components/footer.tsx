"use client"

import Link from "next/link"
import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"
import type { MouseEvent } from "react"
import { HandLabel } from "@/components/blueprint"
import { GithubIcon, XIcon } from "@/components/brand-icons"

export function Footer() {
  const { t } = useI18n()

  const handleScrollTo = (event: MouseEvent, targetId: string) => {
    event.preventDefault()
    const target = document.getElementById(targetId)
    if (!target) return
    const headerOffset = 80
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: y, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-background py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border border-border bg-card">
          {/* title block strip */}
          <div className="flex items-center justify-between border-b border-border-soft px-6 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              title · block
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              rev · 0001
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
            {/* Brand column */}
            <div className="border-border-soft p-8 md:col-span-2 md:border-r">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/web3insight_logo.svg"
                  alt="Web3Insight"
                  width={229}
                  height={26}
                  className="h-6 w-auto"
                />
              </Link>
              <p className="mt-5 max-w-[42ch] text-sm leading-[1.65] text-muted-foreground">
                {t("footer.description")}
              </p>
              <div className="mt-8 flex items-center gap-5">
                <Link
                  href="https://github.com/web3insight-ai/web3insight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="https://x.com/intent/follow?screen_name=Web3insightAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="X"
                >
                  <XIcon className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </div>

            {/* Product column */}
            <div className="border-border-soft border-t p-8 md:border-l-0 md:border-r md:border-t-0">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("footer.product")}
              </h4>
              <ul className="mt-5 space-y-3">
                <FooterLink href="https://dash.web3insight.ai">{t("nav.dashboard")}</FooterLink>
                <FooterLink as="a" onClick={(e) => handleScrollTo(e, "features")} href="#features">
                  {t("nav.features")}
                </FooterLink>
                <FooterLink as="a" onClick={(e) => handleScrollTo(e, "use-cases")} href="#use-cases">
                  {t("nav.useCases")}
                </FooterLink>
              </ul>
            </div>

            {/* Resources column */}
            <div className="border-t border-border-soft p-8 md:border-t-0">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("footer.resources")}
              </h4>
              <ul className="mt-5 space-y-3">
                <FooterLink href="https://github.com/web3insight-ai/web3insight">GitHub</FooterLink>
                <FooterLink href="https://api.web3insight.ai/doc/api#/">
                  {t("footer.apiDocs")}
                </FooterLink>
              </ul>
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-border-soft px-6 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              © {new Date().getFullYear()} · {t("footer.copyright")}
            </p>
            <span className="hidden md:inline-flex">
              <HandLabel arrow="left">finish</HandLabel>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

type FooterLinkProps = {
  href: string
  children: React.ReactNode
  as?: "link" | "a"
  onClick?: (e: MouseEvent) => void
}

function FooterLink({ href, children, as = "link", onClick }: FooterLinkProps) {
  const className =
    "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground group"
  const inner = (
    <>
      <span
        aria-hidden
        className="block h-px w-3 bg-border-soft transition-colors group-hover:bg-teal-500"
      />
      <span>{children}</span>
    </>
  )
  if (as === "a") {
    return (
      <li>
        <a href={href} onClick={onClick} className={className}>
          {inner}
        </a>
      </li>
    )
  }
  return (
    <li>
      <Link href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </Link>
    </li>
  )
}
