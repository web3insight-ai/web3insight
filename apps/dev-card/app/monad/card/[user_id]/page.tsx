"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, Share2 } from "lucide-react"

export default function CardPage() {
  const [isFlipped, setIsFlipped] = useState(false)

  // Default card data
  const name = "Web3Insight"
  const github = "web3insight-ai"
  const twitter = "Web3insightAI"
  const bio = "Comprehensive insights about major blockchain ecosystems!"
  const buildingOn = ["Monad", "OpenBuild", "Starknet", "DeFiHackLabs", "WTF.Academy", "Ethereum", "Hardhat"]
  const hasEcosystems = false

  return (
    <div className="h-dvh w-full bg-black flex flex-col overflow-hidden md:items-center">
      {/* Card container - takes all available space except bottom */}
      <div className="flex-1 w-full md:max-w-[420px] md:flex md:items-center md:justify-center">
        <div
          className="relative w-full h-full md:h-auto md:aspect-[54/86] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Back side (default view - mascot) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="w-full h-full bg-black relative">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10">
                  <Image src="/images/monad.svg" alt="MONAD" width={80} height={20} className="h-5 w-auto" />
                  <div className="text-right text-xs sm:text-sm text-gray-400">
                    <div>Powered by</div>
                    <Image
                      src="/images/web3insight_logo.svg"
                      alt="Web3insight"
                      width={100}
                      height={20}
                      className="h-5 w-auto mt-0.5"
                    />
                  </div>
                </div>

                {/* Mascot */}
                <Image src="/images/monad-mascot.png" alt="Monad mascot" fill className="object-cover" priority />
              </div>
            </div>

            {/* Front side (user info) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden bg-black"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="w-full h-full flex flex-col px-5 pt-12 pb-0">
                {/* BuilderHero Badge */}
                <div className="flex justify-center mb-6 relative">
                  <div className="relative w-full max-w-[340px]">
                    <div className="w-full px-6 py-2.5 rounded-full text-white text-base font-semibold text-center" style={{ background: 'linear-gradient(to right, #5EEAD4, #9F8EFF)' }}>
                      BuilderHero @Monad
                    </div>
                    {/* Speech bubble tail */}
                    <div
                      className="absolute -bottom-2 right-12 w-4 h-4"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        backgroundColor: "#9F8EFF",
                      }}
                    />
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  <div className="w-32 h-32 rounded-full p-[3px]" style={{ background: 'linear-gradient(to bottom right, #9F8EFF, #EC4899, #22D3EE)' }}>
                    <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: '#9F8EFF' }}>
                      <Image
                        src="/images/user-avatar-sample.png"
                        alt="Default avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Name - using DM Mono font */}
                <h2 className="text-4xl font-bold text-center text-white tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {name}
                </h2>

                {/* Bio */}
                <p className="text-center text-white text-sm mt-3 px-6 line-clamp-2 leading-relaxed font-light" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center items-center gap-3 mt-4 text-sm">
                  <a
                    href={`https://twitter.com/${twitter}`}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ color: '#9F8EFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#BBA9FF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9F8EFF'}
                  >
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>@{twitter}</span>
                  </a>
                  {github && (
                    <>
                      <span className="text-gray-600">|</span>
                      <a
                        href={`https://github.com/${github}`}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{ color: '#9F8EFF' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#BBA9FF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9F8EFF'
                        }}
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span>{github}</span>
                      </a>
                    </>
                  )}
                </div>

                {/* Building on Section - centered vertically in remaining space */}
                <div className="flex-1 flex flex-col justify-center py-10">
                  {hasEcosystems ? (
                    <div className="bg-[#1C1C2E] rounded-2xl p-4 border border-gray-800/50 mx-2">
                      <h3 className="text-sm mb-2.5 font-medium" style={{ color: '#9F8EFF' }}>Building on</h3>
                      <div className="flex flex-wrap gap-2">
                        {buildingOn.map((item) => (
                          <span
                            key={item}
                            className="px-3 py-1 rounded-full text-xs text-white font-medium border-2"
                            style={{ borderColor: '#9F8EFF' }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Image
                        src="/images/gmonad-bunny.png"
                        alt="GMONAD bunny"
                        width={200}
                        height={240}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Logo - fixed at bottom */}
                <div className="flex justify-center items-center h-12">
                  <Image
                    src="/images/monad_footer.svg"
                    alt="Monad DevCard"
                    width={150}
                    height={20}
                    className="h-4 w-auto opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - fixed height */}
      <div className="flex-shrink-0 flex flex-col items-center pb-8 pt-4 gap-4">
        {/* Tap card to flip */}
        <p className="text-gray-500 text-sm">Tap card to flip</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="px-5 py-2.5 text-sm text-white rounded-full transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            style={{ background: 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #5EEAD4, #9F8EFF)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgba(94, 234, 212, 0.8), rgba(159, 142, 255, 0.8))'}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="px-5 py-2.5 text-sm bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-700 flex items-center gap-2 font-medium">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
