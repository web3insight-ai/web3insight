import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

// Tag format: monad, mantle
function getTagForEcosystem(ecosystem: string): string {
  return ecosystem.toLowerCase()
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ecosystem: string }> }
) {
  try {
    const { ecosystem } = await params

    const validEcosystems = ["monad", "mantle"]
    if (!validEcosystems.includes(ecosystem.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid ecosystem" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken?.value) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    // Transform to v2 API format
    const v2Data = {
      user_nick_name: profileData.user_nick_name,
      user_avatar: profileData.user_avatar,
      user_bio: profileData.user_bio,
      user_custom_x: profileData.user_custom_x,
      user_custom_labels: profileData.user_custom_labels,
      user_title: profileData.user_title,
    }

    const tag = getTagForEcosystem(ecosystem)

    const response = await fetch(`${DATA_API_URL}/v2/auth/user/info/${tag}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(v2Data),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update profile: ${error}`,
        },
        { status: response.status }
      )
    }

    const userData = await response.json()

    let processedUserData = userData

    if (userData && userData.profile) {
      let githubLogin = ""
      if (userData.github) {
        githubLogin = userData.github
      } else if (userData.profile.github_login) {
        githubLogin = userData.profile.github_login
      }

      processedUserData = {
        id: userData.profile.user_id || userData.user_id,
        nick_name: userData.profile.user_nick_name,
        user_avatar: userData.profile.user_avatar,
        user_bio: userData.profile.user_bio,
        user_title: userData.profile.user_title || "",
        user_custom_x: userData.profile.user_custom_x,
        user_custom_labels: userData.profile.user_custom_labels,
        github_login: githubLogin,
        created_at: userData.profile.created_at,
        updated_at: userData.profile.updated_at,
        profile: userData.profile,
        binds: userData.binds,
        role: userData.role,
      }
    } else if (userData && !userData.id && userData.user_id) {
      processedUserData = {
        ...userData,
        id: userData.user_id,
      }
    }

    return NextResponse.json({
      success: true,
      code: "200",
      message: "Profile updated successfully",
      data: processedUserData,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating profile",
      },
      { status: 500 }
    )
  }
}
