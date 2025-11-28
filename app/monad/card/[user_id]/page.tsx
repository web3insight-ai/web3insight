"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { getUserById } from "@/services/auth"
import { ProfileUpdateDialog } from "@/components/ProfileUpdateDialog"
import { CardActionButtons } from "@/components/CardActionButtons"
import { ApiUser } from "@/types/api"

export default function CardPage({ params }: { params: { user_id: string } }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardUser, setCardUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const { user: currentUser, authenticated } = useAuth()
  const cardRef = useRef<HTMLDivElement>(null)

  const isOwnCard = currentUser?.id === params.user_id

  useEffect(() => {
    async function fetchCardUser() {
      try {
        setLoading(true)
        const result = await getUserById(params.user_id)
        if (result.success && result.data) {
          setCardUser(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCardUser()
  }, [params.user_id])

  const handleAvatarClick = () => {
    if (isOwnCard && authenticated) {
      setShowProfileDialog(true)
    }
  }

  const handleProfileUpdate = () => {
    // Refresh card user data
    if (isOwnCard && currentUser) {
      setCardUser(currentUser)
    }
  }

  if (loading) {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!cardUser) {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    )
  }

  // Card data from user
  const name = cardUser.nick_name || "Anonymous"
  const github = cardUser.github_login || ""
  const bio = cardUser.user_bio || "Building the future of Web3!"
  const avatar = cardUser.user_avatar || "/images/user-avatar-sample.png"
  const twitter = cardUser.user_custom_x || "" // X (Twitter) handle
  
  // 从 user_custom_labels 获取生态系统
  let buildingOn: string[] = []
  if (cardUser.user_custom_labels && Array.isArray(cardUser.user_custom_labels) && cardUser.user_custom_labels.length > 0) {
    buildingOn = [...cardUser.user_custom_labels]
  }
  
  // 判断是否显示 Building on 区域：用户有 GitHub 绑定且有选择的生态系统
  const hasGithubBinding = !!github
  const hasEcosystems = hasGithubBinding && buildingOn.length > 0

  return (
    <div className="h-dvh w-full bg-black flex flex-col overflow-hidden md:items-center">
      {/* Card container - takes all available space except bottom */}
      <div className="flex-1 w-full md:max-w-[420px] md:flex md:items-center md:justify-center">
        <div
          ref={cardRef}
          className="relative w-full h-full md:h-auto md:aspect-[54/86] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Back side (default view - mascot) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="w-full h-full bg-black relative">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10">
                  <Image src="/images/monad.svg" alt="MONAD" width={80} height={20} className="h-5 w-auto" />
                  <div className="text-right text-xs sm:text-sm text-gray-400">
                    <div>Powered by</div>
                    <Image
                      src="/images/web3insight_logo.svg"
                      alt="Web3insight"
                      width={100}
                      height={20}
                      className="h-5 w-auto mt-0.5"
                    />
                  </div>
                </div>

                {/* Mascot */}
                <Image
                  src="/images/monad-mascot.png"
                  alt="Monad mascot"
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            </div>

            {/* Front side (user info) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden bg-black"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="w-full h-full flex flex-col px-5 pt-12 pb-0">
                {/* BuilderHero Badge */}
                <div className="flex justify-center mb-6 relative">
                  <div className="relative w-full max-w-[340px]">
                    <div className="w-full px-6 py-2.5 rounded-full text-white text-base font-semibold text-center" style={{ background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)' }}>
                      BuilderHero @Monad
                    </div>
                    {/* Speech bubble tail */}
                    <div
                      className="absolute -bottom-2 right-12 w-4 h-4"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        backgroundColor: "#9F8EFF",
                      }}
                    />
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  <div className="w-32 h-32 rounded-full p-[3px]" style={{ background: 'linear-gradient(to bottom right, #9F8EFF, #EC4899, #22D3EE)' }}>
                    <div
                      className={`w-full h-full rounded-full overflow-hidden ${isOwnCard && authenticated ? 'cursor-pointer' : ''}`}
                      style={{ backgroundColor: '#9F8EFF' }}
                      onClick={handleAvatarClick}
                    >
                      <Image
                        src={avatar}
                        alt="User avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/user-avatar-sample.png"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Name - using DM Mono font */}
                <h2 className="text-4xl font-bold text-center text-white tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {name}
                </h2>

                {/* Bio */}
                <p className="text-center text-white text-sm mt-3 px-6 line-clamp-2 leading-relaxed font-light" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center items-center gap-3 mt-4 text-sm">
                  {twitter && (
                    <>
                      <a
                        href={`https://twitter.com/${twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 transition-colors"
                        style={{ color: '#9F8EFF' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#BBA9FF'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9F8EFF'}
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>@{twitter}</span>
                      </a>
                      {github && <span className="text-gray-600">|</span>}
                    </>
                  )}
                  {github && (
                    <a
                      href={`https://github.com/${github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 transition-colors"
                      style={{ color: '#9F8EFF' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#BBA9FF'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9F8EFF'
                      }}
                    >
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span>{github}</span>
                    </a>
                  )}
                  {!twitter && !github && (
                    <div className="text-gray-500 text-xs">Web3 Builder</div>
                  )}
                </div>

                {/* Building on Section - centered vertically in remaining space */}
                <div className="flex-1 flex flex-col justify-center py-10">
                  {hasEcosystems ? (
                    <div className="bg-[#1C1C2E] rounded-2xl p-4 border border-gray-800/50 mx-2">
                      <h3 className="text-sm mb-2.5 font-medium" style={{ color: '#9F8EFF' }}>Building on</h3>
                      <div className="flex flex-wrap gap-2">
                        {buildingOn.map((item, index) => (
                          <span
                            key={item}
                            className={`px-3 py-1 rounded-full text-xs text-white font-medium border-2 relative ${
                              index === 0 && item === 'Monad' ? 'bg-gradient-to-r from-violet-500/20 to-slate-400/20' : ''
                            }`}
                            style={{ borderColor: '#9F8EFF' }}
                          >
                            {item}
                            {index === 0 && item === 'Monad' && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-violet-500 to-slate-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        用户自定义生态标签 • Monad 优先
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Image
                        src="/images/gmonad-bunny.png"
                        alt="GMONAD bunny"
                        width={200}
                        height={240}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Logo - fixed at bottom */}
                <div className="flex justify-center items-center h-12">
                  <Image
                    src="/images/monad_footer.svg"
                    alt="Monad DevCard"
                    width={150}
                    height={20}
                    className="h-4 w-auto opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - fixed height */}
      <div className="flex-shrink-0 flex flex-col items-center pb-8 pt-4 gap-4">
        {/* Tap card to flip */}
        <p className="text-gray-500 text-sm">Tap card to flip</p>

        {/* Action Buttons */}
        <CardActionButtons 
          cardRef={cardRef} 
          userName={cardUser?.nick_name || cardUser?.github_login || "user"}
        />
      </div>

      {/* Profile Update Dialog */}
      <ProfileUpdateDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        onUpdate={handleProfileUpdate}
        currentName={cardUser.nick_name}
        currentAvatar={cardUser.user_avatar}
        currentBio={cardUser.user_bio}
      />
    </div>
  )
}
