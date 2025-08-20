import { Card, CardBody, Chip } from "@nextui-org/react";
import { Brain, Code } from "lucide-react";

import type { AIProfile } from "../../typing";
import { StatsDashboard } from "../stats-dashboard";
import { SkillRadarChart } from "../skill-radar-chart";
import { EcosystemChart } from "../ecosystem-chart";
import { ActivityHeatmap } from "../activity-heatmap";

interface AIProfileDisplayProps {
  aiProfile: AIProfile;
  className?: string;
}

export function AIProfileDisplay({ aiProfile, className = "" }: AIProfileDisplayProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Visual Analytics Dashboard */}
      <div className="space-y-6">
        {/* Primary Visualizations Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stats Dashboard */}
          <StatsDashboard aiProfile={aiProfile} />

          {/* Skill Radar Chart */}
          <SkillRadarChart aiProfile={aiProfile} />
        </div>

        {/* Secondary Visualizations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ecosystem Impact Chart */}
          <EcosystemChart aiProfile={aiProfile} />

          {/* Activity Heatmap */}
          <ActivityHeatmap aiProfile={aiProfile} />
        </div>

        {/* AI Summary - Minimized */}
        {aiProfile.summary && (
          <Card className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="text-primary" size={14} />
                <h4 className="text-xs font-semibold text-primary">AI SUMMARY</h4>
              </div>
              <p className="text-xs chinese-content leading-relaxed text-gray-700 dark:text-gray-300">
                {aiProfile.summary.length > 200 ? `${aiProfile.summary.slice(0, 200)}...` : aiProfile.summary}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Quick Skills */}
        {aiProfile.skills && aiProfile.skills.length > 0 && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Code className="text-secondary" size={14} />
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">KEY SKILLS</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiProfile.skills.slice(0, 6).map((skill, index) => (
                  <Chip key={index} color="danger" variant="flat" size="sm">
                    <span className="text-xs">{skill.toUpperCase()}</span>
                  </Chip>
                ))}
                {aiProfile.skills.length > 6 && (
                  <Chip color="default" variant="bordered" size="sm">
                    <span className="text-xs">+{aiProfile.skills.length - 6} MORE</span>
                  </Chip>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* AI Roast Report Section */}
      {aiProfile.roast_report && (
        <div className="space-y-6">
          {/* Roast Title */}
          <Card className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-danger-200 dark:border-danger-700">
                <div className="text-lg">🔥</div>
                <h3 className="text-sm font-bold text-danger">AI Roast Report</h3>
                <div className="ml-auto flex gap-2">
                  <Chip color="danger" variant="flat" size="sm">
                    🌶️ {aiProfile.roast_report.roast_score.spicyLevel}/10
                  </Chip>
                  <Chip color="warning" variant="flat" size="sm">
                    💯 {aiProfile.roast_report.roast_score.truthLevel}/10
                  </Chip>
                </div>
              </div>
              <Card className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <CardBody className="p-4">
                  <h4 className="chinese-content text-sm mb-2 text-danger font-semibold">
                    {aiProfile.roast_report.title}
                  </h4>
                </CardBody>
              </Card>
            </CardBody>
          </Card>

          {/* Main Roast Content */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Overall Roast */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm">😈</div>
                  <h5 className="font-medium text-xs">Overall Roast</h5>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <p className="chinese-content text-xs leading-relaxed">
                    {aiProfile.roast_report.overall_roast}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Activity Roast */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm">📊</div>
                  <h5 className="font-medium text-xs">Activity Roast</h5>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <p className="chinese-content text-xs leading-relaxed">
                    {aiProfile.roast_report.activity_roast}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Ecosystem Roast */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm">🌐</div>
                  <h5 className="font-medium text-xs">Ecosystem Choice Roast</h5>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <p className="chinese-content text-xs leading-relaxed">
                    {aiProfile.roast_report.ecosystem_roast}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Technical Roast */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm">💻</div>
                  <h5 className="font-medium text-xs">Tech Stack Roast</h5>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <p className="chinese-content text-xs leading-relaxed">
                    {aiProfile.roast_report.technical_roast}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Constructive Sarcasm */}
          <Card className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-success-200 dark:border-success-700">
                <div className="text-lg">💡</div>
                <h4 className="text-sm font-bold text-success">Constructive Suggestions</h4>
              </div>
              <div className="space-y-3">
                {aiProfile.roast_report.constructive_sarcasm.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Chip color="success" variant="flat" size="sm">
                      {index + 1}
                    </Chip>
                    <div className="bg-success-100 dark:bg-success-900/30 border border-success-200 dark:border-success-700 p-3 rounded-lg flex-1">
                      <p className="chinese-content text-xs leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Final Verdict */}
          <Card className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-secondary-200 dark:border-secondary-700">
                <div className="text-lg">⚖️</div>
                <h4 className="text-sm font-bold text-secondary">Final Verdict</h4>
              </div>
              <div className="bg-secondary-100 dark:bg-secondary-900/30 border-2 border-secondary-300 dark:border-secondary-600 p-4 rounded-lg text-center">
                <p className="chinese-content text-sm font-bold">
                  {aiProfile.roast_report.final_verdict}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Analysis Date Footer */}
      {aiProfile.analysis_date && (
        <div className="text-center mt-6">
          <Card className="inline-block bg-gray-50 dark:bg-gray-900">
            <CardBody className="p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                📅 ANALYSIS COMPLETED: {new Date(aiProfile.analysis_date).toLocaleDateString()} 📅
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
