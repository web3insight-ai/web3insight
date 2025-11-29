import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET() {
  try {
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

    // Fetch user profile using the backend token
    const response = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        accept: "*/*",
      },
    })

    if (!response.ok) {
      // Token might be expired, clear it
      if (response.status === 401) {
        cookieStore.delete("auth-token")
      }

      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: null,
      })
    }

    const userData = await response.json()

    let processedUserData = userData

    if (userData && userData.profile) {
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
    console.error("Get current user error:", error)
    return NextResponse.json({
      success: true,
      code: "200",
      message: "",
      data: null,
    })
  }
}
