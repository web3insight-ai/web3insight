import type { ChatStatus } from "ai";
import { useAtomValue } from "jotai";
import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageAction,
  MessageActions,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageToolbar,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { useCopilotActions } from "../../state/actions";
import { copilotSessionIdAtom } from "../../state/atoms";
import type { FeedbackType } from "../../types";
import { CopilotFeedbackDialog } from "./feedback-dialog";

type MessageRole = "assistant" | "user";

interface CopilotMessageToolbarProps {
  canCopy: boolean;
  copyText: string;
  hasBranchSelector: boolean;
  messageId: string;
  onEdit?: () => void;
  role: MessageRole;
  status: ChatStatus;
}

function BranchSelector({ status }: { status: ChatStatus }) {
  const isDisabled = status !== "ready";

  return (
    <MessageBranchSelector>
      <MessageBranchPrevious disabled={isDisabled} />
      <MessageBranchPage />
      <MessageBranchNext disabled={isDisabled} />
    </MessageBranchSelector>
  );
}

export function CopilotMessageToolbar({
  canCopy,
  copyText,
  hasBranchSelector,
  messageId,
  onEdit,
  role,
  status,
}: CopilotMessageToolbarProps) {
  const actions = useCopilotActions();
  const sessionId = useAtomValue(copilotSessionIdAtom);

  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyResetTimeoutRef = useRef<number | null>(null);

  const hasSession = Boolean(sessionId);
  const isReady = status === "ready";
  const canRegenerate = isReady && hasSession;
  const canSubmitFeedback = isReady && hasSession;

  const handleCopy = useCallback(() => {
    if (!canCopy) {
      return;
    }

    void navigator.clipboard
      .writeText(copyText)
      .then(() => {
        if (copyResetTimeoutRef.current !== null) {
          window.clearTimeout(copyResetTimeoutRef.current);
        }

        setIsCopied(true);
        copyResetTimeoutRef.current = window.setTimeout(() => {
          setIsCopied(false);
          copyResetTimeoutRef.current = null;
        }, 2000);
      })
      .catch(() => {
        setIsCopied(false);
      });
  }, [canCopy, copyText]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!canRegenerate) {
      return;
    }

    void actions.regenerateMessage(messageId);
  }, [actions, canRegenerate, messageId]);

  const submitFeedback = useCallback(
    async (type: FeedbackType, comment?: string) => {
      if (!canSubmitFeedback || isSubmittingFeedback) {
        return false;
      }

      const previousType = feedbackType;

      setIsSubmittingFeedback(true);
      setFeedbackType(type);
      try {
        const didSubmit = await actions.submitFeedback(
          messageId,
          type,
          comment,
        );
        if (!didSubmit) {
          setFeedbackType(previousType);
        }

        return didSubmit;
      } finally {
        setIsSubmittingFeedback(false);
      }
    },
    [actions, canSubmitFeedback, feedbackType, isSubmittingFeedback, messageId],
  );

  const handleThumbsUp = useCallback(() => {
    if (feedbackType) {
      return;
    }

    void submitFeedback("thumbs_up");
  }, [feedbackType, submitFeedback]);

  const handleThumbsDown = useCallback(() => {
    if (feedbackType || !canSubmitFeedback) {
      return;
    }

    setIsFeedbackDialogOpen(true);
  }, [canSubmitFeedback, feedbackType]);

  const handleFeedbackDialogClose = useCallback(() => {
    if (isSubmittingFeedback) {
      return;
    }

    setFeedbackComment("");
    setIsFeedbackDialogOpen(false);
  }, [isSubmittingFeedback]);

  const handleSubmitThumbsDownFeedback = useCallback(async () => {
    const trimmedComment = feedbackComment.trim();
    const didSubmit = await submitFeedback(
      "thumbs_down",
      trimmedComment.length > 0 ? trimmedComment : undefined,
    );

    if (!didSubmit) {
      return;
    }

    setFeedbackComment("");
    setIsFeedbackDialogOpen(false);
  }, [feedbackComment, submitFeedback]);

  const actionItems =
    role === "assistant" ? (
      <MessageActions>
        <MessageAction
          tooltip={isCopied ? "Copied!" : "Copy"}
          disabled={!canCopy}
          onClick={handleCopy}
        >
          {isCopied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </MessageAction>
        <MessageAction
          tooltip="Regenerate"
          disabled={!canRegenerate}
          onClick={handleRegenerate}
        >
          <RefreshCwIcon className="size-4" />
        </MessageAction>
        <MessageAction
          tooltip="Thumbs up"
          disabled={!canSubmitFeedback || Boolean(feedbackType)}
          className={cn(
            feedbackType === "thumbs_up" && "bg-muted text-foreground",
          )}
          onClick={handleThumbsUp}
        >
          <ThumbsUpIcon className="size-4" />
        </MessageAction>
        <MessageAction
          tooltip="Thumbs down"
          disabled={!canSubmitFeedback || Boolean(feedbackType)}
          className={cn(
            feedbackType === "thumbs_down" && "bg-muted text-foreground",
          )}
          onClick={handleThumbsDown}
        >
          <ThumbsDownIcon className="size-4" />
        </MessageAction>
      </MessageActions>
    ) : (
      <MessageActions>
        <MessageAction
          tooltip={isCopied ? "Copied!" : "Copy"}
          disabled={!canCopy}
          onClick={handleCopy}
        >
          {isCopied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </MessageAction>
        <MessageAction
          tooltip="Edit"
          disabled={!isReady || !onEdit}
          onClick={onEdit}
        >
          <PencilIcon className="size-4" />
        </MessageAction>
      </MessageActions>
    );

  return (
    <>
      <MessageToolbar>
        {role === "user" ? (
          <div className="flex w-full justify-end">
            {hasBranchSelector ? <BranchSelector status={status} /> : null}
            {actionItems}
          </div>
        ) : (
          <div className="flex w-full justify-start">
            {actionItems}
            {hasBranchSelector ? <BranchSelector status={status} /> : null}
          </div>
        )}
      </MessageToolbar>
      {role === "assistant" ? (
        <CopilotFeedbackDialog
          comment={feedbackComment}
          isOpen={isFeedbackDialogOpen}
          isSubmitting={isSubmittingFeedback}
          onClose={handleFeedbackDialogClose}
          onCommentChange={setFeedbackComment}
          onSubmit={() => {
            void handleSubmitThumbsDownFeedback();
          }}
        />
      ) : null}
    </>
  );
}
