import clsx from "clsx";
import { Card } from "@nextui-org/react";

import DataTable from "@/components/control/data-table";

import { resolveCustomMarkText } from "../../helper";
import { LinkReadFieldWidget } from "../../widgets/link-field";

import type { RepositoryListViewWidgetProps } from "./typing";

function RepositoryListView({ className, dataSource, pagination, loading, onCurrentChange }: RepositoryListViewWidgetProps ) {
  return (
    <Card className={clsx("h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
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
          {
            title: "Custom Mark",
            key: "customMark",
            render: (_, { row }) => resolveCustomMarkText(row.customMark),
          },
        ]}
        total={pagination.total}
        currentPage={pagination.pageNum}
        pageSize={pagination.pageSize}
        loading={loading}
        onCurrentChange={onCurrentChange}
      />
    </Card>
  );
}

export default RepositoryListView;
