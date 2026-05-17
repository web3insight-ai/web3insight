"use client";

import { Input, Pagination } from "@/components/ui";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { EventInsights as EventInsightsWidget } from "~/event/widgets/event-insights";
import type { EventInsight } from "~/event/typing";
import { SectionHeader, EmptyState } from "$/primitives";
import { Panel } from "$/blueprint";

interface EventsPageProps {
  eventInsights: EventInsight[];
}

export default function EventsPageClient({ eventInsights }: EventsPageProps) {
  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Filtering state
  const [filterValue, setFilterValue] = useState("");

  // Filter events based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...eventInsights];

    if (filterValue) {
      filtered = filtered.filter(
        (event) =>
          event.description &&
          event.description.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [eventInsights, filterValue]);

  // Sort filtered events by created date (descending - newest first)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
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
    <div className="w-full max-w-content mx-auto px-6 py-10">
      <div className="mb-10">
        <SectionHeader
          kicker="index · events"
          title="All events"
          deck="Web3 development events, hackathons, and community activities tracked across ecosystems."
        />
      </div>

      {/* Search */}
      <div className="mb-6 flex justify-end">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search events..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            startContent={<Search size={18} className="text-fg-subtle" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Events Panel */}
      {sortedItems.length > 0 ? (
        <Panel
          label={{ text: "events · index", position: "tl" }}
          code="01"
          className="overflow-hidden"
        >
          <EventInsightsWidget dataSource={paginatedItems} variant="public" />

          {pages > 1 && (
            <div className="px-6 py-4 border-t border-rule flex justify-center">
              <Pagination page={page} total={pages} onChange={setPage} />
            </div>
          )}
        </Panel>
      ) : (
        <Panel
          label={{ text: "events · index", position: "tl" }}
          code="01"
          className="p-10"
        >
          <EmptyState
            label="no events"
            title="No events found"
            hint={
              filterValue
                ? "Try adjusting your search terms."
                : "No events are currently available."
            }
          />
        </Panel>
      )}
    </div>
  );
}
