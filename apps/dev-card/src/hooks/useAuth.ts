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
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth"
      )
      if (githubAccount?.username) {
        return `https://github.com/${githubAccount.username}.png`
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
        (acc) => acc.type === "github_oauth"
      )
      const googleAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "google_oauth"
      )
      const emailAccount = privyUser.linkedAccounts.find((acc) => acc.type === "email")

      // 2.1 GitHub display name (real name) or username
      if (githubAccount) {
        if (githubAccount.name) return githubAccount.name
        if (githubAccount.username) return githubAccount.username
      }

      // 2.2 Google display name
      if (googleAccount?.name) {
        return googleAccount.name
      }

      // 2.3 Email username as fallback (remove domain part)
      if (emailAccount?.address) {
        return emailAccount.address.split("@")[0]
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
        (acc) => acc.type === "github_oauth"
      )
      if (githubAccount?.username) {
        return githubAccount.username
      }
    }

    return ""
  }, [user, privyUser])

  const getGithubUserId = () => {
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(
        (acc) => acc.type === "github_oauth"
      )
      if (githubAccount?.subject) {
        return githubAccount.subject
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
        (acc) => acc.type === "google_oauth"
      )
      if (googleAccount?.email) {
        return googleAccount.email
      }

      // Direct email account
      const emailAccount = privyUser.linkedAccounts.find((acc) => acc.type === "email")
      if (emailAccount?.address) {
        return emailAccount.address
      }
    }

    return ""
  }

  const getWalletAddress = () => {
    if (privyUser) {
      const walletAccount = privyUser.linkedAccounts.find((acc) => acc.type === "wallet")
      if (walletAccount?.address) {
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
