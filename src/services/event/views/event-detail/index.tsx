'use client';

import EventDetailView from "./EventDetail";

import type { EventDetailViewWidgetProps } from "./typing";

function EventDetailWrapper(props: EventDetailViewWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Traditional Loading Only - Waits for complete analysis */}
      <EventDetailView {...props} />
    </div>
  );
}

export default EventDetailWrapper;
