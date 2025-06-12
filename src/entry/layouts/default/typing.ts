import type { User } from "~/strapi/typing";
import type { Query } from "~/query/typing";

type SearchHistoryProps = {
  history: Query[];
  placeholder: string;
};

type DefaultLayoutProps = {
  children: React.ReactNode;
  history: {
    query: string;
    id: string;
    documentId: string;
  }[];
  user: User | null;
};

export type { SearchHistoryProps, DefaultLayoutProps };
