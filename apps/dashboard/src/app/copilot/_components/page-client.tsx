"use client";

import { CopilotChatShell } from "./chat-shell";

interface CopilotPageClientProps {
  initialRemoteId?: string | null;
}

export function CopilotPageClient({
  initialRemoteId = null,
}: CopilotPageClientProps) {
  return <CopilotChatShell initialRemoteId={initialRemoteId} />;
}
