"use client"

import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface CreateCardButtonProps {
  ecosystem?: "mantle" | "monad"
}

export function CreateCardButton({ ecosystem = "mantle" }: CreateCardButtonProps) {
  const isMantle = ecosystem === "mantle"
  const accentColor = isMantle ? "#5EEAD4" : "#9F8EFF"
  const bgColor = isMantle ? "rgba(101, 179, 175, 0.15)" : "rgba(159, 142, 255, 0.15)"
  const createUrl = `/${ecosystem}`

  return (
    <motion.a
      href={createUrl}
      className="w-12 py-1.5 transition-colors rounded-lg flex flex-col items-center gap-0.5"
      style={{ color: accentColor }}
      whileHover={{ scale: 1.05, backgroundColor: bgColor }}
      whileTap={{ scale: 0.95 }}
      aria-label="Create your own card"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-[9px] opacity-70">Create</span>
    </motion.a>
  )
}
