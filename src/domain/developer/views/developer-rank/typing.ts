import type { DeveloperRankRecord } from "../../../api/typing";

type DeveloperLinkProps = {
  className?: string;
  developer: DeveloperRankRecord;
};

type DeveloperRankViewWidgetProps = {
  dataSource: DeveloperRankRecord[];
  view?: "table" | "grid";
}

export type { DeveloperLinkProps, DeveloperRankViewWidgetProps };
