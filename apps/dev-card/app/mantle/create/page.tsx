"use client"

import type React from "react"

import { useState, useRef, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { updateUserProfileByEcosystem } from "@/services/auth"
import { getUserEcosystems, getBuildingOnOptions, type UserEcosystemData } from "@/services/ecosystem"
import LoadingScreen from "@/components/LoadingScreen"

function CreateForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    user,
    loading: authLoading,
    authenticated,
    getDisplayAvatar,
    getDisplayName,
    getGithubUsername,
    getEmail,
    privyUser,
  } = useAuth({ ecosystem: "mantle" })

  const [formData, setFormData] = useState({
    avatar: "",
    name: "",
    github: "",
    twitter: "",
    title: "",
    bio: "",
    buildingOn: ["Mantle"] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectingTwitter, setConnectingTwitter] = useState(false)
  const [twitterConnected, setTwitterConnected] = useState(false)

  // 生态系统相关状态 - 初始为空，只有获取到真实数据才显示
  const [buildingOnOptions, setBuildingOnOptions] = useState<string[]>([])
  const [userEcosystems, setUserEcosystems] = useState<string[]>([])
  const [loadingEcosystems, setLoadingEcosystems] = useState(false)
  const [ecosystemsLoaded, setEcosystemsLoaded] = useState(false)

  useEffect(() => {
    if (authenticated) {
      // Avatar priority: Twitter > GitHub > Mantle Icon
      let finalAvatar = ""

      // 1. Check if API has a Twitter avatar (from previous Connect Twitter)
      const apiAvatar = user?.user_avatar
      const isTwitterAvatar = apiAvatar && (apiAvatar.includes('pbs.twimg.com') || apiAvatar.includes('twimg.com'))
      const isValidApiAvatar = apiAvatar && apiAvatar !== '/images/mantle-icon.png'

      if (isTwitterAvatar) {
        // Use Twitter avatar if it exists in API
        finalAvatar = apiAvatar
      } else if (isValidApiAvatar) {
        // Use any other valid avatar from API (could be custom upload)
        finalAvatar = apiAvatar
      } else {
        // 2. Fall back to GitHub avatar from Privy
        const privyAvatar = getDisplayAvatar()
        finalAvatar = privyAvatar
      }

      const name = user?.nick_name || getDisplayName()
      const github = user?.github_login || getGithubUsername()
      const bio = user?.user_bio || ""
      const title = user?.user_title || ""

      let defaultBio = bio
      if (!bio && !user?.user_bio) {
        defaultBio = "Building amazing things with code!"
      }

      // 从用户已保存的数据中读取生态系统选择，确保 Mantle 始终在列表中
      let existingBuildingOn: string[] = ["Mantle"]
      if (user?.user_custom_labels && Array.isArray(user.user_custom_labels) && user.user_custom_labels.length > 0) {
        const userLabels = user.user_custom_labels.filter(label => label !== 'Mantle')
        existingBuildingOn = ['Mantle', ...userLabels]
      }

      const twitter = user?.user_custom_x || ""

      setFormData(prev => {
        if (prev.avatar !== finalAvatar || prev.name !== name || prev.github !== github || prev.bio !== defaultBio || prev.title !== title || prev.twitter !== twitter || JSON.stringify(prev.buildingOn) !== JSON.stringify(existingBuildingOn)) {
          return {
            ...prev,
            avatar: finalAvatar,
            name,
            github,
            twitter,
            title,
            bio: defaultBio,
            buildingOn: existingBuildingOn,
          }
        }
        return prev
      })
    }
  }, [user, authLoading, authenticated])

  // 获取用户参与的生态系统
  useEffect(() => {
    let mounted = true

    async function fetchUserEcosystems() {
      const github = formData.github || getGithubUsername()

      if (!authenticated) {
        return
      }

      if (!github) {
        if (mounted) {
          setEcosystemsLoaded(true)
        }
        return
      }

      try {
        if (mounted) {
          setLoadingEcosystems(true)
          setEcosystemsLoaded(false)
        }

        const result = await getUserEcosystems(github)

        if (result.success && result.data) {
          const ecosystems = result.data.ecosystems

          if (mounted) {
            setUserEcosystems(ecosystems)
            const options = getBuildingOnOptions(ecosystems, "mantle")
            setBuildingOnOptions(options)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user ecosystems:", error)
      } finally {
        if (mounted) {
          setLoadingEcosystems(false)
          setEcosystemsLoaded(true)
        }
      }
    }

    // 延迟执行，等表单数据填充完成
    if (authenticated) {
      if (formData.github) {
        const timer = setTimeout(fetchUserEcosystems, 1000)
        return () => {
          mounted = false
          clearTimeout(timer)
        }
      } else {
        // 如果2秒后仍然没有 GitHub 信息，标记为已加载
        const timer = setTimeout(() => {
          fetchUserEcosystems()
        }, 2000)
        return () => {
          mounted = false
          clearTimeout(timer)
        }
      }
    }

    return () => {
      mounted = false
    }
  }, [formData.github, authenticated, user])

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/mantle')
    }
  }, [authLoading, authenticated, router])

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

  const handleConnectTwitter = async () => {
    const twitterHandle = formData.twitter.replace('@', '').trim()

    if (!twitterHandle) {
      setError("Please enter a Twitter username first")
      return
    }

    try {
      setConnectingTwitter(true)
      setError(null)

      const response = await fetch(`/api/twitter/user/${twitterHandle}`)
      const result = await response.json()

      if (result.success && result.data) {
        const updates: any = {}

        // Update bio if available
        if (result.data.bio) {
          updates.bio = result.data.bio
        }

        // Update avatar - Twitter avatar always takes priority
        if (result.data.avatar) {
          updates.avatar = result.data.avatar
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({
            ...prev,
            ...updates
          }))
        }
        setTwitterConnected(true)
      } else {
        setError(result.message || "Failed to fetch Twitter data")
        setTwitterConnected(false)
      }
    } catch (error) {
      console.error("Failed to fetch Twitter data:", error)
      setError("Failed to connect to Twitter")
      setTwitterConnected(false)
    } finally {
      setConnectingTwitter(false)
    }
  }

  const toggleBuildingOn = (item: string) => {
    setFormData((prev) => {
      const isSelected = prev.buildingOn.includes(item)

      // 如果是取消选择，直接移除
      if (isSelected) {
        // Mantle 不能取消选择
        if (item === 'Mantle') {
          return prev
        }
        return {
          ...prev,
          buildingOn: prev.buildingOn.filter((i) => i !== item)
        }
      }

      // 如果是添加选择，检查数量限制（最多6个，包括Mantle）
      if (prev.buildingOn.length >= 6) {
        // 已经选满6个，不能再选
        return prev
      }

      return {
        ...prev,
        buildingOn: [...prev.buildingOn, item]
      }
    })
  }

  const handleCreate = async () => {
    if (!user) {
      setError("User not logged in, please login first")
      return
    }

    if (!user.id) {
      setError("User ID missing, please login again")
      return
    }

    // Title and Bio are required for all users
    if (!formData.title || !formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (formData.title.length > 25) {
      setError("Title must be 25 characters or less")
      return
    }

    if (!formData.bio || !formData.bio.trim()) {
      setError("Bio is required")
      return
    }

    if (formData.bio.length > 50) {
      setError("Bio must be 50 characters or less")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 用户选择的生态系统
      const sortedBuildingOn = [...formData.buildingOn]

      // 准备提交数据
      const profileData: any = {
        user_nick_name: formData.name,
        user_bio: formData.bio,
        user_title: formData.title,
        user_custom_x: formData.twitter,
        user_custom_labels: sortedBuildingOn,
        github_login: formData.github,
      }

      // Always include avatar if it exists and is not default Mantle icon
      if (formData.avatar && formData.avatar !== '/images/mantle-icon.png') {
        profileData.user_avatar = formData.avatar
      }

      const result = await updateUserProfileByEcosystem('mantle', profileData)

      if (result.success) {
        const userId = result.data?.id || user?.id

        if (userId) {
          router.push(`/mantle/${userId}`)
        } else {
          setError("Failed to get user ID")
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create card")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (authenticated && !ecosystemsLoaded)) {
    return (
      <LoadingScreen
        variant="mantle"
        message={authenticated && !ecosystemsLoaded ? "Loading your ecosystem data..." : undefined}
      />
    )
  }

  if (!authLoading && !authenticated) {
    return null
  }

  return (
    <motion.div
      className="min-h-dvh bg-black text-white flex flex-col relative"
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
            src="/images/mantle-homepage-bg.svg"
            alt="Mantle background"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
        </div>
        <header className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 z-10">
          <Image src="/images/mantle-logo.svg" alt="MANTLE" width={80} height={20} className="h-4 md:h-5 w-auto" />
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
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-black overflow-auto">
        <div className="flex flex-col items-center px-4 py-6 min-h-full">
          <motion.div
            className="w-full max-w-[340px] flex flex-col"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >


          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">Create Dev Card</h1>

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
                Avatar <span className="text-red-400">*</span>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <motion.button
                onClick={handleAvatarClick}
                className="w-[110px] h-[110px] bg-black/60 rounded-xl border-2 overflow-hidden"
                style={{ borderColor: '#5EEAD450' }}
                whileHover={{ borderColor: '#5EEAD4', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={formData.avatar && formData.avatar.trim() !== '' ? formData.avatar : "/images/mantle-icon.png"}
                  alt="Avatar preview"
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/images/mantle-icon.png"
                  }}
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
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#5EEAD4]"
                  placeholder="Your name"
                  whileFocus={{ scale: 1.02, borderColor: '#5EEAD4' }}
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
                  disabled
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="@username"
                  whileFocus={{ scale: 1.02, borderColor: '#5EEAD4' }}
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
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm text-white mb-1.5 font-medium">
              Twitter
            </label>
            <div className="relative">
              <motion.input
                type="text"
                value={formData.twitter}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    twitter: e.target.value,
                  }))
                  setTwitterConnected(false)
                }}
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 pr-28 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#5EEAD4]"
                placeholder="@username"
                whileFocus={{ scale: 1.02, borderColor: '#5EEAD4' }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.button
                type="button"
                onClick={handleConnectTwitter}
                disabled={connectingTwitter || !formData.twitter || twitterConnected}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: '#5EEAD4'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {connectingTwitter ? "Connecting" : twitterConnected ? "Connected" : "Connect"}
              </motion.button>
            </div>
          </motion.div>

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
              <span className="text-xs text-gray-400">
                {formData.title.length}/25
              </span>
            </div>
            <motion.input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              maxLength={25}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#5EEAD4]"
              placeholder="BuilderHero @Mantle"
              whileFocus={{ scale: 1.02, borderColor: '#5EEAD4' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
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
              <span className="text-xs text-gray-400">
                {formData.bio.length}/50
              </span>
            </div>
            <motion.textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              maxLength={50}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#5EEAD4] resize-none"
              placeholder="Share your bio (max 50 chars)"
              whileFocus={{ scale: 1.02, borderColor: '#5EEAD4' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Building on - 只有获取到真实数据时才显示 */}
          <AnimatePresence>
            {buildingOnOptions.length > 0 && (
              <motion.div
                className="mb-4"
                initial={{ x: -20, opacity: 0, height: 0 }}
                animate={{ x: 0, opacity: 1, height: 'auto' }}
                exit={{ x: -20, opacity: 0, height: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-sm text-white mb-2 font-medium">
                  Building on
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (Selected: {formData.buildingOn.length}/6)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {buildingOnOptions.map((item, index) => {
                    const isSelected = formData.buildingOn.includes(item)
                    const isMantle = item === 'Mantle'
                    const canSelect = isSelected || formData.buildingOn.length < 6

                    return (
                      <motion.button
                        key={item}
                        onClick={() => toggleBuildingOn(item)}
                        disabled={!canSelect && !isSelected}
                        className="px-3 py-1.5 rounded-full text-sm font-medium outline outline-1 outline-offset-[-1px]"
                        style={{
                          outlineColor: isSelected ? '#5EEAD4' : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          opacity: isSelected ? 1 : (canSelect ? 0.7 : 0.3),
                          cursor: (isMantle && isSelected) ? 'not-allowed' : (canSelect || isSelected ? 'pointer' : 'not-allowed')
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: isSelected ? 1 : (canSelect ? 0.7 : 0.3) }}
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

          <AnimatePresence>
            {error && (
              <motion.div
                className="text-red-400 text-sm text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create button */}
          <motion.button
            onClick={handleCreate}
            disabled={loading || !formData.name || !formData.github || !formData.title || !formData.bio}
            className="w-full h-12 px-9 py-2 rounded-[50px] shadow-[0px_0px_10px_0px_rgba(94,234,212,0.50)] outline outline-2 outline-offset-[-2px] outline-teal-300 inline-flex justify-center items-center gap-2.5 mt-6 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to right, #5EEAD4, #10B981)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2, boxShadow: "0px 0px 20px 0px rgba(94,234,212,0.70)" }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-center text-white text-base font-bold leading-7" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? "Creating..." : "Create"}
            </span>
          </motion.button>
          </motion.div>
        </div>
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
