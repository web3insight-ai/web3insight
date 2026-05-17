"use client"

import { useI18n } from "@/lib/i18n-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:border-accent/50 transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{locale === "en" ? "ZH" : "EN"}</span>
    </button>
  )
}
