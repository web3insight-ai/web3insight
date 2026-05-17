"use client";

import { useState } from "react";
import clsx from "clsx";
import { Card, Button, Input, Pagination } from "@/components/ui";
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

  const [addedResult, setAddedResult] = useState<EventDialogPayload>({
    eventId: 0,
    contestants: [],
    failedAccounts: [],
  });
  const [addedResultVisible, setAddedResultVisible] = useState(false);

  // Loading state for navigation
  const [navigatingEventId, setNavigatingEventId] = useState<number | null>(
    null,
  );

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
      console.error("Navigation error:", error);
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
      <Card className="bg-bg-raised border border-rule rounded-[2px] overflow-hidden">
        {/* Header with Search and Actions */}
        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-medium text-fg">Event Management</h3>
              <p className="font-mono text-xs text-fg-muted">
                manage and track all events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search events..."
              startContent={<Search size={16} className="text-fg-subtle" />}
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
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-sm text-fg-muted">
                Loading events...
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-fg-subtle" />
              <p className="text-sm text-fg-muted mb-2">
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
                  <tr className="border-t border-rule bg-bg-sunken">
                    <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                      #
                    </th>
                    <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                      Event
                    </th>
                    <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                      Created
                    </th>
                    <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filteredData.map((event: EventData, i: number) => (
                    <tr
                      key={event.id}
                      className="hover:bg-bg-sunken transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                          {String(i + 1).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-fg">
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
                          className="border-rule hover:bg-bg-sunken rounded-[2px]"
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
          <div className="px-6 py-4 border-t border-rule flex justify-center">
            <Pagination page={page} total={pages} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <EventDialog visible={visible} onClose={closeDialog} />
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
