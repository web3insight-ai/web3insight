"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

interface CampaignBannerProps {
  ecosystem?: "mantle" | "monad"
}

export function CampaignBanner({ ecosystem = "mantle" }: CampaignBannerProps) {
  const isMantle = ecosystem === "mantle"

  if (!isMantle) return null

  const campaignUrl = "https://x.com/Web3insightAI/status/2005915619410239668"

  return (
    <motion.a
      href={campaignUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 cursor-pointer overflow-hidden"
      style={{
        background: "linear-gradient(90deg, rgba(13, 35, 35, 0.95) 0%, rgba(20, 60, 55, 0.95) 50%, rgba(13, 35, 35, 0.95) 100%)",
        borderBottom: "1px solid rgba(94, 234, 212, 0.4)",
        backdropFilter: "blur(8px)",
      }}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        borderBottomColor: "rgba(94, 234, 212, 0.6)",
        background: "linear-gradient(90deg, rgba(20, 50, 48, 0.98) 0%, rgba(30, 75, 70, 0.98) 50%, rgba(20, 50, 48, 0.98) 100%)",
      }}
    >
      {/* Flowing light effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(94, 234, 212, 0.15) 20%, rgba(94, 234, 212, 0.3) 50%, rgba(94, 234, 212, 0.15) 80%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary flowing effect (opposite direction) */}
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
        }}
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(94, 234, 212, 0.8) 50%, transparent 100%)",
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        <span className="text-[#5EEAD4] text-sm font-semibold tracking-wide">
          Mantle DevCard Campaign Live
        </span>
        <span className="text-white/60 text-sm">—</span>
        <span className="text-white text-sm font-medium">
          Click to Win $2,000
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-[#5EEAD4]/70" />
      </div>
    </motion.a>
  )
}
