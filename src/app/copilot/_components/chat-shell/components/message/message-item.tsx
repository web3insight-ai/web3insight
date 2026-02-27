import { isToolUIPart } from "ai";
import type { ChatStatus } from "ai";
import { useCallback, useMemo, useState } from "react";

import { Message, MessageContent } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { CopilotUIMessage } from "~/ai/copilot-types";

import { extractTextFromMessage } from "../../lib/message-utils";
import { useCopilotActions } from "../../state/actions";
import { CopilotMessageEditor } from "./message-editor";
import { CopilotMessageParts } from "./message-parts";
import { CopilotMessageToolbar } from "./message-toolbar";

interface CopilotMessageItemProps {
  hasBranchSelector: boolean;
  isLastMessage: boolean;
  message: CopilotUIMessage;
  status: ChatStatus;
}

type MessageMode = "edit" | "view";

export function CopilotMessageItem({
  hasBranchSelector,
  isLastMessage,
  message,
  status,
}: CopilotMessageItemProps) {
  const actions = useCopilotActions();

  const [mode, setMode] = useState<MessageMode>("view");
  const [editDraft, setEditDraft] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const messageTextForCopy = useMemo(
    () => extractTextFromMessage(message),
    [message],
  );
  const isUserMessage = message.role === "user";
  const isReady = status === "ready";
  const isEditing = mode === "edit" && isUserMessage;
  const canCopy = messageTextForCopy.length > 0;
  const hasDisplayableParts = useMemo(() => {
    const reasoningText = message.parts
      .filter((part) => part.type === "reasoning")
      .map((part) => part.text)
      .join("\n\n")
      .trim();
    if (reasoningText.length > 0) {
      return true;
    }

    return message.parts.some((part) => {
      if (part.type === "source-url") {
        return ((part as { url?: string }).url?.trim().length ?? 0) > 0;
      }

      if (part.type === "text") {
        return part.text.trim().length > 0;
      }

      return isToolUIPart(part);
    });
  }, [message.parts]);
  const shouldShowGeneratingShimmer =
    !isUserMessage &&
    isLastMessage &&
    status === "streaming" &&
    !hasDisplayableParts;

  const handleBeginEdit = useCallback(() => {
    if (!isReady || !isUserMessage) {
      return;
    }

    setEditDraft(messageTextForCopy);
    setMode("edit");
  }, [isReady, isUserMessage, messageTextForCopy]);

  const handleCancelEdit = useCallback(() => {
    setMode("view");
    setEditDraft("");
  }, []);

  const handleSubmitEdit = useCallback(async () => {
    if (!isReady || !isUserMessage || isSubmittingEdit) {
      return;
    }

    const trimmedDraft = editDraft.trim();
    if (!trimmedDraft) {
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const didSubmit = await actions.submitEditedMessage(
        message.id,
        trimmedDraft,
      );
      if (!didSubmit) {
        return;
      }

      setMode("view");
      setEditDraft("");
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [
    actions,
    editDraft,
    isReady,
    isSubmittingEdit,
    isUserMessage,
    message.id,
  ]);

  return (
    <div className="space-y-1">
      <Message from={message.role}>
        {isEditing ? (
          <CopilotMessageEditor
            draft={editDraft}
            isSubmitting={isSubmittingEdit}
            onCancel={handleCancelEdit}
            onDraftChange={setEditDraft}
            onSubmit={() => {
              void handleSubmitEdit();
            }}
            status={status}
          />
        ) : (
          <MessageContent className={!isUserMessage ? "w-full" : undefined}>
            {shouldShowGeneratingShimmer ? (
              <Shimmer className="w-fit" duration={1}>
                Generating...
              </Shimmer>
            ) : (
              <CopilotMessageParts
                message={message}
                isLastMessage={isLastMessage}
                isStreaming={status === "streaming"}
              />
            )}
          </MessageContent>
        )}
      </Message>

      {isEditing ? null : (
        <CopilotMessageToolbar
          canCopy={canCopy}
          copyText={messageTextForCopy}
          hasBranchSelector={hasBranchSelector}
          messageId={message.id}
          onEdit={isUserMessage ? handleBeginEdit : undefined}
          role={isUserMessage ? "user" : "assistant"}
          status={status}
        />
      )}
    </div>
  );
}
