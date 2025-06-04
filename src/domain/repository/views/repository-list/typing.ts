import type { Repository } from "../../typing";

type RepositoryListViewWidgetProps = {
  className?: string;
  dataSource: Repository[];
  pagination: {
    total: number;
    pageNum: number;
    pageSize: number;
  };
  loading: boolean;
  onCurrentChange: (currentPage: number) => void;
};

export type { RepositoryListViewWidgetProps };
