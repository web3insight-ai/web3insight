import type { DataValue } from "@/types";

import type { Repository } from "../../typing";

type SearchValue = {
  search: string;
  order: "id" | "org";
  direction: "asc" | "desc";
};

type SelectableFilterWidgetProps<V extends DataValue = DataValue> = {
  value: V;
  onChange: (value: V) => void;
};

type FormSearchWidgetProps = {
  onSearch: (value: SearchValue) => void;
}

type RepositoryListViewWidgetProps = Pick<FormSearchWidgetProps, "onSearch"> & {
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

export type { SearchValue, SelectableFilterWidgetProps, FormSearchWidgetProps, RepositoryListViewWidgetProps };
