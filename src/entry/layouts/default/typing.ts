import type { StrapiUser } from "~/strapi/typing";
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
  user: StrapiUser | null;
};

export type { SearchHistoryProps, DefaultLayoutProps };
