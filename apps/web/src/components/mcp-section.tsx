"use client"

import { useCallback, useMemo, useState } from "react"
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  SparklesIcon,
  TerminalIcon,
} from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { motion } from "framer-motion"
import { fadeInUp, ScrollReveal, stagger } from "@/components/ui/motion"
import { Panel } from "@/components/blueprint"

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.18em]">
      {children}
    </div>
  )
}

const MCP_ENDPOINT_URL = "https://dash.web3insight.ai/api/ai/mcp"
const PLUGIN_README_URL =
  "https://github.com/web3insight-ai/web3insight/blob/main/plugins/web3insight/README.md"
const SKILL_URL =
  "https://github.com/web3insight-ai/web3insight/blob/main/skills/web3insight/SKILL.md"
const TOKEN_ISSUE_URL =
  "https://dash.web3insight.ai/copilot?copilotMcpTokens=open"

const PLUGIN_COMMAND = `/plugin marketplace add web3insight-ai/web3insight
/plugin install web3insight@web3insight
export WEB3INSIGHT_MCP_TOKEN="w3i_mcp_<your-token>"`

const SKILL_COMMAND = `npx skills add web3insight-ai/web3insight \\
  -a claude-code -a universal \\
  -s web3insight -y --copy`

const MANUAL_SNIPPET = JSON.stringify(
  {
    mcpServers: {
      web3insight: {
        url: MCP_ENDPOINT_URL,
        headers: {
          Authorization: "Bearer w3i_mcp_<your-token>",
        },
      },
    },
  },
  null,
  2,
)

interface ClientCard {
  id: string
  name: string
  configPath: string
}

const CLIENTS: ClientCard[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    configPath: "via plugin marketplace (recommended)",
  },
  {
    id: "claude",
    name: "Claude Desktop",
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
  },
  { id: "cursor", name: "Cursor", configPath: "~/.cursor/mcp.json" },
  { id: "vscode", name: "VS Code", configPath: ".vscode/mcp.json" },
]

type InstallTab = "plugin" | "skill" | "manual"

interface TabDef {
  id: InstallTab
  labelKey: string
  badgeKey?: string
}

const TABS: TabDef[] = [
  { id: "plugin", labelKey: "mcp.install.plugin.tab", badgeKey: "mcp.install.plugin.recommended" },
  { id: "skill", labelKey: "mcp.install.skill.tab" },
  { id: "manual", labelKey: "mcp.install.manual.tab" },
]

export function McpSection() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<InstallTab>("plugin")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = useCallback((value: string, key: string) => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }, [])

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "plugin":
        return {
          description: t("mcp.install.plugin.description"),
          snippet: PLUGIN_COMMAND,
          ctaLabel: t("mcp.install.plugin.cta"),
          ctaUrl: PLUGIN_README_URL,
        }
      case "skill":
        return {
          description: t("mcp.install.skill.description"),
          snippet: SKILL_COMMAND,
          ctaLabel: t("mcp.install.skill.cta"),
          ctaUrl: SKILL_URL,
        }
      case "manual":
        return {
          description: t("mcp.install.manual.description"),
          snippet: MANUAL_SNIPPET,
          ctaLabel: t("mcp.cta"),
          ctaUrl: TOKEN_ISSUE_URL,
        }
    }
  }, [activeTab, t])

  return (
    <section
      id="mcp"
      className="relative overflow-hidden border-y border-border bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div className="max-w-content mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14 max-w-3xl">
            <div className="text-accent mb-4 inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
              <SparklesIcon className="size-3.5" />
              <span>{t("mcp.eyebrow")}</span>
            </div>
            <h2 className="font-display mb-5 text-balance text-4xl font-semibold text-foreground sm:text-5xl">
              {t("mcp.title")}
            </h2>
            <p className="text-muted-foreground text-pretty text-base leading-relaxed sm:text-lg">
              {t("mcp.description")}
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* LEFT — install tabs (the hero) */}
          <motion.div variants={fadeInUp()}>
            <Panel className="h-full p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <SectionLabel>{t("mcp.install.label")}</SectionLabel>
              </div>

              {/* Tab strip */}
              <div className="flex flex-wrap items-stretch gap-2 border-b border-border-soft pb-0">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                        isActive
                          ? "border-accent text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{t(tab.labelKey)}</span>
                      {tab.badgeKey ? (
                        <span
                          className={`border px-1.5 py-0.5 text-[9px] tracking-[0.12em] ${
                            isActive
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : "border-border-soft text-muted-foreground"
                          }`}
                        >
                          {t(tab.badgeKey)}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {/* Active tab content */}
              <div className="mt-6 space-y-5">
                <p className="text-foreground/85 text-sm leading-relaxed">
                  {activeContent.description}
                </p>

                <div>
                  <div className="text-muted-foreground mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                    <span>
                      {activeTab === "manual" ? t("mcp.config.label") : "Run"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(activeContent.snippet, activeTab)
                      }
                      className="text-foreground/80 hover:text-foreground flex items-center gap-1.5 normal-case"
                    >
                      {copiedKey === activeTab ? (
                        <CheckIcon className="size-3" />
                      ) : (
                        <CopyIcon className="size-3" />
                      )}
                      <span className="tracking-normal">
                        {copiedKey === activeTab
                          ? t("mcp.install.copied")
                          : t("mcp.install.copy")}
                      </span>
                    </button>
                  </div>
                  <pre className="border-border-soft bg-background overflow-x-auto border p-4 font-mono text-[12px] leading-relaxed sm:text-[13px]">
                    {activeContent.snippet}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={activeContent.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
                  >
                    {activeContent.ctaLabel}
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                  {activeTab !== "skill" ? (
                    <a
                      href={TOKEN_ISSUE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border-soft text-foreground/80 hover:border-foreground hover:text-foreground inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-medium transition-colors"
                    >
                      {t("mcp.cta")}
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* RIGHT — endpoint + clients + steps (reference) */}
          <motion.div variants={fadeInUp(0.05)} className="flex flex-col gap-6">
            <Panel className="p-6">
              <div className="text-muted-foreground mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                <TerminalIcon className="size-3" />
                <span>{t("mcp.endpoint.label")}</span>
              </div>
              <code className="border-border-soft bg-background block break-all border px-3 py-2 font-mono text-xs sm:text-sm">
                {MCP_ENDPOINT_URL}
              </code>
            </Panel>

            <Panel className="p-6">
              <SectionLabel>{t("mcp.clients.label")}</SectionLabel>
              <div className="mb-4" />
              <ul className="space-y-3">
                {CLIENTS.map((client) => (
                  <li
                    key={client.id}
                    className="border-border-soft flex flex-col gap-1 border-b py-2 last:border-0 last:pb-0"
                  >
                    <span className="text-foreground text-sm font-medium">
                      {client.name}
                    </span>
                    <code className="text-muted-foreground break-all font-mono text-[11px]">
                      {client.configPath}
                    </code>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-6">
              <SectionLabel>{t("mcp.steps.label")}</SectionLabel>
              <div className="mb-4" />
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-accent font-mono text-xs">01</span>
                  <span className="text-foreground/90">
                    {t("mcp.steps.one")}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-mono text-xs">02</span>
                  <span className="text-foreground/90">
                    {t("mcp.steps.two")}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-mono text-xs">03</span>
                  <span className="text-foreground/90">
                    {t("mcp.steps.three")}
                  </span>
                </li>
              </ol>
            </Panel>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
