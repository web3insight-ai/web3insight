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

    console.log("从 Web3Insight API 获取的用户数据:", userData)

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
    console.error("Get current user error:", error)
    return NextResponse.json({
      success: true,
      code: "200",
      message: "",
      data: null,
    })
  }
}
