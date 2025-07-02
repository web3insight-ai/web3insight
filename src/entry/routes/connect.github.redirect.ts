import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createUserSession } from "~/auth/helper/server-only";
import { authWithGitHub } from "~/auth/repository";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get("access_token");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    const errorMsg = errorDescription || "GitHub authentication failed";
    console.error("GitHub OAuth error:", error, errorDescription);
    
    // Redirect to home with error message in URL params
    return redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  // Handle missing access token
  if (!accessToken) {
    const errorMsg = "No access token received from GitHub";
    console.error("GitHub OAuth error:", errorMsg);
    return redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    // Exchange access token for JWT and user data
    const authResult = await authWithGitHub(accessToken);

    if (!authResult.success) {
      console.error("GitHub authentication failed:", authResult.message);
      return redirect(`/?auth_error=${encodeURIComponent(authResult.message || "Authentication failed")}`);
    }

    const { jwt, user } = authResult.data;

    // Create user session
    const sessionOpts = await createUserSession({
      request,
      userJwt: jwt,
      userId: user.id,
    });

    // Check if this is a new GitHub user
    const isNewUser = authResult.extra?.isNewGitHubUser;
    const successParam = isNewUser ? "github_new" : "github";

    // Redirect to home page with success
    return redirect(`/?auth_success=${successParam}`, sessionOpts);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    const errorMsg = "An unexpected error occurred during authentication";
    return redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }
}

// No component needed for this route - it's just for handling the callback
export default function GitHubCallback() {
  return null;
}
