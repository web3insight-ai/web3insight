import { useState } from "react";
import clsx from "clsx";
import { Card } from "@nextui-org/react";

import TableViewWidget from "@/components/widget/view/table";

import type { Repository } from "../../typing";
import { LinkReadFieldWidget } from "../../widgets/link-field";

import type { RepositoryListViewWidgetProps } from "./typing";
import FormSearchWidget from "./FormSearch";
import MarkedFieldWidget from "./MarkedField";
import MarkDialog from "./MarkDialog";

function RepositoryListView({
  className,
  dataSource,
  pagination,
  loading,
  onCurrentChange,
  onSearch,
  onMark,
}: RepositoryListViewWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [record, setRecord] = useState({} as Repository);

  const closeDialog = () => setVisible(false);

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
        actions={[
          {
            text: "Mark",
            name: "mark",
            execute: record => {
              setRecord(record as Repository);
              setVisible(true);
            },
          },
        ]}
        search={<FormSearchWidget onSearch={onSearch} />}
        total={pagination.total}
        currentPage={pagination.pageNum}
        pageSize={pagination.pageSize}
        loading={loading}
        onCurrentChange={onCurrentChange}
      />
      <MarkDialog
        record={record}
        visible={visible}
        onClose={closeDialog}
        onChange={mark => onMark(mark, record)}
      />
    </Card>
  );
}

export default RepositoryListView;
