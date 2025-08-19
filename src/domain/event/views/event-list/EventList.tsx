import { useState, useEffect } from "react";
import clsx from "clsx";
import { Card, Button, Input, Pagination } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Search, Eye } from "lucide-react";

import { fetchList } from "../../repository";

import type { EventDialogPayload, EventListViewWidgetProps } from "./typing";
import CreatedTimeFieldWidget from "./CreatedTimeField";
import EventDialog from "./EventDialog";
import ContestantListDialog from "./ContestantListDialog";

interface EventData {
  id: number;
  description: string;
  created_at: string;
}

const initTimestamp = Date.now();

function EventListView({ className }: EventListViewWidgetProps) {
  const [dataSource, setDataSource] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetchTimestamp, setRefetchTimestamp] = useState(initTimestamp);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 25;

  const [visible, setVisible] = useState(false);

  const [addedResult, setAddedResult] = useState<EventDialogPayload>({ eventId: 0, contestants: [], failedAccounts: [] });
  const [addedResultVisible, setAddedResultVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetchList({ pageNum: page, pageSize: rowsPerPage })
      .then(res => {
        // API already returns data sorted globally in descending order (newest first)
        setDataSource(res.data);
        setTotal(Number(res.extra?.total || 0));
      })
      .finally(() => setLoading(false));
  }, [page, refetchTimestamp]);

  const gotoDetail = (id: number) => router.push(`/admin/events/${id}`);

  const closeDialog = (payload?: EventDialogPayload) => {
    setVisible(false);

    if (payload) {
      setRefetchTimestamp(Date.now());
      setAddedResult(payload);
      setAddedResultVisible(true);
    }
  };

  // Filter data based on search term
  const filteredData = dataSource.filter((event: EventData) =>
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate pagination based on API total
  const pages = Math.ceil(total / rowsPerPage);


  return (
    <div className={clsx("space-y-6", className)}>
      {/* Main Events Table */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        {/* Header with Search and Actions */}
        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage and track all events</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search events..."
              startContent={<Search size={16} className="text-gray-400" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-64"
              size="sm"
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10",
              }}
            />
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onClick={() => setVisible(true)}
              className="flex-shrink-0 text-sm"
              size="sm"
            >
              Add Event
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading events...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {searchTerm ? "No events match your search" : "No events found"}
              </p>
              {!searchTerm && (
                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<Plus size={16} />}
                  onClick={() => setVisible(true)}
                  size="sm"
                  className="text-sm"
                >
                  Create your first event
                </Button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {filteredData.map((event: EventData) => (
                    <tr
                      key={event.id}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-500">
                            {event.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <CreatedTimeFieldWidget value={event.created_at} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="bordered"
                          onClick={() => gotoDetail(event.id)}
                          className="border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark"
                          title="View Event Details"
                        >
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
            <Pagination
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <EventDialog
        visible={visible}
        onClose={closeDialog}
      />
      <ContestantListDialog
        dataSource={addedResult.contestants}
        eventId={addedResult.eventId}
        failedAccounts={addedResult.failedAccounts}
        visible={addedResultVisible}
        onGoto={() => gotoDetail(addedResult.eventId)}
        onClose={() => setAddedResultVisible(false)}
      />
    </div>
  );
}

export default EventListView;
