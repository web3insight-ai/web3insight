import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { CopilotPageClient } from "../_components/page-client";

export default async function CopilotSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [user, { sessionId }] = await Promise.all([getUser(), params]);

  return (
    <DefaultLayoutWrapper user={user} hideFooter>
      <CopilotPageClient initialRemoteId={sessionId} />
    </DefaultLayoutWrapper>
  );
}
