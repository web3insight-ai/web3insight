import { json, MetaFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import {
  Input, Pagination,
} from "@nextui-org/react";
import { Search, Calendar } from "lucide-react";
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

    if (!eventInsightsResult.success) {
      console.warn("Event insights fetch failed:", eventInsightsResult.message);
    }

    return json({
      eventInsights,
    });
  } catch (error) {
    console.error("Loader error in events route:", error);

    return json({
      eventInsights: [],
    });
  }
};

export default function AllEventsPage() {
  const { eventInsights } = useLoaderData<typeof loader>();
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
