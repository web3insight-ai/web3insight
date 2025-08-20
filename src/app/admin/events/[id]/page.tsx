import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Calendar } from "lucide-react";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import { fetchOne } from "~/event/repository";
import EventDetailViewWidget from "~/event/views/event-detail";

interface AdminEventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AdminEventDetailPageProps) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const url = `${protocol}://${host}/admin/events/${eventId}`;

    const request = new Request(url, {
      headers: Object.fromEntries(headersList.entries()),
    });

    // Fetch event data to get the description/name
    const eventRes = await fetchOne(request, eventId);
    const eventName = eventRes.success ? (eventRes.data.description || "Unknown Event") : "Event";

    return {
      title: `${eventName} (${eventId}) | Admin Panel`,
      description: `Event details and analytics for ${eventName}`,
    };
  } catch {
    return {
      title: 'Event Details | Admin Panel',
      description: 'Event details and analytics',
    };
  }
}

async function getEventDetailData(eventId: number) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin/events/${eventId}`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser(request);

  if (!canManageEvents(res.data)) {
    notFound();
  }

  // Fetch event data to get the description/name
  const eventRes = await fetchOne(request, eventId);

  if (!eventRes.success) {
    notFound();
  }

  return {
    eventId,
    eventName: eventRes.data.description || "Unknown Event",
  };
}

export default async function AdminEventDetailPage({ params }: AdminEventDetailPageProps) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);
  const { eventName } = await getEventDetailData(eventId);

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                {eventName}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Event Details & Analytics</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            Comprehensive analytics and insights for event participants and their contributions.
          </p>
        </div>

        {/* Event Detail Content */}
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <EventDetailViewWidget id={eventId} />
        </div>
      </div>
    </div>
  );
}
