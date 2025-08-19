import { NextRequest, NextResponse } from 'next/server';
import { createUserSession } from "~/auth/helper/server";
import { getVar } from "@/utils/env";

// Web3Insight API OAuth endpoint
const API_BASE_URL = getVar("DATA_API_URL") || "https://api.web3insight.ai";

// Authenticate with Web3Insight API using GitHub OAuth code
async function authenticateWithAPI(code: string) {
  console.log(`🔗 Calling API: ${API_BASE_URL}/v1/auth/login/oauth`);

  const response = await fetch(`${API_BASE_URL}/v1/auth/login/oauth`, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: "github",
      code: code,
    }),
  });

  const data = await response.json();
  console.log(`📊 API Response (${response.status}):`, JSON.stringify(data, null, 2));

  if (!response.ok) {
    // Handle specific error cases
    if (response.status === 500) {
      throw new Error(`API server error (500): ${data.message || 'Internal server error'}`);
    } else if (response.status === 400) {
      throw new Error(`Invalid request (400): ${data.message || 'Bad request'}`);
    } else if (response.status === 401) {
      throw new Error(`Unauthorized (401): ${data.message || 'Code may have expired'}`);
    } else {
      throw new Error(`API authentication failed: ${response.status} ${response.statusText}`);
    }
  }

  // Handle successful responses where success might be a boolean
  if (data.success === false) {
    throw new Error(`API OAuth error: ${data.message || 'Authentication failed'}`);
  }

  return data;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error("GitHub OAuth error:", error, error_description);
    return NextResponse.redirect(new URL("/?error=oauth_error", request.url));
  }

  // Handle missing code
  if (!code) {
    console.error("GitHub OAuth error: No authorization code received");
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  let authResult;

  try {
    console.log("🔄 Authenticating with Web3Insight API for code:", code.substring(0, 8) + "...");

    // Authenticate directly with Web3Insight API
    authResult = await authenticateWithAPI(code);
    console.log("✅ API authentication successful for user:", authResult.data?.user?.username || 'unknown');

  } catch (apiError) {
    console.error("API authentication failed:", apiError);
    const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';

    // Provide more specific error handling
    if (errorMessage.includes('API authentication failed')) {
      return NextResponse.redirect(new URL("/?error=api_auth_failed", request.url));
    } else {
      return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
    }
  }

  // Validate auth result
  if (!authResult || !authResult.success) {
    console.error("GitHub authentication failed:", authResult?.message || 'Unknown error');
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const { token, user } = authResult.data;

  if (!user || !user.id) {
    console.error("GitHub authentication: User data missing");
    return NextResponse.redirect(new URL("/?error=no_user_data", request.url));
  }

  // Create user session
  try {
    const sessionOpts = await createUserSession({
      request,
      userToken: token,
      userId: user.id,
    });

    console.log("✅ GitHub authentication successful for user:", user.username || user.id);

    // Create redirect response with session cookies
    const redirectUrl = new URL("/", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Apply session cookies to the redirect response
    if (sessionOpts.headers && sessionOpts.headers["Set-Cookie"]) {
      const cookies = Array.isArray(sessionOpts.headers["Set-Cookie"])
        ? sessionOpts.headers["Set-Cookie"]
        : [sessionOpts.headers["Set-Cookie"]];

      cookies.forEach(cookie => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (sessionError) {
    console.error("Session creation failed:", sessionError);
    return NextResponse.redirect(new URL("/?error=session_error", request.url));
  }
}
