"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight } from "lucide-react"

interface OnboardingTooltipProps {
  ecosystem?: "mantle" | "monad"
  storageKey?: string
}

export function OnboardingTooltip({
  ecosystem = "mantle",
  storageKey = "devcard-onboarding-dismissed"
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const isMantle = ecosystem === "mantle"
  const accentColor = isMantle ? "#5EEAD4" : "#9F8EFF"
  const bgColor = isMantle ? "#0a1a1a" : "#0f0a1a"

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey)
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(storageKey, "true")
  }

  const handleCreateClick = () => {
    handleDismiss()
    window.location.href = `/${ecosystem}`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-30 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Tooltip pointing to create button */}
          <motion.div
            className="absolute top-[52px] right-0 z-40"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div
              className="relative rounded-2xl p-4 shadow-2xl min-w-[220px]"
              style={{
                backgroundColor: bgColor,
                border: `2px solid ${accentColor}`,
                boxShadow: `0 0 30px ${accentColor}40`
              }}
            >
              {/* Arrow pointing to button */}
              <div
                className="absolute -top-2 right-4 w-4 h-4 rotate-45"
                style={{
                  backgroundColor: bgColor,
                  borderTop: `2px solid ${accentColor}`,
                  borderLeft: `2px solid ${accentColor}`,
                }}
              />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: accentColor }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="pr-4">
                <motion.div
                  className="text-base font-bold mb-2"
                  style={{ color: accentColor }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨ Create Your Own!
                </motion.div>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                  Want a Dev Card like this?<br />
                  Create yours in seconds!
                </p>

                {/* CTA Button */}
                <motion.button
                  onClick={handleCreateClick}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: accentColor,
                    color: "#000"
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Pulsing ring around create button */}
          <motion.div
            className="absolute top-[38px] right-0 w-11 h-11 rounded-full z-35 pointer-events-none"
            style={{ border: `2px solid ${accentColor}` }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
