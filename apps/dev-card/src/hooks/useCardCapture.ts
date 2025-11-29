"use client"

import { useCallback, useMemo, useState } from "react"
import html2canvas from "html2canvas"
import * as htmlToImage from "html-to-image"

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

  const outputSize = useMemo(() => ({
    width: 1701,
    height: 2709,
  }), [])

  const shouldIncludeNode = useCallback((node: HTMLElement) => {
    if (node?.classList?.contains("ignore-screenshot")) return false
    if (node?.hasAttribute("data-html2canvas-ignore")) return false
    return true
  }, [])

  const waitForReadyState = useCallback(async (element: HTMLElement) => {
    if (document.fonts) {
      await document.fonts.ready
    }

    const images = element.querySelectorAll("img")
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve(undefined)
      return new Promise<void>((resolve) => {
        const done = () => resolve()
        img.onload = done
        img.onerror = done
        setTimeout(done, 5000)
      })
    })
    await Promise.all(imagePromises)

    await new Promise(resolve => setTimeout(resolve, 200))
  }, [])

  const captureWithHtmlToImage = useCallback(async (element: HTMLElement) => {
    const originalWidth = element.offsetWidth || element.getBoundingClientRect().width
    const originalHeight = element.offsetHeight || element.getBoundingClientRect().height

    const blob = await htmlToImage.toBlob(element, {
      width: originalWidth,
      height: originalHeight,
      canvasWidth: outputSize.width,
      canvasHeight: outputSize.height,
      backgroundColor,
      cacheBust: true,
      skipFonts: false,
      pixelRatio: 1,
      quality,
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true
        return shouldIncludeNode(node)
      },
      style: {
        transformOrigin: "top left",
      },
      type: "image/png",
    })

    if (!blob) {
      throw new Error("Failed to create image blob")
    }

    return blob
  }, [backgroundColor, outputSize.height, outputSize.width, quality, shouldIncludeNode])

  const captureWithHtml2Canvas = useCallback(async (element: HTMLElement) => {
    const originalWidth = element.offsetWidth
    const originalHeight = element.offsetHeight
    const canvas = await html2canvas(element, {
      quality,
      backgroundColor,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      removeContainer: true,
      logging: false,
      width: originalWidth,
      height: originalHeight,
      ignoreElements: (el) => {
        return !shouldIncludeNode(el as HTMLElement)
      },
    })

    const outputCanvas = document.createElement("canvas")
    outputCanvas.width = outputSize.width
    outputCanvas.height = outputSize.height
    const ctx = outputCanvas.getContext("2d")

    if (ctx) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, outputSize.width, outputSize.height)
      ctx.drawImage(canvas, 0, 0, originalWidth, originalHeight, 0, 0, outputSize.width, outputSize.height)
    }

    return new Promise<Blob | null>((resolve) => {
      outputCanvas.toBlob((blob) => {
        resolve(blob)
      }, "image/png", quality)
    })
  }, [backgroundColor, outputSize.height, outputSize.width, quality, shouldIncludeNode])

  const captureElement = useCallback(async (element: HTMLElement): Promise<Blob | null> => {
    try {
      setIsCapturing(true)
      setError(null)
      await waitForReadyState(element)

      try {
        return await captureWithHtmlToImage(element)
      } catch (primaryError) {
        console.warn("html-to-image failed, falling back to html2canvas", primaryError)
        try {
          return await captureWithHtml2Canvas(element)
        } catch (fallbackError) {
          console.error("html2canvas fallback failed", fallbackError)
          throw fallbackError
        }
      }

    } catch (err) {
      console.error("Failed to capture element:", err)
      setError(err instanceof Error ? err.message : "Failed to capture image")
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [captureWithHtml2Canvas, captureWithHtmlToImage, waitForReadyState])

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
