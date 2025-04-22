import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { loginUser, registerUser, forgotPassword, resetPassword } from "#/services/strapi";
import { createUserSession } from "#/services/auth/session.server";

// Type for error handling
type StrapiError = {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  // Get the redirect URL (or default to home)
  const redirectTo = formData.get("redirectTo")?.toString() || "/";

  try {
    // Handle different auth actions
    switch (action) {
      case "signin": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
          return json({ error: "Email and password are required" });
        }

        try {
          const response = await loginUser(email, password);

          // Create a session for the user
          return createUserSession({
            request,
            userJwt: response.jwt,
            userId: response.user.id,
            redirectTo
          });
        } catch (error) {
          const strapiError = error as StrapiError;
          console.error("Login error:", error);
          return json({
            error: strapiError.response?.data?.error?.message || "Invalid email or password"
          });
        }
      }

      case "signup": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const username = formData.get("username") as string;

        if (!email || !password || !username) {
          return json({ error: "All fields are required" });
        }

        try {
          const response = await registerUser(username, email, password);

          // Create a session for the newly registered user
          return createUserSession({
            request,
            userJwt: response.jwt,
            userId: response.user.id,
            redirectTo
          });
        } catch (error) {
          const strapiError = error as StrapiError;
          console.error("Registration error:", error);
          return json({
            error: strapiError.response?.data?.error?.message || "Registration failed"
          });
        }
      }

      case "forgotPassword": {
        const email = formData.get("email") as string;

        if (!email) {
          return json({ error: "Email is required" });
        }

        try {
          await forgotPassword(email);

          // Return success response
          return json({
            resetSuccess: true,
            email
          });
        } catch (error) {
          const strapiError = error as StrapiError;
          console.error("Forgot password error:", error);
          return json({
            error: strapiError.response?.data?.error?.message || "Failed to send reset email"
          });
        }
      }

      case "resetPassword": {
        const code = formData.get("code") as string;
        const password = formData.get("password") as string;
        const passwordConfirmation = formData.get("passwordConfirmation") as string;

        if (!code || !password || !passwordConfirmation) {
          return json({ error: "All fields are required" });
        }

        if (password !== passwordConfirmation) {
          return json({ error: "Passwords don't match" });
        }

        try {
          const response = await resetPassword(code, password, passwordConfirmation);

          // Create a session for the user after password reset
          return createUserSession({
            request,
            userJwt: response.jwt,
            userId: response.user.id,
            redirectTo
          });
        } catch (error) {
          const strapiError = error as StrapiError;
          console.error("Reset password error:", error);
          return json({
            error: strapiError.response?.data?.error?.message || "Failed to reset password"
          });
        }
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Auth action error:", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// No loader or component needed for this route
export default function Auth() {
  return redirect("/");
}
