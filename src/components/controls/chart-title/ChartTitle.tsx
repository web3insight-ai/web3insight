import { Tooltip } from "@nextui-org/react";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface ChartTitleProps {
  icon?: ReactNode;
  title: string;
  tooltip?: string;
  className?: string;
}

function ChartTitle({ icon, title, tooltip, className = "" }: ChartTitleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      {tooltip && (
        <Tooltip
          content={tooltip}
          placement="top"
          classNames={{
            base: "max-w-xs",
            content: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg text-xs leading-relaxed p-3 rounded-lg",
          }}
          delay={300}
          closeDelay={0}
        >
          <Info 
            size={12} 
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" 
          />
        </Tooltip>
      )}
    </div>
  );
}

export default ChartTitle;
export type { ChartTitleProps };
