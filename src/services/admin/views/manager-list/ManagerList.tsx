import { useState } from "react";
import clsx from "clsx";

import TableViewWidget from "$/widgets/view/table";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

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
    <Panel
      label={{ text: "admin · managers", position: "tl" }}
      code="01"
      className={clsx("h-full", className)}
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>managers</SmallCapsLabel>
      </div>
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
    </Panel>
  );
}

export default ManagerListView;
