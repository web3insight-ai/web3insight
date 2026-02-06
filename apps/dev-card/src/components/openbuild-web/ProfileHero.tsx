'use client'

import Image from 'next/image'

export function ProfileHero() {
  return (
    <div className="relative h-[200px]">
      {/* Hero background - single composited image matching Figma */}
      <Image
        src="/images/openbuild-web-hero-bg.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
    </div>
  )
}
