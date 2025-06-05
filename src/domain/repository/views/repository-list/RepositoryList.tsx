import clsx from "clsx";
import { Card } from "@nextui-org/react";

import TableViewWidget from "@/components/widget/view/table";

import { LinkReadFieldWidget } from "../../widgets/link-field";

import type { RepositoryListViewWidgetProps } from "./typing";
import MarkedFieldWidget from "./MarkedField";

function RepositoryListView({ className, dataSource, pagination, loading, onCurrentChange }: RepositoryListViewWidgetProps ) {
  return (
    <Card className={clsx("h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
      <TableViewWidget
        dataSource={dataSource}
        fields={[
          {
            label: "Repository",
            name: "fullName",
            widget: LinkReadFieldWidget,
            config: { span: 5 },
          },
          {
            label: "Custom Mark",
            name: "customMark",
            widget: MarkedFieldWidget,
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
