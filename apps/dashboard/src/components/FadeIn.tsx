"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/utils/animations";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * FadeIn component using Framer Motion
 * Smoothly fades in content with optional delay
 */
export default function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.3,
}: FadeInProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
