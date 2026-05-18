import { isToolUIPart } from "ai";
import type { ChatStatus } from "ai";
import { useCallback, useMemo, useState } from "react";

import { SPEC_DATA_PART_TYPE } from "@json-render/core";
import { Message, MessageContent } from "@/components/ai-elements/message";
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
  // Reason: Wired down to the toolbar so the read-only share view can hide
  // every mutating action while still allowing copy.
  readOnly?: boolean;
  status: ChatStatus;
}

type MessageMode = "edit" | "view";

export function CopilotMessageItem({
  hasBranchSelector,
  isLastMessage,
  message,
  readOnly = false,
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

      if (part.type === SPEC_DATA_PART_TYPE) {
        return true;
      }

      return isToolUIPart(part);
    });
  }, [message.parts]);
  // Reason: Show shimmer as soon as the message is submitted (before streaming starts)
  // so the user sees immediate feedback after sending a message.
  const shouldShowGeneratingShimmer =
    !isUserMessage &&
    isLastMessage &&
    (status === "streaming" || status === "submitted") &&
    !hasDisplayableParts;
  // Reason: Hide the toolbar while the assistant turn is still streaming so
  // the regenerate/feedback buttons do not flash before the message even
  // exists. Matches the euka behaviour.
  const isAssistantTurnInFlight =
    !isUserMessage &&
    isLastMessage &&
    (status === "streaming" || status === "submitted");

  const handleBeginEdit = useCallback(() => {
    if (!isReady || !isUserMessage || readOnly) {
      return;
    }

    setEditDraft(messageTextForCopy);
    setMode("edit");
  }, [isReady, isUserMessage, messageTextForCopy, readOnly]);

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

  // Reason: Override the base MessageContent's group-[.is-user]:bg-secondary (indigo)
  // with a neutral soft bubble matching the Blueprint tinted-neutral system.
  const userBubbleOverride =
    "group-[.is-user]:bg-bg-sunken group-[.is-user]:text-fg group-[.is-user]:rounded-[2px] group-[.is-user]:border group-[.is-user]:border-rule";

  // Reason: MessageContent hardcodes group-[.is-assistant]:text-foreground (#000000).
  // Use !important to override so our --fg semantic token wins.
  const assistantOverride = "w-full !text-fg";

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
          <MessageContent
            className={isUserMessage ? userBubbleOverride : assistantOverride}
          >
            {shouldShowGeneratingShimmer ? (
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">
                generating
                <span
                  aria-hidden
                  className="animate-cursor inline-block h-[0.9em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
                />
              </span>
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

      {!isEditing && !isAssistantTurnInFlight ? (
        <CopilotMessageToolbar
          canCopy={canCopy}
          copyText={messageTextForCopy}
          hasBranchSelector={hasBranchSelector}
          messageId={message.id}
          onEdit={isUserMessage ? handleBeginEdit : undefined}
          readOnly={readOnly}
          role={isUserMessage ? "user" : "assistant"}
          status={status}
        />
      ) : null}
    </div>
  );
}
