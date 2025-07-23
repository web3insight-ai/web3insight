import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createUserSession } from "~/auth/helper/server-only";
import { signInWithGitHub } from "~/auth/repository";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("GitHub OAuth error:", error, errorDescription);
    return redirect("/");
  }

  // Handle missing code
  if (!code) {
    const errorMsg = "No authorization code received from GitHub";
    console.error("GitHub OAuth error:", errorMsg);
    return redirect("/");
  }

  try {
    // Exchange code for token and user data
    const authResult = await signInWithGitHub(code);

    if (!authResult.success) {
      console.error("GitHub authentication failed:", authResult.message);
      return redirect("/");
    }

    const { token, user } = authResult.data;

    // Create user session
    const sessionOpts = await createUserSession({
      request,
      userToken: token,
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
