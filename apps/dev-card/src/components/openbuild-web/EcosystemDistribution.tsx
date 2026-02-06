'use client'

import type { EcosystemScoreItem } from '@/schemas/auth.schema'

interface EcosystemDistributionProps {
  ecosystemScores: EcosystemScoreItem[]
}

export function EcosystemDistribution({ ecosystemScores }: EcosystemDistributionProps) {
  if (!ecosystemScores || ecosystemScores.length === 0) return null

  const sorted = [...ecosystemScores]
    .filter((e) => e.total_score > 0)
    .sort((a, b) => b.total_score - a.total_score)

  const totalScore = sorted.reduce((sum, e) => sum + e.total_score, 0)
  const displayItems = sorted.slice(0, 9)
  const remaining = sorted.length - 9

  // Determine status based on activity
  function getStatus(eco: EcosystemScoreItem): { label: string; active: boolean } {
    if (!eco.last_activity_at) return { label: 'Historical', active: false }
    const lastActivity = new Date(eco.last_activity_at)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return lastActivity > sixMonthsAgo
      ? { label: 'Active', active: true }
      : { label: 'Historical', active: false }
  }

  return (
    <div className="py-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Ecosystem Distribution
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayItems.map((eco, i) => {
          const rank = i + 1
          const percentage = totalScore > 0 ? ((eco.total_score / totalScore) * 100).toFixed(1) : '0'
          const repoCount = eco.repos?.length || 0
          const avgScore = repoCount > 0 ? Math.round(eco.total_score / repoCount) : 0
          const status = getStatus(eco)

          return (
            <div
              key={eco.ecosystem}
              className="border border-gray-200 rounded-lg p-4"
            >
              {/* Header row: rank + score */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-gray-400 text-sm">#{rank}</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#1a1a1a]">{Math.round(eco.total_score)}</span>
                  <span className="text-gray-400 text-xs ml-1">{percentage}%</span>
                </div>
              </div>

              {/* Ecosystem name */}
              <h4 className="text-base font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {eco.ecosystem}
              </h4>

              {/* Stats */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Repositories:</span>
                  <span className="text-[#1a1a1a]">{repoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="text-[#1a1a1a]">{avgScore}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${status.active ? 'bg-[#01DB83]' : 'bg-gray-300'}`}
                  />
                  <span className="text-gray-500 text-xs">{status.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {remaining > 0 && (
        <p className="text-center text-gray-400 text-sm mt-4">
          +{remaining} more ecosystems
        </p>
      )}
    </div>
  )
}
