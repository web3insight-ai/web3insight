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
      <div className="space-y-0 divide-y divide-gray-100">
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
            <div key={item.id ?? i} className="py-4 first:pt-0">
              {/* Date */}
              {date && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 text-xs">+</span>
                  <span className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {date}
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                {/* Thumbnail */}
                {imageUrl && (
                  <div className="w-[140px] h-[90px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={item.title || ''}
                      width={140}
                      height={90}
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
                    className="text-sm font-medium text-[#1a1a1a] line-clamp-2 mb-2"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.title || 'Untitled'}
                  </h4>

                  {/* Participant avatars + enroll count */}
                  {item.enroll_count !== undefined && item.enroll_count > 0 && (
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* Placeholder avatars */}
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(5, item.enroll_count) }).map((_, j) => (
                          <div
                            key={j}
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 border border-white"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.enroll_count > 50 ? '50+' : item.enroll_count} Builders Enroll
                      </span>
                    </div>
                  )}

                  {/* Course sections + views */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {item.course_series_count !== undefined && item.course_series_count > 0 && (
                      <span>Course Sections {item.course_series_count}</span>
                    )}
                    {item.view_count !== undefined && item.view_count > 0 && (
                      <span>{item.view_count.toLocaleString()} Builders View</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Cat illustration placeholder */}
      <div className="w-[120px] h-[100px] mb-4 flex items-center justify-center">
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          {/* Simple cat silhouette */}
          <ellipse cx="50" cy="55" rx="30" ry="22" fill="#E5E7EB" />
          <circle cx="38" cy="35" r="12" fill="#E5E7EB" />
          <circle cx="62" cy="35" r="12" fill="#E5E7EB" />
          <path d="M32 28 L25 15 L38 25" fill="#E5E7EB" />
          <path d="M68 28 L75 15 L62 25" fill="#E5E7EB" />
          <circle cx="35" cy="33" r="2" fill="#9CA3AF" />
          <circle cx="65" cy="33" r="2" fill="#9CA3AF" />
          <path d="M47 40 Q50 43 53 40" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
          {/* Laptop */}
          <rect x="35" y="60" width="30" height="18" rx="2" fill="#D1D5DB" />
          <rect x="30" y="78" width="40" height="2" rx="1" fill="#D1D5DB" />
        </svg>
      </div>

      <p
        className="text-gray-500 text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Please tell me why there is no data. Why?
      </p>
    </div>
  )
}
