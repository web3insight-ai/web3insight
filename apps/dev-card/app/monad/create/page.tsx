"use client"

import type React from "react"

import { useState, useRef, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { updateUserProfile } from "@/services/auth"
import { getUserEcosystems, getBuildingOnOptions, type UserEcosystemData } from "@/services/ecosystem"

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "dev"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    user,
    loading: authLoading,
    authenticated,
    getDisplayAvatar,
    getDisplayName,
    getGithubUsername,
    getEmail,
    privyUser
  } = useAuth()

  const [formData, setFormData] = useState({
    avatar: "/images/user-avatar-sample.png",
    name: "",
    github: "",
    twitter: "",
    title: "",
    bio: "",
    buildingOn: ["Monad"] as string[], // Monad 默认选中
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 生态系统相关状态 - 初始为空，只有获取到真实数据才显示
  const [buildingOnOptions, setBuildingOnOptions] = useState<string[]>([])
  const [userEcosystems, setUserEcosystems] = useState<string[]>([])
  const [loadingEcosystems, setLoadingEcosystems] = useState(false)
  const [ecosystemsLoaded, setEcosystemsLoaded] = useState(false) // 标记生态系统数据是否已加载

  // 调试：监控状态变化
  useEffect(() => {
    console.log("📊 buildingOnOptions 状态更新:", buildingOnOptions)
  }, [buildingOnOptions])

  useEffect(() => {
    console.log("🌍 userEcosystems 状态更新:", userEcosystems)
  }, [userEcosystems])

  // Auto-fill form with user data when available
  useEffect(() => {
    console.log("用户数据更新:", {
      user,
      authLoading,
      authenticated,
      hasUserData: !!user
    })

    if (authenticated) {
      // 数据优先级：Web3Insight API > Privy 兜底
      const avatar = user?.user_avatar || getDisplayAvatar()
      const name = user?.nick_name || getDisplayName()
      const github = user?.github_login || getGithubUsername()
      const bio = user?.user_bio || ""

      // 如果是第一次登录，从 Privy 生成默认简介
      let defaultBio = bio
      if (!bio && !user?.user_bio) {
        const email = getEmail()
        // 根据 GitHub 信息生成简介
        if (github) {
          defaultBio = `Building amazing things with code! Find me on GitHub @${github}`
        } else if (email) {
          defaultBio = "Passionate developer creating innovative solutions!"
        } else {
          defaultBio = "Web3 developer passionate about building the future!"
        }
      }

      console.log("填充表单数据:", {
        avatar,
        name,
        github,
        bio: defaultBio
      })

      // 从用户已保存的数据中读取生态系统选择
      let existingBuildingOn: string[] = []
      if (user?.user_custom_labels && Array.isArray(user.user_custom_labels)) {
        // 如果用户有保存的数据，使用保存的数据
        existingBuildingOn = [...user.user_custom_labels]
      }

      // 获取 Twitter handle
      const twitter = user?.user_custom_x || ""

      setFormData(prev => {
        // 只在数据实际改变时更新
        if (prev.avatar !== avatar || prev.name !== name || prev.github !== github || prev.bio !== defaultBio || prev.twitter !== twitter || JSON.stringify(prev.buildingOn) !== JSON.stringify(existingBuildingOn)) {
          return {
            ...prev,
            avatar,
            name,
            github,
            twitter,
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
        console.log("⏭️ 用户未认证，跳过生态系统加载")
        return
      }

      if (!github) {
        console.log("⚠️ 没有 GitHub 信息，标记为已加载")
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
        console.log("🔍 开始获取用户生态系统数据, GitHub:", github)

        const result = await getUserEcosystems(github)
        console.log("📦 getUserEcosystems 返回结果:", result)

        if (result.success && result.data) {
          const ecosystems = result.data.ecosystems
          console.log("✅ 用户参与的生态系统:", ecosystems)

          if (mounted) {
            setUserEcosystems(ecosystems)

            // 生成完整的选项列表，确保Monad在第一位，最多 top 10
            const options = getBuildingOnOptions(ecosystems)
            console.log("🏗️ 生成的 Building On 选项 (top 10):", options)
            setBuildingOnOptions(options)
          }

          // 不自动选中任何选项，让用户手动选择
        } else {
          console.error("❌ 获取生态系统失败:", result.message)
        }
      } catch (error) {
        console.error("💥 获取用户生态系统异常:", error)
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
        console.log("⏰ 1秒后执行获取生态系统, github=", formData.github)
        const timer = setTimeout(fetchUserEcosystems, 1000)
        return () => {
          mounted = false
          clearTimeout(timer)
        }
      } else {
        // 如果2秒后仍然没有 GitHub 信息，标记为已加载
        const timer = setTimeout(() => {
          console.log("⏱️ 2秒后仍无 GitHub 信息，标记为已加载")
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/monad")
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

  const toggleBuildingOn = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      buildingOn: prev.buildingOn.includes(item)
        ? prev.buildingOn.filter((i) => i !== item)
        : [...prev.buildingOn, item],
    }))
  }

  const handleCreate = async () => {
    console.log("创建卡片 - 当前用户数据:", user)
    console.log("用户 ID 检查:", {
      userId: user?.id,
      hasId: !!user?.id,
      userKeys: user ? Object.keys(user) : [],
      fullUser: user
    })

    if (!user) {
      setError("User not logged in, please login first")
      return
    }

    if (!user.id) {
      console.error("User ID missing - 完整用户对象:", JSON.stringify(user, null, 2))
      setError("User ID missing, please login again")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 用户选择的生态系统
      const sortedBuildingOn = [...formData.buildingOn]

      console.log("提交用户资料:", {
        user_nick_name: formData.name,
        user_avatar: formData.avatar,
        user_bio: formData.bio,
        user_custom_labels: sortedBuildingOn,
        current_user_id: user?.id
      })

      // Update user profile with form data
      const result = await updateUserProfile({
        user_nick_name: formData.name,
        user_avatar: formData.avatar,
        user_bio: formData.bio,
        user_custom_x: formData.twitter, // 保存 Twitter handle
        user_custom_labels: sortedBuildingOn, // 保存生态系统选择，Monad 在第一位
      })

      console.log("更新用户资料结果:", result)

      if (result.success) {
        // 使用更新后的用户数据中的ID，或当前用户ID作为备选
        const userId = result.data?.id || user?.id
        console.log("准备跳转，用户ID:", {
          resultId: result.data?.id,
          currentUserId: user?.id,
          finalUserId: userId
        })

        if (userId) {
          router.push(`/monad/card/${userId}`)
        } else {
          setError("无法获取用户ID，请重试")
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
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes glow {
            0%, 100% { opacity: 0.3; filter: blur(20px); }
            50% { opacity: 0.6; filter: blur(30px); }
          }
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
          .glow-animation {
            animation: glow 2s ease-in-out infinite;
          }
        `}</style>

        <div className="text-white text-center relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-full glow-animation"
              style={{
                background: 'radial-gradient(circle, rgba(111, 84, 255, 0.4) 0%, transparent 70%)'
              }}
            />
          </div>

          {/* Monad Logo with float animation */}
          <div className="mb-6 relative inline-block float-animation">
            <Image
              src="/images/monad-icon.svg"
              alt="Monad"
              width={80}
              height={80}
              className="w-20 h-20 drop-shadow-[0_0_20px_rgba(111,84,255,0.6)]"
            />
          </div>

          {/* Loading status text */}
          {authenticated && !ecosystemsLoaded && (
            <div className="text-sm text-gray-400 animate-pulse relative z-10">
              Loading your ecosystem data...
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col relative">
      {/* Fixed Header with Background */}
      <div className="sticky top-0 z-30 bg-black">
        <div className="relative h-[80px] md:h-[100px]">
          <Image
            src="/images/bg-synthwave.jpeg"
            alt="Synthwave background"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
        </div>
        <header className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 z-10">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-black overflow-auto">
        <div className="flex flex-col items-center px-4 py-6 min-h-full">
          <div className="w-full max-w-[340px] flex flex-col">


          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">Create Dev Card</h1>

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
              Twitter
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
              Title
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

          {/* Building on - 只有获取到真实数据时才显示 */}
          {buildingOnOptions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm text-white mb-2 font-medium">
                Building on
              </label>
              <div className="flex flex-wrap gap-2">
                {buildingOnOptions.map((item) => {
                  const isSelected = formData.buildingOn.includes(item)

                  return (
                    <button
                      key={item}
                      onClick={() => toggleBuildingOn(item)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 cursor-pointer"
                      style={{
                        borderColor: isSelected ? '#9F8EFF' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        opacity: isSelected ? 1 : 0.7
                      }}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
disabled={loading || !formData.name || !formData.github}
            className="w-full h-12 px-9 py-2 rounded-[50px] shadow-[0px_0px_10px_0px_rgba(159,142,255,0.50)] outline outline-2 outline-offset-[-2px] outline-indigo-300 inline-flex justify-center items-center gap-2.5 mt-6 mb-8 hover:shadow-[0px_0px_20px_0px_rgba(159,142,255,0.70)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)'
            }}
          >
            <span className="text-center text-white text-base font-bold leading-7" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? "Creating..." : "Create"}
            </span>
          </button>
          </div>
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
