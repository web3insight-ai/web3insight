"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import { motion } from "framer-motion"

export default function ConnectPage() {
  const router = useRouter()
  const { login, ready, authenticated } = usePrivy()

  // Initialize and save user type to localStorage on mount (always dev for Mantle)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', 'dev')
    }
  }, [])

  // Redirect to create page if already logged in (returning user)
  // New logins will be handled by PrivyAuthSync after backend auth completes
  useEffect(() => {
    if (ready && authenticated) {
      // Only redirect returning users, not new logins
      // New logins have redirectToCreate flag set and will be handled by PrivyAuthSync
      const isNewLogin = typeof window !== 'undefined' && localStorage.getItem('redirectToCreate') === 'true'
      if (!isNewLogin) {
        router.push('/mantle/create')
      }
    }
  }, [ready, authenticated, router])

  const handleConnect = async () => {
    if (ready) {
      // Set flag to redirect to create page after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectToCreate', 'true')
        localStorage.setItem('redirectEcosystem', 'mantle')
      }
      // Trigger Privy login
      login()
    }
  }

  return (
    <motion.div
      className="min-h-dvh bg-black text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Image src="/images/mantle-homepage-bg.svg" alt="Mantle background" fill className="object-cover" priority />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center min-h-dvh px-4 py-6 md:py-8">
        {/* Header logos */}
        <motion.header
          className="flex items-center justify-center gap-1.5 md:gap-2 mb-4 md:mb-2 mt-2 md:mt-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Image src="/images/mantle-logo.svg" alt="MANTLE" width={80} height={20} className="h-4 md:h-5 w-auto" />
          <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
          <Image
            src="/images/openbuild-logo.svg"
            alt="OpenBuild"
            width={80}
            height={20}
            className="h-4 md:h-5 w-auto"
          />
          <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
          <Image
            src="/images/web3insight_logo.svg"
            alt="web3insight"
            width={80}
            height={20}
            className="h-4 md:h-5 w-auto"
          />
        </motion.header>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Title section */}
          <motion.div
            className="text-center mb-6 md:mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="block md:inline">Mantle</span>
              <span className="block md:inline md:ml-4">Dev Card</span>
            </h1>
            <p className="mt-3 md:mt-3 text-white text-lg md:text-xl font-medium">
              {"Not just a profile—it's your proof of build"}
            </p>
          </motion.div>

          {/* Card, button, and footer text grouped together */}
          <motion.div
            className="flex flex-col items-center gap-4 md:gap-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <motion.div
              className="w-[190px] h-[300px] md:w-[174px] md:h-[276px] lg:w-[200px] lg:h-[316px] rounded-[22px] shadow-[0px_18px_24px_12px_rgba(94,234,212,0.40)] overflow-hidden relative"
              style={{
                border: "2px solid #5EEAD4",
                background: "#000",
              }}
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Card header with logos */}
              <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3 z-10">
                <Image
                  src="/images/mantle-logo.svg"
                  alt="MANTLE"
                  width={60}
                  height={16}
                  className="h-3 w-auto"
                />
                <div className="text-right flex flex-col items-end">
                  <p className="text-[6px] text-gray-400 mb-0.5">Powered by</p>
                  <Image
                    src="/images/web3insight_logo.svg"
                    alt="Web3insight.ai"
                    width={60}
                    height={10}
                    className="h-2.5 w-auto"
                  />
                </div>
              </div>
              <Image
                src="/images/mantle-card-bg.svg"
                alt="Mantle card"
                width={232}
                height={368}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.button
              onClick={handleConnect}
              className="px-6 py-2 bg-slate-400/40 rounded-xl inline-flex justify-center items-center gap-2"
              whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(148, 163, 184, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-center text-white text-sm font-semibold leading-normal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {!ready ? "Loading..." : "Connect  Github"}
              </span>
            </motion.button>

            <motion.p
              className="text-center text-white text-xs font-medium leading-5 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {"We'll analyze your repos, lines of code, and vibes."}
              <br />
              {"Nothing sensitive. Only public data."}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
