import { useState } from "react";
import { Button, Chip } from "@nextui-org/react";
import { Brain, Sparkles, Target } from "lucide-react";
import { useAtom } from "jotai";

import type { GitHubUser } from "../../typing";
import { hasAIData, getInvolvementLevelColor } from "../../helper";
import { languageAtom } from "#/atoms";
import { LanguageToggle } from "$/controls/language-toggle";

interface AIInsightsProps {
  user: GitHubUser;
  className?: string;
}

export function AIInsights({ user, className = "" }: AIInsightsProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [language] = useAtom(languageAtom);

  if (!hasAIData(user) || !user.ai) {
    return null;
  }

  const aiProfile = user.ai;

  // Check for new roastReport structure first, then fall back to old structure
  const hasNewRoastReport = aiProfile.roastReport;
  const hasOldRoastReport = aiProfile.roast_report;
  const hasRoastReport = hasNewRoastReport || hasOldRoastReport;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Roast Report - Hero Section */}
      {hasRoastReport ? (
        // DevInsight - Simple & Clean
        <div className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card">
          <div className="space-y-3">
            {/* Header with Language Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI Analysis Report
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Toggle - only show for new structure */}
                {hasNewRoastReport && <LanguageToggle />}
                {/* Scores - With Labels - only show for old structure */}
                {hasOldRoastReport && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-gray-900 dark:text-white font-semibold">
                        {aiProfile.roast_report?.roast_score.spicyLevel}/10
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                        Spiciness
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 dark:text-white font-semibold">
                        {aiProfile.roast_report?.roast_score.truthLevel}/10
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                        Truthfulness
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 dark:text-white font-semibold">
                        {aiProfile.roast_report?.roast_score.helpfulLevel}/10
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                        Helpfulness
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content - New Structure */}
            {hasNewRoastReport && (
              <div className="border-l-3 border-l-primary pl-3">
                <p className="chinese-content text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {aiProfile.roastReport?.[language]}
                </p>
              </div>
            )}

            {/* Content - Old Structure */}
            {hasOldRoastReport && !hasNewRoastReport && (
              <>
                {/* Title */}
                <div className="border-l-3 border-l-primary pl-3">
                  <p className="chinese-content text-sm font-medium text-gray-900 dark:text-white">
                    {aiProfile.roast_report?.title}
                  </p>
                </div>

                {/* Analysis Content - Compact */}
                <div className="space-y-3 text-sm">
                  <div className="border-l-2 border-l-gray-200 dark:border-l-gray-700 pl-3">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Overall Performance</h4>
                    <p className="chinese-content leading-relaxed text-gray-700 dark:text-gray-300">
                      {aiProfile.roast_report?.overall_roast}
                    </p>
                  </div>

                  <div className="border-l-2 border-l-gray-200 dark:border-l-gray-700 pl-3">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Activity Level</h4>
                    <p className="chinese-content leading-relaxed text-gray-700 dark:text-gray-300">
                      {aiProfile.roast_report?.activity_roast}
                    </p>
                  </div>

                  <div className="border-l-2 border-l-gray-200 dark:border-l-gray-700 pl-3">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ecosystem Choice</h4>
                    <p className="chinese-content leading-relaxed text-gray-700 dark:text-gray-300">
                      {aiProfile.roast_report?.ecosystem_roast}
                    </p>
                  </div>

                  <div className="border-l-2 border-l-gray-200 dark:border-l-gray-700 pl-3">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Technical Skills</h4>
                    <p className="chinese-content leading-relaxed text-gray-700 dark:text-gray-300">
                      {aiProfile.roast_report?.technical_roast}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 mt-4 border dark:border-gray-600">
                  <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Summary</h4>
                  <p className="chinese-content text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {aiProfile.roast_report?.final_verdict}
                  </p>
                </div>

                {/* Suggestions */}
                {aiProfile.roast_report?.constructive_sarcasm && aiProfile.roast_report.constructive_sarcasm.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Improvement Suggestions</h4>
                    <div className="space-y-2">
                      {aiProfile.roast_report?.constructive_sarcasm.slice(0, 2).map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 mt-0.5">{index + 1}.</span>
                          <p className="chinese-content text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        // Fallback for other AI insights when no roast report
        <div className="space-y-4">
          {/* Web3 Involvement Score - Primary KPI */}
          {aiProfile.web3_involvement && (
            <div className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Web3 Involvement Level
                  </h3>
                  <div className="flex items-center gap-3">
                    <Chip
                      color={getInvolvementLevelColor(aiProfile.web3_involvement.level)}
                      variant="flat"
                      size="lg"
                      className="font-semibold"
                    >
                      {aiProfile.web3_involvement.level}
                    </Chip>
                    <span className="metric-number text-gray-900 dark:text-white">
                      {aiProfile.web3_involvement.score}/100
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Target size={32} className="text-primary/60" />
                </div>
              </div>
            </div>
          )}

          {/* AI Summary - Progressive Disclosure */}
          {aiProfile.summary && (
            <div className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} className="text-secondary" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  DevInsight Analysis Summary
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {showFullSummary ? aiProfile.summary : `${aiProfile.summary.slice(0, 200)}${aiProfile.summary.length > 200 ? '...' : ''}`}
                </p>

                {aiProfile.summary.length > 200 && (
                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => setShowFullSummary(!showFullSummary)}
                    className="text-primary"
                  >
                    {showFullSummary ? 'Show Less' : 'Read More'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Skills - Simplified Display */}
          {aiProfile.skills && aiProfile.skills.length > 0 && (
            <div className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={18} className="text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Key Skills
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {aiProfile.skills.slice(0, 8).map((skill, index) => (
                  <Chip
                    key={index}
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="text-xs"
                  >
                    {skill}
                  </Chip>
                ))}
                {aiProfile.skills.length > 8 && (
                  <Chip color="default" variant="bordered" size="sm" className="text-xs">
                    +{aiProfile.skills.length - 8} more
                  </Chip>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {aiProfile.recommendation && (
            <div className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card border-l-4 border-l-success">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/10 rounded-lg flex-shrink-0 mt-1">
                  <Target size={18} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-success mb-2">
                    Recommendations
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {aiProfile.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
