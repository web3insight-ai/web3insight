"use client"

import { useCallback, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { snapdom } from "@zumer/snapdom"
import { CardTemplate, type CardData } from "@/components/CardTemplate"

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

  const captureWithSnapDOM = useCallback(async (element: HTMLElement) => {
    // Element should already be at the target size (1701x2709)
    const snapshot = await snapdom(element, {
      scale: 1,
      width: outputSize.width,
      height: outputSize.height,
      backgroundColor,
      quality,
      embedFonts: true,
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true
        return shouldIncludeNode(node)
      },
    })

    // Get the canvas from SnapDOM
    const sourceCanvas = await snapshot.toCanvas()

    // Create a new canvas with exact target dimensions
    const targetCanvas = document.createElement('canvas')
    targetCanvas.width = outputSize.width
    targetCanvas.height = outputSize.height

    const ctx = targetCanvas.getContext('2d')
    if (!ctx) {
      throw new Error("Failed to get canvas context")
    }

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, outputSize.width, outputSize.height)

    // Draw the source canvas scaled to exact target size
    ctx.drawImage(
      sourceCanvas,
      0, 0, sourceCanvas.width, sourceCanvas.height,
      0, 0, outputSize.width, outputSize.height
    )

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      targetCanvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png', quality)
    })

    if (!blob) {
      throw new Error("Failed to create image blob")
    }

    return blob
  }, [backgroundColor, outputSize.width, outputSize.height, quality, shouldIncludeNode])

  const captureElement = useCallback(async (element: HTMLElement): Promise<Blob | null> => {
    try {
      setIsCapturing(true)
      setError(null)
      await waitForReadyState(element)

      return await captureWithSnapDOM(element)
    } catch (err) {
      console.error("Failed to capture element:", err)
      setError(err instanceof Error ? err.message : "Failed to capture image")
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [captureWithSnapDOM, waitForReadyState])

  /**
   * Capture card from data using the fixed-size template
   * This creates a temporary off-screen element with the card template,
   * captures it, and then cleans up
   */
  const captureCardFromData = useCallback(async (cardData: CardData): Promise<Blob | null> => {
    let container: HTMLDivElement | null = null

    try {
      setIsCapturing(true)
      setError(null)

      // Create a container off-screen with complete style isolation
      container = document.createElement("div")
      container.style.position = "fixed"
      container.style.left = "-9999px"
      container.style.top = "0"
      container.style.width = "1701px"
      container.style.height = "2709px"
      container.style.zIndex = "-1"
      // Reset all CSS custom properties that might contain oklch/lab colors
      container.style.setProperty("--background", "#000000")
      container.style.setProperty("--foreground", "#ffffff")
      container.style.setProperty("--card", "#000000")
      container.style.setProperty("--card-foreground", "#ffffff")
      container.style.setProperty("--border", "#000000")
      container.style.setProperty("--ring", "#000000")
      // Disable all potential Tailwind CSS inheritance
      container.className = ""
      container.setAttribute("data-theme", "none")
      document.body.appendChild(container)

      // Render the CardTemplate into the container
      const root = createRoot(container)

      // Wrap in a promise to wait for rendering
      await new Promise<void>((resolve) => {
        root.render(<CardTemplate data={cardData} />)
        // Give React time to render and images to load
        setTimeout(resolve, 1000)
      })

      // Wait for images and fonts to load
      await waitForReadyState(container)

      // Additional wait to ensure all assets are loaded
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Capture the rendered template
      const blob = await captureWithSnapDOM(container)

      // Cleanup
      root.unmount()

      return blob
    } catch (err) {
      console.error("Failed to capture card from data:", err)
      setError(err instanceof Error ? err.message : "Failed to capture card")
      return null
    } finally {
      // Always cleanup the container
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
      setIsCapturing(false)
    }
  }, [captureWithSnapDOM, waitForReadyState])

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

  const downloadCardImage = useCallback(async (cardData: CardData) => {
    const blob = await captureCardFromData(cardData)
    if (!blob) return false

    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      // Generate filename as id+nickname.png (e.g., "181258+pseudoyu.png")
      const downloadFileName = (cardData as any).id
        ? `${(cardData as any).id}+${cardData.name}.png`
        : `${cardData.name}.png`
      link.download = downloadFileName
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
  }, [captureCardFromData, fileName])

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

  const shareCardImage = useCallback(async (cardData: CardData, shareData?: { title?: string; text?: string }) => {
    if (!canShare) {
      // Fallback to download on desktop
      return downloadCardImage(cardData)
    }

    const blob = await captureCardFromData(cardData)
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
        return downloadCardImage(cardData)
      }
      return false
    }
  }, [canShare, captureCardFromData, downloadCardImage, fileName])

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

  const saveCardToGallery = useCallback(async (cardData: CardData) => {
    // On mobile devices, try different approaches based on the platform
    if (isMobile) {
      // First try the Web Share API for saving to photos
      if (canShare) {
        try {
          const blob = await captureCardFromData(cardData)
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
      const blob = await captureCardFromData(cardData)
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
    return downloadCardImage(cardData)
  }, [isMobile, canShare, captureCardFromData, fileName, downloadCardImage])

  return {
    // Legacy element-based methods (kept for backwards compatibility)
    captureElement,
    downloadImage,
    shareImage,
    saveToGallery,

    // New data-based methods (recommended)
    captureCardFromData,
    downloadCardImage,
    shareCardImage,
    saveCardToGallery,

    // State
    isCapturing,
    error,
    canShare,
    isMobile,
    clearError: () => setError(null)
  }
}
