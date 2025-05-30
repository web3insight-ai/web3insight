import clsx from "clsx";
import { Card } from "@nextui-org/react";

import DataTable from "@/components/control/data-table";

import { LinkReadFieldWidget } from "../../widgets/link-field";

import type { RepositoryListViewWidgetProps } from "./typing";

function RepositoryListView({ className, dataSource }: RepositoryListViewWidgetProps ) {
  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
      <DataTable
        dataSource={dataSource}
        columns={[
          { title: "#", key: "serialNumber", type: "index" },
          {
            title: "Repository",
            key: "fullName",
            span: 5,
            render: (_, { row }) => <LinkReadFieldWidget value={row.fullName} />,
          },
        ]}
      />
    </Card>
  );
}

export default RepositoryListView;
