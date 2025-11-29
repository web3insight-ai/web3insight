"use client"

import { Download, Share2, Image as ImageIcon } from "lucide-react"
import { useCardCapture } from "@/hooks/useCardCapture"
import type { CardData } from "@/components/CardTemplate"

interface CardActionButtonsProps {
  cardData: CardData
  userName?: string
}

export function CardActionButtons({ cardData, userName }: CardActionButtonsProps) {
  const {
    downloadCardImage,
    shareCardImage,
    saveCardToGallery,
    isCapturing,
    error,
    canShare,
    isMobile,
    clearError
  } = useCardCapture({
    fileName: `${userName ? `${userName}-` : ""}monad-dev-card`,
    quality: 1,
    backgroundColor: "#090111"
  })

  const handleDownload = async () => {
    clearError()
    const success = await downloadCardImage(cardData)
    if (!success && error) {
      alert(`Download failed: ${error}`)
    }
  }

  const handleShare = async () => {
    clearError()
    const success = await shareCardImage(cardData, {
      title: `${userName ? `${userName}'s` : "My"} Monad Dev Card`,
      text: "Check out this awesome developer card! 🚀"
    })
    if (!success && error) {
      alert(`Share failed: ${error}`)
    }
  }

  const handleSaveToGallery = async () => {
    clearError()
    const success = await saveCardToGallery(cardData)
    if (!success && error) {
      alert(`Save failed: ${error}`)
    }
  }

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* Primary action - Download/Save based on platform */}
      <button
        onClick={isMobile ? handleSaveToGallery : handleDownload}
        disabled={isCapturing}
        className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-white rounded-full transition-all flex items-center gap-1.5 sm:gap-2 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isCapturing
            ? 'linear-gradient(to right, rgba(94, 234, 212, 0.5), rgba(159, 142, 255, 0.5))'
            : 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'
        }}
        onMouseEnter={(e) => {
          if (!isCapturing) {
            e.currentTarget.style.background = 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isCapturing) {
            e.currentTarget.style.background = 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'
          }
        }}
      >
        {isCapturing ? (
          <>
            <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="hidden xs:inline">Capturing...</span>
          </>
        ) : isMobile ? (
          <>
            <ImageIcon className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Save Image</span>
          </>
        ) : (
          <>
            <Download className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Download</span>
          </>
        )}
      </button>

      {/* Secondary action - Share (if supported) or Download (on mobile) */}
      {canShare ? (
        <button
          onClick={handleShare}
          disabled={isCapturing}
          className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 flex items-center gap-1.5 sm:gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-3 sm:w-4 h-3 sm:h-4" />
          <span>Share</span>
        </button>
      ) : (
        !isMobile && (
          <button
            onClick={handleShare}
            disabled={isCapturing}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 flex items-center gap-1.5 sm:gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Share</span>
          </button>
        )
      )}
    </div>
  )
}
