import { Tooltip } from "@nextui-org/react";
import { Info } from "lucide-react";

interface TableHeaderProps {
  children: React.ReactNode;
  tooltip?: string;
  align?: "left" | "right" | "center";
  className?: string;
}

function TableHeader({ children, tooltip, align = "left", className = "" }: TableHeaderProps) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  
  return (
    <th className={`px-6 py-3 ${alignClass} text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider ${className}`}>
      <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
        <span>{children}</span>
        {tooltip && (
          <Tooltip
            content={tooltip}
            placement="top"
            classNames={{
              base: "max-w-xs",
              content: "bg-white dark:bg-surface-elevated text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-border-dark shadow-lg text-xs leading-relaxed p-3 rounded-lg",
              arrow: "bg-white dark:bg-surface-elevated border border-gray-200 dark:border-border-dark",
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
    </th>
  );
}

export default TableHeader;
export type { TableHeaderProps };
