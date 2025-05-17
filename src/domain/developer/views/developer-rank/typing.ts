import type { DeveloperRankRecord } from "../../../api/typing";

type DeveloperRankViewWidgetProps = {
  dataSource: DeveloperRankRecord[];
  view?: "table" | "grid";
}

export type { DeveloperRankViewWidgetProps };
