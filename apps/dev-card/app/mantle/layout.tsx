import { CampaignBanner } from "@/components/CampaignBanner"

export default function MantleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CampaignBanner ecosystem="mantle" />
      {children}
    </>
  )
}
