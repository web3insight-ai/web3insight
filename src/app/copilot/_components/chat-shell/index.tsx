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
    <div
      className="-mb-16 flex min-h-0 flex-1 flex-col overflow-hidden text-foreground dark:text-foreground-dark"
      style={{ height: "calc(100dvh - 65px)" }}
    >
      {/* Reason: -mb-16 neutralizes <main>'s pb-16 so the page doesn't scroll
          and this container fills exactly the space below the navbar. */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2 dark:border-border-dark dark:bg-background-dark">
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

      {/* Chat area */}
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

        {/* Input — shrink-0 keeps it pinned at the bottom */}
        <div className="mx-auto w-full shrink-0 max-w-3xl px-4 pb-4">
          <PromptInput
            status={status}
            onStop={actions.stopGeneration}
            onSubmit={async ({ text }) => {
              await actions.sendMessage(text);
            }}
          >
            {/* Reason: Textarea hardcodes bg/ring/outline on the inner <textarea>.
                Use [&_textarea] + [&_textarea:focus] to strip all inner styling
                so only the outer border is visible, even on focus. */}
            <div className="overflow-hidden rounded-xl border border-border transition-colors focus-within:border-primary dark:border-border-dark dark:focus-within:border-primary [&_textarea]:!bg-transparent [&_textarea]:!ring-0 [&_textarea]:!shadow-none [&_textarea]:!outline-none [&_textarea]:!resize-none [&_textarea]:rounded-none [&_textarea:focus]:!ring-0 [&_textarea:focus]:!shadow-none [&_textarea:focus]:!outline-none">
              <PromptInputTextarea
                placeholder="Ask about Web3 developer activity..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs text-muted-foreground">
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
