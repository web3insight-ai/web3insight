import { json } from "@remix-run/node";
import { STRAPI_API_URL, STRAPI_API_TOKEN } from "~/services/env.server";
import { getStrapiUrl, getStrapiHeaders } from "~/services/strapi.server";

// Interface for user data
export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

// Login with Strapi
export async function loginUser(identifier: string, password: string) {
  try {
    const authEndpoint = getStrapiUrl('api/auth/local');
    console.log(`Attempting login with Strapi at: ${authEndpoint}`);

    const response = await fetch(authEndpoint, {
      method: "POST",
      headers: getStrapiHeaders(),
      body: JSON.stringify({
        identifier, // This can be email or username
        password,
      }),
    });

    console.log("Strapi login response status:", response.status);
    const data = await response.json();
    console.log("Strapi login response data:", JSON.stringify(data));

    if (!response.ok) {
      let errorMessage = "Login failed";

      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = data.error.message;
        }
      }

      console.error("Login error:", errorMessage);
      return json({ error: errorMessage }, { status: response.status });
    }

    // Check if email is confirmed
    if (data.user && !data.user.confirmed) {
      console.log("User email not confirmed:", data.user.email);
      return json({
        ...data,
        message: "Please verify your email address to access all features.",
      });
    }

    console.log("Login successful for user:", data.user?.username);
    return json(data);
  } catch (error) {
    console.error("Login error:", error);
    return json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

// Register a new user
export async function registerUser(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "Registration failed";

      if (data.error?.message) {
        errorMessage = data.error.message;
      }

      return json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Send confirmation email using Strapi's built-in endpoint
    const confirmationResponse = await fetch(`${STRAPI_API_URL}/api/auth/send-email-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!confirmationResponse.ok) {
      return json({
        ...data,
        message: "Registration successful but verification email could not be sent. Please contact support."
      });
    }

    return json({
      ...data,
      message: "Registration successful. Please check your email to verify your account.",
      requiresEmailVerification: true
    });
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

// Get current user data
export async function getCurrentUser(token: string) {
  try {
    const usersEndpoint = getStrapiUrl('api/users/me');

    const response = await fetch(usersEndpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If user token is invalid, try using admin token
      if (response.status === 401 && STRAPI_API_TOKEN) {
        console.log("User token invalid, trying admin token");
        const adminResponse = await fetch(usersEndpoint, {
          method: "GET",
          headers: getStrapiHeaders(true),
        });

        console.log("Admin token response status:", adminResponse.status);

        if (adminResponse.ok) {
          const userData = await adminResponse.json();
          return userData; // Return the actual user data, not wrapped in json()
        }
      }

      console.error("Failed to get user data");
      return { status: response.status, error: "Failed to get user data" };
    }

    const userData = await response.json();

    return userData; // Return the actual user data, not wrapped in json()
  } catch (error) {
    return { status: 500, error: "An error occurred while fetching user data" };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { error: data.error?.message || "Failed to send password reset email" },
        { status: response.status }
      );
    }

    return json({
      message: "Password reset email sent successfully"
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return json(
      { error: "An error occurred while sending the password reset email" },
      { status: 500 }
    );
  }
}

// Reset password with token
export async function resetPassword(code: string, password: string, passwordConfirmation: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { error: data.error?.message || "Failed to reset password" },
        { status: response.status }
      );
    }

    return json({
      ...data,
      message: "Password has been reset successfully. You can now login."
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}

// Email confirmation
export async function confirmEmail(confirmation: string) {
  try {
    const url = new URL(`${STRAPI_API_URL}/api/auth/email-confirmation`);
    url.searchParams.append('confirmation', confirmation);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { error: data.error?.message || "Failed to confirm email" },
        { status: response.status }
      );
    }

    return json({
      ...data,
      message: "Email confirmed successfully. You can now login."
    });
  } catch (error) {
    console.error("Error confirming email:", error);
    return json(
      { error: "An error occurred while confirming your email" },
      { status: 500 }
    );
  }
}

// Change password
export async function changePassword(currentPassword: string, password: string, passwordConfirmation: string, token: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        password,
        passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { error: data.error?.message || "Failed to change password" },
        { status: response.status }
      );
    }

    return json({
      ...data,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return json(
      { error: "An error occurred while changing your password" },
      { status: 500 }
    );
  }
}