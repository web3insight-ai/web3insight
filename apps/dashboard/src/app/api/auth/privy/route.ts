import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

// Privy authentication endpoint — exchanges a Privy identity token for a
// backend JWT via the api's orpc.auth.privyTokenAuth procedure, then fetches
// the user profile via orpc.auth.me. Both calls go through the typed
// @web3insight/orpc-client; no legacy REST left in this route.
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "Privy ID token is required" },
        { status: 400 },
      );
    }

    const anonClient = createWeb3InsightClient({
      url: RPC_URL,
      credentials: "omit",
    }).client;

    let token: string;
    try {
      const auth = (await anonClient.auth.privyTokenAuth({
        id_token: idToken,
      } as never)) as { token?: string };
      if (!auth?.token) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authentication response from server",
          },
          { status: 500 },
        );
      }
      token = auth.token;
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "auth failed";
      return NextResponse.json(
        {
          success: false,
          message: `Failed to authenticate with Privy: ${message}`,
          error: message,
        },
        { status },
      );
    }

    const userClient = createWeb3InsightClient({
      url: RPC_URL,
      token,
      credentials: "omit",
    }).client;

    let userData: unknown;
    try {
      userData = await userClient.auth.me({});
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      code: "200",
      message: "Privy authentication successful",
      data: { token, user: userData },
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
