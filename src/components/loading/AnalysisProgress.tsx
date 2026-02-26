import { Progress } from "@/components/ui";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress?: number;
  estimatedTime?: string;
  message?: string;
  className?: string;
}

function AnalysisProgress({
  status,
  progress = 0,
  estimatedTime,
  message,
  className = "",
}: AnalysisProgressProps) {
  const getStatusConfig = () => {
    switch (status) {
    case "pending":
      return {
        icon: <Clock size={16} className="text-gray-400" />,
        text: "Queued for analysis",
        color: "default" as const,
        showProgress: false,
      };
    case "analyzing":
      return {
        icon: (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        ),
        text: message || "Analyzing repository contributions...",
        color: "primary" as const,
        showProgress: true,
      };
    case "completed":
      return {
        icon: <CheckCircle size={16} className="text-success" />,
        text: "Analysis completed",
        color: "success" as const,
        showProgress: false,
      };
    case "failed":
      return {
        icon: <AlertCircle size={16} className="text-danger" />,
        text: "Analysis failed",
        color: "danger" as const,
        showProgress: false,
      };
    default:
      return {
        icon: <Clock size={16} className="text-gray-400" />,
        text: "Unknown status",
        color: "default" as const,
        showProgress: false,
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {config.icon}
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {config.text}
        </span>
        {estimatedTime && status === "analyzing" && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (~{estimatedTime})
          </span>
        )}
      </div>

      {config.showProgress && (
        <Progress
          size="sm"
          value={progress}
          color={config.color}
          className="max-w-md"
          showValueLabel={progress > 0}
        />
      )}
    </div>
  );
}

export default AnalysisProgress;
