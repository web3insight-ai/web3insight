import { NextResponse } from "next/server"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ecosystem: string; id: string }> }
) {
  try {
    const { ecosystem, id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    if (!ecosystem) {
      return NextResponse.json(
        { success: false, message: "Ecosystem is required" },
        { status: 400 }
      )
    }

    // Validate ecosystem
    const validEcosystems = ["monad", "mantle"]
    if (!validEcosystems.includes(ecosystem.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid ecosystem" },
        { status: 400 }
      )
    }

    // Get user info from v2 API
    const response = await fetch(
      `${DATA_API_URL}/v2/auth/user/info/${ecosystem.toLowerCase()}/${id}`,
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
          message: `Failed to fetch user profile: ${error}`,
        },
        { status: response.status }
      )
    }

    const userData = await response.json()

    let processedUserData = userData

    if (userData && userData.profile) {
      // Try to get GitHub from multiple sources
      let githubLogin = ""

      // 1. Check top-level github field (from public API)
      if (userData.github) {
        githubLogin = userData.github
      }

      // 2. Check profile.github_login
      if (!githubLogin && userData.profile.github_login) {
        githubLogin = userData.profile.github_login
      }

      // 3. Check binds array
      if (!githubLogin && userData.binds && Array.isArray(userData.binds)) {
        const githubBind = userData.binds.find(
          (bind: any) =>
            bind.bind_type === "github" || bind.bind_type === "github_oauth"
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
