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
            <p className="text-2xl font-semibold">Hello there!</p>
            <p className="text-2xl text-muted-foreground/65">
              How can I help you today?
            </p>
          </div>
        </div>

        <div className="grid w-full gap-2 pb-4 md:grid-cols-2">
          {STARTER_PROMPT_CARDS.map((prompt) => (
            <div
              key={prompt.action}
              className="[&:nth-child(n+3)]:hidden md:[&:nth-child(n+3)]:block"
            >
              <Button
                variant="ghost"
                className="h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-3xl border px-5 py-4 text-left text-sm md:flex-col"
                onClick={() => {
                  actions.sendStarterPrompt(prompt.action);
                }}
                aria-label={prompt.action}
              >
                <span className="font-medium">{prompt.title}</span>
                <span className="text-muted-foreground">{prompt.label}</span>
              </Button>
            </div>
          ))}
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
