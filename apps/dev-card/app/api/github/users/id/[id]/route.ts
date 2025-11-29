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

    // 解析并显示生态系统名称
    let ecosystemNames: string[] = []
    if (githubData.eco_score?.ecosystems) {
      // 过滤掉 ALL 和 General，并提取生态系统名称
      ecosystemNames = githubData.eco_score.ecosystems
        .filter((eco: any) => eco.ecosystem && eco.ecosystem !== 'ALL' && eco.ecosystem !== 'General')
        .map((eco: any) => eco.ecosystem)
      console.log("生态系统列表:", ecosystemNames)
    }

    // 转换数据格式，将 eco_score.ecosystems 展开为 ecosystems 字段
    const transformedData = {
      ...githubData,
      ecosystems: ecosystemNames
    }

    return NextResponse.json({
      success: true,
      code: "200",
      message: "GitHub user data retrieved successfully",
      data: transformedData,
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
