import clsx from "clsx";
import { Card } from "@nextui-org/react";

import TableViewWidget from "@/components/widget/view/table";

import type { ManagerListViewWidgetProps } from "./typing";

function ManagerListView({ className, dataSource }: ManagerListViewWidgetProps) {
  return (
    <Card className={clsx("h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
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
            config: { span: 5 },
          },
        ]}
        hidePagination
      />
    </Card>
  );
}

export default ManagerListView;
