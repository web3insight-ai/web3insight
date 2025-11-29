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
  id?: number
  login?: string
  actor_id?: string
  actor_login?: string
  name?: string
  bio?: string
  public_repos?: number
  followers?: number
  following?: number
  repositories?: Array<{
    name: string
    description?: string
    language?: string
    topics?: string[]
  }>
  ecosystems?: string[]
  eco_score?: {
    ecosystems?: Array<{ ecosystem: string }>
    total_score?: number
    updated_at?: string
  }
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
        message: "GitHub username or user ID is required"
      }
    }

    const results: GitHubUserData[] = []
    const errors: string[] = []
    const promises: Promise<void>[] = []
    if (githubUserId) {
      promises.push(
        httpClient.get<any>(`/api/github/users/id/${githubUserId}`)
          .then(result => {
            if (result.success && result.data) {
              const userData = result.data as GitHubUserData
              results.push(userData)
            } else {
              errors.push(`ID API failed: ${result.message}`)
            }
          })
          .catch(error => {
            errors.push(`ID API error: ${error.message}`)
          })
      )
    }

    if (githubUsername) {
      promises.push(
        httpClient.get<any>(`/api/github/users/username/${githubUsername}`)
          .then(result => {
            if (result.success && result.data) {
              const userData = result.data as GitHubUserData
              results.push(userData)
            } else {
              errors.push(`Username API failed: ${result.message}`)
            }
          })
          .catch(error => {
            errors.push(`Username API error: ${error.message}`)
          })
      )
    }

    await Promise.all(promises)

    if (results.length === 0) {
      return {
        success: false,
        code: "404",
        message: `Failed to fetch user data. Errors: ${errors.join('; ')}`
      }
    }

    const mergedUserData = mergeGitHubUserData(results)
    const ecosystems = extractEcosystemsFromUserData(mergedUserData)

    const resultData = {
      ecosystems,
      repositories: mergedUserData.repositories || []
    }

    return {
      success: true,
      code: "200",
      message: "User data retrieved successfully",
      data: resultData
    }
  } catch (error) {
    return {
      success: false,
      code: "500",
      message: error instanceof Error ? error.message : "Failed to fetch data"
    }
  }
}

/**
 * 从用户数据中提取生态系统信息
 */
function extractEcosystemsFromUserData(userData: GitHubUserData): string[] {
  const ecosystems = new Set<string>()

  if (userData.ecosystems && Array.isArray(userData.ecosystems)) {
    userData.ecosystems.forEach(eco => ecosystems.add(eco))
  }

  if (userData.repositories && Array.isArray(userData.repositories)) {
    userData.repositories.forEach(repo => {
      const ecosystemsFromRepo = inferEcosystemsFromRepository(repo)
      ecosystemsFromRepo.forEach(eco => ecosystems.add(eco))
    })
  }

  if (userData.bio) {
    const ecosystemsFromBio = inferEcosystemsFromText(userData.bio)
    ecosystemsFromBio.forEach(eco => ecosystems.add(eco))
  }

  return Array.from(ecosystems)
}

function inferEcosystemsFromRepository(repo: any): string[] {
  const ecosystems: string[] = []
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase()

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

function mergeGitHubUserData(userDataArray: GitHubUserData[]): GitHubUserData {
  if (userDataArray.length === 0) {
    throw new Error("No user data to merge")
  }

  if (userDataArray.length === 1) {
    return userDataArray[0]
  }

  const mergedData = { ...userDataArray[0] }
  if (!mergedData.login && mergedData.actor_login) {
    mergedData.login = mergedData.actor_login
  }

  const allRepositories: any[] = []
  const repoNames = new Set<string>()

  userDataArray.forEach(userData => {
    if (userData.repositories && Array.isArray(userData.repositories)) {
      userData.repositories.forEach(repo => {
        if (!repoNames.has(repo.name)) {
          repoNames.add(repo.name)
          allRepositories.push(repo)
        }
      })
    }
  })

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

  return mergedData
}

export function getBuildingOnOptions(userEcosystems: string[]): string[] {
  if (!userEcosystems || userEcosystems.length === 0) {
    return []
  }

  const baseOptions = ['Monad']
  const userOptions = userEcosystems.filter(eco =>
    !baseOptions.includes(eco)
  ).slice(0, 10)

  const allOptions = [...baseOptions, ...userOptions]
  return [...new Set(allOptions)]
}
