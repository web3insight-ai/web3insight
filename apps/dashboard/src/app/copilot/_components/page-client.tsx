"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { CopilotChatShell } from "./chat-shell";

export function CopilotPageClient({
  initialMessage = "",
}: {
  initialMessage?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Reason: Strip the `?message=` deep-link param after capture so it does not
  // resurface on refresh or when the URL is shared/bookmarked.
  useEffect(() => {
    if (initialMessage) {
      router.replace(pathname);
    }
  }, [initialMessage, pathname, router]);

  return <CopilotChatShell defaultValue={initialMessage} />;
}
