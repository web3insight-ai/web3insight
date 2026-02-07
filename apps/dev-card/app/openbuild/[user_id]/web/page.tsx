'use client'

import { useState, use, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { orpc } from '@/orpc/client'
import LoadingScreen from '@/components/LoadingScreen'
import {
  NavBar,
  ProfileHero,
  TabNavigation,
  GitHubProfile,
  EcosystemAnalysis,
  AIAnalysisReport,
  EcosystemDistribution,
  ActivityList,
  type TabType,
} from '@/components/openbuild-web'

function WebPageContent({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('building')
  const { authenticated } = useAuth({ ecosystem: 'openbuild' })

  // Fetch card user data
  const { data: cardUserResult, isLoading } = useQuery({
    ...orpc.auth.getUserByIdAndEcosystem.queryOptions({
      input: { ecosystem: 'openbuild', id: userId },
    }),
    enabled: !!userId,
  })

  const cardUser = cardUserResult?.success ? cardUserResult.data : null

  // Fetch full GitHub data for Building on tab
  const githubLogin = cardUser?.github_login
  const { data: fullGithubResult } = useQuery({
    ...orpc.github.getFullUser.queryOptions({
      input: { username: githubLogin! },
    }),
    enabled: !!githubLogin,
  })

  const fullGithubData = fullGithubResult?.success
    ? fullGithubResult.data
    : null

  // Fetch AI analysis
  const { data: analysisResult } = useQuery({
    ...orpc.analysis.getResult.queryOptions({
      input: { id: userId },
    }),
    enabled: activeTab === 'building',
    retry: false,
  })

  const analysisData = analysisResult?.success ? analysisResult.data : null

  // Fetch OpenBuild records for Activity tab
  const { data: openbuildRecordResult } = useQuery({
    ...orpc.auth.getOpenBuildRecord.queryOptions({}),
    enabled: activeTab === 'activity' && authenticated,
    retry: false,
  })

  const openbuildRecords = openbuildRecordResult?.success
    ? Array.isArray(openbuildRecordResult.data)
      ? openbuildRecordResult.data
      : openbuildRecordResult.data?.data || []
    : []

  if (isLoading) {
    return <LoadingScreen variant="openbuild" />
  }

  if (!cardUser) {
    return (
      <div className="h-dvh w-full bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-[#1a1a1a]">User not found</div>
      </div>
    )
  }

  const name = cardUser.nick_name || 'Anonymous'
  const github = cardUser.github_login || ''
  const bio = cardUser.user_bio || ''
  const avatar = cardUser.user_avatar || '/images/openbuild-icon.svg'
  const twitter = cardUser.user_custom_x || ''

  // Extract ecosystem scores
  const ecosystemScores = fullGithubData?.ecosystem_scores || []

  // Extract AI roast report
  const roastReport = analysisData?.ai?.data?.roastReport || null

  return (
    <div className="min-h-dvh bg-[#f8f8f8]">
      {/* Nav bar */}
      <NavBar userId={userId} />

      {/* Horizontal line below nav */}
      <div className="border-b border-gray-200" />

      {/* Hero background + Return button */}
      <div className="relative">
        <ProfileHero />

        {/* Return button - positioned over the hero */}
        <Link
          href={`/openbuild/${userId}`}
          className="absolute top-[24px] md:top-[36px] left-[20px] md:left-[56px] z-10 flex items-center gap-1.5 px-3 py-1 rounded-[4px] border border-black/10 text-black/60 text-[14px] hover:bg-white/50 transition-colors"
          style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          Return
        </Link>
      </div>

      {/* White card overlapping the hero - avatar protrudes into hero */}
      <div className="md:w-[900px] w-full max-w-[calc(100%-32px)] mx-auto mt-[-130px] md:mt-[-184px] relative z-10 mb-6">
        {/* Profile section: avatar + name + bio + social links */}
        <div className="flex flex-col items-center gap-[16px]">
          {/* Avatar - positioned in the hero area, 100px circle */}
          <div className="w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center overflow-hidden z-20 relative">
            <Image
              src={avatar}
              alt={name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/images/openbuild-icon.svg'
              }}
            />
          </div>

          {/* White card background - overlaps bottom 40px of avatar */}
          <div className="bg-white rounded-[16px] md:rounded-[24px] w-full mt-[-56px] pt-[56px] px-5 md:px-[50px] pb-6 md:pb-8">
            {/* Name */}
            <h1
              className="text-[28px] font-bold text-[#1a1a1a] text-center leading-[20px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {name}
            </h1>

            {/* Bio */}
            {bio && (
              <p
                className="text-[#1a1a1a] text-[16px] text-center mx-auto mt-4 leading-[20px]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center justify-center gap-[11px] mt-4 text-[16px]">
              {twitter && (
                <a
                  href={`https://twitter.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#01db83] hover:opacity-70 transition-opacity"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg
                    className="w-[19px] h-[19px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@{twitter}</span>
                </a>
              )}
              {twitter && github && (
                <span className="text-[#1a1a1a]/20 text-[15px]">|</span>
              )}
              {github && (
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#01db83] hover:opacity-70 transition-opacity"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg
                    className="w-[19px] h-[19px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>{github}</span>
                </a>
              )}
            </div>

            {/* Tabs row - always left-aligned with Sort by on right */}
            <div className="flex items-center justify-between mt-8 mb-5">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              {/* Sort by dropdown */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-[14px] text-[#1a1a1a]/60 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                <span>Sort by</span>
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Building on tab */}
            {activeTab === 'building' && (
              <div className="animate-[fadeIn_200ms_ease-in-out]">
                {/* GitHub profile */}
                {fullGithubData ? (
                  <GitHubProfile
                    login={
                      fullGithubData.login ||
                      fullGithubData.actor_login ||
                      github
                    }
                    name={fullGithubData.name || name}
                    bio={fullGithubData.bio || bio}
                    publicRepos={fullGithubData.public_repos}
                    followers={fullGithubData.followers}
                    following={fullGithubData.following}
                    company={fullGithubData.company}
                    location={fullGithubData.location}
                    createdAt={fullGithubData.created_at}
                  />
                ) : github ? (
                  <div className="border-b border-gray-200 pb-6">
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="h-5 bg-gray-200 rounded w-40" />
                      <div className="h-4 bg-gray-200 rounded w-72" />
                      <div className="h-3 bg-gray-200 rounded w-56" />
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-gray-200 pb-6 text-gray-400 text-sm text-center py-8">
                    No GitHub account linked
                  </div>
                )}

                {/* Ecosystem Analysis */}
                <EcosystemAnalysis ecosystemScores={ecosystemScores} />

                {/* AI Analysis Report */}
                {roastReport && <AIAnalysisReport report={roastReport} />}

                {/* Ecosystem Distribution */}
                {ecosystemScores.length > 0 && (
                  <EcosystemDistribution ecosystemScores={ecosystemScores} />
                )}
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="animate-[fadeIn_200ms_ease-in-out]">
                {!authenticated ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <p className="text-sm font-medium">Login required</p>
                    <p className="text-xs mt-1">
                      Sign in to view OpenBuild activity records
                    </p>
                  </div>
                ) : (
                  <ActivityList records={openbuildRecords} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1 py-5">
        <span
          className="text-[#1a1a1a] opacity-40 text-[12px]"
          style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        >
          Powered by
        </span>
        <Image
          src="/images/footer-web3insight-logo.svg"
          alt="Web3.insight()"
          width={106}
          height={12}
          className="h-[12px] w-auto"
        />
      </div>
    </div>
  )
}

export default function WebPage({
  params,
}: {
  params: Promise<{ user_id: string }>
}) {
  const resolvedParams = use(params)
  const userId = resolvedParams.user_id

  return (
    <Suspense fallback={<LoadingScreen variant="openbuild" />}>
      <WebPageContent userId={userId} />
    </Suspense>
  )
}
