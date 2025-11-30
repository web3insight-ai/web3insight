"use client";

import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerContainerFast,
  staggerItem,
} from "@/utils/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Stagger delay between items (seconds)
   * @default 0.1
   */
  staggerDelay?: number;
  /**
   * Use fast stagger (0.05s)
   */
  fast?: boolean;
}

/**
 * Container for staggered list animations
 * Wraps children with motion.div for individual animations
 */
export function AnimatedList({
  children,
  className = "",
  staggerDelay,
  fast = false,
}: AnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = fast ? staggerContainerFast : staggerContainer;

  // Override stagger delay if provided
  if (staggerDelay) {
    variants.visible = {
      ...variants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    };
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Individual item in an AnimatedList
 */
export function AnimatedListItem({
  children,
  className = "",
}: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

