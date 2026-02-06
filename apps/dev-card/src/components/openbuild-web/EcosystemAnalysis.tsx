'use client'

import { useMemo } from 'react'
import type { EcosystemScoreItem } from '@/schemas/auth.schema'

// Ecosystem color mapping
const ECOSYSTEM_COLORS: Record<string, string> = {
  Ethereum: '#627EEA',
  Bitcoin: '#F7931A',
  Solana: '#9945FF',
  Polkadot: '#E6007A',
  Cosmos: '#2E3148',
  Avalanche: '#E84142',
  Polygon: '#8247E5',
  Near: '#00C08B',
  Cardano: '#0033AD',
  Aptos: '#4CC9F0',
  Sui: '#4DA2FF',
  Arbitrum: '#28A0F0',
  Optimism: '#FF0420',
  Base: '#0052FF',
  Mantle: '#5EEAD4',
  Monad: '#9F8EFF',
  TON: '#0088CC',
  Starknet: '#EC796B',
  zkSync: '#4E529A',
  Linea: '#61DFFF',
  OpenBuild: '#01DB83',
  Foundry: '#3E4347',
  Hardhat: '#FFF100',
  Solidity: '#363636',
  'BNB Chain': '#F3BA2F',
}

const DEFAULT_COLORS = [
  '#01DB83', '#627EEA', '#9945FF', '#E84142', '#F7931A',
  '#8247E5', '#0052FF', '#28A0F0', '#4CC9F0', '#EC796B',
]

function getEcoColor(ecosystem: string, index: number): string {
  return ECOSYSTEM_COLORS[ecosystem] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}

interface EcosystemAnalysisProps {
  ecosystemScores: EcosystemScoreItem[]
}

export function EcosystemAnalysis({ ecosystemScores }: EcosystemAnalysisProps) {
  const chartData = useMemo(() => {
    const totalScore = ecosystemScores.reduce((sum, e) => sum + e.total_score, 0)
    if (totalScore === 0) return { items: [], total: 0, count: 0 }

    const items = ecosystemScores
      .filter((e) => e.total_score > 0)
      .sort((a, b) => b.total_score - a.total_score)
      .map((e, i) => ({
        ecosystem: e.ecosystem,
        score: e.total_score,
        percentage: (e.total_score / totalScore) * 100,
        color: getEcoColor(e.ecosystem, i),
      }))

    return { items, total: Math.round(totalScore), count: items.length }
  }, [ecosystemScores])

  if (chartData.items.length === 0) {
    return (
      <div className="py-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-[#1a1a1a] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
          Web3 Ecosystem Analysis
        </h3>
        <p className="text-gray-400 text-sm text-center py-8">No ecosystem data available yet.</p>
      </div>
    )
  }

  // Build donut chart SVG
  const donutRadius = 80
  const donutCx = 100
  const donutCy = 100
  const donutStroke = 30
  const circumference = 2 * Math.PI * donutRadius
  let cumulativePercentage = 0

  // Primary ecosystems = top 5
  const primaryEcosystems = chartData.items.slice(0, 5)

  return (
    <div className="py-6 border-b border-gray-200">
      <h3 className="flex items-center gap-2 text-base font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
        Web3 Ecosystem Analysis
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut chart */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            {chartData.items.map((item) => {
              const dashLength = (item.percentage / 100) * circumference
              const dashOffset = -((cumulativePercentage / 100) * circumference)
              cumulativePercentage += item.percentage
              return (
                <circle
                  key={item.ecosystem}
                  cx={donutCx}
                  cy={donutCy}
                  r={donutRadius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={donutStroke}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                />
              )
            })}
          </svg>
        </div>

        {/* Score and legend */}
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-[40px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {chartData.total}
            </p>
            <p className="text-gray-500 text-sm">Total Web3 Ecosystem Activity Score</p>
            <p className="text-gray-400 text-xs mt-0.5">Covering <strong className="text-[#1a1a1a]">{chartData.count}</strong> ecosystems</p>
          </div>

          <p className="text-sm text-gray-500 mb-2">Primary Ecosystems:</p>
          <div className="space-y-1">
            {primaryEcosystems.map((item) => (
              <div key={item.ecosystem} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#1a1a1a]">{item.ecosystem}</span>
                </div>
                <span className="font-bold text-[#1a1a1a]">{Math.round(item.score)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
