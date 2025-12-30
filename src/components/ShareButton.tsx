"use client"

import { useState } from "react"
import { Share2, Twitter, Link2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
  ecosystem?: "mantle" | "monad"
}

export function ShareButton({
  url,
  title = "Check out my Web3 Dev Card!",
  text = "I just created my Web3 Dev Card. Get yours now!",
  ecosystem = "mantle",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const isMantle = ecosystem === "mantle"
  const accentColor = isMantle ? "#5EEAD4" : "#9F8EFF"
  const bgColor = isMantle ? "rgba(101, 179, 175, 0.15)" : "rgba(159, 142, 255, 0.15)"
  const borderColor = isMantle ? "rgba(94, 234, 212, 0.3)" : "rgba(159, 142, 255, 0.3)"

  const handleTwitterShare = () => {
    const twitterUrl = new URL("https://twitter.com/intent/tweet")
    twitterUrl.searchParams.set("text", `${title}\n\n${text}`)
    twitterUrl.searchParams.set("url", shareUrl)
    window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer")
    setIsOpen(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 1500)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 transition-colors rounded-full"
        style={{ color: accentColor }}
        whileHover={{ scale: 1.15, backgroundColor: bgColor }}
        whileTap={{ scale: 0.95 }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          opacity: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 z-50 min-w-[160px] rounded-xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isMantle ? "#0a1a1a" : "#0f0a1a",
                border: `1px solid ${borderColor}`,
              }}
            >
              {/* Twitter/X share */}
              <button
                onClick={handleTwitterShare}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm"
                style={{ color: accentColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Twitter className="w-4 h-4" />
                <span>Share on X</span>
              </button>

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm"
                style={{
                  color: copied ? "#4ade80" : accentColor,
                  borderTop: `1px solid ${borderColor}`,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
