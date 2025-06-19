import { useState, useEffect } from "react";
import clsx from "clsx";
import { Card } from "@nextui-org/react";

import TableViewWidget from "@/components/widget/view/table";

import { fetchContestantList } from "../../repository";

import type { ContestantListViewWidgetProps } from "./typing";
import ContestantDialog from "./ContestantDialog";

const initTimestamp = Date.now();

function ContestantListView({ className, managerId }: ContestantListViewWidgetProps) {
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [refetchTimestamp, setRefetchTimestamp] = useState(initTimestamp);

  useEffect(() => {
    if (!managerId) {
      return;
    }

    setLoading(true);
    fetchContestantList({ managerId })
      .then(res => {
        setDataSource(res.data);
        setTotal(res.extra?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [managerId, refetchTimestamp]);

  const closeDialog = (needRefetch: boolean = false) => {
    if (needRefetch) {
      setRefetchTimestamp(Date.now());
    }

    setVisible(false);
  };

  return (
    <Card className={clsx("h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
      <TableViewWidget
        dataSource={dataSource}
        fields={[
          { label: "ID", name: "id" },
          { label: "Description", name: "description", config: { span: 3 } },
          { label: "Created Time", name: "created_at", config: { span: 3 } },
        ]}
        actions={[
          {
            text: "Add new",
            name: "addNewContestants",
            context: "free",
            execute: () => setVisible(true),
          },
        ]}
        total={total}
        loading={loading}
      />
      <ContestantDialog
        managerId={managerId}
        visible={visible}
        onClose={closeDialog}
      />
    </Card>
  );
}

export default ContestantListView;
