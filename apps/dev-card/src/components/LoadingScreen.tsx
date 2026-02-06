"use client"

import Image from "next/image"
import { motion } from "framer-motion"

type LoadingVariant = "monad" | "mantle" | "openbuild"

interface LoadingScreenProps {
  message?: string
  variant?: LoadingVariant
}

const variantConfig = {
  monad: {
    icon: "/images/monad-icon.svg",
    alt: "Monad",
    glowColor: "rgba(111, 84, 255, 0.4)",
    dropShadowBase: "drop-shadow(0 0 20px rgba(111,84,255,0.6))",
    dropShadowPeak: "drop-shadow(0 0 30px rgba(111,84,255,0.9))",
  },
  mantle: {
    icon: "/images/mantle-logo-white.png",
    alt: "Mantle",
    glowColor: "rgba(94, 234, 212, 0.4)",
    dropShadowBase: "drop-shadow(0 0 20px rgba(94,234,212,0.6))",
    dropShadowPeak: "drop-shadow(0 0 30px rgba(94,234,212,0.9))",
  },
  openbuild: {
    icon: "/images/openbuild-icon.svg",
    alt: "OpenBuild",
    glowColor: "rgba(1, 219, 131, 0.4)",
    dropShadowBase: "drop-shadow(0 0 20px rgba(1,219,131,0.6))",
    dropShadowPeak: "drop-shadow(0 0 30px rgba(1,219,131,0.9))",
  },
}

export default function LoadingScreen({ message, variant = "monad" }: LoadingScreenProps) {
  const config = variantConfig[variant]

  return (
    <motion.div
      className="min-h-screen bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-white text-center relative">
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div
            className="w-40 h-40 rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              filter: 'blur(20px)'
            }}
          />
        </motion.div>

        {/* Logo with float animation */}
        <motion.div
          className="mb-3 relative inline-block"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            animate={{
              filter: [
                config.dropShadowBase,
                config.dropShadowPeak,
                config.dropShadowBase
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src={config.icon}
              alt={config.alt}
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </motion.div>
        </motion.div>

        {/* Loading status text */}
        {message && (
          <motion.div
            className="text-sm text-gray-400 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
            transition={{
              opacity: { duration: 1.5, repeat: Infinity },
              y: { duration: 0.5 }
            }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
