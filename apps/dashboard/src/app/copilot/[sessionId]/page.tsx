import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { CopilotPageClient } from "../_components/page-client";

export default async function CopilotSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // Reason: We still resolve params so Next can render the segment, but the
  // active session is derived from usePathname inside useCopilotSessionLifecycle.
  const [user] = await Promise.all([getUser(), params]);

  return (
    <DefaultLayoutWrapper user={user} hideFooter>
      <CopilotPageClient />
    </DefaultLayoutWrapper>
  );
}
