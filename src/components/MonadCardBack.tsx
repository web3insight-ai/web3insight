'use client'

import { forwardRef, HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '../../lib/utils'

interface MonadCardBackProps extends HTMLAttributes<HTMLDivElement> {
  isFlipped?: boolean
}

const MonadCardBack = forwardRef<HTMLDivElement, MonadCardBackProps>(
  ({ isFlipped = false, className, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full overflow-hidden bg-black',
          className,
        )}
        style={{ fontSize: '1rem', ...style }}
        {...rest}
      >
        <div
          className="absolute top-0 left-0 right-0 p-[4%] flex items-center justify-between z-10 ignore-screenshot print:!opacity-100 print:!pointer-events-auto"
          data-html2canvas-ignore="true"
          style={{
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? 'none' : 'auto',
            transition: 'opacity 0.1s',
          }}
        >
          <Image
            src="/images/monad.svg"
            alt="MONAD"
            width={100}
            height={24}
            className="print:!h-[2.4em]"
            style={{ height: '1.4em', width: 'auto' }}
          />
          <div
            className="text-right text-gray-400 print:text-[1.1em]"
            style={{ fontSize: '0.82em' }}
          >
            <div className="mb-0.5">Powered by</div>
            <Image
              src="/images/web3insight_logo.svg"
              alt="Web3insight"
              width={120}
              height={24}
              className="print:!h-[2.4em]"
              style={{ height: '1.4em', width: 'auto' }}
            />
          </div>
        </div>

        <Image
          src="/images/monad-mascot.png"
          alt="Monad mascot"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      </div>
    )
  },
)

export default MonadCardBack
