"use client"

import type React from "react"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

const BUILDING_ON_OPTIONS = ["Monad", "Starknet", "Ethereum", "DeFiHackLabs", "Hardhat", "WTF.Academy", "OpenBuild"]

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "dev"
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    avatar: "/images/user-avatar-sample.png",
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
    // Generate a simple user ID (in production, this would come from backend)
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    router.push(`/monad/card/${userId}`)
  }

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col overflow-auto relative">
      <div className="absolute top-0 left-0 right-0 h-[100px] md:h-[120px] z-0">
        <Image
          src="/images/bg-synthwave.jpeg"
          alt="Synthwave background"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
      </div>

      <header className="shrink-0 relative z-20 flex items-center justify-center gap-1.5 md:gap-2 py-5 md:py-6">
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
      </header>

      <div className="flex-1 relative z-10 bg-black rounded-t-3xl -mt-2 flex flex-col items-center px-4 py-8 md:py-10">
        <div className="w-full max-w-[340px] flex flex-col max-h-[calc(100dvh-140px)] justify-center">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-5">Create Dev Card</h1>

          {/* Avatar + Name/Github row */}
          <div className="flex gap-3 mb-3">
            {/* Avatar */}
            <div className="flex flex-col">
              <label className="text-sm text-white mb-1.5 font-medium">
                Avatar <span className="text-red-400">*</span>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <button
                onClick={handleAvatarClick}
                className="w-[110px] h-[110px] bg-black/60 rounded-xl border-2 hover:border-[#9F8EFF] transition-colors overflow-hidden"
                style={{ borderColor: '#9F8EFF50' }}
              >
                <Image
                  src={formData.avatar || "/images/user-avatar-sample.png"}
                  alt="Avatar preview"
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>

            {/* Name + Github */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <label className="block text-sm text-white mb-1.5 font-medium">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1.5 font-medium">
                  Github <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div className="mb-3">
            <label className="block text-sm text-white mb-1.5 font-medium">
              Twitter <span className="text-red-400">*</span>
            </label>
            <input
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
            />
          </div>

          {/* Title */}
          <div className="mb-3">
            <label className="block text-sm text-white mb-1.5 font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
              placeholder="Your title"
            />
          </div>

          {/* Bio */}
          <div className="mb-3">
            <label className="block text-sm text-white mb-1.5 font-medium">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF] resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Building on */}
          <div className="mb-4">
            <label className="block text-sm text-white mb-2 font-medium">Building on</label>
            <div className="flex flex-wrap gap-2">
              {BUILDING_ON_OPTIONS.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleBuildingOn(item)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2"
                  style={{
                    borderColor: formData.buildingOn.includes(item) ? '#9F8EFF' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            className="w-full h-12 px-9 py-2 rounded-[50px] shadow-[0px_0px_10px_0px_rgba(159,142,255,0.50)] outline outline-2 outline-offset-[-2px] outline-indigo-300 inline-flex justify-center items-center gap-2.5 mt-auto mb-4 hover:shadow-[0px_0px_20px_0px_rgba(159,142,255,0.70)] hover:-translate-y-0.5 transition-all"
            style={{
              background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
            }}
          >
            <span className="text-center text-white text-base font-bold leading-7" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Create
            </span>
          </button>
        </div>
      </div>
    </div>
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
