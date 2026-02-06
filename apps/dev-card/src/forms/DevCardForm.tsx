"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useDevCardForm } from "./hooks/useDevCardForm"
import LoadingScreen from "@/components/LoadingScreen"
import type { Ecosystem } from "@/schemas/auth.schema"

interface DevCardFormProps {
  ecosystem: Ecosystem
}

// Theme configuration for each ecosystem
const themeConfig = {
  monad: {
    accentColor: "#9F8EFF",
    gradient: "linear-gradient(to right, #5EEAD4, #9F8EFF)",
    shadow: "0px 0px 10px 0px rgba(159,142,255,0.50)",
    hoverShadow: "0px 0px 20px 0px rgba(159,142,255,0.70)",
    outlineColor: "indigo-300",
    defaultIcon: "/images/monad-icon.svg",
    headerBg: "/images/bg-synthwave.jpeg",
    logos: [
      { src: "/images/monad.svg", alt: "MONAD" },
      { src: "/images/seperator.svg", alt: "", isSeparator: true },
      { src: "/images/openbuild-logo.svg", alt: "OpenBuild" },
      { src: "/images/seperator.svg", alt: "", isSeparator: true },
      { src: "/images/web3insight_logo.svg", alt: "web3insight" },
    ],
    placeholder: "BuilderHero @Monad",
  },
  mantle: {
    accentColor: "#5EEAD4",
    gradient: "#65B3AF99",
    shadow: "0px 0px 10px 0px rgba(94,234,212,0.50)",
    hoverShadow: "0px 0px 20px 0px rgba(94,234,212,0.70)",
    outlineColor: "teal-300",
    defaultIcon: "/images/mantle-icon.png",
    headerBg: "/images/mantle-homepage-bg.svg",
    logos: [
      { src: "/images/mantle-logo.svg", alt: "Mantle" },
      { src: "/images/seperator.svg", alt: "", isSeparator: true },
      { src: "/images/openbuild-logo.svg", alt: "OpenBuild" },
      { src: "/images/seperator.svg", alt: "", isSeparator: true },
      { src: "/images/web3insight_logo.svg", alt: "web3insight" },
    ],
    placeholder: "BuilderHero @Mantle",
  },
  openbuild: {
    accentColor: "#01DB83",
    gradient: "#01a36399",
    shadow: "0px 0px 10px 0px rgba(1,219,131,0.50)",
    hoverShadow: "0px 0px 20px 0px rgba(1,219,131,0.70)",
    outlineColor: "green-400",
    defaultIcon: "/images/openbuild-icon.svg",
    headerBg: "/images/openbuild-homepage-bg.png",
    logos: [
      { src: "/images/openbuild-logo.svg", alt: "OpenBuild" },
      { src: "/images/seperator.svg", alt: "", isSeparator: true },
      { src: "/images/web3insight_logo.svg", alt: "web3insight" },
    ],
    placeholder: "BuilderHero @OpenBuild",
  },
}

export function DevCardForm({ ecosystem }: DevCardFormProps) {
  const [twitterConnected, setTwitterConnected] = useState(false)

  const theme = themeConfig[ecosystem]

  const {
    form,
    onSubmit,
    isLoading,
    isSubmitting,
    isConnectingTwitter,
    buildingOnOptions,
    isDev,
    baseEcosystem,
    authenticated,
    connectTwitter,
    toggleBuildingOn,
    inviteCodeLocked,
    isUpdate,
    connectOpenBuild,
    isBindingOpenBuild,
    openbuildBound,
  } = useDevCardForm({ ecosystem })

  const {
    register,
    formState: { errors },
    watch,
  } = form

  // Single watch call to avoid multiple subscriptions causing redundant re-renders
  const {
    avatar: avatarValue,
    twitter: twitterValue,
    title: titleValue,
    bio: bioValue,
    buildingOn: buildingOnValue,
    inviteCode: inviteCodeValue,
  } = watch()

  // Handle Twitter connect
  const handleConnectTwitter = async () => {
    const success = await connectTwitter()
    setTwitterConnected(success)
  }

  if (isLoading) {
    return (
      <LoadingScreen
        variant={ecosystem}
        message={authenticated ? "Loading your ecosystem data..." : undefined}
      />
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <motion.div
      className={`min-h-dvh bg-black text-white flex flex-col relative ${ecosystem === 'mantle' ? 'pt-9' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Header with Background */}
      <motion.div
        className="sticky top-0 z-30 bg-black"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="relative h-[80px] md:h-[100px]">
          <Image
            src={theme.headerBg}
            alt="Background"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
        </div>
        <header className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 z-10">
          {theme.logos.map((logo, index) => (
            <Image
              key={index}
              src={logo.src}
              alt={logo.alt}
              width={80}
              height={20}
              className={logo.isSeparator ? "h-2.5 w-auto opacity-50" : "h-4 md:h-5 w-auto"}
            />
          ))}
        </header>
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-black overflow-auto">
        <div className="flex flex-col items-center px-4 py-6 min-h-full">
          <motion.form
            onSubmit={onSubmit}
            className="w-full max-w-[340px] flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-center mb-6">{isUpdate ? "Update" : "Create"} Dev Card</h1>

            {/* Avatar + Name/Github row */}
            <motion.div
              className="flex gap-3 mb-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Avatar */}
              <div className="flex flex-col">
                <label className="text-sm text-white mb-1.5 font-medium">
                  Avatar
                </label>
                <div
                  className="w-[110px] h-[110px] bg-black/60 rounded-xl border-2 overflow-hidden"
                  style={{ borderColor: `${theme.accentColor}50` }}
                >
                  <Image
                    src={avatarValue && avatarValue.trim() !== "" ? avatarValue : theme.defaultIcon}
                    alt="Avatar preview"
                    width={110}
                    height={110}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = theme.defaultIcon
                    }}
                  />
                </div>
              </div>

              {/* Name + Github */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <label className="block text-sm text-white mb-1.5 font-medium">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <motion.input
                    type="text"
                    {...register("name")}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none"
                    style={{ ["--tw-ring-color" as string]: theme.accentColor }}
                    placeholder="Your name"
                    whileFocus={{ scale: 1.02, borderColor: theme.accentColor }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {errors.name && (
                    <span className="text-red-400 text-xs">{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-white mb-1.5 font-medium">
                    Github <span className="text-red-400">*</span>
                  </label>
                  <motion.input
                    type="text"
                    {...register("github")}
                    disabled={isDev}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="@username"
                    whileFocus={{ scale: 1.02, borderColor: theme.accentColor }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {errors.github && (
                    <span className="text-red-400 text-xs">{errors.github.message}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Twitter */}
            <motion.div
              className="mb-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm text-white mb-1.5 font-medium">
                Twitter
                {!isDev && <span className="text-red-400 ml-1">*</span>}
              </label>
              <div className="relative">
                <motion.input
                  type="text"
                  {...register("twitter")}
                  onChange={(e) => {
                    form.setValue("twitter", e.target.value)
                    setTwitterConnected(false)
                  }}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 pr-28 text-white text-sm placeholder-gray-500 focus:outline-none"
                  placeholder="@username"
                  whileFocus={{ scale: 1.02, borderColor: theme.accentColor }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.button
                  type="button"
                  onClick={handleConnectTwitter}
                  disabled={isConnectingTwitter || !twitterValue || twitterConnected}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: theme.accentColor }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isConnectingTwitter ? "Connecting" : twitterConnected ? "Connected" : "Connect"}
                </motion.button>
              </div>
              {errors.twitter && (
                <span className="text-red-400 text-xs">{errors.twitter.message}</span>
              )}
            </motion.div>

            {/* OpenBuild Connect - only for openbuild ecosystem */}
            {ecosystem === "openbuild" && (
              <motion.div
                className="mb-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <label className="block text-sm text-white mb-1.5 font-medium">
                  OpenBuild
                </label>
                <div className="relative">
                  <div
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 pr-28 text-white text-sm flex items-center"
                    style={{ minHeight: "38px" }}
                  >
                    {openbuildBound ? (
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Account linked
                      </span>
                    ) : isBindingOpenBuild ? (
                      <span className="text-gray-500">Binding...</span>
                    ) : (
                      <span className="text-gray-500">Connect your OpenBuild account</span>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    onClick={connectOpenBuild}
                    disabled={isBindingOpenBuild || openbuildBound}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: theme.accentColor }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isBindingOpenBuild ? "Binding..." : openbuildBound ? "Connected" : "Connect"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Title */}
            <motion.div
              className="mb-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm text-white font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-gray-400">{titleValue?.length || 0}/25</span>
              </div>
              <motion.input
                type="text"
                {...register("title")}
                maxLength={25}
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none"
                placeholder={theme.placeholder}
                whileFocus={{ scale: 1.02, borderColor: theme.accentColor }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {errors.title && (
                <span className="text-red-400 text-xs">{errors.title.message}</span>
              )}
            </motion.div>

            {/* Bio */}
            <motion.div
              className="mb-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm text-white font-medium">
                  Bio <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-gray-400">{bioValue?.length || 0}/100</span>
              </div>
              <motion.textarea
                {...register("bio")}
                rows={4}
                maxLength={100}
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none resize-none"
                placeholder="Share your bio (max 100 chars)"
                whileFocus={{ scale: 1.02, borderColor: theme.accentColor }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {errors.bio && <span className="text-red-400 text-xs">{errors.bio.message}</span>}
            </motion.div>

            {/* Building on */}
            <AnimatePresence>
              {buildingOnOptions.length > 0 && (
                <motion.div
                  className="mb-4"
                  initial={{ x: -20, opacity: 0, height: 0 }}
                  animate={{ x: 0, opacity: 1, height: "auto" }}
                  exit={{ x: -20, opacity: 0, height: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <label className="block text-sm text-white mb-2 font-medium">
                    Building on
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      (Selected: {buildingOnValue?.length || 0}/6)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {buildingOnOptions.map((item, index) => {
                      const isSelected = buildingOnValue?.includes(item)
                      const isBase = item === baseEcosystem
                      const canSelect = isSelected || (buildingOnValue?.length || 0) < 6

                      return (
                        <motion.button
                          key={item}
                          type="button"
                          onClick={() => toggleBuildingOn(item)}
                          disabled={!canSelect && !isSelected}
                          className="px-3 py-1.5 rounded-full text-sm font-medium outline outline-1 outline-offset-[-1px]"
                          style={{
                            outlineColor: isSelected ? theme.accentColor : "rgba(255,255,255,0.1)",
                            color: "white",
                            opacity: isSelected ? 1 : canSelect ? 0.7 : 0.3,
                            cursor:
                              isBase && isSelected
                                ? "not-allowed"
                                : canSelect || isSelected
                                  ? "pointer"
                                  : "not-allowed",
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: isSelected ? 1 : canSelect ? 0.7 : 0.3,
                          }}
                          transition={{ delay: 0.8 + index * 0.05, type: "spring", stiffness: 200 }}
                          whileHover={canSelect ? { scale: 1.05 } : {}}
                          whileTap={canSelect ? { scale: 0.95 } : {}}
                        >
                          {item}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invite Code */}
            <motion.div
              className="mb-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <label className="block text-sm text-white mb-1.5 font-medium">
                Invite Code
                <span className="ml-2 text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <motion.input
                type="text"
                {...register("inviteCode")}
                disabled={inviteCodeLocked}
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter invite code"
                whileFocus={inviteCodeLocked ? {} : { scale: 1.02, borderColor: theme.accentColor }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {inviteCodeLocked && inviteCodeValue && (
                <span className="text-xs text-gray-400 mt-1 block">
                  Invite code is locked after first save
                </span>
              )}
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {errors.root && (
                <motion.div
                  className="text-red-400 text-sm text-center mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.root.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Create button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 px-9 py-2 rounded-[50px] outline outline-2 outline-offset-[-2px] inline-flex justify-center items-center gap-2.5 mt-6 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: theme.gradient,
                boxShadow: theme.shadow,
                outlineColor: theme.accentColor,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: theme.hoverShadow,
                background: ecosystem === "mantle" ? "#65B3AF" : ecosystem === "openbuild" ? "#01a363" : undefined,
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className="text-center text-white text-base font-bold leading-7"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {isSubmitting ? (isUpdate ? "Updating..." : "Creating...") : (isUpdate ? "Update" : "Create")}
              </span>
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.div>
  )
}
