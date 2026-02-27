import { CopilotPageClient } from "../_components/page-client";

export default async function CopilotSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return <CopilotPageClient initialRemoteId={sessionId} />;
}
