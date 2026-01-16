"use client"

import { useState, useCallback, memo, useMemo } from "react"
import { Share2, Twitter, Link2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
  ecosystem?: "mantle" | "monad"
}

export const ShareButton = memo(function ShareButton({
  url,
  title = "I just minted a Mantle DevCard! Join the Mantle Global Hackathon 2025 and win rewards!",
  text = "#BuildOnMantle @Mantle_Official @0xMantleCN @OpenBuildxyz @Web3insightAI",
  ecosystem = "mantle",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const isMantle = ecosystem === "mantle"

  // Memoize computed colors to avoid recalculation on re-renders
  const { accentColor, bgColor, borderColor } = useMemo(() => ({
    accentColor: isMantle ? "#5EEAD4" : "#9F8EFF",
    bgColor: isMantle ? "rgba(101, 179, 175, 0.15)" : "rgba(159, 142, 255, 0.15)",
    borderColor: isMantle ? "rgba(94, 234, 212, 0.3)" : "rgba(159, 142, 255, 0.3)",
  }), [isMantle])

  // Memoize handlers to prevent recreation on every render
  const handleTwitterShare = useCallback(() => {
    const twitterUrl = new URL("https://twitter.com/intent/tweet")
    // Format: title + empty line + URL + empty line + hashtags/tags
    const fullText = `${title}\n\n${shareUrl}\n\n${text}`
    twitterUrl.searchParams.set("text", fullText)
    window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer")
    setIsOpen(false)
  }, [title, shareUrl, text])

  const handleCopyLink = useCallback(async () => {
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
  }, [shareUrl])

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 py-1.5 transition-colors rounded-lg flex flex-col items-center gap-0.5"
        style={{ color: accentColor }}
        whileHover={{ scale: 1.05, backgroundColor: bgColor }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-[9px] opacity-70">Share</span>
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
})
