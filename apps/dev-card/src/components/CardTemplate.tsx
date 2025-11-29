"use client"

export interface CardData {
  id?: string
  name: string
  github: string
  twitter: string
  bio: string
  avatar: string
  title: string
  buildingOn: string[]
}

interface CardTemplateProps {
  data: CardData
}

/**
 * Fixed-size card template for image export (1701px × 2709px)
 * Matches the web version exactly, but with fixed pixel dimensions
 */
export function CardTemplate({ data }: CardTemplateProps) {
  const { name, github, twitter, bio, avatar, title, buildingOn } = data
  const hasEcosystems = buildingOn.length > 1

  // Base font size for calculations (1em = 54px at this resolution)
  const baseFontSize = 54
  const cardWidth = 1701
  const cardHeight = 2709

  return (
    <div
      style={{
        position: "relative",
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: "#090111",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: `${cardHeight * 0.03}px 0 0`,
        }}
      >
        {/* Title Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: `${cardHeight * 0.012}px` }}>
          <div style={{ position: "relative", width: `${cardWidth * 0.7}px` }}>
            <img
              src="/images/title_bg.svg"
              alt=""
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "10%",
                paddingRight: "10%",
                height: "72.7%",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: `${baseFontSize * 0.9}px`,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: `${cardHeight * 0.015}px` }}>
          <div
            style={{
              width: `${cardWidth * 0.25}px`,
              aspectRatio: "1",
              borderRadius: "50%",
              padding: "2px",
              background: "linear-gradient(135deg, #9F8EFF 0%, #EC4899 50%, #22D3EE 100%)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#9F8EFF",
              }}
            >
              <img
                src={avatar || "/images/monad-icon.svg"}
                alt="User avatar"
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>

        {/* Name */}
        <h2
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: `${baseFontSize * 2.2}px`,
            fontWeight: 700,
            textAlign: "center",
            color: "#ffffff",
            letterSpacing: "0.025em",
            marginBottom: `${cardHeight * 0.01}px`,
            lineHeight: 1,
            margin: `0 0 ${cardHeight * 0.01}px 0`,
          }}
        >
          {name}
        </h2>

        {/* Bio */}
        <p
          style={{
            textAlign: "center",
            color: "#ffffff",
            paddingLeft: `${cardWidth * 0.08}px`,
            paddingRight: `${cardWidth * 0.08}px`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: `${baseFontSize * 0.95}px`,
            lineHeight: 1.6,
            fontWeight: 300,
            margin: "0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {bio}
        </p>

        {/* Social Links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: `${cardWidth * 0.03}px`,
            marginTop: `${cardHeight * 0.012}px`,
            fontSize: `${baseFontSize * 0.88}px`,
            paddingLeft: `${cardWidth * 0.08}px`,
            paddingRight: `${cardWidth * 0.08}px`,
          }}
        >
          {twitter && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${baseFontSize * 0.12}px`,
                  color: "#9F8EFF",
                  maxWidth: github ? "45%" : "90%",
                  overflow: "hidden",
                }}
              >
                <svg
                  style={{
                    color: "#ffffff",
                    width: `${baseFontSize * 0.88}px`,
                    height: `${baseFontSize * 0.88}px`,
                    flexShrink: 0
                  }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  @{twitter}
                </span>
              </div>
              {github && (
                <span style={{ color: "#4B5563", margin: `0 ${baseFontSize * 0.08}px`, flexShrink: 0 }}>|</span>
              )}
            </>
          )}
          {github && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${baseFontSize * 0.12}px`,
                color: "#9F8EFF",
                maxWidth: twitter ? "45%" : "90%",
                overflow: "hidden",
              }}
            >
              <svg
                style={{
                  color: "#ffffff",
                  width: `${baseFontSize * 0.88}px`,
                  height: `${baseFontSize * 0.88}px`,
                  flexShrink: 0
                }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {github}
              </span>
            </div>
          )}
          {!twitter && !github && (
            <div style={{ color: "#6B7280" }}>Web3 Builder</div>
          )}
        </div>

        {/* Building on Section */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingBottom: `${cardHeight * 0.03}px`,
            paddingTop: `${cardHeight * 0.03}px`,
            paddingLeft: `${cardWidth * 0.055}px`,
            paddingRight: `${cardWidth * 0.055}px`,
          }}
        >
          {hasEcosystems ? (
            <div
              style={{
                borderRadius: `${baseFontSize * 0.5}px`,
                padding: `${cardWidth * 0.055}px`,
                border: "1px solid rgba(31, 41, 55, 0.5)",
                backgroundColor: "#927EFF1A",
              }}
            >
              <h3
                style={{
                  marginBottom: `${cardHeight * 0.035}px`,
                  fontWeight: 600,
                  color: "#9F8EFF",
                  fontSize: `${baseFontSize * 1.1}px`,
                  margin: `0 0 ${cardHeight * 0.035}px 0`,
                }}
              >
                Building on
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: `${cardWidth * 0.018}px`,
                }}
              >
                {buildingOn.map((item) => (
                  <span
                    key={item}
                    style={{
                      paddingLeft: `${cardWidth * 0.028}px`,
                      paddingRight: `${cardWidth * 0.028}px`,
                      paddingTop: `${cardHeight * 0.01}px`,
                      paddingBottom: `${cardHeight * 0.01}px`,
                      borderRadius: "9999px",
                      color: "#ffffff",
                      fontWeight: 500,
                      outline: "2px solid #9F8EFF",
                      outlineOffset: "-2px",
                      fontSize: `${baseFontSize * 0.7}px`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingBottom: `${cardHeight * 0.03}px`,
              }}
            >
              <img
                src="/images/gmonad-bunny.png"
                alt="GMONAD bunny"
                crossOrigin="anonymous"
                style={{
                  width: `${cardWidth * 0.5}px`,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: `${cardHeight * 0.035}px`,
            paddingBottom: `${cardHeight * 0.035}px`,
          }}
        >
          <img
            src="/images/monad_footer.svg"
            alt="Monad DevCard"
            style={{
              height: `${baseFontSize * 1.15}px`,
              width: "auto",
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </div>
  )
}
