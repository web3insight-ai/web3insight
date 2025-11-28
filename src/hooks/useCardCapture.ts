"use client"

import { useCallback, useState } from "react"
import html2canvas from "html2canvas"

interface UseCardCaptureOptions {
  fileName?: string
  quality?: number
  backgroundColor?: string
}

export function useCardCapture(options: UseCardCaptureOptions = {}) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    fileName = "monad-dev-card",
    quality = 1,
    backgroundColor = "#000000"
  } = options

  // Check if Web Share API is supported
  const canShare = typeof navigator !== "undefined" && "share" in navigator

  // Check if we're on a mobile device
  const isMobile = typeof navigator !== "undefined" && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const captureElement = useCallback(async (element: HTMLElement): Promise<Blob | null> => {
    try {
      setIsCapturing(true)
      setError(null)

      // Wait for fonts to load
      if (document.fonts) {
        await document.fonts.ready
      }

      // Wait for images to load
      const images = element.querySelectorAll("img")
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve, reject) => {
          img.onload = () => resolve(undefined)
          img.onerror = () => resolve(undefined) // Don't fail on image errors
          setTimeout(() => resolve(undefined), 5000) // Timeout after 5s
        })
      })
      await Promise.all(imagePromises)

      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      const canvas = await html2canvas(element, {
        quality,
        backgroundColor,
        scale: window.devicePixelRatio || 2, // Use device pixel ratio for optimal quality
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        // Ignore elements that might cause issues
        ignoreElements: (element) => {
          return element.classList?.contains('ignore-screenshot') || false
        },
        // Font handling
        fontEmbedCSS: true,
        // Better handling of CSS
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      })

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, "image/png", quality)
      })
    } catch (err) {
      console.error("Failed to capture element:", err)
      setError(err instanceof Error ? err.message : "Failed to capture image")
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [quality, backgroundColor])

  const downloadImage = useCallback(async (element: HTMLElement) => {
    const blob = await captureElement(element)
    if (!blob) return false

    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${fileName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (err) {
      console.error("Failed to download image:", err)
      setError("Failed to download image")
      return false
    }
  }, [captureElement, fileName])

  const shareImage = useCallback(async (element: HTMLElement, shareData?: { title?: string; text?: string }) => {
    if (!canShare) {
      // Fallback to download on desktop
      return downloadImage(element)
    }

    const blob = await captureElement(element)
    if (!blob) return false

    try {
      const file = new File([blob], `${fileName}.png`, { type: "image/png" })
      
      const shareOptions: ShareData = {
        title: shareData?.title || "My Monad Dev Card",
        text: shareData?.text || "Check out my developer card!",
        files: [file]
      }

      // Check if files can be shared
      if (navigator.canShare && !navigator.canShare(shareOptions)) {
        // If files can't be shared, try without files
        await navigator.share({
          title: shareOptions.title,
          text: shareOptions.text,
        })
      } else {
        await navigator.share(shareOptions)
      }
      return true
    } catch (err) {
      console.error("Failed to share image:", err)
      // If sharing fails, fallback to download
      if (err instanceof Error && err.name !== "AbortError") {
        return downloadImage(element)
      }
      return false
    }
  }, [canShare, captureElement, downloadImage, fileName])

  const saveToGallery = useCallback(async (element: HTMLElement) => {
    // On mobile devices, try different approaches based on the platform
    if (isMobile) {
      // First try the Web Share API for saving to photos
      if (canShare) {
        try {
          const blob = await captureElement(element)
          if (!blob) return false

          const file = new File([blob], `${fileName}.png`, { type: "image/png" })
          
          // Try sharing with files (works on many mobile browsers)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Save to Photos",
              text: "My Monad Dev Card"
            })
            return true
          }
        } catch (err) {
          console.warn("Web Share API failed, falling back to download:", err)
        }
      }
      
      // iOS Safari: Create a link that opens the image in a new tab
      // User can then long-press to save to photos
      const blob = await captureElement(element)
      if (!blob) return false
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.target = "_blank"
      link.download = `${fileName}.png`
      
      // For mobile, we'll both download and open in new tab
      link.click()
      
      // Also try to open in new window for iOS
      const newWindow = window.open(url, "_blank")
      if (newWindow) {
        // Give user instructions for iOS
        setTimeout(() => {
          if (confirm("On iOS: Long press the image and select 'Save to Photos'.\nOn Android: The image should download automatically.")) {
            newWindow.close()
          }
        }, 1000)
      }
      
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      return true
    }
    
    // Desktop fallback
    return downloadImage(element)
  }, [isMobile, canShare, captureElement, fileName, downloadImage])

  return {
    captureElement,
    downloadImage,
    shareImage,
    saveToGallery,
    isCapturing,
    error,
    canShare,
    isMobile,
    clearError: () => setError(null)
  }
}
