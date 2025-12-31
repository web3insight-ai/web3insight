"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

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

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
