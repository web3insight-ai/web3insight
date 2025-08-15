import { useState } from "react";
import { BarChart3, Globe, Code, Activity } from "lucide-react";

import type { GitHubUser } from "../../typing";
import { hasEcosystemData } from "../../helper";
import { EcosystemInsights } from "../ecosystem-insights";
import { TechnicalBreakdown } from "../technical-breakdown";
import { ActivityAnalytics } from "../activity-analytics";

interface AnalysisTabsProps {
  user: GitHubUser;
  className?: string;
}

export function AnalysisTabs({ user, className = "" }: AnalysisTabsProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!hasEcosystemData(user)) {
    return (
      <div className={`bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card text-center ${className}`}>
        <div className="space-y-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
            <BarChart3 size={16} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Processing Analytics
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Analyzing Web3 ecosystem activity
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: "overview",
      title: "Ecosystem Overview",
      icon: Globe,
      subtitle: "Detailed ecosystem analysis",
      content: <EcosystemInsights ecosystemScores={user.ecosystem_scores!} />,
    },
    {
      key: "technical",
      title: "Technical Details",
      icon: Code,
      subtitle: "Tech stack analysis",
      content: <TechnicalBreakdown ecosystemScores={user.ecosystem_scores!} />,
    },
    {
      key: "activity",
      title: "Activity",
      icon: Activity,
      subtitle: "Timeline analysis",
      content: <ActivityAnalytics ecosystemScores={user.ecosystem_scores!} />,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Horizontal Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tabItems.map((tab) => (
          <div
            key={tab.key}
            className={`analysis-tab cursor-pointer rounded-xl border p-4 ${
              selectedTab === tab.key
                ? "analysis-tab-selected border-primary/30 dark:border-primary/40"
                : "border-border dark:border-border-dark bg-white dark:bg-surface-dark"
            }`}
            onClick={() => setSelectedTab(tab.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedTab(tab.key);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <tab.icon 
                  size={18} 
                  className={`transition-colors duration-200 ${
                    selectedTab === tab.key 
                      ? "text-primary" 
                      : "text-gray-400 dark:text-gray-500"
                  }`} 
                />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${
                  selectedTab === tab.key 
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-700 dark:text-gray-200"
                }`}>
                  {tab.title}
                </h3>
                <p className={`text-xs ${
                  selectedTab === tab.key 
                    ? "text-gray-600 dark:text-gray-300" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {tab.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Content */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
        <div className="animate-fade-in">
          {tabItems.find(tab => tab.key === selectedTab)?.content}
        </div>
      </div>
    </div>
  );
}
