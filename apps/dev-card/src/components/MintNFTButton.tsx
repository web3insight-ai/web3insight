"use client"

import { useState } from "react"
import { IdCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MintNFTButtonProps {
  ecosystem?: "mantle" | "monad"
}

export function MintNFTButton({ ecosystem = "mantle" }: MintNFTButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const isMantle = ecosystem === "mantle"
  const accentColor = isMantle ? "#5EEAD4" : "#9F8EFF"
  const bgColor = isMantle ? "rgba(101, 179, 175, 0.15)" : "rgba(159, 142, 255, 0.15)"

  const handleClick = () => {
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 2000)
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-12 py-1.5 transition-colors rounded-lg flex flex-col items-center gap-0.5 opacity-50 cursor-not-allowed"
        style={{ color: accentColor }}
        whileHover={{ scale: 1.05, backgroundColor: bgColor }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mint NFT"
      >
        <IdCard className="w-4 h-4" />
        <span className="text-[9px] opacity-70">Mint</span>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: isMantle ? "#0a1a1a" : "#0f0a1a",
              color: "#888",
              border: `1px solid ${accentColor}30`,
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            Coming soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
