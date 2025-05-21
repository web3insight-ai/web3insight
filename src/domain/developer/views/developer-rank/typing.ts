import type { ActorRankRecord } from "../../../api/typing";

type DeveloperLinkProps = {
  className?: string;
  developer: ActorRankRecord;
};

type DeveloperRankViewWidgetProps = {
  dataSource: ActorRankRecord[];
  view?: "table" | "grid";
}

export type { DeveloperLinkProps, DeveloperRankViewWidgetProps };
