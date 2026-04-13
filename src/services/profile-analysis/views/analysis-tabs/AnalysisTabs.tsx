import { useState } from "react";
import { BarChart3 } from "lucide-react";

import type { GitHubUser } from "../../typing";
import { hasEcosystemData } from "../../helper";
import { EcosystemInsights } from "../ecosystem-insights";
import { TechnicalBreakdown } from "../technical-breakdown";
import { ActivityAnalytics } from "../activity-analytics";
import { SectionHeader, SmallCapsLabel } from "$/primitives";

interface AnalysisTabsProps {
  user: GitHubUser;
  githubUsername?: string;
  className?: string;
}

export function AnalysisTabs({
  user,
  githubUsername,
  className = "",
}: AnalysisTabsProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!hasEcosystemData(user)) {
    return (
      <section className={`border-t border-rule pt-10 ${className}`}>
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-fg-subtle" />
          <SmallCapsLabel tone="subtle">
            Processing deep analytics…
          </SmallCapsLabel>
        </div>
      </section>
    );
  }

  const tabItems = [
    {
      key: "overview",
      title: "Ecosystems",
      hint: "Where activity lands and how it's distributed.",
      content: <EcosystemInsights ecosystemScores={user.ecosystem_scores!} />,
    },
    {
      key: "technical",
      title: "Technical",
      hint: "Languages, stacks, and repositories by weight.",
      content: (
        <TechnicalBreakdown
          ecosystemScores={user.ecosystem_scores!}
          githubUsername={githubUsername}
        />
      ),
    },
    {
      key: "activity",
      title: "Activity",
      hint: "Commit rhythm and long-term engagement signal.",
      content: <ActivityAnalytics ecosystemScores={user.ecosystem_scores!} />,
    },
  ];

  const active = tabItems.find((tab) => tab.key === selectedTab);

  return (
    <section className={`border-t border-rule pt-10 ${className}`}>
      <SectionHeader
        kicker="Deep analytics"
        title="Break it apart"
        deck="Three lenses on the same developer footprint. Switch freely — each view is computed from the same activity set."
      />

      {/* Editorial underline tab bar */}
      <div
        role="tablist"
        aria-label="Analysis views"
        className="flex items-end gap-8 border-b border-rule -mt-2 mb-8"
      >
        {tabItems.map((tab) => {
          const isActive = tab.key === selectedTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedTab(tab.key)}
              className="relative flex flex-col items-start gap-1 pb-3 pt-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <span
                className={`font-display text-[1rem] leading-[1.2] tracking-[-0.005em] transition-colors ${
                  isActive ? "text-fg font-semibold" : "text-fg-muted"
                }`}
              >
                {tab.title}
              </span>
              <span className="font-sans text-[0.75rem] text-fg-subtle max-w-[18ch] text-left">
                {tab.hint}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">{active?.content}</div>
    </section>
  );
}
