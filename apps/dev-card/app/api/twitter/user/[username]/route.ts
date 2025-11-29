import { NextResponse } from "next/server"
import { env } from "@/env"

const TWITTER_API_URL = env.TWITTER_API_URL

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Twitter username is required" },
        { status: 400 }
      )
    }

    const variables = JSON.stringify({ screen_name: username })
    const encodedVariables = encodeURIComponent(variables)
    const operationId = "xxxxxxx"
    const response = await fetch(
      `${TWITTER_API_URL}/i/api/graphql/${operationId}/UserByScreenName?variables=${encodedVariables}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch Twitter user data: ${error}`,
        },
        { status: response.status }
      )
    }

    const twitterData = await response.json()

    const result = twitterData?.data?.user?.result
    const user = result?.legacy
    const bio = user?.description || ""

    // Get avatar from the correct path: data.user.result.avatar.image_url
    let avatarUrl = result?.avatar?.image_url || user?.profile_image_url_https || ""

    // Replace _normal with _400x400 for higher quality image
    if (avatarUrl && avatarUrl.includes('_normal.')) {
      avatarUrl = avatarUrl.replace('_normal.', '_400x400.')
    }

    return NextResponse.json({
      success: true,
      code: "200",
      message: "Twitter user data retrieved successfully",
      data: {
        username,
        bio,
        name: result?.core?.name || user?.name || "",
        avatar: avatarUrl,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching Twitter user data",
      },
      { status: 500 }
    )
  }
}


