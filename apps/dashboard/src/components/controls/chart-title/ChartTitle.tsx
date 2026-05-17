import { Tooltip } from "@/components/ui";
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
      {icon && <div className="text-fg-muted">{icon}</div>}
      <h3 className="text-sm font-medium text-fg">{title}</h3>
      {tooltip && (
        <Tooltip
          content={tooltip}
          placement="top"
          classNames={{
            base: "max-w-xs",
            content:
              "bg-bg-raised text-fg border border-rule-strong text-xs leading-relaxed p-3 rounded-[2px]",
            arrow: "bg-bg-raised border border-rule-strong",
          }}
          delay={300}
          closeDelay={0}
        >
          <Info
            size={12}
            className="text-fg-subtle hover:text-fg transition-colors cursor-help"
          />
        </Tooltip>
      )}
    </div>
  );
}

export default ChartTitle;
export type { ChartTitleProps };
