import { Tooltip } from "@/components/ui";
import { Info } from "lucide-react";

import type { MetricCardProps } from "./typing";
import GrowthIndicator from "./GrowthIndicator";
import { SmallCapsLabel } from "$/primitives";

function MetricCard({ label, value, growth, tooltip }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-4">
      <div className="flex items-center gap-1.5">
        <SmallCapsLabel>{label}</SmallCapsLabel>
        {tooltip && (
          <Tooltip
            content={tooltip}
            placement="top"
            classNames={{
              base: "max-w-xs",
              content:
                "bg-bg-raised text-fg border border-rule-strong text-xs leading-relaxed p-3 rounded",
            }}
            delay={300}
            closeDelay={0}
          >
            <Info
              size={11}
              className="text-fg-subtle hover:text-fg-muted transition-colors cursor-help"
            />
          </Tooltip>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[1.875rem] leading-[1] font-semibold tabular-nums tracking-[-0.02em] text-fg">
          {value}
        </span>
        {growth !== undefined && (
          <GrowthIndicator
            value={`${growth > 0 ? "+" + growth : growth}%`}
            positive={growth > 0}
          />
        )}
      </div>
    </div>
  );
}

export default MetricCard;
