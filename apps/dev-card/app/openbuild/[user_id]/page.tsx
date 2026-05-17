'use client'

import { useState, useRef, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { orpc } from '@/orpc/client'
import { ProfileUpdateDialog } from '@/components/ProfileUpdateDialog'
import { ShareButton } from '@/components/ShareButton'
import { CreateCardButton } from '@/components/CreateCardButton'
import { MintNFTButton } from '@/components/MintNFTButton'
import OpenBuildCardBack from '@/components/OpenBuildCardBack'
import OpenBuildCardFront from '@/components/OpenBuildCardFront'
import LoadingScreen from '@/components/LoadingScreen'
import { WalletAddressInput } from '@/components/WalletAddressInput'

export default function CardPage({
  params,
}: {
  params: Promise<{ user_id: string }>
}) {
  const resolvedParams = use(params)
  const userId = resolvedParams.user_id

  const [isFlipped, setIsFlipped] = useState(true)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const { user: currentUser } = useAuth({ ecosystem: 'openbuild' })
  const frontCardRef = useRef<HTMLDivElement>(null)

  const isOwnCard = currentUser?.id === userId

  // Fetch card user data using TanStack Query + oRPC
  const { data: cardUserResult, isLoading, refetch } = useQuery({
    ...orpc.auth.getUserByIdAndEcosystem.queryOptions({
      input: { ecosystem: 'openbuild', id: userId },
    }),
    enabled: !!userId,
  })

  const cardUser = cardUserResult?.success ? cardUserResult.data : null

  // Fetch inviter profile if inviter exists
  const inviterId = cardUser?.inviter?.id
  const { data: inviterResult } = useQuery({
    ...orpc.auth.getUserByIdAndEcosystem.queryOptions({
      input: { ecosystem: 'openbuild', id: inviterId! },
    }),
    enabled: !!inviterId,
  })

  const inviter = inviterResult?.success ? inviterResult.data : null

  const handleProfileUpdate = () => {
    refetch()
  }

  if (isLoading) {
    return <LoadingScreen variant="openbuild" />
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
  const avatar = cardUser.user_avatar || '/images/openbuild-icon.svg'
  const twitter = cardUser.user_custom_x || ''
  const title = cardUser.user_title || 'BuilderHero @OpenBuild'

  let buildingOn: string[] = []
  if (
    cardUser.user_custom_labels &&
    Array.isArray(cardUser.user_custom_labels) &&
    cardUser.user_custom_labels.length > 0
  ) {
    buildingOn = [...cardUser.user_custom_labels]
  }

  const userName = cardUser?.nick_name || cardUser?.github_login || 'I'
  const shareTitle = `${userName} just created an OpenBuild DevCard! Join the Web3 builder community!`
  const shareText = `#OpenBuild @OpenBuildxyz @Web3insightAI`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-col print:flex hidden">
        <OpenBuildCardBack className="h-dvh overflow-hidden bg-black" />
        <OpenBuildCardFront
          className="h-dvh overflow-hidden"
          name={name}
          github={github}
          twitter={twitter}
          bio={bio}
          avatar={avatar}
          title={title}
          buildingOn={buildingOn}
          inviter={inviter}
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
            className="relative w-[min(90vw,calc((100vh-200px)*1701/2709))] h-auto cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              perspective: '1000px',
              aspectRatio: '1701 / 2709',
              maxHeight: 'calc(100vh - 200px)',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Action buttons on card top right - only show when front side is visible */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  className="absolute top-2 right-2 z-20 ignore-screenshot flex flex-col items-center gap-0.5"
                  data-html2canvas-ignore="true"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  transition={{ duration: 0.35, delay: 0.35, ease: "easeOut" }}
                >
                  <ShareButton
                    title={shareTitle}
                    text={shareText}
                    ecosystem="openbuild"
                  />
                  {!isOwnCard && <CreateCardButton ecosystem="openbuild" inviteCode={userId} />}
                  <MintNFTButton ecosystem="openbuild" />
                </motion.div>
              )}
            </AnimatePresence>
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
              <OpenBuildCardBack
                isFlipped={isFlipped}
                className="absolute inset-0 w-full h-full overflow-hidden bg-black"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
              />

              {/* Front side (user info) */}
              <OpenBuildCardFront
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
                inviter={inviter}
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
          <WalletAddressInput ecosystem="openbuild" isOwnCard={isOwnCard} />
          <motion.p
            className="text-gray-500 text-xs sm:text-sm mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap card to flip
          </motion.p>
          <Link
            href={`/openbuild/${userId}/web`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-[#01DB83] border border-[#01DB83]/30 hover:bg-[#01DB83]/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View DevCard Web
          </Link>
        </motion.div>

        <ProfileUpdateDialog
          isOpen={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          onUpdate={handleProfileUpdate}
          currentName={cardUser.nick_name}
          currentAvatar={cardUser.user_avatar}
          currentBio={cardUser.user_bio}
          ecosystem="openbuild"
        />
      </div>
    </motion.div>
  )
}
