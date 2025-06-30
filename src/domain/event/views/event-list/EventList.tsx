import { useState, useEffect } from "react";
import clsx from "clsx";
import { Card } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";

import TableViewWidget from "@/components/widget/view/table";

import { fetchList } from "../../repository";

import type { EventDialogPayload, EventListViewWidgetProps } from "./typing";
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

  const [addedResult, setAddedResult] = useState<EventDialogPayload>({ eventId: 0, contestants: [] });
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

  const gotoDetail = (id: number) => navigate(`/admin/events/${id}`);

  const closeDialog = (payload?: EventDialogPayload) => {
    setVisible(false);

    if (payload) {
      setRefetchTimestamp(Date.now());
      setAddedResult(payload);
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
            execute: row => gotoDetail(row.id),
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
        dataSource={addedResult.contestants}
        visible={addedResultVisible}
        onGoto={() => gotoDetail(addedResult.eventId)}
        onClose={() => setAddedResultVisible(false)}
      />
    </Card>
  );
}

export default EventListView;
