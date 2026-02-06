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
      className="inline-flex items-center gap-1 p-[3px] rounded-md border border-[rgba(132,132,132,0.25)]"
      style={{ backgroundColor: 'rgba(255,255,255,0.19)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="px-3 py-[3px] rounded-[5px] text-xs font-medium transition-all"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.28px',
            backgroundColor:
              activeTab === tab.id ? '#1a1a1a' : 'transparent',
            color: activeTab === tab.id ? '#ffffff' : '#1a1a1a',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
