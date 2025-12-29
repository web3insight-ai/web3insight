"use client"

import { useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/orpc/client"
import type { Ecosystem, ApiUser } from "@/schemas/auth.schema"

interface UseAuthOptions {
  ecosystem?: Ecosystem
}

export function useAuth(options?: UseAuthOptions) {
  const { ecosystem } = options || {}
  const { ready, authenticated, user: privyUser, logout: privyLogout, login } = usePrivy()
  const queryClient = useQueryClient()

  // Use TanStack Query with oRPC for data fetching
  const {
    data: userResult,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    ...orpc.auth.getCurrentUser.queryOptions({
      input: { ecosystem: ecosystem || "monad" },
    }),
    enabled: ready && authenticated && !!ecosystem,
    staleTime: 30 * 1000, // 30 seconds
  })

  const user = userResult?.success ? userResult.data : null
  const loading = !ready || (authenticated && isLoading)
  const error = queryError?.message || (userResult && !userResult.success ? userResult.message : null)

  // Logout function that also invalidates the query
  const logout = async () => {
    await privyLogout()
    queryClient.invalidateQueries({ queryKey: orpc.auth.key() })
  }

  const getDisplayAvatar = useCallback(() => {
    // 1. Prefer Web3Insight API avatar (but skip default Monad icon)
    if (user?.user_avatar && user.user_avatar !== "/images/monad-icon.svg") {
      return user.user_avatar
    }

    // 2. Fallback: use Privy avatar info
    if (privyUser) {
      // GitHub avatar priority (try multiple fields)
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth" || acc.type === "github"
      )

      if (githubAccount) {
        // Try profile.profilePictureUrl
        if ("profile" in githubAccount && githubAccount.profile?.profilePictureUrl) {
          return githubAccount.profile.profilePictureUrl
        }
        // Try profile.avatar_url
        if ("profile" in githubAccount && githubAccount.profile?.avatar_url) {
          return githubAccount.profile.avatar_url
        }
        // Try profile.picture
        if ("profile" in githubAccount && githubAccount.profile?.picture) {
          return githubAccount.profile.picture
        }
        // Try to construct avatar URL from GitHub username
        if (
          githubAccount.username ||
          ("profile" in githubAccount && githubAccount.profile?.username)
        ) {
          const username = githubAccount.username || githubAccount.profile?.username
          return `https://github.com/${username}.png`
        }
      }

      // Google avatar as secondary
      const googleAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "google_oauth" || acc.type === "google"
      )

      if (googleAccount) {
        if ("profile" in googleAccount && googleAccount.profile?.profilePictureUrl) {
          return googleAccount.profile.profilePictureUrl
        }
        if ("profile" in googleAccount && googleAccount.profile?.picture) {
          return googleAccount.profile.picture
        }
      }

      // Email account avatar (if available)
      const emailAccount = privyUser.linkedAccounts.find((acc) => acc.type === "email")

      if (emailAccount && "profile" in emailAccount && emailAccount.profile?.profilePictureUrl) {
        return emailAccount.profile.profilePictureUrl
      }
    }

    // 3. Default to Monad icon
    return "/images/monad-icon.svg"
  }, [user, privyUser])

  const getDisplayName = useCallback(() => {
    // 1. Prefer Web3Insight API custom nickname
    if (user?.nick_name) {
      return user.nick_name
    }

    // 2. Fallback: use Privy name info by priority
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth" || acc.type === "github"
      )
      const googleAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "google_oauth" || acc.type === "google"
      )
      const emailAccount = privyUser.linkedAccounts.find((acc) => acc.type === "email")

      // 2.1 GitHub display name (real name) or username
      if (githubAccount) {
        // Try profile.name first (real name)
        if ("profile" in githubAccount && githubAccount.profile?.name) {
          return githubAccount.profile.name
        }
        // Fallback to username (same logic as getDisplayAvatar)
        const username =
          (githubAccount as any).username ||
          ("profile" in githubAccount && githubAccount.profile?.username)
        if (username) {
          return username
        }
      }

      // 2.2 Google display name
      if (googleAccount) {
        if ("name" in googleAccount && (googleAccount as any).name) {
          return (googleAccount as any).name
        }
        if ("profile" in googleAccount && googleAccount.profile?.name) {
          return googleAccount.profile.name
        }
      }

      // 2.3 Email username as fallback (remove domain part)
      if (emailAccount && "address" in emailAccount && (emailAccount as any).address) {
        return (emailAccount as any).address.split("@")[0]
      }
    }

    return ""
  }, [user, privyUser])

  const getGithubUsername = useCallback(() => {
    // 1. Prefer Web3Insight API GitHub username
    if (user?.github_login) {
      return user.github_login
    }

    // 2. Fallback: use Privy GitHub account info
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth" || acc.type === "github"
      )
      if (githubAccount) {
        // Try multiple ways to get username (same logic as getDisplayAvatar)
        const username =
          (githubAccount as any).username ||
          ("profile" in githubAccount && githubAccount.profile?.username)
        if (username) {
          return username
        }
      }
    }

    return ""
  }, [user, privyUser])

  const getGithubUserId = () => {
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth" || acc.type === "github"
      )
      if (githubAccount) {
        if ("subject" in githubAccount && githubAccount.subject) {
          return githubAccount.subject
        }
      }
    }
    return ""
  }

  const getEmail = () => {
    // 1. Prefer Web3Insight API Google email
    if (user?.google_email) {
      return user.google_email
    }

    // 2. Fallback: use Privy email info
    if (privyUser) {
      // Google email priority
      const googleAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "google_oauth" || acc.type === "google"
      )
      if (googleAccount && "email" in googleAccount && googleAccount.email) {
        return googleAccount.email
      }

      // Direct email account
      const emailAccount = privyUser.linkedAccounts.find((acc) => acc.type === "email")
      if (emailAccount && "address" in emailAccount && emailAccount.address) {
        return emailAccount.address
      }
    }

    return ""
  }

  const getWalletAddress = () => {
    if (privyUser) {
      const walletAccount = privyUser.linkedAccounts.find((acc) => acc.type === "wallet")
      if (walletAccount && "address" in walletAccount && walletAccount.address) {
        return walletAccount.address
      }
    }
    return ""
  }

  return {
    user,
    loading,
    error,
    authenticated,
    ready,
    privyUser,
    logout,
    login,
    getDisplayAvatar,
    getDisplayName,
    getGithubUsername,
    getGithubUserId,
    getEmail,
    getWalletAddress,
    refetch: () => refetch(),
  }
}

// Re-export types
export type { ApiUser, Ecosystem }
