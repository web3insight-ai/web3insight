export type RepositoryDetailProps = {
  repository: {
    id: number;
    name: string;
    starCount: number;
    forksCount: number;
    openIssuesCount: number;
    contributorCount: number;
    details?: {
      description?: string;
      language?: string;
      homepage?: string;
      topics?: string[];
    } | null;
  };
  analysis: {
    openrank: Record<string, number> | null;
    communityOpenrank: {
      data: Record<string, Record<string, number>>;
    } | null;
    attention: Record<string, number> | null;
    participants: Record<string, number> | null;
    newContributors: Record<string, number> | null;
    inactiveContributors: Record<string, number> | null;
  } | null;
};
