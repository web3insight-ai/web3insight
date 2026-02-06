import { ImageResponse } from "next/og"
import { env } from "@/env"

export const runtime = "edge"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630

async function fetchUserData(ecosystem: string, userId: string) {
  const response = await fetch(
    `${env.DATA_API_URL}/v2/auth/user/info/${ecosystem}/${userId}`,
    { next: { revalidate: 60 } }
  )

  if (!response.ok) return null
  return response.json()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ecosystem: string; user_id: string }> }
) {
  const { ecosystem, user_id } = await params

  const userData = await fetchUserData(ecosystem, user_id)

  const name = userData?.profile?.user_nick_name || userData?.nick_name || "Web3 Builder"
  const title = userData?.profile?.user_title || userData?.user_title || `BuilderHero @${ecosystem}`
  const bio = userData?.profile?.user_bio || userData?.user_bio || "Building the future of Web3!"
  const avatar = userData?.profile?.user_avatar || userData?.user_avatar || ""
  const github = userData?.github || userData?.profile?.github_login || ""

  const accentColor = ecosystem === "mantle" ? "#5EEAD4" : ecosystem === "openbuild" ? "#01DB83" : "#9F8EFF"
  const bgColor = ecosystem === "mantle" ? "#0a0f0f" : ecosystem === "openbuild" ? "#001d15" : "#0a0a0f"

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: ecosystem === "mantle"
              ? "radial-gradient(ellipse at 50% 0%, rgba(94, 234, 212, 0.15) 0%, transparent 50%)"
              : ecosystem === "openbuild"
                ? "radial-gradient(ellipse at 50% 0%, rgba(1, 219, 131, 0.15) 0%, transparent 50%)"
                : "radial-gradient(ellipse at 50% 0%, rgba(159, 142, 255, 0.15) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px",
            zIndex: 1,
          }}
        >
          {/* Title badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: accentColor,
              color: "#000",
              padding: "8px 24px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            {title}
          </div>

          {/* Avatar */}
          <div
            style={{
              display: "flex",
              width: "120px",
              height: "120px",
              borderRadius: "60px",
              overflow: "hidden",
              border: `4px solid ${accentColor}`,
              marginBottom: "20px",
              backgroundColor: accentColor,
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name}
                width={120}
                height={120}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000",
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "12px",
            }}
          >
            {name}
          </div>

          {/* Bio */}
          <div
            style={{
              fontSize: "20px",
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: "600px",
              lineHeight: 1.4,
              marginBottom: "16px",
            }}
          >
            {bio.length > 100 ? bio.slice(0, 100) + "..." : bio}
          </div>

          {/* GitHub handle */}
          {github && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                color: accentColor,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={accentColor}
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>{github}</span>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "16px",
            color: "#666",
          }}
        >
          <span style={{ color: accentColor, fontWeight: 600 }}>
            {ecosystem === "mantle" ? "Mantle" : ecosystem === "openbuild" ? "OpenBuild" : "Monad"} DevCard
          </span>
          <span>•</span>
          <span>Powered by Web3Insight</span>
        </div>
      </div>
    ),
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }
  )
}
