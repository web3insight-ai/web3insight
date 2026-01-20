"use client";

import { useMemo, type FC, type ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";

interface AIAssistantProviderProps {
  children: ReactNode;
}

const AIAssistantProvider: FC<AIAssistantProviderProps> = ({ children }) => {
  const transport = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => new DefaultChatTransport({ api: "/api/ai/chat" }) as any,
    [],
  );

  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

export { AIAssistantProvider };
