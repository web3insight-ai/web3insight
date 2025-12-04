'use client';

import { useState } from "react";
import clsx from "clsx";
import { Card, Button, Input, Pagination } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Search, Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchList } from "../../repository/client";
import { eventKeys } from "../../hooks";

import type { EventDialogPayload, EventListViewWidgetProps } from "./typing";
import CreatedTimeFieldWidget from "./CreatedTimeField";
import EventDialog from "./EventDialog";
import ContestantListDialog from "./ContestantListDialog";

interface EventData {
  id: number;
  description: string;
  created_at: string;
}

function EventListView({ className }: EventListViewWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  const [visible, setVisible] = useState(false);

  const [addedResult, setAddedResult] = useState<EventDialogPayload>({ eventId: 0, contestants: [], failedAccounts: [] });
  const [addedResultVisible, setAddedResultVisible] = useState(false);

  // Loading state for navigation
  const [navigatingEventId, setNavigatingEventId] = useState<number | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Use TanStack Query for data fetching
  const { data, isLoading: loading } = useQuery({
    queryKey: eventKeys.list({ pageNum: page, pageSize: rowsPerPage }),
    queryFn: async () => {
      const res = await fetchList({ pageNum: page, pageSize: rowsPerPage });
      return {
        data: res.data as EventData[],
        total: Number(res.extra?.total || 0),
      };
    },
  });

  const dataSource = data?.data || [];
  const total = data?.total || 0;

  const gotoDetail = async (id: number) => {
    setNavigatingEventId(id);

    // Set a timeout to clear loading state in case navigation gets stuck
    const timeoutId = setTimeout(() => {
      setNavigatingEventId(null);
    }, 5000); // 5 seconds timeout

    try {
      await router.push(`/admin/events/${id}`);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Navigation error:', error);
      clearTimeout(timeoutId);
      setNavigatingEventId(null);
    }
    // Note: navigatingEventId will be cleared when component unmounts during successful navigation
  };

  const closeDialog = (payload?: EventDialogPayload) => {
    setVisible(false);

    if (payload) {
      // Invalidate and refetch event list using TanStack Query
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
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
                          isLoading={navigatingEventId === event.id}
                          isDisabled={navigatingEventId !== null}
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
