import { Skeleton } from "@/components/ui";

import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

interface ChartSkeletonProps {
  title?: string;
  height?: string;
}

function ChartSkeleton({
  title = "loading chart",
  height = "320px",
}: ChartSkeletonProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>{title}</SmallCapsLabel>
      </div>
      <div className="p-5" style={{ height }}>
        <div className="w-full h-full flex items-end justify-between gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex-1 h-full flex items-end">
              <Skeleton
                className="w-full rounded-[2px]"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default ChartSkeleton;
