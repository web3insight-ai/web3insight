'use client'

import Image from 'next/image'

interface ActivityItem {
  id?: string | number
  title?: string
  type?: string
  image?: string
  img?: string
  course_series_count?: number
  course_single_count?: number
  enroll_count?: number
  view_count?: number
  created_at?: string
  status?: string | number
  [key: string]: unknown
}

interface ActivityListProps {
  records: ActivityItem[]
}

export function ActivityList({ records }: ActivityListProps) {
  if (!records || records.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[6px] top-0 bottom-0 w-px bg-gray-200" />

        <div className="divide-y divide-gray-100">
          {records.map((item, i) => {
            const imageUrl = item.image || item.img
            const date = item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })
              : null

            return (
              <div key={item.id ?? i} className="py-5 first:pt-0 pl-6">
                {/* Date */}
                {date && (
                  <div className="flex items-center gap-2 mb-3 -ml-6">
                    <span className="text-[#1a1a1a]/60 text-sm relative z-10 bg-white w-[13px] h-[13px] flex items-center justify-center">+</span>
                    <span className="text-[14px] text-[#1a1a1a]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                      {date}
                    </span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                  {/* Thumbnail */}
                  {imageUrl && (
                    <div className="w-full md:w-[180px] h-[140px] md:h-[100px] rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={item.title || ''}
                        width={180}
                        height={100}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-[16px] font-bold text-[#1a1a1a] line-clamp-2 mb-2 leading-[24px]"
                      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {item.title || 'Untitled'}
                    </h4>

                    {/* Participant avatars + enroll count */}
                    {item.enroll_count !== undefined && item.enroll_count > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        {/* Placeholder avatars */}
                        <div className="flex -space-x-1.5">
                          {Array.from({ length: Math.min(5, item.enroll_count) }).map((_, j) => (
                            <div
                              key={j}
                              className="w-5 h-5 rounded-full bg-linear-to-br from-orange-400 to-pink-400 border border-white"
                            />
                          ))}
                        </div>
                        <span className="text-[14px] text-[#1a1a1a]/80" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                          {item.enroll_count > 50 ? '50+' : item.enroll_count} Builders Enroll
                        </span>
                      </div>
                    )}

                    {/* Course sections + views */}
                    <div className="flex items-center text-[14px] text-[#1a1a1a]/80" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                      {item.course_series_count !== undefined && item.course_series_count > 0 && (
                        <span>Course Sections <strong>{item.course_series_count}</strong></span>
                      )}
                      {item.course_series_count !== undefined && item.course_series_count > 0 && item.view_count !== undefined && item.view_count > 0 && (
                        <span className="mx-2 text-[#1a1a1a]/20">|</span>
                      )}
                      {item.view_count !== undefined && item.view_count > 0 && (
                        <span><strong>{item.view_count.toLocaleString()}</strong> Builders View</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity tab footer - Powered by OpenBuild */}
      <div className="flex items-center justify-center gap-1 pt-6 pb-2">
        <span
          className="text-[#1a1a1a] opacity-40 text-[12px]"
          style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        >
          Powered by
        </span>
        <Image
          src="/images/nav-openbuild-text.svg"
          alt="OpenBuild"
          width={80}
          height={12}
          className="h-[12px] w-auto opacity-80"
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Cat illustration */}
      <div className="w-[126px] h-[90px] mb-4 flex items-center justify-center">
        <Image
          src="/images/empty-state-cat.png"
          alt="No data"
          width={126}
          height={90}
          className="w-full h-full object-contain"
        />
      </div>

      <p
        className="text-[#1a1a1a] text-[14px] text-center leading-[20px]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Please tell me why there is no data. Why?
      </p>
    </div>
  )
}
