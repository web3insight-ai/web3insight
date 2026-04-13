import { Tooltip } from "@/components/ui";
import { Info } from "lucide-react";

interface TableHeaderProps {
  children: React.ReactNode;
  tooltip?: string;
  align?: "left" | "right" | "center";
  className?: string;
}

function TableHeader({
  children,
  tooltip,
  align = "left",
  className = "",
}: TableHeaderProps) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <th
      className={`px-6 py-3 ${alignClass} font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}
      >
        <span className="whitespace-nowrap">{children}</span>
        {tooltip && (
          <Tooltip
            content={tooltip}
            placement="top"
            classNames={{
              base: "max-w-xs",
              content:
                "bg-bg-raised text-fg border border-rule-strong text-xs leading-relaxed p-3 rounded-[2px]",
            }}
            delay={300}
            closeDelay={0}
          >
            <Info
              size={12}
              className="text-fg-subtle hover:text-fg-muted transition-colors cursor-help"
            />
          </Tooltip>
        )}
      </div>
    </th>
  );
}

export default TableHeader;
export type { TableHeaderProps };
