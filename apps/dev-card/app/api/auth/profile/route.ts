import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken?.value) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    // Update user profile using the backend token
    const response = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(profileData),
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

    // 处理API返回的数据结构，支持嵌套的 profile 对象
    let processedUserData = userData

    // 如果数据有嵌套的 profile 结构，展平它
    if (userData && userData.profile) {
      processedUserData = {
        id: userData.profile.user_id || userData.user_id,
        nick_name: userData.profile.user_nick_name,
        user_avatar: userData.profile.user_avatar,
        user_bio: userData.profile.user_bio,
        user_custom_x: userData.profile.user_custom_x,
        user_custom_labels: userData.profile.user_custom_labels,
        created_at: userData.profile.created_at,
        updated_at: userData.profile.updated_at,
        // 保留原始的 profile 数据以备用
        profile: userData.profile,
        binds: userData.binds,
        role: userData.role
      }
    } else if (userData && !userData.id && userData.user_id) {
      // 如果是扁平结构但使用 user_id 字段
      processedUserData = {
        ...userData,
        id: userData.user_id  // 将 user_id 映射为 id
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
