'use client'

export type TabType = 'building' | 'activity'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'building', label: 'Building on' },
  { id: 'activity', label: 'Activity' },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div
      className="relative inline-flex items-center gap-[6px] p-[4px] rounded-[8px] border border-[rgba(132,132,132,0.25)] h-[36px] z-20"
      style={{ backgroundColor: 'rgba(255,255,255,0.19)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 h-[28px] flex items-center justify-center px-[12px] text-[14px] cursor-pointer transition-all duration-200 ease-in-out ${
              isActive
                ? 'bg-[#1a1a1a] text-white rounded-[6px] font-medium'
                : 'text-[#1a1a1a] rounded-[40px] font-normal hover:bg-black/5'
            }`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.28px',
              lineHeight: '18px',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
