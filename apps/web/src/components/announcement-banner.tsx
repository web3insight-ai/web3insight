"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-accent/10 backdrop-blur-sm border-b border-accent/10">
      <div className="max-w-7xl mx-auto px-6 py-2.5 text-center relative">
        <span className="text-sm text-accent">
          Mantle Global Hackathon 2025
        </span>
        <span className="mx-2" />
        <Link
          href="https://www.hackquest.io/zh-cn/hackathons/Mantle-Global-Hackathon-2025?utm=openbuild"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent font-medium underline underline-offset-2 hover:text-accent/80 transition-colors"
        >
          Start registration→
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-accent/60 hover:text-accent transition-colors"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
