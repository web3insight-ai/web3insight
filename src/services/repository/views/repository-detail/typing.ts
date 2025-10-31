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
  activeDevelopers?: Array<{
    month: string;
    developers: number;
  }> | null;
};
