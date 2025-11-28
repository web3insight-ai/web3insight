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
