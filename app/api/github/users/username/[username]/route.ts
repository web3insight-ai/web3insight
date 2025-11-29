import { NextResponse } from "next/server"
import { env } from "@/env"

const DATA_API_URL = env.DATA_API_URL

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, message: "GitHub username is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${DATA_API_URL}/v2/external/github/users/username/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch GitHub user data: ${error}`,
        },
        { status: response.status }
      )
    }

    const githubData = await response.json()

    let ecosystemNames: string[] = []
    if (githubData.eco_score?.ecosystems) {
      ecosystemNames = githubData.eco_score.ecosystems
        .filter((eco: any) => eco.ecosystem && eco.ecosystem !== 'ALL' && eco.ecosystem !== 'General')
        .map((eco: any) => eco.ecosystem)
    }
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
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching GitHub user data",
      },
      { status: 500 }
    )
  }
}
