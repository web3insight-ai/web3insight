'use client'

import Image from 'next/image'
import Link from 'next/link'

interface NavBarProps {
  userId?: string
}

export function NavBar({ userId }: NavBarProps) {
  return (
    <nav className="h-[60px] md:h-[84px] flex items-center justify-between px-5 md:px-14 relative z-10">
      {/* Logo: [OpenBuild icon + text] × [Web3.insight() logo] */}
      <div className="flex items-center gap-2.5 md:gap-4 h-[28px]">
        {/* OpenBuild icon */}
        <Image
          src="/images/nav-openbuild-icon.svg"
          alt=""
          width={18}
          height={18}
          className="h-[14px] md:h-[18px] w-auto"
        />
        {/* OpenBuild text */}
        <Image
          src="/images/nav-openbuild-text.svg"
          alt="OpenBuild"
          width={110}
          height={28}
          className="h-[20px] md:h-[28px] w-auto"
        />
        {/* Separator × */}
        <span className="text-[#1a1a1a]/40 text-xs md:text-sm select-none">×</span>
        {/* Web3.insight() logo */}
        <Image
          src="/images/nav-web3insight-logo.svg"
          alt="Web3.insight()"
          width={194}
          height={22}
          className="h-[16px] md:h-[22px] w-auto"
        />
      </div>

      {/* Mobile hamburger menu */}
      <button className="md:hidden flex items-center justify-center w-8 h-8">
        <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right nav links - desktop only */}
      <div className="hidden md:flex items-center gap-[26px]">
        <a
          href="https://openbuild.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a1a1a] text-[16px] font-normal leading-[20px] hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          About OpenBuild
        </a>
        <a
          href="https://web3insight.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a1a1a] text-[16px] font-normal leading-[20px] hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          About Web3Insight
        </a>
        {userId && (
          <Link
            href={`/openbuild/${userId}`}
            className="bg-[#00ff98] text-black text-[16px] font-bold px-[35px] py-[9px] rounded-[50px] hover:bg-[#00ff98]/90 transition-colors h-[42px] w-[150px] flex items-center justify-center leading-[27px] tracking-[-0.32px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Devcard
          </Link>
        )}
      </div>
    </nav>
  )
}
