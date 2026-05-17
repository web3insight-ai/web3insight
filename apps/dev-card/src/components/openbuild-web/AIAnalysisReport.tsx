'use client'

interface AIAnalysisReportProps {
  report: {
    english?: string
    chinese?: string
  }
  scores?: {
    spiciness?: number
    truthfulness?: number
    helpfulness?: number
  }
}

export function AIAnalysisReport({ report, scores }: AIAnalysisReportProps) {
  const content = report.english || report.chinese

  if (!content) return null

  const spiciness = scores?.spiciness ?? 8
  const truthfulness = scores?.truthfulness ?? 9
  const helpfulness = scores?.helpfulness ?? 7

  return (
    <div className="py-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Analysis Report
        </h3>

        {/* Language toggle + scores */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>🔥</span>
            <span>中文</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-[#01DB83]">{spiciness}/10</p>
              <p className="text-[10px] text-gray-400">Spiciness</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#01DB83]">{truthfulness}/10</p>
              <p className="text-[10px] text-gray-400">Truthfulness</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#01DB83]">{helpfulness}/10</p>
              <p className="text-[10px] text-gray-400">Helpfulness</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-gray-50 rounded-lg p-4 text-sm text-[#1a1a1a] leading-relaxed border-l-2 border-[#01DB83]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {content}
      </div>
    </div>
  )
}
