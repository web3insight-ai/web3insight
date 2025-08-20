import type { ResponseResult } from "@/types";

import type { Manager } from "../../typing";

type AssignDialogProps = {
  record: Manager;
  ecosystems: string[];
  visible: boolean;
  onClose: () => void;
  onChange: (value: string[]) => Promise<ResponseResult>;
};

type ManagerListViewWidgetProps = {
  className?: string;
  dataSource: Manager[];
  metadata: {
    ecosystems: string[];
  };
  onAssign: (assigned: string[], record: Manager) => Promise<ResponseResult>;
};

export type { AssignDialogProps, ManagerListViewWidgetProps };
