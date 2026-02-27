import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import { CopilotPageClient } from "./_components/page-client";

export default async function CopilotPage() {
  const user = await getUser();

  return (
    <DefaultLayoutWrapper user={user} hideFooter>
      <CopilotPageClient initialRemoteId={null} />
    </DefaultLayoutWrapper>
  );
}
