/**
 * Custom hook for triggering animations when elements come into view
 */

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface UseAnimationInViewOptions {
  /**
   * Trigger animation only once
   * @default true
   */
  once?: boolean;

  /**
   * Amount of element that must be visible (0-1)
   * @default 0.3
   */
  amount?: number;

  /**
   * Margin around the viewport
   * @default "0px"
   */
  margin?: string;

  /**
   * Delay before animation starts (ms)
   * @default 0
   */
  delay?: number;
}

/**
 * Hook to animate elements when they come into view
 * Returns ref to attach to element and whether element is in view
 */
export function useAnimationInView(options: UseAnimationInViewOptions = {}) {
  const { once = true, amount = 0.3, margin = "0px", delay = 0 } = options;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount, margin });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldAnimate(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShouldAnimate(true);
      }
    }
  }, [isInView, delay]);

  return { ref, isInView: shouldAnimate };
}

