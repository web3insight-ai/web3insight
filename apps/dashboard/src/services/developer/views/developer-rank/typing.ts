import type { ActorRankRecord } from "@/lib/api/types";

type DeveloperLinkProps = {
  className?: string;
  developer: ActorRankRecord;
};

type DeveloperRankViewWidgetProps = {
  dataSource: ActorRankRecord[];
  view?: "table" | "grid";
};

export type { DeveloperLinkProps, DeveloperRankViewWidgetProps };
