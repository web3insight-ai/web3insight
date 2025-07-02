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
    console.error("GitHub OAuth error:", error, errorDescription);

    // Redirect to home page
    return redirect("/");
  }

  // Handle missing access token
  if (!accessToken) {
    const errorMsg = "No access token received from GitHub";
    console.error("GitHub OAuth error:", errorMsg);
    return redirect("/");
  }

  try {
    // Exchange access token for JWT and user data
    const authResult = await authWithGitHub(accessToken);

    if (!authResult.success) {
      console.error("GitHub authentication failed:", authResult.message);
      return redirect("/");
    }

    const { jwt, user } = authResult.data;

    // Create user session
    const sessionOpts = await createUserSession({
      request,
      userJwt: jwt,
      userId: user.id,
    });

    // Redirect to home page after successful authentication
    return redirect("/", sessionOpts);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return redirect("/");
  }
}

// No component needed for this route - it's just for handling the callback
export default function GitHubCallback() {
  return null;
}
