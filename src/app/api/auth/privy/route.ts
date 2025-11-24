import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@env";

const DATA_API_URL = env.DATA_API_URL;

// Privy authentication endpoint
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "Privy ID token is required" },
        { status: 400 },
      );
    }

    // Call backend API to exchange Privy token for backend token
    const response = await fetch(`${DATA_API_URL}/v1/auth/privy/token/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Failed to authenticate with Privy: ${error}`,
          error: error,
        },
        { status: response.status },
      );
    }

    const authData = await response.json();

    if (!authData.token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication response from server",
        },
        { status: 500 },
      );
    }

    // Fetch user profile using the backend token
    const userResponse = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authData.token}`,
        accept: "*/*",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch user profile",
        },
        { status: userResponse.status },
      );
    }

    const userData = await userResponse.json();

    // Set the backend token as an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      code: "200",
      message: "Privy authentication successful",
      data: {
        token: authData.token,
        user: userData,
      },
    });
  } catch (error) {
    console.error("Privy authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during Privy authentication",
      },
      { status: 500 },
    );
  }
}

