import { useState, useEffect } from "react";
import clsx from "clsx";
import { Card } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";

import TableViewWidget from "@/components/widget/view/table";

import type { GithubUser } from "../../typing";
import { fetchList } from "../../repository";

import type { EventListViewWidgetProps } from "./typing";
import CreatedTimeFieldWidget from "./CreatedTimeField";
import EventDialog from "./EventDialog";
import ContestantListDialog from "./ContestantListDialog";

const initTimestamp = Date.now();

function EventListView({ className, managerId }: EventListViewWidgetProps) {
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refetchTimestamp, setRefetchTimestamp] = useState(initTimestamp);

  const [visible, setVisible] = useState(false);

  const [addedResult, setAddedResult] = useState<GithubUser[]>([]);
  const [addedResultVisible, setAddedResultVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!managerId) {
      return;
    }

    setLoading(true);
    fetchList({ managerId })
      .then(res => {
        setDataSource(res.data);
        setTotal(res.extra?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [managerId, refetchTimestamp]);

  const closeDialog = (contestants?: GithubUser[]) => {
    setVisible(false);

    if (contestants) {
      setRefetchTimestamp(Date.now());
      setAddedResult(contestants);
      setAddedResultVisible(true);
    }
  };

  return (
    <Card className={clsx("h-full bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
      <TableViewWidget
        dataSource={dataSource}
        fields={[
          { label: "ID", name: "id" },
          { label: "Description", name: "description", config: { span: 5 } },
          {
            label: "Created Time",
            name: "created_at",
            widget: CreatedTimeFieldWidget,
            config: { span: 3 },
          },
        ]}
        actions={[
          {
            text: "Add new",
            name: "addNewEvent",
            context: "free",
            execute: () => setVisible(true),
          },
          {
            text: "View",
            name: "viewDetail",
            execute: row => navigate(`/admin/events/${row.id}`),
          },
        ]}
        total={total}
        loading={loading}
      />
      <EventDialog
        managerId={managerId}
        visible={visible}
        onClose={closeDialog}
      />
      <ContestantListDialog
        dataSource={addedResult}
        visible={addedResultVisible}
        onClose={() => setAddedResultVisible(false)}
      />
    </Card>
  );
}

export default EventListView;
