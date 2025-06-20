import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import EventDetailViewWidget from "~/event/views/event-detail";

import Section from "../components/section";

function loader({ params }: LoaderFunctionArgs) {
  return json({ eventId: Number(params.id!) });
}

function AdminEventDetailPage() {
  const { eventId } = useLoaderData<typeof loader>();

  return (
    <Section title={`Event #${eventId}`}>
      <EventDetailViewWidget id={eventId} />
    </Section>
  );
}

export { loader };
export default AdminEventDetailPage;
