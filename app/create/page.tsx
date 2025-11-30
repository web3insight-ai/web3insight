"use client"

import type React from "react"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

const BUILDING_ON_OPTIONS = ["Monad", "Starknet", "Ethereum", "DeFiHackLabs", "Hardhat", "WTF.Academy", "OpenBuild"]

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "dev"
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    avatar: "/images/monad-icon.svg",
    name: "",
    github: "",
    twitter: "",
    title: "",
    bio: "",
    buildingOn: [] as string[],
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleBuildingOn = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      buildingOn: prev.buildingOn.includes(item)
        ? prev.buildingOn.filter((i) => i !== item)
        : [...prev.buildingOn, item],
    }))
  }

  const handleCreate = () => {
    const params = new URLSearchParams({
      type,
      name: formData.name,
      github: formData.github,
      twitter: formData.twitter,
      title: formData.title,
      bio: formData.bio,
      buildingOn: formData.buildingOn.join(","),
      avatar: formData.avatar,
    })
    router.push(`/card?${params.toString()}`)
  }

  return (
    <motion.div
      className="min-h-dvh bg-black text-white flex flex-col overflow-auto relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-[100px] md:h-[120px] z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Image
          src="/images/bg-synthwave.jpeg"
          alt="Synthwave background"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
      </motion.div>

      <motion.header
        className="shrink-0 relative z-20 flex items-center justify-center gap-1.5 md:gap-2 py-5 md:py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Image src="/images/monad.svg" alt="MONAD" width={80} height={20} className="h-4 md:h-5 w-auto" />
        <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
        <Image src="/images/openbuild-logo.svg" alt="OpenBuild" width={80} height={20} className="h-4 md:h-5 w-auto" />
        <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
        <Image
          src="/images/web3insight_logo.svg"
          alt="web3insight"
          width={80}
          height={20}
          className="h-4 md:h-5 w-auto"
        />
      </motion.header>

      <div className="flex-1 relative z-10 bg-black rounded-t-3xl -mt-2 flex flex-col items-center px-4 py-8 md:py-10">
        <motion.div
          className="w-full max-w-[340px] flex flex-col max-h-[calc(100dvh-140px)] justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-xl md:text-2xl font-bold text-center mb-5">Create Dev Card</h1>

          {/* Avatar + Name/Github row */}
          <motion.div
            className="flex gap-3 mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Avatar */}
            <div className="flex flex-col">
              <label className="text-sm text-white mb-1.5 font-medium">
                Avatar <span className="text-red-400">*</span>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <motion.button
                onClick={handleAvatarClick}
                className="w-[110px] h-[110px] bg-black/60 rounded-xl border-2 overflow-hidden"
                style={{ borderColor: '#9F8EFF50' }}
                whileHover={{ borderColor: '#9F8EFF', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={formData.avatar || "/images/monad-icon.svg"}
                  alt="Avatar preview"
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            </div>

            {/* Name + Github */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <label className="block text-sm text-white mb-1.5 font-medium">
                  Name <span className="text-red-400">*</span>
                </label>
                <motion.input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
                  placeholder="Your name"
                  whileFocus={{ scale: 1.02, borderColor: '#9F8EFF' }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1.5 font-medium">
                  Github <span className="text-red-400">*</span>
                </label>
                <motion.input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
                  placeholder="@username"
                  whileFocus={{ scale: 1.02, borderColor: '#9F8EFF' }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Twitter */}
          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm text-white mb-1.5 font-medium">
              Twitter <span className="text-red-400">*</span>
            </label>
            <motion.input
              type="text"
              value={formData.twitter}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  twitter: e.target.value,
                }))
              }
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
              placeholder="@username"
              whileFocus={{ scale: 1.02, borderColor: '#9F8EFF' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Title */}
          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm text-white mb-1.5 font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <motion.input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
              placeholder="Your title"
              whileFocus={{ scale: 1.02, borderColor: '#9F8EFF' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-sm text-white mb-1.5 font-medium">Bio</label>
            <motion.textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF] resize-none"
              placeholder="Tell us about yourself..."
              whileFocus={{ scale: 1.02, borderColor: '#9F8EFF' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Building on */}
          <motion.div
            className="mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <label className="block text-sm text-white mb-2 font-medium">Building on</label>
            <div className="flex flex-wrap gap-2">
              {BUILDING_ON_OPTIONS.map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => toggleBuildingOn(item)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border-2"
                  style={{
                    borderColor: formData.buildingOn.includes(item) ? '#9F8EFF' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + index * 0.05, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Create button */}
          <motion.button
            onClick={handleCreate}
            className="w-full h-12 px-9 py-2 rounded-[50px] shadow-[0px_0px_10px_0px_rgba(159,142,255,0.50)] outline outline-2 outline-offset-[-2px] outline-indigo-300 inline-flex justify-center items-center gap-2.5 mt-auto mb-4"
            style={{
              background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2, boxShadow: "0px 0px 20px 0px rgba(159,142,255,0.70)" }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-center text-white text-base font-bold leading-7" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Create
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <CreateForm />
    </Suspense>
  )
}
