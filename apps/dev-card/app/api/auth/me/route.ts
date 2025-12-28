import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ecosystem = searchParams.get("ecosystem")

    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken?.value) {
      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: null,
      })
    }

    // First, get user ID from v1 auth endpoint (needed to get user ID)
    const userResponse = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        accept: "*/*",
      },
    })

    if (!userResponse.ok) {
      // Token might be expired, clear it
      if (userResponse.status === 401) {
        cookieStore.delete("auth-token")
      }

      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: null,
      })
    }

    const userData = await userResponse.json()

    // Get user ID from response
    const userId = userData?.profile?.user_id || userData?.user_id

    if (!userId) {
      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: null,
      })
    }

    // If ecosystem is provided, use v2 API
    if (ecosystem) {
      const validEcosystems = ["monad", "mantle"]
      if (!validEcosystems.includes(ecosystem.toLowerCase())) {
        return NextResponse.json(
          { success: false, message: "Invalid ecosystem" },
          { status: 400 }
        )
      }

      const v2Response = await fetch(
        `${DATA_API_URL}/v2/auth/user/info/${ecosystem.toLowerCase()}/${userId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      )

      if (!v2Response.ok) {
        // v2 API failed, return only minimal info (id, github) for user to create profile
        // Don't return profile data from v1 as it might be from another ecosystem
        let githubLogin = ""
        if (userData.profile?.github_login) {
          githubLogin = userData.profile.github_login
        } else if (userData.binds && Array.isArray(userData.binds)) {
          const githubBind = userData.binds.find(
            (bind: any) =>
              bind.bind_type === "github" || bind.bind_type === "github_oauth"
          )
          if (githubBind) {
            githubLogin = githubBind.bind_key || ""
          }
        }

        // Only return id and github_login, other fields should be empty for new ecosystem
        const basicUserData = {
          id: userId,
          nick_name: "",
          user_avatar: "",
          user_bio: "",
          user_title: "",
          user_custom_x: "",
          user_custom_labels: [],
          github_login: githubLogin,
        }

        return NextResponse.json({
          success: true,
          code: "200",
          message: "",
          data: basicUserData,
        })
      }

      const v2Data = await v2Response.json()

      let processedV2Data = v2Data

      if (v2Data && v2Data.profile) {
        let githubLogin = ""
        if (v2Data.github) {
          githubLogin = v2Data.github
        } else if (v2Data.profile.github_login) {
          githubLogin = v2Data.profile.github_login
        } else if (v2Data.binds && Array.isArray(v2Data.binds)) {
          const githubBind = v2Data.binds.find(
            (bind: any) =>
              bind.bind_type === "github" || bind.bind_type === "github_oauth"
          )
          if (githubBind) {
            githubLogin = githubBind.bind_key || ""
          }
        }

        processedV2Data = {
          id: v2Data.profile.user_id || v2Data.user_id,
          nick_name: v2Data.profile.user_nick_name,
          user_avatar: v2Data.profile.user_avatar,
          user_bio: v2Data.profile.user_bio,
          user_title: v2Data.profile.user_title || "",
          user_custom_x: v2Data.profile.user_custom_x,
          user_custom_labels: v2Data.profile.user_custom_labels,
          github_login: githubLogin,
          created_at: v2Data.profile.created_at,
          updated_at: v2Data.profile.updated_at,
          profile: v2Data.profile,
          binds: v2Data.binds,
          role: v2Data.role,
        }
      }

      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: processedV2Data,
      })
    }

    // No ecosystem provided - return error (ecosystem is required now)
    return NextResponse.json(
      { success: false, message: "Ecosystem parameter is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching user data",
      },
      { status: 500 }
    )
  }
}
