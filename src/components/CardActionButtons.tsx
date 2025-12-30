"use client"

import { Printer } from "lucide-react"
import { motion } from "framer-motion"
import type { CardData } from "@/components/CardTemplate"
import { ShareButton } from "@/components/ShareButton"

interface CardActionButtonsProps {
  cardData: CardData
  userName?: string
  ecosystem?: "mantle" | "monad"
}

export function CardActionButtons({ cardData, userName, ecosystem = "mantle" }: CardActionButtonsProps) {
  const handlePrint = () => {
    window.print()
  }

  const isMantle = ecosystem === "mantle"
  const displayName = userName || "I"
  const shareTitle = isMantle
    ? `${displayName} just minted a Mantle DevCard! Join the Mantle Global Hackathon 2025 and win rewards!`
    : `${displayName} just minted a Monad DevCard! Join the Monad ecosystem!`
  const shareText = isMantle
    ? `#BuildOnMantle @Mantle_Official @0xMantleCN @OpenBuildxyz @Web3insightAI`
    : `@monad_xyz @Web3insightAI`

  return (
    <motion.div
      className="flex gap-2 sm:gap-3"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Share button */}
      <ShareButton
        title={shareTitle}
        text={shareText}
        ecosystem={ecosystem}
      />

      {/* Print button */}
      <motion.button
        onClick={handlePrint}
        className="hidden px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-white rounded-full flex items-center gap-1.5 sm:gap-2 font-medium shadow-lg"
        style={{
          background: 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'
        }}
        whileHover={{
          scale: 1.05,
          y: -2,
          boxShadow: "0px 10px 30px rgba(159, 142, 255, 0.5)",
          background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Printer className="w-3 sm:w-4 h-3 sm:h-4" />
        <span>Print</span>
      </motion.button>
    </motion.div>
  )
}
