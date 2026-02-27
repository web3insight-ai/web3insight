import type { ChatStatus } from "ai";
import { useAtomValue } from "jotai";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import {
  MessageBranch,
  MessageBranchContent,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import { STARTER_PROMPT_CARDS } from "../../constants";
import { useCopilotActions } from "../../state/actions";
import { copilotSessionIdAtom } from "../../state/atoms";
import { copilotBranchMetaByMessageIdAtom } from "../../state/selectors";
import { CopilotMessageItem } from "./message-item";

interface CopilotMessageListProps {
  messages: CopilotUIMessage[];
  status: ChatStatus;
}

export function CopilotMessageList({
  messages,
  status,
}: CopilotMessageListProps) {
  const actions = useCopilotActions();
  const branchMetaByMessageId = useAtomValue(copilotBranchMetaByMessageIdAtom);
  const sessionId = useAtomValue(copilotSessionIdAtom);

  if (messages.length === 0 && sessionId === null) {
    return (
      <ConversationEmptyState className="mx-auto my-auto w-full max-w-3xl min-h-0 h-full gap-5 p-0 justify-center items-center">
        <div className="w-full pb-4 text-center">
          <div className="flex w-full flex-col justify-center px-8">
            <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
              Hello there!
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              How can I help you today?
            </p>
          </div>
        </div>

        <div className="grid w-full gap-2 pb-4 md:grid-cols-2">
          {STARTER_PROMPT_CARDS.map((prompt) => {
            const Icon = prompt.icon;

            return (
              <div
                key={prompt.action}
                className="[&:nth-child(n+3)]:hidden md:[&:nth-child(n+3)]:block"
              >
                <Button
                  variant="ghost"
                  className="h-auto w-full items-start justify-start gap-3 rounded-lg border border-border bg-white px-4 py-3 text-left text-sm shadow-subtle hover:bg-accent dark:border-border-dark dark:bg-surface-dark dark:text-foreground-dark dark:hover:bg-surface-elevated"
                  onClick={() => {
                    actions.sendStarterPrompt(prompt.action);
                  }}
                  aria-label={prompt.action}
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-medium">{prompt.title}</span>
                    <span className="text-muted-foreground">
                      {prompt.label}
                    </span>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </ConversationEmptyState>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  const lastMessageId = messages[messages.length - 1]?.id ?? null;

  return (
    <>
      {messages.map((message) => {
        const branchMeta = branchMetaByMessageId.get(message.id);
        const versions = branchMeta
          ? branchMeta.siblings.map((node) => node.message)
          : [message];

        return (
          <MessageBranch
            key={`${message.id}:${branchMeta?.currentIndex ?? 0}`}
            defaultBranch={branchMeta?.currentIndex ?? 0}
            onBranchChange={(nextIndex) => {
              if (!branchMeta || status !== "ready") {
                return;
              }

              if (nextIndex === branchMeta.currentIndex) {
                return;
              }

              actions.selectBranch(branchMeta, nextIndex);
            }}
          >
            <MessageBranchContent>
              {versions.map((version) => (
                <CopilotMessageItem
                  key={version.id}
                  hasBranchSelector={Boolean(branchMeta)}
                  isLastMessage={lastMessageId === version.id}
                  message={version}
                  status={status}
                />
              ))}
            </MessageBranchContent>
          </MessageBranch>
        );
      })}

      {status === "submitted" ? (
        <Shimmer className="w-fit" duration={3}>
          Thinking...
        </Shimmer>
      ) : null}
    </>
  );
}
