import { json, MetaFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import {
  Card, CardBody, Input, Pagination,
} from "@nextui-org/react";
import { Search, Calendar, Activity, Clock, Users } from "lucide-react";
import { useState, useMemo } from "react";

import type { ApiUser } from "~/auth/typing";
import { fetchPublicEventInsights } from "~/event/repository/public";

import EventInsightsWidget from "~/event/widgets/event-insights";

type HomeContext = {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
};

export const meta: MetaFunction = () => {
  return [
    { title: "All Events | Web3 Insights" },
    { property: "og:title", content: "All Events | Web3 Insights" },
    { name: "description", content: "Comprehensive overview of Web3 development events and hackathons with insights and analytics" },
  ];
};

export const loader = async () => {
  try {
    const eventInsightsResult = await fetchPublicEventInsights({
      take: 100, // Fetch more for the dedicated page
      intent: "hackathon",
    });

    const eventInsights = eventInsightsResult.success ? eventInsightsResult.data : [];
    const totalEvents = eventInsightsResult.extra?.total || eventInsights.length;

    // Calculate additional metrics
    const recentEventsCount = eventInsights.filter(event => {
      const eventDate = new Date(event.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate > weekAgo;
    }).length;

    if (!eventInsightsResult.success) {
      console.warn("Event insights fetch failed:", eventInsightsResult.message);
    }

    return json({
      eventInsights,
      totalEvents,
      recentEventsCount,
      activeEvents: eventInsights.length,
    });
  } catch (error) {
    console.error("Loader error in events route:", error);

    return json({
      eventInsights: [],
      totalEvents: 0,
      recentEventsCount: 0,
      activeEvents: 0,
    });
  }
};

export default function AllEventsPage() {
  const { eventInsights, totalEvents, recentEventsCount, activeEvents } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<HomeContext>();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Filtering state
  const [filterValue, setFilterValue] = useState("");

  // Filter events based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...eventInsights];

    if (filterValue) {
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [eventInsights, filterValue]);

  // Sort filtered events by created date (descending - newest first)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredItems]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Events</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Browse and explore Web3 development events, hackathons, and community activities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Total Events</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalEvents.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                  <Activity size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Active Events</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeEvents.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                  <Clock size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Recent Events</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentEventsCount.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <Users size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Hackathons</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {eventInsights.filter(e => e.description.toLowerCase().includes('hackathon')).length.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6 flex justify-end">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search events..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              startContent={<Search size={18} className="text-gray-400" />}
              className="w-full"
            />
          </div>
        </div>

        {/* Events Table */}
        <div>
          <EventInsightsWidget 
            dataSource={paginatedItems} 
            loading={false}
            user={user}
          />

          {pages > 1 && (
            <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
              <Pagination
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
