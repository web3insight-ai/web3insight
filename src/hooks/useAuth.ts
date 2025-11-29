"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { getCurrentUser } from "@/services/auth"
import { ApiUser } from "@/types/api"

export function useAuth() {
  const { ready, authenticated, user: privyUser, logout, login } = usePrivy()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      console.log('=== useAuth fetchUser 调试 ===')
      console.log('ready:', ready)
      console.log('authenticated:', authenticated)

      if (!ready) return

      try {
        setLoading(true)
        setError(null)

        if (!authenticated) {
          console.log('⚠️ 用户未认证，设置 user 为 null')
          setUser(null)
          return
        }

        console.log('📡 调用 getCurrentUser API...')
        const result = await getCurrentUser()
        console.log('📥 getCurrentUser 返回结果:', result)

        if (result.success) {
          console.log('✅ 设置 user 数据:', result.data)
          setUser(result.data || null)
        } else {
          console.error('❌ getCurrentUser 失败:', result.message)
          setError(result.message)
        }
      } catch (err) {
        console.error('❌ fetchUser 异常:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [ready, authenticated])

  const getDisplayAvatar = () => {
    console.log('=== getDisplayAvatar 调试 ===')
    console.log('1. user?.user_avatar:', user?.user_avatar)

    // 1. 优先使用 Web3Insight API 的头像（但跳过默认头像）
    if (user?.user_avatar && user.user_avatar !== '/images/user-avatar-sample.png') {
      console.log('✅ 使用 Web3Insight API 头像:', user.user_avatar)
      return user.user_avatar
    }

    // 2. 兜底：使用 Privy 的头像信息
    if (privyUser) {
      console.log('2. privyUser:', privyUser)
      console.log('3. linkedAccounts:', privyUser.linkedAccounts)

      // GitHub 头像优先（尝试多个字段）
      const githubAccount = privyUser.linkedAccounts.find(acc => acc.type === 'github_oauth' || acc.type === 'github')
      console.log('4. githubAccount:', githubAccount)

      if (githubAccount) {
        // 尝试 profile.profilePictureUrl
        if ('profile' in githubAccount && githubAccount.profile?.profilePictureUrl) {
          console.log('✅ 使用 GitHub profile.profilePictureUrl:', githubAccount.profile.profilePictureUrl)
          return githubAccount.profile.profilePictureUrl
        }
        // 尝试 profile.avatar_url
        if ('profile' in githubAccount && githubAccount.profile?.avatar_url) {
          console.log('✅ 使用 GitHub profile.avatar_url:', githubAccount.profile.avatar_url)
          return githubAccount.profile.avatar_url
        }
        // 尝试 profile.picture
        if ('profile' in githubAccount && githubAccount.profile?.picture) {
          console.log('✅ 使用 GitHub profile.picture:', githubAccount.profile.picture)
          return githubAccount.profile.picture
        }
        // 尝试根据 GitHub username 构建 avatar URL
        if (githubAccount.username || ('profile' in githubAccount && githubAccount.profile?.username)) {
          const username = githubAccount.username || githubAccount.profile?.username
          const avatarUrl = `https://github.com/${username}.png`
          console.log('✅ 使用 GitHub username 构建头像:', avatarUrl)
          return avatarUrl
        }
      }

      // Google 头像次优先
      const googleAccount = privyUser.linkedAccounts.find(acc => acc.type === 'google_oauth' || acc.type === 'google')
      console.log('5. googleAccount:', googleAccount)

      if (googleAccount) {
        if ('profile' in googleAccount && googleAccount.profile?.profilePictureUrl) {
          console.log('✅ 使用 Google profile.profilePictureUrl:', googleAccount.profile.profilePictureUrl)
          return googleAccount.profile.profilePictureUrl
        }
        if ('profile' in googleAccount && googleAccount.profile?.picture) {
          console.log('✅ 使用 Google profile.picture:', googleAccount.profile.picture)
          return googleAccount.profile.picture
        }
      }

      // 邮箱账户头像（如果有的话）
      const emailAccount = privyUser.linkedAccounts.find(acc => acc.type === 'email')
      console.log('6. emailAccount:', emailAccount)

      if (emailAccount && 'profile' in emailAccount && emailAccount.profile?.profilePictureUrl) {
        console.log('✅ 使用 Email profile.profilePictureUrl:', emailAccount.profile.profilePictureUrl)
        return emailAccount.profile.profilePictureUrl
      }
    }

    // 3. 默认头像
    console.log('⚠️ 使用默认头像')
    return "/images/user-avatar-sample.png"
  }

  const getDisplayName = () => {
    // 1. 优先使用 Web3Insight API 的用户自定义昵称
    if (user?.nick_name) {
      return user.nick_name
    }

    // 2. 兜底：按优先级使用 Privy 的姓名信息
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(acc => acc.type === 'github_oauth' || acc.type === 'github')
      const googleAccount = privyUser.linkedAccounts.find(acc => acc.type === 'google_oauth' || acc.type === 'google')
      const emailAccount = privyUser.linkedAccounts.find(acc => acc.type === 'email')

      // 2.1 GitHub display name (真实姓名)
      if (githubAccount && 'profile' in githubAccount && githubAccount.profile?.name) {
        return githubAccount.profile.name
      }

      // 2.2 GitHub username (handle)
      if (githubAccount && 'username' in githubAccount && githubAccount.username) {
        return githubAccount.username
      }
      if (githubAccount && 'profile' in githubAccount && githubAccount.profile?.username) {
        return githubAccount.profile.username
      }

      // 2.3 Google display name
      if (googleAccount && 'name' in googleAccount && googleAccount.name) {
        return googleAccount.name
      }
      if (googleAccount && 'profile' in googleAccount && googleAccount.profile?.name) {
        return googleAccount.profile.name
      }

      // 2.4 邮箱用户名作为兜底（去掉域名部分）
      if (emailAccount && 'address' in emailAccount && emailAccount.address) {
        return emailAccount.address.split('@')[0]
      }
    }

    return ""
  }

  const getGithubUsername = () => {
    // 1. 优先使用 Web3Insight API 的 GitHub 用户名
    if (user?.github_login) {
      return user.github_login
    }

    // 2. 兜底：使用 Privy 的 GitHub 账号信息
    if (privyUser) {
      const githubAccount = privyUser.linkedAccounts.find(acc => acc.type === 'github_oauth' || acc.type === 'github')
      if (githubAccount) {
        // 优先使用 profile.username
        if ('profile' in githubAccount && githubAccount.profile?.username) {
          return githubAccount.profile.username
        }
        // 兜底使用 username 字段
        if ('username' in githubAccount && githubAccount.username) {
          return githubAccount.username
        }
      }
    }

    return ""
  }

  // 获取用户邮箱
  const getEmail = () => {
    // 1. 优先使用 Web3Insight API 的 Google 邮箱
    if (user?.google_email) {
      return user.google_email
    }

    // 2. 兜底：使用 Privy 的邮箱信息
    if (privyUser) {
      // Google 邮箱优先
      const googleAccount = privyUser.linkedAccounts.find(acc => acc.type === 'google_oauth' || acc.type === 'google')
      if (googleAccount && 'email' in googleAccount && googleAccount.email) {
        return googleAccount.email
      }

      // 直接邮箱账号
      const emailAccount = privyUser.linkedAccounts.find(acc => acc.type === 'email')
      if (emailAccount && 'address' in emailAccount && emailAccount.address) {
        return emailAccount.address
      }
    }

    return ""
  }

  // 获取钱包地址
  const getWalletAddress = () => {
    if (privyUser) {
      const walletAccount = privyUser.linkedAccounts.find(acc => acc.type === 'wallet')
      if (walletAccount && 'address' in walletAccount && walletAccount.address) {
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
    getEmail,
    getWalletAddress,
    refetch: () => {
      if (authenticated) {
        getCurrentUser().then(result => {
          if (result.success) {
            setUser(result.data || null)
          }
        })
      }
    }
  }
}
