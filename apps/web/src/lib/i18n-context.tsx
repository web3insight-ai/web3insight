"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"

type Locale = "en" | "zh"

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "nav.features": "Features",
    "nav.useCases": "Use Cases",
    "nav.dashboard": "Dashboard",

    // Hero
    "hero.badge": "AI-Powered Developer Insights",
    "hero.title1": "Web3",
    "hero.title2": "insight",
    "hero.description":
      "Discover, analyze, and connect with Web3 developers. Powered by GitHub data and on-chain activity for ecosystem growth.",
    "hero.exploreDashboard": "Explore Dashboard",
    "hero.viewGithub": "View on GitHub",
    "hero.askAnything": "Ask anything about Web3",
    "hero.aiPowered": "AI-powered insights",
    "hero.developers": "Core Developer",
    "hero.ecosystems": "Ecosystems",
    "hero.contributors": "Contributors",

    // Stats
    "stats.developers": "Core Developer",
    "stats.contributors": "Contributors",
    "stats.ecosystems": "Ecosystems",
    "stats.repositories": "Repositories",

    // Features
    "features.title": "Everything you need to understand Web3 developers",
    "features.description":
      "Comprehensive tools for ecosystem growth, developer engagement, and technical due diligence.",
    "features.devId.title": "Developer Identification",
    "features.devId.description":
      "Identify and connect with the most relevant active builders using GitHub data and Web3 activity.",
    "features.ecosystem.title": "Ecosystem Insights",
    "features.ecosystem.description": "Visualize ecosystem structures, code activity, and technology evolution paths.",
    "features.events.title": "Event Tracking",
    "features.events.description": "Track hackathon, bounty, and grant program performance with quantifiable metrics.",
    "features.integration.title": "Data Integration",
    "features.integration.description": "Integrate developer profiles and skill maps into your platform.",
    "features.research.title": "Investment Research",
    "features.research.description": "Assess technical maturity and team stability for due diligence.",
    "features.growth.title": "Developer Growth",
    "features.growth.description": "Track developer journeys from hackathons to core contributions.",

    // Use Cases
    "useCases.title": "Powering Web3 ecosystem growth",
    "useCases.description": "From developer outreach to investment research, see how leading projects use Web3Insight.",
    "useCases.partnersLabel": "Partners & Cases",
    "useCases.devOutreach.title": "Developer Identification & Targeted Outreach",
    "useCases.devOutreach.description":
      "Identify and engage the most relevant active builders for grants, recruitment, and hackathon initiatives.",
    "useCases.ecosystem.title": "Ecosystem Landscape & Trend Insights",
    "useCases.ecosystem.description":
      "Uncover ecosystem structures, code activity, and technology evolution for foundations to grasp competitive landscapes.",
    "useCases.events.title": "Events & Programs Performance Tracking",
    "useCases.events.description":
      "Track developer participation, output, and retention across hackathons, bounties, and grant programs.",
    "useCases.integration.title": "Data Integration & Developer Profiles",
    "useCases.integration.description":
      "Integrate verifiable developer profiles and skill maps into partner platforms for transparent identity systems.",
    "useCases.research.title": "Investment Research & Technical Due Diligence",
    "useCases.research.description":
      "Assess technical maturity and team stability for VCs, accelerators, and research institutes.",
    "useCases.growth.title": "Developer Growth & Community Intelligence",
    "useCases.growth.description":
      "Track developer journeys and analyze skill evolution to support education and ecosystem development.",

    // Partners
    "partners.title": "Trusted by leading Web3 ecosystems",

    // MCP
    "mcp.eyebrow": "Model Context Protocol · Featured",
    "mcp.title": "Use Web3Insight in your AI tools",
    "mcp.description":
      "Connect Web3Insight Copilot to Claude Code, Claude Desktop, Cursor, VS Code, or any MCP-compatible client. Query ecosystems, repos, developers, and trends from the same chat where you already write code.",
    "mcp.endpoint.label": "MCP endpoint",
    "mcp.config.label": "mcp.json snippet",
    "mcp.config.copy": "Copy",
    "mcp.config.copied": "Copied",
    "mcp.config.hint":
      "Replace `w3i_mcp_<your-token>` with a personal token issued from the Copilot settings dialog.",
    "mcp.clients.label": "Supported clients",
    "mcp.steps.label": "Get started",
    "mcp.steps.one": "Sign in to the dashboard and open Copilot settings.",
    "mcp.steps.two": "Issue a personal MCP token (shown once — save it).",
    "mcp.steps.three": "Drop the install command (or JSON) into your client and restart.",
    "mcp.cta": "Issue a token",
    "mcp.install.label": "Install — pick your path",
    "mcp.install.plugin.tab": "Claude Code plugin",
    "mcp.install.plugin.recommended": "Recommended",
    "mcp.install.plugin.description":
      "One-command install. Auto-registers the MCP server and ships a SKILL that picks the right tool for you. Zero JSON editing.",
    "mcp.install.plugin.cta": "View plugin README",
    "mcp.install.skill.tab": "Skill only",
    "mcp.install.skill.description":
      "For agents and clients without MCP support. Installs just the tool-picker SKILL via npx skills — no token required.",
    "mcp.install.skill.cta": "Browse the SKILL",
    "mcp.install.manual.tab": "Manual mcp.json",
    "mcp.install.manual.description":
      "Drop this snippet into Claude Desktop, Cursor, VS Code, or any client that accepts an HTTP MCP config.",
    "mcp.install.copy": "Copy",
    "mcp.install.copied": "Copied",

    // Tools catalog
    "tools.title": "24 tools, end-to-end typed",
    "tools.description":
      "Every MCP call is a typed procedure backed by the same Postgres + GitHub indexers that power the dashboard. Pick from the catalog — or let the bundled SKILL pick for you.",
    "tools.cta": "Browse the SKILL",
    "tools.footnote": "src · skills/web3insight/SKILL.md",
    "tools.getPlatformOverview": "Platform totals — ecosystems, repos, devs, core devs.",
    "tools.countEcosystems": "Just the total ecosystem count.",
    "tools.countRepositories": "Repo count, scoped to an ecosystem or global.",
    "tools.countContributors": "Dev / core-dev count, scoped by ecosystem.",
    "tools.rankEcosystems": "Top ecosystems ranked by developer activity.",
    "tools.rankRepositories": "Top repos in an ecosystem, ranked by stars + activity.",
    "tools.rankContributors": "Top devs in an ecosystem, ranked by commits.",
    "tools.getRecentContributorTrends": "Weekly / monthly contributor trend series.",
    "tools.getContributorGrowth": "Net-new contributors in the last quarter.",
    "tools.getCountryDistribution": "Geographic split of contributors by country.",
    "tools.compareEcosystems": "Side-by-side ecosystem comparison.",
    "tools.getTrendingRepositories": "7-day star-growth leaders.",
    "tools.getHotRepositories": "7-day developer-activity leaders.",
    "tools.getRepositoryActiveDevelopers": "Monthly active devs for owner/repo.",
    "tools.getDeveloperProfile": "Bio, location, contribution stats for a handle.",
    "tools.getDeveloperTopRepositories": "Their top owned / contributed repos.",
    "tools.getDeveloperRecentActivity": "Pushes, PRs, issues, code reviews.",
    "tools.getDeveloperEcosystems": "Ecosystems they contribute to + scores.",
    "tools.getEventDeveloperProfile": "Web3 résumé for hackathons + events.",
    "tools.getDonationRepositories": "OSS repos accepting donations via x402.",
    "tools.getDonationRepositoryByName": "Donation detail for owner/repo.",
    "tools.getPublicEventInsights": "Hackathon and event analysis.",
    "tools.getYearlyReport": "Annual Web3 developer ecosystem report.",
    "tools.queryWeb3Data": "Read-only SQL against the data.* schema.",

    // Footer
    "footer.description":
      "Discover, analyze, and connect with Web3 developers. Powered by GitHub data and on-chain activity for ecosystem growth.",
    "footer.product": "Product",
    "footer.resources": "Resources",
    "footer.apiDocs": "API Docs",
    "footer.copyright": "Web3Insight. All rights reserved.",
  },
  zh: {
    // Header
    "nav.features": "功能",
    "nav.useCases": "使用场景",
    "nav.dashboard": "控制台",

    // Hero
    "hero.badge": "AI 驱动的开发者洞察",
    "hero.title1": "Web3",
    "hero.title2": "insight",
    "hero.description": "发现、分析并连接 Web3 开发者。基于 GitHub 数据和链上活动，助力生态增长。",
    "hero.exploreDashboard": "探索控制台",
    "hero.viewGithub": "GitHub 仓库",
    "hero.askAnything": "关于 Web3 的任何问题",
    "hero.aiPowered": "AI 驱动洞察",
    "hero.developers": "核心开发者",
    "hero.ecosystems": "生态系统",
    "hero.contributors": "贡献者",

    // Stats
    "stats.developers": "核心开发者",
    "stats.contributors": "贡献者",
    "stats.ecosystems": "生态系统",
    "stats.repositories": "代码仓库",

    // Features
    "features.title": "全面了解 Web3 开发者所需的一切",
    "features.description": "为生态增长、开发者参与和技术尽调提供全面工具。",
    "features.devId.title": "开发者识别",
    "features.devId.description": "利用 GitHub 数据和 Web3 活动，识别并连接最相关的活跃开发者。",
    "features.ecosystem.title": "生态洞察",
    "features.ecosystem.description": "可视化生态结构、代码活跃度和技术演进路径。",
    "features.events.title": "活动追踪",
    "features.events.description": "通过量化指标追踪黑客松、赏金和资助计划的表现。",
    "features.integration.title": "数据集成",
    "features.integration.description": "将开发者画像和技能图谱集成到您的平台。",
    "features.research.title": "投资研究",
    "features.research.description": "评估技术成熟度和团队稳定性，进行尽职调查。",
    "features.growth.title": "开发者成长",
    "features.growth.description": "追踪开发者从黑客松到核心贡献的成长轨迹。",

    // Use Cases
    "useCases.title": "推动 Web3 生态增长",
    "useCases.description": "从开发者触达到投资研究，了解领先项目如何使用 Web3Insight。",
    "useCases.partnersLabel": "合作伙伴与案例",
    "useCases.devOutreach.title": "开发者识别与定向连接",
    "useCases.devOutreach.description":
      "帮助生态项目方精准识别并筛选最契合的活跃开发者，用于 Grant 激励、人才招聘或 Hackathon 邀约。",
    "useCases.ecosystem.title": "生态全景与趋势洞察",
    "useCases.ecosystem.description":
      "揭示生态结构、代码活跃度与技术演进路径，帮助基金会与生态方洞察竞争格局与长期增长趋势。",
    "useCases.events.title": "Devs Programs 与 Events 绩效追踪",
    "useCases.events.description":
      "整合各类 Web3 事件与激励活动的数据追踪，为 DAO 与生态基金会提供量化评估与优化依据。",
    "useCases.integration.title": "系统集成与开发者画像展示",
    "useCases.integration.description": "将数据能力与合作平台系统集成，构建生态内的透明开发者身份体系。",
    "useCases.research.title": "投资研究与技术尽调",
    "useCases.research.description": "分析项目的技术成熟度、贡献深度与生态稳定性，为投资机构提供客观尽调与研究支持。",
    "useCases.growth.title": "开发者成长与社区洞察",
    "useCases.growth.description": "追踪开发者成长轨迹，洞察技能演进与社区活跃度，为 Web3 教育和运营提供数据支持。",

    // Partners
    "partners.title": "受领先 Web3 生态系统信赖",

    // MCP
    "mcp.eyebrow": "Model Context Protocol · 重点功能",
    "mcp.title": "在你的 AI 工具里直接使用 Web3Insight",
    "mcp.description":
      "把 Web3Insight Copilot 接入 Claude Code、Claude Desktop、Cursor、VS Code 或任何兼容 MCP 的客户端。在写代码的同一个对话里查询生态、仓库、开发者和趋势。",
    "mcp.endpoint.label": "MCP 端点",
    "mcp.config.label": "mcp.json 配置片段",
    "mcp.config.copy": "复制",
    "mcp.config.copied": "已复制",
    "mcp.config.hint":
      "把 `w3i_mcp_<your-token>` 替换为在 Copilot 设置面板里签发的个人 token。",
    "mcp.clients.label": "支持的客户端",
    "mcp.steps.label": "开始使用",
    "mcp.steps.one": "登录控制台，打开 Copilot 设置。",
    "mcp.steps.two": "签发一个 MCP 个人 token（只显示一次，记得保存）。",
    "mcp.steps.three": "把安装命令（或 JSON）放到客户端里，然后重启。",
    "mcp.cta": "签发 Token",
    "mcp.install.label": "安装方式 — 任选其一",
    "mcp.install.plugin.tab": "Claude Code 插件",
    "mcp.install.plugin.recommended": "推荐",
    "mcp.install.plugin.description":
      "一条命令搞定。自动注册 MCP server，并附带 SKILL 帮你选用合适的工具，无需手改 JSON。",
    "mcp.install.plugin.cta": "查看插件 README",
    "mcp.install.skill.tab": "仅 Skill",
    "mcp.install.skill.description":
      "面向不支持 MCP 的 agent 与客户端。通过 npx skills 仅安装工具选择器 SKILL，无需 token。",
    "mcp.install.skill.cta": "查看 SKILL",
    "mcp.install.manual.tab": "手动 mcp.json",
    "mcp.install.manual.description":
      "把这段 JSON 直接粘到 Claude Desktop、Cursor、VS Code 或任何接受 HTTP MCP 配置的客户端。",
    "mcp.install.copy": "复制",
    "mcp.install.copied": "已复制",

    // Tools catalog
    "tools.title": "24 个工具，端到端类型安全",
    "tools.description":
      "每一个 MCP 调用都是一个类型化的 procedure，背后是和 dashboard 共享的 Postgres + GitHub indexer。从目录里挑一个，或者让随附的 SKILL 帮你选。",
    "tools.cta": "查看 SKILL",
    "tools.footnote": "src · skills/web3insight/SKILL.md",
    "tools.getPlatformOverview": "平台总览 — 生态、仓库、开发者、核心开发者数。",
    "tools.countEcosystems": "仅返回生态总数。",
    "tools.countRepositories": "仓库总数，可按生态过滤或全局。",
    "tools.countContributors": "开发者 / 核心开发者数，按生态过滤。",
    "tools.rankEcosystems": "按开发者活跃度对生态排名。",
    "tools.rankRepositories": "按 star + 活跃度对生态内仓库排名。",
    "tools.rankContributors": "按 commit 对生态内开发者排名。",
    "tools.getRecentContributorTrends": "贡献者趋势的周 / 月时间序列。",
    "tools.getContributorGrowth": "上一季度新增贡献者数。",
    "tools.getCountryDistribution": "贡献者的国家地理分布。",
    "tools.compareEcosystems": "多个生态并排对比。",
    "tools.getTrendingRepositories": "近 7 天 star 增长榜。",
    "tools.getHotRepositories": "近 7 天开发者活跃度榜。",
    "tools.getRepositoryActiveDevelopers": "owner/repo 的月度活跃开发者数。",
    "tools.getDeveloperProfile": "GitHub handle 的简介、地区、贡献统计。",
    "tools.getDeveloperTopRepositories": "其拥有 / 贡献的 top 仓库。",
    "tools.getDeveloperRecentActivity": "Push、PR、issue、code review 等近期活动。",
    "tools.getDeveloperEcosystems": "该开发者贡献的生态 + 在每个生态的得分。",
    "tools.getEventDeveloperProfile": "面向黑客松 / 活动的 Web3 简历。",
    "tools.getDonationRepositories": "通过 x402 协议接受捐赠的开源仓库。",
    "tools.getDonationRepositoryByName": "owner/repo 的捐赠详情。",
    "tools.getPublicEventInsights": "黑客松 / 活动分析。",
    "tools.getYearlyReport": "年度 Web3 开发者生态报告。",
    "tools.queryWeb3Data": "对 data.* schema 的只读 SQL 兜底。",

    // Footer
    "footer.description": "发现、分析并连接 Web3 开发者。基于 GitHub 数据和链上活动，助力生态增长。",
    "footer.product": "产品",
    "footer.resources": "资源",
    "footer.apiDocs": "API 文档",
    "footer.copyright": "Web3Insight 版权所有。",
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || key
    },
    [locale],
  )

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
