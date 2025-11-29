import { NextResponse } from "next/server"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user public profile - no auth required
    const response = await fetch(`${DATA_API_URL}/v1/auth/user/public/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch user profile: ${error}`,
        },
        { status: response.status }
      )
    }

    const userData = await response.json()

    let processedUserData = userData

    if (userData && userData.profile) {
      let githubLogin = ""
      if (userData.binds && Array.isArray(userData.binds)) {
        const githubBind = userData.binds.find((bind: any) =>
          bind.bind_type === 'github' || bind.bind_type === 'github_oauth'
        )
        if (githubBind) {
          githubLogin = githubBind.bind_key || ""
        }
      }

      processedUserData = {
        id: userData.profile.user_id || userData.user_id,
        nick_name: userData.profile.user_nick_name,
        user_avatar: userData.profile.user_avatar,
        user_bio: userData.profile.user_bio,
        user_title: Array.isArray(userData.profile.user_title) && userData.profile.user_title.length > 0
          ? userData.profile.user_title[0]
          : userData.profile.user_title || "",
        user_custom_x: userData.profile.user_custom_x,
        user_custom_labels: userData.profile.user_custom_labels,
        github_login: githubLogin,
        created_at: userData.profile.created_at,
        updated_at: userData.profile.updated_at,
        profile: userData.profile,
        binds: userData.binds,
        role: userData.role
      }
    } else if (userData && !userData.id && userData.user_id) {
      processedUserData = {
        ...userData,
        id: userData.user_id
      }
    }

    return NextResponse.json({
      success: true,
      code: "200",
      message: "",
      data: processedUserData,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching user profile",
      },
      { status: 500 }
    )
  }
}
