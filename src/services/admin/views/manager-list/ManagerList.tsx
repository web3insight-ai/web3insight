import { useState } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui";

import TableViewWidget from "$/widgets/view/table";

import type { Manager } from "../../typing";

import type { ManagerListViewWidgetProps } from "./typing";
import EcosystemField from "./EcosystemField";
import AssignDialog from "./AssignDialog";

function ManagerListView({
  className,
  dataSource,
  metadata,
  onAssign,
}: ManagerListViewWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [manager, setManager] = useState({} as Manager);

  return (
    <Card
      className={clsx(
        "h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300",
        className,
      )}
    >
      <TableViewWidget
        dataSource={dataSource}
        fields={[
          {
            label: "Username",
            name: "username",
            config: { span: 3 },
          },
          {
            label: "E-mail",
            name: "email",
            config: { span: 4 },
          },
          {
            label: "Ecosystems",
            name: "ecosystems",
            widget: EcosystemField,
            config: { span: 3 },
          },
        ]}
        actions={[
          {
            text: "Assign",
            name: "assign",
            execute: (record) => {
              setManager(record as Manager);
              setVisible(true);
            },
          },
        ]}
        hidePagination
      />
      <AssignDialog
        record={manager}
        ecosystems={metadata.ecosystems}
        visible={visible}
        onClose={() => setVisible(false)}
        onChange={(assigned) => onAssign(assigned, manager)}
      />
    </Card>
  );
}

export default ManagerListView;
