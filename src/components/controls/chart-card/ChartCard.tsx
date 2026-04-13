import clsx from "clsx";
import ReactEcharts from "echarts-for-react";

import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";
import type { ChartCardProps } from "./typing";

function ChartCard({
  className,
  title,
  style,
  option,
  chartContainerClassName,
}: ChartCardProps) {
  return (
    <Panel
      label={{ text: String(title).toLowerCase(), position: "tl" }}
      className={clsx("overflow-hidden", className)}
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>{title}</SmallCapsLabel>
      </div>
      <div className="px-5 py-4">
        <div
          className={clsx("w-full overflow-hidden", chartContainerClassName)}
          style={style}
        >
          <ReactEcharts
            style={{ width: "100%", height: "100%" }}
            option={option}
          />
        </div>
      </div>
    </Panel>
  );
}

export default ChartCard;
