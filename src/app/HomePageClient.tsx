"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useOverviewStatistics } from "@/hooks/api";
import { SmallCapsLabel } from "$/primitives";
import {
  Panel,
  Trace,
  OutlinedDisplay,
  TerminalPanel,
  HandLabel,
  type Line,
} from "$/blueprint";

function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function formatFull(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function MonoStat({
  value,
  format = "compact",
}: {
  value: number | null;
  format?: "compact" | "full";
}) {
  if (value == null) {
    return (
      <span className="font-mono text-2xl text-fg-muted">
        —
        <span
          aria-hidden
          className="animate-cursor ml-0.5 inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-accent align-middle"
        />
      </span>
    );
  }
  return (
    <span className="font-mono text-2xl font-medium text-fg tabular-nums">
      {format === "compact" ? formatCompact(value) : formatFull(value)}
    </span>
  );
}

const terminalLines: Line[] = [
  [{ type: "comment", text: "// ask anything. AI-powered." }],
  [
    { type: "prompt", text: "> " },
    { type: "keyword", text: "query" },
    { type: "punct", text: "(" },
    { type: "string", text: '"top contributors of ethereum"' },
    { type: "punct", text: ")" },
  ],
  [{ type: "comment", text: "// filter window, then rank" }],
  [
    { type: "prompt", text: "> " },
    { type: "keyword", text: "since" },
    { type: "plain", text: " " },
    { type: "string", text: '"30d"' },
    { type: "plain", text: " | " },
    { type: "keyword", text: "rank" },
    { type: "plain", text: " " },
    { type: "ident", text: "by.commits" },
  ],
];

export default function HomePageClient() {
  const { data: stats, isLoading } = useOverviewStatistics();

  const eco = stats?.totalEcosystems ?? 0;
  const repos = stats?.totalRepositories ?? 0;
  const devs = stats?.totalDevelopers ?? 0;
  const coreDevs = stats?.totalCoreDevelopers ?? 0;

  return (
    <section className="relative w-full overflow-hidden border-b border-rule">
      {/* Blueprint grid ground */}
      <div aria-hidden className="absolute inset-0 opacity-[0.04]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="home-bp-grid"
              width="72"
              height="72"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 72 0 L 0 0 0 72"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#home-bp-grid)"
            className="text-fg"
          />
        </svg>
      </div>

      <motion.div
        className="relative mx-auto grid max-w-content grid-cols-1 gap-10 px-6 pt-14 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-28"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.16, delayChildren: 0.1 },
          },
        }}
      >
        {/* Left — editorial hero */}
        <motion.div
          className="lg:col-span-7"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          <div className="mb-6 inline-flex items-center gap-2 border border-rule px-2 py-1">
            <span className="h-1.5 w-1.5 bg-accent" />
            <SmallCapsLabel tone="subtle">
              web3 developer analytics · live
            </SmallCapsLabel>
          </div>

          <h1 className="font-display font-extrabold leading-[0.92] text-[44px] sm:text-[64px] lg:text-[88px] text-fg">
            <span className="block">Web3</span>
            <span className="mt-1 block">
              <OutlinedDisplay stack={4} offset={4} solidFront>
                insight
              </OutlinedDisplay>
            </span>
          </h1>

          <p className="mt-8 max-w-[58ch] text-base leading-[1.65] text-fg-muted sm:text-lg">
            Discover, analyze, and connect with Web3 developers. Powered by
            GitHub data and on-chain activity for ecosystem growth.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/developers"
              className="group inline-flex h-11 items-center gap-2 rounded-[2px] border border-accent bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:brightness-105"
            >
              <span>Explore developers</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ecosystems"
              className="inline-flex h-11 items-center rounded-[2px] border border-fg bg-transparent px-5 text-sm font-medium text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Browse ecosystems
            </Link>
            <div className="ml-1 hidden sm:inline-flex">
              <HandLabel>start</HandLabel>
            </div>
          </div>

          {/* Schematic ruler */}
          <div className="relative mt-14 flex items-center gap-3 pl-1">
            <SmallCapsLabel tone="subtle">rev · 0001</SmallCapsLabel>
            <div className="h-px flex-1 bg-rule" />
            <SmallCapsLabel tone="subtle">sheet 01/04</SmallCapsLabel>
          </div>
        </motion.div>

        {/* Right — schematic panel grid */}
        <motion.div
          className="relative lg:col-span-5 lg:pt-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          <Trace
            className="inset-0 z-0 h-full w-full"
            viewBox="0 0 100 100"
            d="M 50 48 L 50 62 L 22 62 L 22 72 M 50 62 L 78 62 L 78 72"
            length={280}
            delay={0.8}
            duration={1.6}
            nodes={[
              { x: 50, y: 48 },
              { x: 22, y: 72 },
              { x: 78, y: 72 },
            ]}
            color="teal"
          />

          <div className="relative z-10 flex flex-col gap-4">
            <Panel label={{ text: "query · nl", position: "tl" }} code="01">
              <TerminalPanel
                title="web3insight · nl-query"
                lines={terminalLines}
                className="border-0"
              />
            </Panel>

            <div className="grid grid-cols-2 gap-4">
              <Panel
                ground="dotted"
                label={{ text: "core · devs", position: "tl" }}
                code="02"
                className="p-5"
              >
                <SmallCapsLabel tone="subtle">core developers</SmallCapsLabel>
                <div className="mt-2 flex min-h-[36px] items-center">
                  <MonoStat
                    value={isLoading ? null : coreDevs}
                    format="compact"
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] text-fg-muted/80">
                  src: opendigger · 30d
                </p>
              </Panel>

              <Panel
                ground="hatched"
                label={{ text: "ecosystems", position: "tl" }}
                code="03"
                className="p-5"
              >
                <SmallCapsLabel tone="subtle">ecosystems</SmallCapsLabel>
                <div className="mt-2 flex min-h-[36px] items-center">
                  <MonoStat value={isLoading ? null : eco} format="full" />
                </div>
                <p className="mt-2 font-mono text-[10px] text-fg-muted/80">
                  live · indexed
                </p>
              </Panel>
            </div>

            <Panel
              label={{ text: "contributors · global", position: "tl" }}
              code="04"
              className="p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SmallCapsLabel tone="subtle">
                    eco contributors
                  </SmallCapsLabel>
                  <div className="mt-2 flex min-h-[32px] items-center">
                    <MonoStat
                      value={isLoading ? null : devs}
                      format="compact"
                    />
                  </div>
                </div>
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 64 64" className="h-full w-full text-fg">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      fill="none"
                    />
                    <circle cx="32" cy="32" r="2" className="fill-accent" />
                    <line
                      x1="32"
                      y1="6"
                      x2="32"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line
                      x1="32"
                      y1="52"
                      x2="32"
                      y2="58"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line
                      x1="6"
                      y1="32"
                      x2="12"
                      y2="32"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line
                      x1="52"
                      y1="32"
                      x2="58"
                      y2="32"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-3 font-mono text-[10px] text-fg-muted/80">
                {Number.isFinite(repos) ? repos.toLocaleString() : "—"}{" "}
                repositories indexed
              </p>
            </Panel>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
