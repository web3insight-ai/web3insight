import type { ChatStatus } from "ai";
import { ArrowRightIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import {
  MessageBranch,
  MessageBranchContent,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
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
      <ConversationEmptyState className="mx-auto my-auto w-full max-w-xl min-h-0 h-full gap-8 p-0 justify-center items-center">
        <div className="w-full text-center">
          <p className="text-lg font-medium text-foreground dark:text-foreground-dark">
            What would you like to explore?
          </p>
        </div>

        <div className="flex w-full flex-wrap justify-center gap-2">
          {STARTER_PROMPT_CARDS.map((prompt) => (
            <button
              key={prompt.action}
              type="button"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3.5 py-2 text-[13px] text-gray-600 transition-all hover:bg-teal-50 hover:text-teal-700 dark:bg-white/[0.06] dark:text-gray-400 dark:hover:bg-teal-500/10 dark:hover:text-teal-400"
              onClick={() => {
                actions.sendStarterPrompt(prompt.action);
              }}
            >
              {prompt.label}
              <ArrowRightIcon className="size-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </button>
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
