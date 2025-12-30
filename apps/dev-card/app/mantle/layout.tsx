import { CampaignBanner } from "@/components/CampaignBanner"

export default function MantleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CampaignBanner ecosystem="mantle" />
      <div className="pt-9">
        {children}
      </div>
    </>
  )
}
