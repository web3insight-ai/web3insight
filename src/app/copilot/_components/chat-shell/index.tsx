"use client";

import { AlertTriangleIcon } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopilotMessageList } from "./components/message/message-list";
import { CopilotSessionMenu } from "./components/thread/session-menu";
import { CopilotThreadActionsMenu } from "./components/thread/thread-actions-menu";
import { useCopilotChatController } from "./hooks/use-chat-controller";
import { useCopilotActions } from "./state/actions";

interface CopilotChatShellProps {
  initialRemoteId: string | null;
}

export function CopilotChatShell({ initialRemoteId }: CopilotChatShellProps) {
  const {
    archivedQueryState,
    archivedThreads,
    error,
    historyQueryState,
    historyThreads,
    messages,
    status,
  } = useCopilotChatController({
    initialRemoteId,
  });

  const actions = useCopilotActions();

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header bar with session menu and thread actions */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <CopilotSessionMenu
          archivedThreads={archivedThreads}
          historyQueryState={historyQueryState}
          historyThreads={historyThreads}
          messages={messages}
        />
        <CopilotThreadActionsMenu
          archivedQueryState={archivedQueryState}
          archivedThreads={archivedThreads}
        />
      </div>

      {/* Main chat area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {error ? (
          <div className="mx-auto w-full max-w-3xl px-4 pt-4">
            <Alert variant="destructive">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Copilot request failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <Conversation>
          <ConversationContent>
            <CopilotMessageList messages={messages} status={status} />
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto w-full max-w-3xl pb-4">
          <PromptInput
            status={status}
            onStop={actions.stopGeneration}
            onSubmit={async ({ text }) => {
              await actions.sendMessage(text);
            }}
          >
            <div className="rounded-2xl border border-input bg-background p-2">
              <PromptInputTextarea
                placeholder="Ask about Web3 developer activity..."
                className="border-0 bg-transparent"
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-muted-foreground text-xs">
                  AI can make mistakes. Verify critical decisions.
                </p>
                <PromptInputSubmit status={status} />
              </div>
            </div>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
