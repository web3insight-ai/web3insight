'use client';

import {
  Input, Pagination,
} from "@nextui-org/react";
import { Search, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import EventInsightsWidget from "~/event/widgets/event-insights";
import type { EventInsight } from "~/event/typing";

interface EventsPageProps {
  eventInsights: EventInsight[];
}

export default function EventsPageClient({
  eventInsights,
}: EventsPageProps) {
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
        (event.description && event.description.toLowerCase().includes(filterValue.toLowerCase()))
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
          <EventInsightsWidget dataSource={paginatedItems} />

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

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterValue ? 'Try adjusting your search terms' : 'No events are currently available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
