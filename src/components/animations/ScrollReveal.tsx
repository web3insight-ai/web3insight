"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useAnimationInView } from "@/hooks/useAnimationInView";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/utils/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /**
   * Animation direction
   * @default "up"
   */
  direction?: "up" | "down" | "left" | "right";
  /**
   * Delay before animation starts (ms)
   * @default 0
   */
  delay?: number;
  /**
   * Trigger animation only once
   * @default true
   */
  once?: boolean;
  /**
   * Amount of element visible before triggering (0-1)
   * @default 0.3
   */
  amount?: number;
}

/**
 * Reveals content with animation when scrolled into view
 */
export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const { ref, isInView } = useAnimationInView({ once, amount, delay });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getVariants = () => {
    switch (direction) {
    case "left":
      return fadeInLeft;
    case "right":
      return fadeInRight;
    case "up":
    default:
      return fadeInUp;
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

