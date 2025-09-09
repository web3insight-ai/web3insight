import { Card, CardBody, Progress, Chip } from "@nextui-org/react";
import { Brain, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import FadeIn from "$/FadeIn";

import type { AnalysisStatus } from "../../typing";

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress: number;
  message?: string;
  estimatedTime?: string;
}

export function AnalysisProgress({ 
  status, 
  progress, 
  message, 
  estimatedTime, 
}: AnalysisProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
    case "pending":
      return <Clock size={20} className="text-warning" />;
    case "analyzing":
      return <Brain size={20} className="text-primary/80" />;
    case "completed":
      return <CheckCircle size={20} className="text-success" />;
    case "failed":
      return <AlertCircle size={20} className="text-danger" />;
    default:
      return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
    case "analyzing":
      return "primary";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "warning";
    }
  };

  const getStatusText = () => {
    switch (status) {
    case "pending":
      return "Preparing Analysis";
    case "analyzing":
      return "Analysis in Progress";
    case "completed":
      return "Analysis Complete";
    case "failed":
      return "Analysis Failed";
    default:
      return "Unknown Status";
    }
  };

  return (
    <FadeIn key={`${status}-${Math.floor(progress)}`}>
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        <CardBody className="p-5 md:p-6">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getStatusText()}
                </h3>
              </div>
              <Chip color={getStatusColor()} variant="flat" size="sm">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            </div>

            {/* Progress Bar - simple, no numeric percentage */}
            <div className="space-y-3" aria-busy={status === "analyzing"}>
              <Progress
                size="md"
                radius="full"
                color={getStatusColor()}
                className="w-full"
                aria-label="Analysis progress"
                isIndeterminate={status === "analyzing"}
                value={status === "completed" ? 100 : undefined}
              />
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Loader2
                  size={14}
                  className={status === "analyzing" ? "animate-spin text-primary" : "text-success"}
                />
                <span>{message || (status === "analyzing" ? "Loading analysis..." : "Analysis complete")}</span>
              </div>
            </div>

            {/* Estimated Time */}
            {estimatedTime && status === "analyzing" && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary">
                  <strong>Estimated time:</strong> {estimatedTime}
                </p>
              </div>
            )}

            {/* Status Messages */}
            {status === "analyzing" && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analyzing GitHub profile and generating AI insights...
              </p>
            )}

            {status === "completed" && (
              <p className="text-xs text-success">
                Analysis completed successfully! Check the results below.
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </FadeIn>
  );
}
