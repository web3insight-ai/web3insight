import { Card, CardBody, Progress, Chip } from "@/components/ui";
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
      return <Brain size={20} className="text-accent/80" />;
    case "completed":
      return <CheckCircle size={20} className="text-success" />;
    case "failed":
      return <AlertCircle size={20} className="text-danger" />;
    default:
      return <Clock size={20} className="text-fg-subtle" />;
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
      <Card className="bg-bg-raised border border-rule rounded-[2px]">
        <CardBody className="p-5 md:p-6">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <h3 className="font-semibold text-fg">{getStatusText()}</h3>
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
              <div className="flex items-center gap-2 text-sm text-fg-muted">
                <Loader2
                  size={14}
                  className={
                    status === "analyzing"
                      ? "animate-spin text-accent"
                      : "text-success"
                  }
                />
                <span>
                  {message ||
                    (status === "analyzing"
                      ? "Loading analysis..."
                      : "Analysis complete")}
                </span>
              </div>
            </div>

            {/* Estimated Time */}
            {estimatedTime && status === "analyzing" && (
              <div className="p-3 bg-accent-subtle rounded-[2px] border border-accent/30">
                <p className="text-sm text-accent">
                  <strong>Estimated time:</strong> {estimatedTime}
                </p>
              </div>
            )}

            {/* Status Messages */}
            {status === "analyzing" && (
              <p className="text-xs text-fg-muted">
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
