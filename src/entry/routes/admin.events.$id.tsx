import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Calendar } from "lucide-react";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import { fetchOne } from "~/event/repository";
import EventDetailViewWidget from "~/event/views/event-detail";

async function loader({ request, params }: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(request);

  if (!canManageEvents(res.data)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const eventId = Number(params.id!);

  // Fetch event data to get the description/name
  const eventRes = await fetchOne(request, eventId);

  if (!eventRes.success) {
    throw new Response(null, { status: 404, statusText: "Event Not Found" });
  }

  return json({
    eventId,
    eventName: eventRes.data.description || "Unknown Event"
  });
}

function AdminEventDetailPage() {
  const { eventId, eventName } = useLoaderData<typeof loader>();

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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{eventName} (#{eventId})</h1>
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

export { loader };
export default AdminEventDetailPage;
