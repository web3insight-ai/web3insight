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
        { success: false, message: "GitHub user ID is required" },
        { status: 400 }
      )
    }

    console.log(`获取GitHub用户数据: id=${id}`)

    // 调用 Web3Insight API 获取 GitHub 用户数据
    const response = await fetch(`${DATA_API_URL}/v2/external/github/users/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`GitHub API 调用失败: ${response.status} - ${error}`)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch GitHub user data: ${error}`,
        },
        { status: response.status }
      )
    }

    const githubData = await response.json()
    console.log("GitHub API 返回数据:", githubData)

    return NextResponse.json({
      success: true,
      code: "200",
      message: "GitHub user data retrieved successfully",
      data: githubData,
    })
  } catch (error) {
    console.error("GitHub API 调用异常:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching GitHub user data",
      },
      { status: 500 }
    )
  }
}
