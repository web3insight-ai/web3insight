import type { ReactNode } from "react";

import type { Repository } from "../../typing";

type RepoTableProps = {
  className?: string;
  dataSource: Repository[];
  title?: ReactNode;
  icon?: ReactNode;
};

export type { RepoTableProps };
