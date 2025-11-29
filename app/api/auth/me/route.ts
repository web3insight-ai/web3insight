import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET() {
  try {
    console.log('=== /api/auth/me 调试 ===')
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")
    console.log('1. auth-token 存在:', !!authToken?.value)

    if (!authToken?.value) {
      console.log('⚠️ 没有 auth-token，返回 null')
      return NextResponse.json({
        success: true,
        code: "200",
        message: "",
        data: null,
      })
    }

    // Fetch user profile using the backend token
    console.log('2. 调用后端 API:', `${DATA_API_URL}/v1/auth/user`)
    const response = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        accept: "*/*",
      },
    })
    
    console.log('3. 后端响应状态:', response.status)

    if (!response.ok) {
      console.log('❌ 后端响应失败:', response.status)
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
    console.log('4. 后端返回数据:', userData)

    let processedUserData = userData

    if (userData && userData.profile) {
      console.log('5. 处理嵌套的 profile 数据')
      processedUserData = {
        id: userData.profile.user_id || userData.user_id,
        nick_name: userData.profile.user_nick_name,
        user_avatar: userData.profile.user_avatar,
        user_bio: userData.profile.user_bio,
        user_title: userData.profile.user_title || "",
        user_custom_x: userData.profile.user_custom_x,
        user_custom_labels: userData.profile.user_custom_labels,
        github_login: userData.profile.github_login || "",
        created_at: userData.profile.created_at,
        updated_at: userData.profile.updated_at,
        profile: userData.profile,
        binds: userData.binds,
        role: userData.role
      }
      console.log('6. 处理后的数据:', processedUserData)
    } else if (userData && !userData.id && userData.user_id) {
      console.log('5. 处理 user_id 映射')
      processedUserData = {
        ...userData,
        id: userData.user_id
      }
      console.log('6. 处理后的数据:', processedUserData)
    } else {
      console.log('⚠️ 数据格式未知，直接返回:', userData)
    }

    console.log('✅ 返回最终数据:', processedUserData)
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
