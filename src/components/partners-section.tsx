"use client"

import { useI18n } from "@/lib/i18n-context"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

const partners = [
  {
    name: "OpenBuild",
    url: "https://openbuild.xyz/",
    logo: "/ecosystem/openbuild.jpg",
  },
  {
    name: "ETH Shenzhen",
    url: "https://www.ethshenzhen.org/",
    logo: "/ecosystem/eth-shenzhen.svg",
  },
  {
    name: "Fracton",
    url: "https://www.fracton.ventures/",
    logo: "/ecosystem/fracton.jpg",
  },
  {
    name: "Monad",
    url: "https://www.monad.xyz/",
    logo: "/ecosystem/monad.svg",
  },
  {
    name: "Mantle",
    url: "https://www.mantle.xyz/",
    logo: "/ecosystem/mantle.png",
  },
  {
    name: "CAMP Network",
    url: "https://www.campnetwork.xyz/",
    logo: "/ecosystem/camp.svg",
  },
  {
    name: "Kite AI",
    url: "https://gokite.ai/",
    logo: "/ecosystem/kite.svg",
  },
]

// Partner icon component with logo image and fallback
function PartnerIcon({ name, logo }: { name: string; logo: string }) {
  const [imageError, setImageError] = useState(false)
  const initial = name.charAt(0)

  // Get specific styling for certain partners
  const getPartnerStyling = (partnerName: string) => {
    switch (partnerName) {
      case "Kite AI":
        return {
          containerClass: "w-16 h-12 flex items-center justify-center", // Wider container
          imageWidth: 64,
          imageHeight: 48,
          imageClass: "object-contain max-w-full max-h-full scale-125" // Larger scale
        }
      case "ETH Shenzhen":
        return {
          containerClass: "w-14 h-14 flex items-center justify-center", // Larger square
          imageWidth: 56,
          imageHeight: 56,
          imageClass: "object-contain max-w-full max-h-full scale-110" // Slightly larger
        }
      default:
        return {
          containerClass: "w-12 h-12 flex items-center justify-center",
          imageWidth: 48,
          imageHeight: 48,
          imageClass: "object-contain max-w-full max-h-full"
        }
    }
  }

  const styling = getPartnerStyling(name)

  if (imageError || !logo) {
    // Fallback to initial if image fails to load
    return (
      <div className="w-12 h-12 rounded-md border border-border bg-secondary flex items-center justify-center">
        <span className="text-lg font-semibold text-foreground">{initial}</span>
      </div>
    )
  }

  return (
    <div className={styling.containerClass}>
      <Image
        src={logo}
        alt={`${name} logo`}
        width={styling.imageWidth}
        height={styling.imageHeight}
        className={styling.imageClass}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function PartnersSection() {
  const { t } = useI18n()

  return (
    <section className="py-20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-12">
          {t("partners.title")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
          {partners.map((partner) => (
            <Link
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-accent/5 transition-colors group"
            >
              <PartnerIcon name={partner.name} logo={partner.logo} />
              <span className="mt-4 text-sm text-muted-foreground text-center group-hover:text-foreground transition-colors font-medium">
                {partner.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
