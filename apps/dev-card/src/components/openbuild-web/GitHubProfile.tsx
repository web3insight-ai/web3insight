'use client'

import { useGitHubStats, type GitHubLanguage } from '@/hooks/useGitHubStats'

interface GitHubProfileProps {
  login?: string
  name?: string
  bio?: string
  publicRepos?: number
  followers?: number
  following?: number
  company?: string | null
  location?: string | null
  createdAt?: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function GitHubProfile({
  login,
  name,
  bio,
  publicRepos = 0,
  followers = 0,
  following = 0,
  company,
  location,
  createdAt,
}: GitHubProfileProps) {
  const { data: githubData, loading: githubLoading } = useGitHubStats(
    login || null,
  )

  return (
    <div className="border-b border-gray-200 pb-6">
      {/* Header row: name + rank badge + links */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            className="text-lg font-bold text-[#1a1a1a]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {name || login}
          </h3>
          {/* GitHub rank badge */}
          {githubLoading ? (
            <div className="w-8 h-5 bg-gray-200 rounded animate-pulse" />
          ) : githubData?.stats?.rank ? (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#01DB83]/10 text-[#01DB83] border border-[#01DB83]/30">
              {githubData.stats.rank}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-sm text-[#01db83]">
          <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
          {login && (
            <a
              href={`https://github.com/${login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              @{login}
            </a>
          )}
        </div>
      </div>

      {/* Stats row - matching DevInsight ProfileHeader pattern */}
      <div
        className="flex items-center gap-6 mt-2 text-xs"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span className="text-gray-500">
          <strong className="text-[#1a1a1a] text-sm">
            {formatNumber(publicRepos)}
          </strong>{' '}
          Repositories
        </span>
        <span className="text-gray-500">
          <strong className="text-[#1a1a1a] text-sm">
            {formatNumber(followers)}
          </strong>{' '}
          Followers
        </span>
        <span className="text-gray-500">
          <strong className="text-[#1a1a1a] text-sm">
            {formatNumber(following)}
          </strong>{' '}
          Following
        </span>

        {/* GitHub Activity Stats from useGitHubStats */}
        {githubLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : githubData?.stats ? (
          <>
            <span className="text-gray-500">
              <strong className="text-[#1a1a1a] text-sm">
                {githubData.stats.totalStars}
              </strong>{' '}
              Stars
            </span>
            <span className="text-gray-500">
              <strong className="text-[#1a1a1a] text-sm">
                {githubData.stats.totalCommits}
              </strong>{' '}
              Commits ({new Date().getFullYear()})
            </span>
          </>
        ) : null}
      </div>

      {/* Company & Location */}
      {(company || location) && (
        <div
          className="flex items-center gap-4 mt-1.5 text-xs text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {company && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {company}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {location}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {bio && (
        <p
          className="text-gray-500 text-xs mt-1.5 line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {bio}
        </p>
      )}

      {/* Top Languages - from useGitHubStats */}
      {githubData?.languages && githubData.languages.length > 0 && (
        <div className="mt-3">
          {/* Language bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            {githubData.languages.map((lang: GitHubLanguage) => (
              <div
                key={lang.name}
                className="h-full"
                style={{
                  width: lang.percentage,
                  backgroundColor: getLanguageColor(lang.name),
                }}
              />
            ))}
          </div>
          {/* Language labels */}
          <div className="flex flex-wrap gap-3 mt-2">
            {githubData.languages.map((lang: GitHubLanguage) => (
              <span
                key={lang.name}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getLanguageColor(lang.name) }}
                />
                {lang.name}{' '}
                <span className="text-gray-400">{lang.percentage}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Language colors (GitHub-style)
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Solidity: '#AA6746',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89E051',
  PHP: '#4F5D95',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Vue: '#41B883',
  Svelte: '#FF3E00',
  Nix: '#7E7EFF',
  Lua: '#000080',
  Haskell: '#5E5086',
  Elixir: '#6E4A7E',
  Scala: '#C22D40',
  Zig: '#EC915C',
  OCaml: '#3BE133',
  Jupyter: '#F37626',
  R: '#198CE7',
}

function getLanguageColor(name: string): string {
  return LANGUAGE_COLORS[name] || '#8B8B8B'
}
