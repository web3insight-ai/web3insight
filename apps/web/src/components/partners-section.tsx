"use client"

import { useI18n } from "@/lib/i18n-context"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"
import { Panel } from "@/components/blueprint"

const partners = [
  { name: "OpenBuild", url: "https://openbuild.xyz/", logo: "/ecosystem/openbuild.jpg" },
  { name: "ETH Shenzhen", url: "https://www.ethshenzhen.org/", logo: "/ecosystem/eth-shenzhen.svg" },
  { name: "Fracton", url: "https://www.fracton.ventures/", logo: "/ecosystem/fracton.jpg" },
  { name: "Monad", url: "https://www.monad.xyz/", logo: "/ecosystem/monad.svg" },
  { name: "Mantle", url: "https://www.mantle.xyz/", logo: "/ecosystem/mantle.png" },
  { name: "CAMP Network", url: "https://www.campnetwork.xyz/", logo: "/ecosystem/camp.svg" },
  { name: "Kite AI", url: "https://gokite.ai/", logo: "/ecosystem/kite.svg" },
]

function PartnerIcon({ name, logo }: { name: string; logo: string }) {
  const [imageError, setImageError] = useState(false)
  const initial = name.charAt(0)

  if (imageError || !logo) {
    return (
      <div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
        <span className="font-mono text-sm font-semibold text-foreground">{initial}</span>
      </div>
    )
  }

  const size = name === "Kite AI" ? { w: 44, h: 28 } : name === "ETH Shenzhen" ? { w: 36, h: 36 } : { w: 32, h: 32 }

  return (
    <div className="flex h-10 w-full items-center justify-center">
      <Image
        src={logo}
        alt={`${name} logo`}
        width={size.w}
        height={size.h}
        className="h-auto max-h-10 max-w-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function PartnersSection() {
  const { t } = useI18n()

  return (
    <section className="relative border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-10 flex items-end justify-between" margin="-20% 0px -10% 0px">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              06 · partners · n={partners.length}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              {t("partners.title")}
            </h2>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline-block">
            sheet 06/06
          </span>
        </ScrollReveal>

        <Panel ground="dotted" className="p-0">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            variants={stagger(0.06)}
          >
            {partners.map((partner, idx) => (
              <motion.div
                key={partner.name}
                variants={fadeInUp(0.02 * idx, 8)}
                className={[
                  "border-border-soft",
                  "border-r border-b",
                  idx % 2 === 1 ? "md:border-r" : "",
                  idx % 4 === 3 ? "md:border-r-0" : "",
                  idx % 7 === 6 ? "lg:border-r-0" : "lg:border-r",
                  idx === 6 ? "lg:border-b-0" : "",
                ].join(" ")}
              >
                <Link
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col items-center justify-center gap-3 bg-background/60 p-6 transition-colors hover:bg-background"
                >
                  <PartnerIcon name={partner.name} logo={partner.logo} />
                  <span className="font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                    {partner.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Panel>
      </div>
    </section>
  )
}
