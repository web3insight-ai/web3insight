'use client'

import { useState, useRef, use } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { orpc } from '@/orpc/client'
import { ProfileUpdateDialog } from '@/components/ProfileUpdateDialog'
import { ShareButton } from '@/components/ShareButton'
import { CreateCardButton } from '@/components/CreateCardButton'
import { MintNFTButton } from '@/components/MintNFTButton'
import MantleCardBack from '@/components/MantleCardBack'
import MantleCardFront from '@/components/MantleCardFront'
import LoadingScreen from '@/components/LoadingScreen'

export default function CardPage({
  params,
}: {
  params: Promise<{ user_id: string }>
}) {
  const resolvedParams = use(params)
  const userId = resolvedParams.user_id

  const [isFlipped, setIsFlipped] = useState(true)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const { user: currentUser } = useAuth({ ecosystem: 'mantle' })
  const frontCardRef = useRef<HTMLDivElement>(null)

  const isOwnCard = currentUser?.id === userId

  // Fetch card user data using TanStack Query + oRPC
  const { data: cardUserResult, isLoading, refetch } = useQuery({
    ...orpc.auth.getUserByIdAndEcosystem.queryOptions({
      input: { ecosystem: 'mantle', id: userId },
    }),
    enabled: !!userId,
  })

  const cardUser = cardUserResult?.success ? cardUserResult.data : null

  const handleProfileUpdate = () => {
    refetch()
  }

  if (isLoading) {
    return <LoadingScreen variant="mantle" />
  }

  if (!cardUser) {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    )
  }

  const name = cardUser.nick_name || 'Anonymous'
  const github = cardUser.github_login || ''
  const bio = cardUser.user_bio || 'Building the future of Web3!'
  const avatar = cardUser.user_avatar || '/images/mantle-icon.png'
  const twitter = cardUser.user_custom_x || ''
  const title = cardUser.user_title || 'BuilderHero @Mantle'

  let buildingOn: string[] = []
  if (
    cardUser.user_custom_labels &&
    Array.isArray(cardUser.user_custom_labels) &&
    cardUser.user_custom_labels.length > 0
  ) {
    buildingOn = [...cardUser.user_custom_labels]
  }

  const shareTitle = `Check out ${cardUser?.nick_name || cardUser?.github_login || 'my'}'s Web3 Dev Card!`
  const shareText = `${cardUser?.nick_name || cardUser?.github_login || 'I'} just created a Web3 Dev Card on @Web3InsightAI. Get yours now!`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-col print:flex hidden">
        <MantleCardBack className="h-dvh overflow-hidden bg-black" />
        <MantleCardFront
          className="h-dvh overflow-hidden"
          name={name}
          github={github}
          twitter={twitter}
          bio={bio}
          avatar={avatar}
          title={title}
          buildingOn={buildingOn}
        />
      </div>
      <div className="h-dvh w-full print:hidden bg-black flex flex-col overflow-hidden items-center">
        <motion.div
          className="flex-1 w-full min-h-0 flex items-center justify-center py-2 sm:py-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="relative w-[min(90vw,calc((100vh-160px)*1701/2709))] h-auto cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              perspective: '1000px',
              aspectRatio: '1701 / 2709',
              maxHeight: 'calc(100vh - 160px)',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Action buttons on card top right */}
            <div
              className="absolute top-2 right-2 z-20 ignore-screenshot flex flex-col items-center gap-0.5"
              data-html2canvas-ignore="true"
              onClick={(e) => e.stopPropagation()}
            >
              <ShareButton
                title={shareTitle}
                text={shareText}
                ecosystem="mantle"
              />
              <CreateCardButton ecosystem="mantle" />
              <MintNFTButton ecosystem="mantle" />
            </div>
            <motion.div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: isFlipped ? 180 : 0
              }}
              transition={{
                duration: 0.7,
                ease: "easeInOut"
              }}
            >
              {/* Back side (default view - mascot) */}
              <MantleCardBack
                isFlipped={isFlipped}
                className="absolute inset-0 w-full h-full overflow-hidden bg-black"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
              />

              {/* Front side (user info) */}
              <MantleCardFront
                ref={frontCardRef}
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                data-card-face="front"
                name={name}
                github={github}
                twitter={twitter}
                bio={bio}
                avatar={avatar}
                title={title}
                buildingOn={buildingOn}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="shrink-0 w-full flex flex-col items-center pb-4 sm:pb-6 pt-2 sm:pt-4 ignore-screenshot"
          data-html2canvas-ignore="true"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.p
            className="text-gray-500 text-xs sm:text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap card to flip
          </motion.p>
        </motion.div>

        <ProfileUpdateDialog
          isOpen={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          onUpdate={handleProfileUpdate}
          currentName={cardUser.nick_name}
          currentAvatar={cardUser.user_avatar}
          currentBio={cardUser.user_bio}
          ecosystem="mantle"
        />
      </div>
    </motion.div>
  )
}
