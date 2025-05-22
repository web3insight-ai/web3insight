type GithubUserActivity = {
  title: string;
  description: string;
  items: {
    id: string;
    title: string;
    date_published: string;
  }[];
};

export type { GithubUserActivity };
