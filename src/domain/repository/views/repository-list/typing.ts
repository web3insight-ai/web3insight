import type { Repository } from "../../typing";

type RepositoryListViewWidgetProps = {
  className?: string;
  dataSource: Repository[];
  pagination: {
    total: number;
    pageNum: number;
    pageSize: number;
  };
};

export type { RepositoryListViewWidgetProps };
