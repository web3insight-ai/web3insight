'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '../../lib/utils'

interface MonadCardFrontProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  github: string
  twitter: string
  bio: string
  avatar: string
  title: string
  buildingOn: string[]
}

const MonadCardFront = forwardRef<HTMLDivElement, MonadCardFrontProps>(
  (
    {
      name,
      github,
      twitter,
      bio,
      avatar,
      title,
      buildingOn,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const hasEcosystems = buildingOn.length > 1

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full overflow-hidden bg-[#090111]',
          className,
        )}
        style={{ fontSize: '1rem', ...style }}
        {...rest}
      >
        <div className="w-full h-full flex flex-col px-[5%] pt-[3%] pb-0 print:py-[3mm] print:px-[6%]">
          {/* Title Badge */}
          <div className="flex justify-center mb-[1.2%] relative print:mb-[2.8%]">
            <div className="relative w-[70%] print:w-[85%]">
              <Image
                src="/images/title_bg.svg"
                alt=""
                width={340}
                height={58}
                priority
                className="w-full h-auto"
              />
              <div
                className="absolute top-0 left-0 right-0 flex items-center justify-center px-[10%]"
                style={{ height: '72.7%' }}
              >
                <span
                  className="text-white text-center line-clamp-1 print:text-[1.8em]! print:leading-tight print:font-bold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.9em',
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-[1.5%] print:mb-[1mm]">
            <div
              className="w-[25%] aspect-square rounded-full p-0.5 print:w-[40%]"
              style={{
                background:
                  'linear-gradient(135deg, #9F8EFF 0%, #EC4899 50%, #22D3EE 100%)',
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{ backgroundColor: '#9F8EFF' }}
              >
                <Image
                  src={avatar}
                  alt="User avatar"
                  width={208}
                  height={208}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/monad-icon.svg'
                  }}
                />
              </div>
            </div>
          </div>

          <h2
            className="font-bold text-center text-white tracking-wide mb-[1%] text-[2.2em] print:text-[16px] print:mb-[0.2mm]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {name}
          </h2>

          <p
            className="text-center text-white px-[8%] line-clamp-2 leading-relaxed font-light text-[0.95em] print:text-[8px] print:leading-[1.25] print:text-balance"
            style={{
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {bio}
          </p>

          {/* Social Links */}
          <div className="flex justify-center items-center gap-[3%] mt-[1.2%] px-[8%] text-[0.88em] print:text-[7px] print:mt-[0.5mm]">
            {twitter && (
              <>
                <a
                  href={`https://twitter.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors overflow-hidden"
                  style={{ color: '#9F8EFF', maxWidth: github ? '45%' : '90%' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#BBA9FF')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#9F8EFF')
                  }
                >
                  <svg
                    className="text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ width: '1em', height: '1em' }}
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="truncate">@{twitter}</span>
                </a>
                {github && (
                  <span className="text-gray-600 mx-1 shrink-0">|</span>
                )}
              </>
            )}

            {github && (
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors overflow-hidden"
                style={{ color: '#9F8EFF', maxWidth: twitter ? '45%' : '90%' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#BBA9FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9F8EFF'
                }}
              >
                <svg
                  className="text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ width: '1em', height: '1em' }}
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="truncate">{github}</span>
              </a>
            )}

            {!twitter && !github && (
              <div className="text-gray-500">Web3 Builder</div>
            )}
          </div>

          {/* Building on Section */}
          <div className="flex-1 flex flex-col print:justify-normal justify-center pb-[3%] pt-[5%] print:pt-[1mm] print:pb-[1mm] print:mt-[4mm]">
            {hasEcosystems ? (
              <div
                className="rounded-3xl p-[5.5%] border border-gray-800/50 print:py-[6%] print:px-[4%] print:rounded-[3rem]"
                style={{ backgroundColor: '#927EFF1A' }}
              >
                <h3
                  className="mb-[4.5%] font-semibold print:text-[6.5px] text-[1.1em] print:mb-[1mm]"
                  style={{ color: '#9F8EFF' }}
                >
                  Building on
                </h3>
                <div className="flex flex-wrap gap-[2.8%] print:gap-[1mm]">
                  {buildingOn.map((item) => (
                    <span
                      key={item}
                      className="px-[5.5%] py-[2.2%] rounded-full text-white font-medium mb-[2.2%] text-[0.95em] print:text-[6px] print:px-[6.5%] print:py-[3%] print:mb-0"
                      style={{
                        outline: '1px solid #9F8EFF',
                        outlineOffset: '-1px',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-[4%] print:mt-[1.5mm]">
                  <p
                    className="text-center text-[0.8em] print:text-[5px] leading-relaxed"
                    style={{
                      color: '#9F8EFF',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    View detailed insights at{' '}
                    <a
                      href="https://dash.web3insight.ai/devinsight"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-colors"
                      style={{ color: '#BBA9FF' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = '#DDD0FF')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = '#BBA9FF')
                      }
                    >
                      DevInsight
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center pb-[3%]">
                <Image
                  src="/images/gmonad-bunny.png"
                  alt="GMONAD bunny"
                  width={300}
                  height={350}
                  className="object-contain w-[50%] h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer Logo */}
          <div className="flex justify-center items-center py-[2%]">
            <Image
              src="/images/monad_footer.svg"
              alt="Monad DevCard"
              width={180}
              height={24}
              className="print:h-[2mm] h-[1.15em]"
              style={{ width: 'auto', opacity: 0.9 }}
            />
          </div>
        </div>
      </div>
    )
  },
)

MonadCardFront.displayName = 'MonadCardFront'

export default MonadCardFront
