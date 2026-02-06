import type { Metadata } from "next"
import { env } from "@/env"

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ user_id: string }>
}

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(
      `${env.DATA_API_URL}/v2/auth/user/info/openbuild/${userId}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user_id: string }>
}): Promise<Metadata> {
  const { user_id } = await params
  const userData = await fetchUserData(user_id)

  const name = userData?.profile?.user_nick_name || userData?.nick_name || "Web3 Builder"
  const bio = userData?.profile?.user_bio || userData?.user_bio || "Building the future of Web3!"
  const title = `${name}'s Dev Card @ OpenBuild`
  const description = bio.length > 160 ? bio.slice(0, 157) + "..." : bio

  // Determine base URL for OG image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "https://card.web3insight.ai"

  const ogImageUrl = `${baseUrl}/api/og/openbuild/${user_id}`
  const pageUrl = `${baseUrl}/openbuild/${user_id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Web3Insight Dev Card",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name}'s OpenBuild Dev Card`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@Web3InsightAI",
    },
  }
}

export default function CardLayout({ children }: LayoutProps) {
  return children
}
