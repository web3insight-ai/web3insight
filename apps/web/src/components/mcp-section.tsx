"use client"

import { useCallback, useState } from "react"
import { CheckIcon, CopyIcon, ExternalLinkIcon, TerminalIcon } from "lucide-react"
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

const CONFIG_SNIPPET = JSON.stringify(
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
    id: "claude",
    name: "Claude Desktop",
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
  },
  { id: "cursor", name: "Cursor", configPath: "~/.cursor/mcp.json" },
  { id: "vscode", name: "VS Code", configPath: ".vscode/mcp.json" },
]

export function McpSection() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(CONFIG_SNIPPET).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <section
      id="mcp"
      className="relative overflow-hidden border-b border-border py-28"
    >
      <div className="max-w-content mx-auto px-6">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <div className="text-muted-foreground mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <TerminalIcon className="size-3.5" />
              <span>M01 · {t("mcp.eyebrow")}</span>
            </div>
            <h2 className="font-display mb-4 text-balance text-3xl font-semibold text-foreground sm:text-4xl">
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
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.div variants={fadeInUp()}>
            <Panel className="h-full p-6">
              <SectionLabel>{t("mcp.endpoint.label")}</SectionLabel>
              <div className="mb-4" />
              <code className="border-border-soft bg-background block break-all border px-3 py-2 font-mono text-xs sm:text-sm">
                {MCP_ENDPOINT_URL}
              </code>

              <div className="mt-6">
                <div className="text-muted-foreground mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                  <span>{t("mcp.config.label")}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-foreground/80 hover:text-foreground flex items-center gap-1.5 normal-case"
                  >
                    {copied ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <CopyIcon className="size-3" />
                    )}
                    <span className="tracking-normal">
                      {copied ? t("mcp.config.copied") : t("mcp.config.copy")}
                    </span>
                  </button>
                </div>
                <pre className="border-border-soft bg-background overflow-x-auto border p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
                  {CONFIG_SNIPPET}
                </pre>
              </div>

              <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                {t("mcp.config.hint")}
              </p>
            </Panel>
          </motion.div>

          <motion.div variants={fadeInUp(0.05)} className="flex flex-col gap-6">
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
              <a
                href="https://dash.web3insight.ai/copilot?copilotMcpTokens=open"
                target="_blank"
                rel="noopener noreferrer"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-6 inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("mcp.cta")}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </Panel>

            <Panel className="p-6">
              <SectionLabel>{t("mcp.plugin.label")}</SectionLabel>
              <div className="mb-4" />
              <p className="text-foreground/80 text-sm leading-relaxed">
                {t("mcp.plugin.description")}
              </p>
              <pre className="border-border-soft bg-background mt-4 overflow-x-auto border p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
                {`/plugin marketplace add web3insight-ai/web3insight
/plugin install web3insight@web3insight`}
              </pre>
              <a
                href="https://github.com/web3insight-ai/web3insight/blob/main/plugins/web3insight/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-6 inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("mcp.plugin.cta")}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </Panel>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
