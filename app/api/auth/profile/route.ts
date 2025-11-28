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

    // 处理API返回的数据结构，确保有正确的id字段
    let processedUserData = userData
    if (userData && !userData.id && userData.user_id) {
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
