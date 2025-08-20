import { NextRequest, NextResponse } from "next/server";
import { createUserSession } from "~/auth/helper/server";
import { env } from "../../../../env";

// Helper to create production-safe redirect URLs
function createRedirectUrl(path: string, request: NextRequest): URL {
  if (process.env.NODE_ENV === "production") {
    return new URL(path, "https://web3insight.ai");
  }
  return new URL(path, request.url);
}

// Web3Insight API OAuth endpoint - Throw error if not configured to avoid security risk
const apiUrl = env.DATA_API_URL;
if (!apiUrl) {
  throw new Error("DATA_API_URL environment variable is not set. Please configure it to continue.");
}
const API_BASE_URL = apiUrl;

function transformApiUserToCompatibleFormat(apiResponse: {
  profile: {
    user_id: string;
    user_nick_name: string;
    user_avatar: string;
    created_at: string;
    updated_at: string;
  };
  binds: Array<{ bind_type: string; bind_key: string }>;
  role: {
    allowed_roles: string[];
    default_role: string;
    user_id: string;
  };
}) {
  const { profile, binds, role } = apiResponse;

  // Find GitHub bind for username
  const githubBind = binds.find(
    (bind: { bind_type: string; bind_key: string }) =>
      bind.bind_type === "github",
  );
  const emailBind = binds.find(
    (bind: { bind_type: string; bind_key: string }) =>
      bind.bind_type === "email",
  );

  return {
    profile,
    binds,
    role,
    id: profile.user_id,
    username: githubBind?.bind_key || profile.user_nick_name,
    email: emailBind?.bind_key || "",
    provider: "github",
    confirmed: true,
    blocked: false,
    avatar_url: profile.user_avatar,
  };
}

// Authenticate with Web3Insight API using GitHub OAuth code
async function authenticateWithAPI(code: string) {
  // Step 1: Exchange code for token
  const tokenResponse = await fetch(`${API_BASE_URL}/v1/auth/login/oauth`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "github",
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(
      `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`,
    );
  }

  if (!tokenData.token) {
    throw new Error(`Invalid authentication response: Missing token`);
  }

  // Step 2: Fetch user profile using the token
  const userResponse = await fetch(`${API_BASE_URL}/v1/auth/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.token}`,
      accept: "*/*",
    },
  });

  if (!userResponse.ok) {
    const error = await userResponse.text();
    console.error("Failed to fetch user profile:", error);
    throw new Error(
      `Failed to fetch user profile: ${userResponse.status} ${userResponse.statusText}`,
    );
  }

  const userData = await userResponse.json();
  const user = transformApiUserToCompatibleFormat(userData);

  return {
    success: true,
    data: {
      token: tokenData.token,
      user,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("GitHub OAuth error:", error, error_description);
    return NextResponse.redirect(createRedirectUrl("/?error=oauth_error", request));
  }

  // Handle missing code
  if (!code) {
    console.error("GitHub OAuth error: No authorization code received");
    return NextResponse.redirect(createRedirectUrl("/?error=no_code", request));
  }

  let authResult;

  try {
    // Authenticate directly with Web3Insight API
    authResult = await authenticateWithAPI(code);
  } catch (apiError) {
    console.error("API authentication failed:", apiError);
    const errorMessage =
      apiError instanceof Error ? apiError.message : "Unknown API error";

    // Provide more specific error handling
    if (errorMessage.includes("API authentication failed")) {
      return NextResponse.redirect(
        createRedirectUrl("/?error=api_auth_failed", request),
      );
    } else {
      return NextResponse.redirect(
        createRedirectUrl("/?error=oauth_failed", request),
      );
    }
  }

  // Validate auth result
  if (!authResult || !authResult.success) {
    console.error("GitHub authentication failed:", "Unknown error");
    return NextResponse.redirect(createRedirectUrl("/?error=auth_failed", request));
  }

  const { token, user } = authResult.data;

  if (!user || !user.id) {
    console.error("GitHub authentication: User data missing");
    return NextResponse.redirect(createRedirectUrl("/?error=no_user_data", request));
  }

  // Create user session
  try {
    const sessionOpts = await createUserSession({
      userToken: token,
      userId: user.id,
    });

    // Create redirect response with session cookies
    // Always redirect to production URL to avoid localhost issues
    const redirectUrl = createRedirectUrl("/", request);
    const response = NextResponse.redirect(redirectUrl);

    // Apply session cookies to the redirect response
    if (sessionOpts.headers && sessionOpts.headers["Set-Cookie"]) {
      const cookies = Array.isArray(sessionOpts.headers["Set-Cookie"])
        ? sessionOpts.headers["Set-Cookie"]
        : [sessionOpts.headers["Set-Cookie"]];

      cookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }

    return response;
  } catch (sessionError) {
    console.error("Session creation failed:", sessionError);
    return NextResponse.redirect(createRedirectUrl("/?error=session_error", request));
  }
}
