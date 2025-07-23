import { useState, useEffect } from "react";
import clsx from "clsx";
import { Card, Button, Input } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { Calendar, Plus, Users, Clock, Activity, Search, Eye } from "lucide-react";

import MetricCard from "@/components/control/metric-card";

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

function EventListView({ className, managerId }: EventListViewWidgetProps) {
  const [dataSource, setDataSource] = useState<EventData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refetchTimestamp, setRefetchTimestamp] = useState(initTimestamp);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter data based on search term
  const filteredData = dataSource.filter((event: EventData) =>
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate statistics
  const recentEventsCount = dataSource.filter((event: EventData) => {
    const eventDate = new Date(event.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return eventDate > weekAgo;
  }).length;

  const metrics = [
    {
      label: "Total Events",
      value: total.toLocaleString(),
      icon: <Calendar size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
    },
    {
      label: "Active Events",
      value: dataSource.length.toLocaleString(),
      icon: <Activity size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
    },
    {
      label: "Recent Events",
      value: recentEventsCount.toLocaleString(),
      icon: <Clock size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
    },
    {
      label: "Total Contestants",
      value: (dataSource.length).toLocaleString(), // Placeholder calculation
      icon: <Users size={20} className="text-secondary" />,
      iconBgClassName: "bg-secondary/10",
    },
  ];

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.label.replaceAll(" ", "")}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track all events</p>
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
            />
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onClick={() => setVisible(true)}
              className="flex-shrink-0"
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
              <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {searchTerm ? "No events match your search" : "No events found"}
              </p>
              {!searchTerm && (
                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<Plus size={16} />}
                  onClick={() => setVisible(true)}
                >
                  Create your first event
                </Button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {filteredData.map((event: EventData, index) => (
                    <tr
                      key={event.id}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                          index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                              index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" :
                                "bg-gradient-to-r from-primary to-blue-600",
                        )}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Event #{event.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                          {event.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
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
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </Card>

      {/* Dialogs */}
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
    </div>
  );
}

export default EventListView;
