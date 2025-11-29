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

    const user = twitterData?.data?.user?.result?.legacy
    const bio = user?.description || ""

    return NextResponse.json({
      success: true,
      code: "200",
      message: "Twitter user data retrieved successfully",
      data: {
        username,
        bio,
        name: user?.name || "",
        profileImageUrl: user?.profile_image_url_https || "",
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


