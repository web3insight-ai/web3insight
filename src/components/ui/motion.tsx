"use client"

import { ReactNode, useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

const easeOutExpo = [0.22, 1, 0.36, 1]

export const fadeInUp = (delay = 0, y = 24): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo, delay },
  },
})

export const stagger = (staggerChildren = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
})

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  once?: boolean
  margin?: string
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
  once = true,
  margin = "-10% 0px -10% 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, ease: easeOutExpo, delay }}
    >
      {children}
    </motion.div>
  )
}
