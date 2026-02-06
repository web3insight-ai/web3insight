"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

// 活动配置数据
const campaigns = [
  {
    id: "monad",
    name: "Monad",
    tagline: "Dev Card",
    description: "Join the Monad ecosystem and showcase your builder identity",
    href: "/monad",
    logo: "/images/monad.svg",
    preview: "/images/monad-mascot.png",
    theme: {
      primary: "#9F8EFF",
      glow: "rgba(131, 110, 249, 0.6)",
      shadow: "0px 12px 32px rgba(131, 110, 249, 0.5)",
      hoverShadow: "0px 20px 48px rgba(131, 110, 249, 0.7)",
      borderGradient: "linear-gradient(to bottom, #FFFFFF, #927EFF)",
      bg: "#090111",
    },
  },
  {
    id: "mantle",
    name: "Mantle",
    tagline: "Dev Card",
    description: "Build on Mantle and prove your contribution to the ecosystem",
    href: "/mantle",
    logo: "/images/mantle-logo.svg",
    preview: "/images/mantle-card-bg.svg",
    theme: {
      primary: "#5EEAD4",
      glow: "rgba(94, 234, 212, 0.4)",
      shadow: "0px 12px 32px rgba(94, 234, 212, 0.4)",
      hoverShadow: "0px 20px 48px rgba(94, 234, 212, 0.6)",
      borderGradient: "linear-gradient(to bottom, #5EEAD4, #5EEAD4)",
      bg: "#0a0f0f",
    },
  },
  {
    id: "openbuild",
    name: "OpenBuild",
    tagline: "Dev Card",
    description: "Join the OpenBuild community and showcase your Web3 builder identity",
    href: "/openbuild",
    logo: "/images/openbuild-logo.svg",
    preview: "/images/openbuild-card-bg.jpg",
    theme: {
      primary: "#01DB83",
      glow: "rgba(1, 219, 131, 0.4)",
      shadow: "0px 12px 32px rgba(1, 219, 131, 0.4)",
      hoverShadow: "0px 20px 48px rgba(1, 219, 131, 0.6)",
      borderGradient: "linear-gradient(to bottom, #01DB83, #01DB83)",
      bg: "#001d15",
    },
  },
]

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function Home() {
  return (
    <motion.div
      className="min-h-dvh bg-black text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-black to-emerald-950/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center min-h-dvh px-4 py-8 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header className="flex flex-col items-center mb-8 md:mb-12" variants={itemVariants}>
          <div className="flex items-center gap-2 mb-6">
            <Image
              src="/images/web3insight_logo.svg"
              alt="Web3Insight"
              width={120}
              height={28}
              className="h-6 md:h-7 w-auto"
            />
            <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
            <Image
              src="/images/openbuild-logo.svg"
              alt="OpenBuild"
              width={100}
              height={24}
              className="h-5 md:h-6 w-auto"
            />
          </div>
        </motion.header>

        {/* Main Title */}
        <motion.div className="text-center mb-10 md:mb-14" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-violet-400 via-white to-emerald-400 bg-clip-text text-transparent">
              Dev Card
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto">
            Not just a profile — it&apos;s your proof of build
          </p>
        </motion.div>

        {/* Campaign Cards */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12 w-full max-w-5xl flex-wrap"
          variants={itemVariants}
        >
          {campaigns.map((campaign, index) => (
            <Link key={campaign.id} href={campaign.href} className="group">
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + index * 0.15,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {/* Card */}
                <motion.div
                  className="relative w-[200px] h-[316px] md:w-[220px] md:h-[348px] rounded-[22px] overflow-hidden cursor-pointer"
                  style={{
                    border: "2px solid transparent",
                    backgroundImage: `linear-gradient(${campaign.theme.bg}, ${campaign.theme.bg}), ${campaign.theme.borderGradient}`,
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    boxShadow: campaign.theme.shadow,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -12,
                    boxShadow: campaign.theme.hoverShadow,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Card Header */}
                  <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 z-10">
                    <Image
                      src={campaign.logo}
                      alt={campaign.name}
                      width={70}
                      height={18}
                      className="h-4 w-auto"
                    />
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[7px] text-gray-400 mb-0.5">Powered by</p>
                      <Image
                        src="/images/web3insight_logo.svg"
                        alt="Web3Insight"
                        width={60}
                        height={12}
                        className="h-2.5 w-auto opacity-80"
                      />
                    </div>
                  </div>

                  {/* Card Preview Image */}
                  <Image
                    src={campaign.preview}
                    alt={`${campaign.name} preview`}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Campaign Info */}
                <motion.div
                  className="mt-5 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.15, duration: 0.5 }}
                >
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1"
                    style={{ color: campaign.theme.primary }}
                  >
                    {campaign.name}
                  </h2>
                  <p className="text-gray-500 text-sm">{campaign.tagline}</p>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-auto pt-10 md:pt-16 text-center"
          variants={itemVariants}
        >
          <p className="text-gray-600 text-xs">
            Select a campaign to create your Dev Card
          </p>
        </motion.footer>
      </motion.div>
    </motion.div>
  )
}
