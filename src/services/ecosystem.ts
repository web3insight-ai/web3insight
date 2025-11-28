import { httpClient } from "@/lib/http-client"
import { ResponseResult } from "@/types/api"

export interface UserEcosystemData {
  ecosystems: string[]
  repositories: Array<{
    name: string
    description?: string
    language?: string
    topics?: string[]
    ecosystem?: string
  }>
}

export interface GitHubUserData {
  id: number
  login: string
  name?: string
  bio?: string
  public_repos: number
  followers: number
  following: number
  repositories?: Array<{
    name: string
    description?: string
    language?: string
    topics?: string[]
  }>
  ecosystems?: string[]
}

/**
 * 获取用户参与的生态系统数据 - 同时调用两个接口获取最全数据
 */
export async function getUserEcosystems(
  githubUsername?: string,
  githubUserId?: string
): Promise<ResponseResult<UserEcosystemData>> {
  try {
    if (!githubUsername && !githubUserId) {
      return {
        success: false,
        code: "400",
        message: "需要提供 GitHub 用户名或用户ID"
      }
    }

    const results: GitHubUserData[] = []
    const errors: string[] = []

    // 同时调用两个接口获取最全数据
    const promises: Promise<void>[] = []

    // 如果有用户ID，调用 ID 接口
    if (githubUserId) {
      promises.push(
        httpClient.get<GitHubUserData>(`/api/github/users/id/${githubUserId}`)
          .then(result => {
            if (result.success && result.data) {
              results.push(result.data)
              console.log("✓ 通过 GitHub ID 获取到数据:", result.data.login)
            } else {
              errors.push(`ID接口失败: ${result.message}`)
            }
          })
          .catch(error => {
            console.error("GitHub ID API 调用失败:", error)
            errors.push(`ID接口异常: ${error.message}`)
          })
      )
    }

    // 如果有用户名，调用用户名接口
    if (githubUsername) {
      promises.push(
        httpClient.get<GitHubUserData>(`/api/github/users/username/${githubUsername}`)
          .then(result => {
            if (result.success && result.data) {
              results.push(result.data)
              console.log("✓ 通过 GitHub username 获取到数据:", result.data.login)
            } else {
              errors.push(`用户名接口失败: ${result.message}`)
            }
          })
          .catch(error => {
            console.error("GitHub username API 调用失败:", error)
            errors.push(`用户名接口异常: ${error.message}`)
          })
      )
    }

    // 等待所有请求完成
    await Promise.all(promises)

    if (results.length === 0) {
      return {
        success: false,
        code: "404",
        message: `无法获取用户数据。错误信息: ${errors.join('; ')}`
      }
    }

    // 合并所有用户数据
    const mergedUserData = mergeGitHubUserData(results)
    console.log("合并后的用户数据:", {
      login: mergedUserData.login,
      repositoriesCount: mergedUserData.repositories?.length || 0,
      ecosystemsCount: mergedUserData.ecosystems?.length || 0
    })

    // 从合并后的用户数据中提取生态系统信息
    const ecosystems = extractEcosystemsFromUserData(mergedUserData)

    return {
      success: true,
      code: "200",
      message: `成功获取数据 (调用了${results.length}个接口)`,
      data: {
        ecosystems,
        repositories: mergedUserData.repositories || []
      }
    }
  } catch (error) {
    console.error("获取用户生态系统数据失败:", error)
    return {
      success: false,
      code: "500",
      message: error instanceof Error ? error.message : "获取数据时发生错误"
    }
  }
}

/**
 * 从用户数据中提取生态系统信息
 */
function extractEcosystemsFromUserData(userData: GitHubUserData): string[] {
  const ecosystems = new Set<string>()

  // 如果API直接返回了生态系统数据
  if (userData.ecosystems && Array.isArray(userData.ecosystems)) {
    userData.ecosystems.forEach(eco => ecosystems.add(eco))
  }

  // 从仓库信息中推断生态系统
  if (userData.repositories && Array.isArray(userData.repositories)) {
    userData.repositories.forEach(repo => {
      // 根据仓库名称、描述、topics等推断生态系统
      const ecosystemsFromRepo = inferEcosystemsFromRepository(repo)
      ecosystemsFromRepo.forEach(eco => ecosystems.add(eco))
    })
  }

  // 从用户bio中推断
  if (userData.bio) {
    const ecosystemsFromBio = inferEcosystemsFromText(userData.bio)
    ecosystemsFromBio.forEach(eco => ecosystems.add(eco))
  }

  return Array.from(ecosystems)
}

/**
 * 从仓库信息中推断生态系统
 */
function inferEcosystemsFromRepository(repo: any): string[] {
  const ecosystems: string[] = []

  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase()

  // 生态系统关键词映射
  const ecosystemKeywords = {
    'Ethereum': ['ethereum', 'eth', 'erc20', 'erc721', 'solidity', 'web3', 'defi'],
    'Starknet': ['starknet', 'cairo', 'starkware'],
    'DeFiHackLabs': ['defihacklabs', 'defi-hack', 'flashloan', 'defi-security'],
    'Hardhat': ['hardhat', 'hardhat-plugin'],
    'WTF.Academy': ['wtf-academy', 'wtf-solidity', 'wtfacademy'],
    'OpenBuild': ['openbuild', 'web3-education'],
    'Monad': ['monad', 'monad-labs', 'monad-xyz']
  }

  Object.entries(ecosystemKeywords).forEach(([ecosystem, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      ecosystems.push(ecosystem)
    }
  })

  return ecosystems
}

/**
 * 从文本中推断生态系统
 */
function inferEcosystemsFromText(text: string): string[] {
  const ecosystems: string[] = []
  const lowerText = text.toLowerCase()

  const ecosystemKeywords = {
    'Ethereum': ['ethereum', 'eth', 'solidity', 'web3', 'defi'],
    'Starknet': ['starknet', 'cairo'],
    'DeFiHackLabs': ['defihacklabs', 'defi hack'],
    'Hardhat': ['hardhat'],
    'WTF.Academy': ['wtf academy', 'wtf.academy'],
    'OpenBuild': ['openbuild'],
    'Monad': ['monad']
  }

  Object.entries(ecosystemKeywords).forEach(([ecosystem, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      ecosystems.push(ecosystem)
    }
  })

  return ecosystems
}

/**
 * 合并多个 GitHub 用户数据，去重并合并仓库信息
 */
function mergeGitHubUserData(userDataArray: GitHubUserData[]): GitHubUserData {
  if (userDataArray.length === 0) {
    throw new Error("没有可合并的用户数据")
  }

  if (userDataArray.length === 1) {
    return userDataArray[0]
  }

  // 使用第一个作为基础数据
  const mergedData = { ...userDataArray[0] }

  // 合并仓库信息
  const allRepositories: any[] = []
  const repoNames = new Set<string>()

  userDataArray.forEach(userData => {
    if (userData.repositories && Array.isArray(userData.repositories)) {
      userData.repositories.forEach(repo => {
        // 根据仓库名去重
        if (!repoNames.has(repo.name)) {
          repoNames.add(repo.name)
          allRepositories.push(repo)
        }
      })
    }
  })

  // 合并生态系统信息
  const allEcosystems: string[] = []
  const ecosystemSet = new Set<string>()

  userDataArray.forEach(userData => {
    if (userData.ecosystems && Array.isArray(userData.ecosystems)) {
      userData.ecosystems.forEach(eco => {
        if (!ecosystemSet.has(eco)) {
          ecosystemSet.add(eco)
          allEcosystems.push(eco)
        }
      })
    }
  })

  mergedData.repositories = allRepositories
  mergedData.ecosystems = allEcosystems

  console.log("数据合并完成:", {
    原始数据源数量: userDataArray.length,
    合并后仓库数量: allRepositories.length,
    合并后生态系统数量: allEcosystems.length
  })

  return mergedData
}

/**
 * 获取推荐的Building on选项
 * 保证至少包含Monad，然后添加用户实际参与的项目
 */
export function getBuildingOnOptions(userEcosystems: string[]): string[] {
  // 基础选项，Monad始终存在
  const baseOptions = ['Monad']

  // 其他可能的选项
  const availableOptions = [
    'Starknet', 'Ethereum', 'DeFiHackLabs',
    'Hardhat', 'WTF.Academy', 'OpenBuild'
  ]

  // 用户实际参与的项目（去重）
  const userOptions = userEcosystems.filter(eco =>
    !baseOptions.includes(eco) && availableOptions.includes(eco)
  )

  // 合并选项，去重
  const allOptions = [...baseOptions, ...userOptions, ...availableOptions]
  return [...new Set(allOptions)]
}
