"use client"

import { useState } from "react"
import { Sparkles, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CreateCardButtonProps {
  ecosystem?: "mantle" | "monad"
  inviteCode?: string
}

export function CreateCardButton({ ecosystem = "mantle", inviteCode }: CreateCardButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isMantle = ecosystem === "mantle"
  const accentColor = isMantle ? "#5EEAD4" : "#9F8EFF"
  const glowColor = isMantle ? "rgba(94, 234, 212, 0.6)" : "rgba(159, 142, 255, 0.6)"
  const bgGradient = isMantle
    ? "linear-gradient(135deg, rgba(94, 234, 212, 0.2) 0%, rgba(94, 234, 212, 0.1) 100%)"
    : "linear-gradient(135deg, rgba(159, 142, 255, 0.2) 0%, rgba(159, 142, 255, 0.1) 100%)"
  const createUrl = `/${ecosystem}`

  const handleClick = () => {
    if (inviteCode) {
      localStorage.setItem(`devcard-invite-code-${ecosystem}`, inviteCode)
    }
  }

  return (
    <div className="relative">
      {/* Pulsing glow ring */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: bgGradient,
          boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main button */}
      <motion.a
        href={createUrl}
        onClick={handleClick}
        className="relative w-12 py-1.5 rounded-xl flex flex-col items-center gap-0.5 border"
        style={{
          color: accentColor,
          borderColor: accentColor,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          scale: 1.08,
          boxShadow: `0 0 25px ${glowColor}`,
        }}
        whileTap={{ scale: 0.95 }}
        aria-label="Create your own card"
      >
        {/* Sparkles icon with animation */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <span className="text-[9px] font-medium">Create</span>
      </motion.a>

      {/* Tooltip - "Create Your Own Dev Card" */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute right-full top-1/2 mr-3 whitespace-nowrap"
            initial={{ opacity: 0, x: 10, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
              style={{
                background: "rgba(0, 0, 0, 0.9)",
                border: `1px solid ${accentColor}`,
                color: accentColor,
                boxShadow: `0 0 15px ${glowColor}`,
              }}
            >
              <span>Create Your Own Dev Card</span>
              <ChevronRight className="w-3 h-3" />
            </div>
            {/* Tooltip arrow */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"
              style={{
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: `6px solid ${accentColor}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hint arrow that pulses */}
      <motion.div
        className="absolute -left-6 top-1/2 -translate-y-1/2"
        animate={{
          x: [0, -4, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronRight
          className="w-4 h-4"
          style={{ color: accentColor }}
        />
      </motion.div>
    </div>
  )
}
