"use client"

import { useEffect, useState, useRef } from "react"
import { useInView, type UseInViewOptions } from "framer-motion"

interface UseAnimatedNumberOptions {
  /** Animation duration in milliseconds (default: 1000) */
  duration?: number
  /** Whether to wait for element to be in viewport (default: false) */
  waitForInView?: boolean
  /** Margin for intersection observer (default: "-10% 0px -10% 0px") */
  inViewMargin?: UseInViewOptions["margin"]
}

interface UseAnimatedNumberResult {
  /** Current display value during animation */
  displayValue: number
  /** Whether animation is still in progress */
  isAnimating: boolean
  /** Ref to attach to container element (required for waitForInView) */
  ref: React.RefObject<HTMLDivElement | null>
  /** Whether element is in view (always true if waitForInView is false) */
  isInView: boolean
}

/**
 * Hook for animating a number from 0 to target value.
 * Supports optional viewport detection for triggering animation on scroll.
 *
 * @example
 * // Basic usage
 * const { displayValue, ref } = useAnimatedNumber(1000)
 *
 * @example
 * // With viewport detection
 * const { displayValue, ref, isInView } = useAnimatedNumber(1000, {
 *   waitForInView: true,
 *   duration: 2000
 * })
 */
export function useAnimatedNumber(
  targetValue: number,
  isLoading: boolean = false,
  options: UseAnimatedNumberOptions = {}
): UseAnimatedNumberResult {
  const { duration = 1000, waitForInView = false, inViewMargin } = options

  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  // useInView returns boolean directly when ref is provided
  const isInViewResult = useInView(ref, { once: true, margin: inViewMargin })
  const isInView = waitForInView ? isInViewResult : true

  useEffect(() => {
    // Reset when loading
    if (isLoading) {
      setDisplayValue(0)
      setIsAnimating(false)
      hasAnimated.current = false
      return
    }

    // Don't animate if not in view yet
    if (!isInView) return

    // Handle zero value
    if (targetValue === 0) {
      setDisplayValue(0)
      hasAnimated.current = true
      return
    }

    // Skip if already animated
    if (hasAnimated.current || targetValue <= 0) return
    hasAnimated.current = true
    setIsAnimating(true)

    const steps = 60
    const increment = targetValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetValue) {
        setDisplayValue(targetValue)
        setIsAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [targetValue, isLoading, isInView, duration])

  return { displayValue, isAnimating, ref, isInView }
}

/**
 * Format a number with locale-specific separators.
 * @example formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num)
}
