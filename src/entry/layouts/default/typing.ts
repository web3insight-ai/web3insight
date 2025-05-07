import type { StrapiUser } from "~/strapi/typing";
import type { Query } from "~/query/typing";

type SearchHistoryProps = {
  history: Query[];
  placeholder: string;
};

type NavToolbarProps = Pick<SearchHistoryProps, "history"> & {
  user: StrapiUser | null;
};

export type { SearchHistoryProps, NavToolbarProps };
