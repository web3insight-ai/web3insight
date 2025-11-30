"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cardHover, scaleIn } from "@/utils/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
  delay?: number;
}

/**
 * Animated card component with entrance and hover effects
 */
export function AnimatedCard({
  children,
  hoverEffect = true,
  className = "",
  delay = 0,
  ...props
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      {...(hoverEffect && {
        initial: "rest",
        whileHover: "hover",
        whileTap: "tap",
        variants: cardHover,
      })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

