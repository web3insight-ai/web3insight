'use client'

import Image from 'next/image'
import Link from 'next/link'

interface NavBarProps {
  userId?: string
}

export function NavBar({ userId }: NavBarProps) {
  return (
    <nav className="h-[56px] flex items-center justify-between px-6 md:px-10 relative z-10">
      {/* Logo: [OpenBuild icon + text] | [Web3.insight() logo] */}
      <div className="flex items-center gap-2.5 h-[20px]">
        {/* OpenBuild icon */}
        <Image
          src="/images/nav-openbuild-icon.svg"
          alt=""
          width={14}
          height={14}
          className="h-[14px] w-auto"
        />
        {/* OpenBuild text */}
        <Image
          src="/images/nav-openbuild-text.svg"
          alt="OpenBuild"
          width={88}
          height={20}
          className="h-[20px] w-auto"
        />
        {/* Separator line */}
        <div className="h-[14px] w-[1px] bg-[#1a1a1a] opacity-40 mx-0" />
        {/* Web3.insight() logo */}
        <Image
          src="/images/nav-web3insight-logo.svg"
          alt="Web3.insight()"
          width={150}
          height={16}
          className="h-[16px] w-auto"
        />
      </div>

      {/* Right nav links */}
      <div className="hidden md:flex items-center gap-5">
        <a
          href="https://openbuild.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a1a1a] text-sm font-normal hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          About OpenBuild
        </a>
        <a
          href="https://web3insight.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a1a1a] text-sm font-normal hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          About Web3Insight
        </a>
        {userId && (
          <Link
            href={`/openbuild/${userId}`}
            className="bg-[#00ff98] text-black text-sm font-bold px-6 py-1.5 rounded-[50px] hover:bg-[#00ff98]/90 transition-colors h-[34px] flex items-center justify-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Devcard
          </Link>
        )}
      </div>
    </nav>
  )
}
