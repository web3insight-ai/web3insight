"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { getUserById } from "@/services/auth"
import { ProfileUpdateDialog } from "@/components/ProfileUpdateDialog"
import { CardActionButtons } from "@/components/CardActionButtons"
import { ApiUser } from "@/types/api"
import LoadingScreen from "@/components/LoadingScreen"

export default function CardPage({ params }: { params: Promise<{ user_id: string }> }) {
  const [isFlipped, setIsFlipped] = useState(true) // Default to front (user info)
  const [cardUser, setCardUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { user: currentUser, authenticated } = useAuth()
  const cardRef = useRef<HTMLDivElement>(null)
  const frontCardRef = useRef<HTMLDivElement>(null)

  const isOwnCard = currentUser?.id === userId

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setUserId(resolvedParams.user_id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    async function fetchCardUser() {
      if (!userId) return

      try {
        setLoading(true)
        const result = await getUserById(userId)

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
  }, [userId])

  const handleAvatarClick = () => {
    if (isOwnCard && authenticated) {
      setShowProfileDialog(true)
    }
  }

  const handleProfileUpdate = () => {
    if (isOwnCard && currentUser) {
      setCardUser(currentUser)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!cardUser) {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    )
  }

  const name = cardUser.nick_name || "Anonymous"
  const github = cardUser.github_login || ""
  const bio = cardUser.user_bio || "Building the future of Web3!"
  const avatar = cardUser.user_avatar || "/images/monad-icon.svg"
  const twitter = cardUser.user_custom_x || ""
  const title = cardUser.user_title || "BuilderHero @Monad"

  let buildingOn: string[] = []
  if (cardUser.user_custom_labels && Array.isArray(cardUser.user_custom_labels) && cardUser.user_custom_labels.length > 0) {
    buildingOn = [...cardUser.user_custom_labels]
  }

  const hasEcosystems = buildingOn.length > 1

  return (
    <div className="h-dvh w-full bg-black flex flex-col overflow-hidden items-center">
      <div className="flex-1 w-full flex items-center justify-center py-4">
        <div
          ref={cardRef}
          className="relative w-full max-w-[min(95vw,calc((100vh-200px)*1701/2709))] h-auto cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            perspective: "1000px",
            aspectRatio: "1701 / 2709"
          }}
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
              className="absolute inset-0 w-full h-full overflow-hidden bg-black"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="w-full h-full relative">
                <div
                  className="absolute top-0 left-0 right-0 p-[4%] flex items-center justify-between z-10 ignore-screenshot"
                  data-html2canvas-ignore="true"
                  style={{
                    opacity: isFlipped ? 0 : 1,
                    pointerEvents: isFlipped ? 'none' : 'auto',
                    transition: 'opacity 0.1s'
                  }}
                >
                  <Image
                    src="/images/monad.svg"
                    alt="MONAD"
                    width={100}
                    height={24}
                    className="h-[clamp(18px,2.2vw,24px)] w-auto"
                  />
                  <div className="text-right text-gray-400" style={{ fontSize: 'clamp(11px, 1.3vw, 14px)' }}>
                    <div className="mb-0.5">Powered by</div>
                    <Image
                      src="/images/web3insight_logo.svg"
                      alt="Web3insight"
                      width={120}
                      height={24}
                      className="h-[clamp(18px,2.2vw,24px)] w-auto"
                    />
                  </div>
                </div>

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
              ref={frontCardRef}
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: "#090111"
              }}
              data-card-face="front"
            >
              <div className="w-full h-full flex flex-col px-[5%] pt-[3.5%] pb-0">
                {/* Title Badge */}
                <div className="flex justify-center mb-[1.5%] relative">
                  <div className="relative w-[70%]">
                    <Image
                      src="/images/title_bg.svg"
                      alt=""
                      width={340}
                      height={58}
                      priority
                      className="w-full h-auto"
                    />
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-center px-[10%]" style={{ height: '72.7%' }}>
                      <span
                        className="text-white text-center line-clamp-1"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 'clamp(14px, 1.8vw, 18px)',
                          fontWeight: 700,
                          lineHeight: 1.4,
                        }}
                      >
                        {title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-[2%]">
                  <div className="w-[25%] aspect-square rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, #9F8EFF 0%, #EC4899 50%, #22D3EE 100%)' }}>
                    <div
                      className={`w-full h-full rounded-full overflow-hidden ${isOwnCard && authenticated ? 'cursor-pointer' : ''}`}
                      style={{ backgroundColor: '#9F8EFF' }}
                      onClick={handleAvatarClick}
                    >
                      <Image
                        src={avatar}
                        alt="User avatar"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/monad-icon.svg"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <h2 className="font-bold text-center text-white tracking-wide mb-[1.2%]" style={{ fontFamily: "'DM Mono', monospace", fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
                  {name}
                </h2>

                <p className="text-center text-white px-[8%] line-clamp-2 leading-relaxed font-light" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(13px, 1.6vw, 16px)', lineHeight: 1.6 }}>
                  {bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center items-center gap-[3%] mt-[1.5%] mb-[1%]" style={{ fontSize: 'clamp(12px, 1.4vw, 15px)' }}>
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
                        <svg className="text-white" viewBox="0 0 24 24" fill="currentColor" style={{ width: 'clamp(14px, 1.6vw, 18px)', height: 'clamp(14px, 1.6vw, 18px)' }}>
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>@{twitter}</span>
                      </a>
                      {github && <span className="text-gray-600 mx-1">|</span>}
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
                      <svg className="text-white" viewBox="0 0 24 24" fill="currentColor" style={{ width: 'clamp(14px, 1.6vw, 18px)', height: 'clamp(14px, 1.6vw, 18px)' }}>
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span>{github}</span>
                    </a>
                  )}
                  {!twitter && !github && (
                    <div className="text-gray-500">Web3 Builder</div>
                  )}
                </div>

                {/* Building on Section */}
                <div className="flex-1 flex flex-col justify-end pb-[5%]">
                  {hasEcosystems ? (
                    <div className="rounded-3xl p-[5%] border border-gray-800/50" style={{ backgroundColor: '#927EFF1A' }}>
                      <h3 className="mb-[4%] font-semibold" style={{ color: '#9F8EFF', fontSize: 'clamp(16px, 2vw, 20px)' }}>Building on</h3>
                      <div className="flex flex-wrap gap-[2.5%]">
                        {buildingOn.map((item) => (
                          <span
                            key={item}
                            className="px-[5%] py-[2%] rounded-full text-white font-medium outline outline-1 outline-offset-[-1px] mb-[2%]"
                            style={{ outlineColor: '#9F8EFF', fontSize: 'clamp(14px, 1.7vw, 17px)' }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center pb-[3%]">
                      <Image
                        src="/images/gmonad-bunny.png"
                        alt="GMONAD bunny"
                        width={300}
                        height={350}
                        className="object-contain w-[50%] h-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Logo */}
                <div className="flex justify-center items-center py-[2.5%]">
                  <Image
                    src="/images/monad_footer.svg"
                    alt="Monad DevCard"
                    width={180}
                    height={24}
                    className="h-[clamp(16px,2vw,20px)] w-auto opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center pb-6 pt-4 gap-3 ignore-screenshot" data-html2canvas-ignore="true">
        <p className="text-gray-500 text-sm">Tap card to flip</p>

        <CardActionButtons
          cardRef={frontCardRef}
          userName={cardUser?.nick_name || cardUser?.github_login || "user"}
        />
      </div>

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

