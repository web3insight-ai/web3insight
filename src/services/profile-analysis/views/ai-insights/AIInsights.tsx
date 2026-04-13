import { useState } from "react";
import { Button, Chip } from "@/components/ui";
import { Target } from "lucide-react";
import { useAtom } from "jotai";

import type { GitHubUser } from "../../typing";
import { hasAIData, getInvolvementLevelColor } from "../../helper";
import { languageAtom } from "#/atoms";
import { LanguageToggle } from "$/controls/language-toggle";
import { SectionHeader, SmallCapsLabel } from "$/primitives";

interface AIInsightsProps {
  user: GitHubUser;
  className?: string;
}

function ScoreTriplet({
  spicy,
  truth,
  helpful,
}: {
  spicy: number;
  truth: number;
  helpful: number;
}) {
  const items: { label: string; value: number }[] = [
    { label: "Spiciness", value: spicy },
    { label: "Truthfulness", value: truth },
    { label: "Helpfulness", value: helpful },
  ];
  return (
    <div className="grid grid-cols-3 gap-x-10 border-t border-rule pt-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <SmallCapsLabel tone="subtle">{item.label}</SmallCapsLabel>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[1.875rem] leading-[1] font-semibold tabular-nums text-fg">
              {item.value}
            </span>
            <span className="font-mono text-[0.75rem] text-fg-subtle">
              / 10
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIInsights({ user, className = "" }: AIInsightsProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [language] = useAtom(languageAtom);

  if (!hasAIData(user) || !user.ai) return null;

  const aiProfile = user.ai;
  const hasNewRoastReport = aiProfile.roastReport;
  const hasOldRoastReport = aiProfile.roast_report;
  const hasRoastReport = hasNewRoastReport || hasOldRoastReport;

  if (hasRoastReport) {
    const scores = aiProfile.roast_report?.roast_score;
    return (
      <section className={`border-t border-rule pt-10 ${className}`}>
        <SectionHeader
          kicker="AI brief · analysis"
          title="The candid read"
          deck={
            <>
              An unblinking summary of this developer's signal — generated from
              repo activity, commit cadence, and ecosystem footprint. Treat it
              as a starting point for conversation, not a verdict.
            </>
          }
          action={hasNewRoastReport ? <LanguageToggle /> : null}
        />

        {hasOldRoastReport && scores && (
          <div className="mb-8">
            <ScoreTriplet
              spicy={scores.spicyLevel}
              truth={scores.truthLevel}
              helpful={scores.helpfulLevel}
            />
          </div>
        )}

        {hasNewRoastReport && (
          <p className="chinese-content font-sans text-[1.0625rem] leading-[1.65] text-fg max-w-[var(--measure-wide)]">
            {aiProfile.roastReport?.[language] ??
              aiProfile.roastReport?.english ??
              aiProfile.roastReport?.chinese}
          </p>
        )}

        {hasOldRoastReport && !hasNewRoastReport && (
          <div className="flex flex-col gap-8 max-w-[var(--measure-wide)]">
            <p className="chinese-content font-display text-[1.25rem] leading-[1.3] font-semibold text-fg">
              {aiProfile.roast_report?.title}
            </p>

            <AnalysisBlock
              label="Overall performance"
              body={aiProfile.roast_report?.overall_roast}
            />
            <AnalysisBlock
              label="Activity level"
              body={aiProfile.roast_report?.activity_roast}
            />
            <AnalysisBlock
              label="Ecosystem choice"
              body={aiProfile.roast_report?.ecosystem_roast}
            />
            <AnalysisBlock
              label="Technical skills"
              body={aiProfile.roast_report?.technical_roast}
            />

            <div className="border-t border-rule-strong pt-6">
              <SmallCapsLabel tone="subtle">Summary</SmallCapsLabel>
              <p className="chinese-content font-display mt-2 text-[1.125rem] leading-[1.5] text-fg">
                {aiProfile.roast_report?.final_verdict}
              </p>
            </div>

            {aiProfile.roast_report?.constructive_sarcasm &&
              aiProfile.roast_report.constructive_sarcasm.length > 0 && (
              <div className="border-t border-rule pt-6">
                <SmallCapsLabel tone="subtle">
                    Improvement suggestions
                </SmallCapsLabel>
                <ol className="mt-4 flex flex-col gap-3">
                  {aiProfile.roast_report.constructive_sarcasm
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <li key={index} className="flex items-baseline gap-3">
                        <span className="font-mono text-[0.75rem] text-fg-subtle tabular-nums shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="chinese-content text-[0.9375rem] leading-[1.55] text-fg-muted">
                          {suggestion}
                        </p>
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={`border-t border-rule pt-10 ${className}`}>
      <SectionHeader
        kicker="AI brief"
        title="Signal summary"
        deck="Machine-read commentary on this developer's Web3 footprint, capability signal, and suggested next steps."
      />

      <div className="flex flex-col gap-10 max-w-[var(--measure-wide)]">
        {aiProfile.web3_involvement && (
          <div className="flex flex-col gap-3">
            <SmallCapsLabel tone="subtle">
              Web3 involvement level
            </SmallCapsLabel>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-[2.5rem] leading-[1] font-semibold tabular-nums text-fg">
                {aiProfile.web3_involvement.score}
                <span className="text-[1rem] font-mono text-fg-subtle">
                  {" "}
                  / 100
                </span>
              </span>
              <Chip
                color={getInvolvementLevelColor(
                  aiProfile.web3_involvement.level,
                )}
                variant="flat"
                size="md"
                className="font-medium"
              >
                {aiProfile.web3_involvement.level}
              </Chip>
            </div>
          </div>
        )}

        {aiProfile.summary && (
          <div className="flex flex-col gap-3 border-t border-rule pt-6">
            <SmallCapsLabel tone="subtle">Analysis summary</SmallCapsLabel>
            <p className="text-[1rem] leading-[1.65] text-fg">
              {showFullSummary
                ? aiProfile.summary
                : `${aiProfile.summary.slice(0, 240)}${aiProfile.summary.length > 240 ? "…" : ""}`}
            </p>
            {aiProfile.summary.length > 240 && (
              <Button
                variant="light"
                size="sm"
                onPress={() => setShowFullSummary(!showFullSummary)}
                className="self-start text-accent px-0 h-6 min-w-0"
              >
                {showFullSummary ? "Show less ↑" : "Read more ↓"}
              </Button>
            )}
          </div>
        )}

        {aiProfile.skills && aiProfile.skills.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-rule pt-6">
            <SmallCapsLabel tone="subtle">Key skills</SmallCapsLabel>
            <div className="flex flex-wrap gap-2">
              {aiProfile.skills.slice(0, 10).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center font-mono text-[0.75rem] uppercase tracking-[0.08em] text-fg-muted border border-rule rounded-sm px-2 py-1"
                >
                  {skill}
                </span>
              ))}
              {aiProfile.skills.length > 10 && (
                <span className="inline-flex items-center text-[0.75rem] text-fg-subtle px-1 py-1">
                  + {aiProfile.skills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {aiProfile.recommendation && (
          <div className="flex flex-col gap-3 border-t border-rule pt-6">
            <div className="flex items-center gap-2">
              <Target size={12} className="text-accent" />
              <SmallCapsLabel tone="accent">Recommendations</SmallCapsLabel>
            </div>
            <p className="text-[1rem] leading-[1.65] text-fg">
              {aiProfile.recommendation}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AnalysisBlock({
  label,
  body,
}: {
  label: string;
  body: string | undefined;
}) {
  if (!body) return null;
  return (
    <div className="flex flex-col gap-2">
      <SmallCapsLabel tone="subtle">{label}</SmallCapsLabel>
      <p className="chinese-content text-[1rem] leading-[1.65] text-fg">
        {body}
      </p>
    </div>
  );
}
