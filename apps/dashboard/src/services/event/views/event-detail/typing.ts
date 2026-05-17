import type { EcosystemAnalytics } from "../../typing";

type RepoScoreListCardProps = {
  dataSource: EcosystemAnalytics[];
}

type EventDetailViewWidgetProps = {
  id: number;
  mode?: 'admin' | 'public';
  showParticipants?: boolean;
};

export type { RepoScoreListCardProps, EventDetailViewWidgetProps };
