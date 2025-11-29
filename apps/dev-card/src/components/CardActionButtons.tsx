"use client"

import { Printer } from "lucide-react"
import type { CardData } from "@/components/CardTemplate"

interface CardActionButtonsProps {
  cardData: CardData
  userName?: string
}

export function CardActionButtons({ cardData, userName }: CardActionButtonsProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* Print button */}
      <button
        onClick={handlePrint}
        className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-white rounded-full transition-all flex items-center gap-1.5 sm:gap-2 font-medium shadow-lg hover:shadow-xl"
        style={{
          background: 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'
        }}
      >
        <Printer className="w-3 sm:w-4 h-3 sm:h-4" />
        <span>Print</span>
      </button>
    </div>
  )
}
