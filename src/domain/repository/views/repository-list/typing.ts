import type { Repository } from "../../typing";

type RepositoryListViewWidgetProps = {
  className?: string;
  dataSource: Repository[];
  pagination: {
    total: number;
    pageNum: number;
    pageSize: number;
  };
  onCurrentChange: (currentPage: number) => void;
};

export type { RepositoryListViewWidgetProps };
