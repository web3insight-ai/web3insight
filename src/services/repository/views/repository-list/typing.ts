import type { DataValue, ResponseResult } from "@/types";
import type { RepoListSearchInput } from "@/lib/form/schemas";

import type { Repository } from "../../typing";

type SearchValue = RepoListSearchInput;

type SelectableFilterWidgetProps<V extends DataValue = DataValue> = {
  value: V;
  onChange: (value: V) => void;
};

type FormSearchWidgetProps = {
  onSearch: (value: SearchValue) => void;
};

type MarkDialogProps = {
  record: Repository;
  visible: boolean;
  onClose: () => void;
  onChange: (value?: string | number) => Promise<ResponseResult>;
};

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
  onMark: (
    mark: string | number | undefined,
    record: Repository,
  ) => Promise<ResponseResult>;
};

export type {
  SearchValue,
  SelectableFilterWidgetProps,
  FormSearchWidgetProps,
  MarkDialogProps,
  RepositoryListViewWidgetProps,
};
