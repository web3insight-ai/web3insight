"use client"

import { useRef } from "react"
import { Download, Share2, Image as ImageIcon } from "lucide-react"
import { useCardCapture } from "@/hooks/useCardCapture"

interface CardActionButtonsProps {
  cardRef: React.RefObject<HTMLElement>
  userName?: string
}

export function CardActionButtons({ cardRef, userName }: CardActionButtonsProps) {
  const {
    downloadImage,
    shareImage,
    saveToGallery,
    isCapturing,
    error,
    canShare,
    isMobile,
    clearError
  } = useCardCapture({
    fileName: `${userName ? `${userName}-` : ""}monad-dev-card`,
    quality: 1,
    backgroundColor: "#000000"
  })

  const handleDownload = async () => {
    if (!cardRef.current) return
    clearError()
    const success = await downloadImage(cardRef.current)
    if (!success && error) {
      alert(`Download failed: ${error}`)
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    clearError()
    const success = await shareImage(cardRef.current, {
      title: `${userName ? `${userName}'s` : "My"} Monad Dev Card`,
      text: "Check out this awesome developer card! 🚀"
    })
    if (!success && error) {
      alert(`Share failed: ${error}`)
    }
  }

  const handleSaveToGallery = async () => {
    if (!cardRef.current) return
    clearError()
    
    // Add a small delay to ensure the card is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const success = await saveToGallery(cardRef.current)
    if (!success && error) {
      alert(`Save failed: ${error}`)
    }
  }

  return (
    <div className="flex gap-3">
      {/* Primary action - Download/Save based on platform */}
      <button
        onClick={isMobile ? handleSaveToGallery : handleDownload}
        disabled={isCapturing}
        className="px-5 py-2.5 text-sm text-white rounded-full transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Capturing...
          </>
        ) : isMobile ? (
          <>
            <ImageIcon className="w-4 h-4" />
            Save Image
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download
          </>
        )}
      </button>

      {/* Secondary action - Share (if supported) or Download (on mobile) */}
      {canShare ? (
        <button 
          onClick={handleShare}
          disabled={isCapturing}
          className="px-5 py-2.5 text-sm bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      ) : (
        !isMobile && (
          <button 
            onClick={handleShare}
            disabled={isCapturing}
            className="px-5 py-2.5 text-sm bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )
      )}
    </div>
  )
}
