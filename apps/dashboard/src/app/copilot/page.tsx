import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import { CopilotPageClient } from "./_components/page-client";

export default async function CopilotPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const initialMessage =
    typeof params.message === "string" ? params.message.trim() : "";

  return (
    <DefaultLayoutWrapper user={user} hideFooter>
      <CopilotPageClient initialMessage={initialMessage} />
    </DefaultLayoutWrapper>
  );
}
