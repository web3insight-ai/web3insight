"use client";

import type { ChatStatus } from "ai";
import { CornerDownLeftIcon, SquareIcon } from "lucide-react";
import type { ComponentProps, FormEvent, KeyboardEvent } from "react";
import { createContext, use, useCallback, useMemo, useState } from "react";

import {
  InputGroup,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PromptInputContextValue {
  text: string;
  setText: (value: string) => void;
  status: ChatStatus | "ready";
  onStop?: () => void;
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

function usePromptInputContext() {
  const context = use(PromptInputContext);
  if (!context) {
    throw new Error("PromptInput components must be used within PromptInput");
  }
  return context;
}

export interface PromptInputMessage {
  text: string;
}

export type PromptInputProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  defaultValue?: string;
  status?: ChatStatus | "ready";
  onStop?: () => void;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
};

export function PromptInput({
  className,
  defaultValue = "",
  status = "ready",
  onStop,
  onSubmit,
  children,
  ...props
}: PromptInputProps) {
  const [text, setText] = useState(defaultValue);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const submitResult = onSubmit({ text: trimmed }, event);
      setText("");

      void Promise.resolve(submitResult).catch(() => {
        setText(trimmed);
      });
    },
    [onSubmit, text],
  );

  const contextValue = useMemo<PromptInputContextValue>(
    () => ({
      onStop,
      setText,
      status,
      text,
    }),
    [onStop, status, text],
  );

  return (
    <PromptInputContext value={contextValue}>
      <form
        className={cn("w-full", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </PromptInputContext>
  );
}

export type PromptInputTextareaProps = Omit<
  ComponentProps<typeof InputGroupTextarea>,
  "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
};

export function PromptInputTextarea({
  className,
  value,
  onChange,
  onKeyDown,
  ...props
}: PromptInputTextareaProps) {
  const { text, setText } = usePromptInputContext();
  const resolvedValue = value ?? text;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.nativeEvent.isComposing
      ) {
        return;
      }

      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    },
    [onKeyDown],
  );

  return (
    <InputGroupTextarea
      className={cn("min-h-[72px] max-h-48 text-sm", className)}
      onChange={(event) => {
        const nextValue = event.currentTarget.value;
        if (onChange) {
          onChange(nextValue);
        } else {
          setText(nextValue);
        }
      }}
      onKeyDown={handleKeyDown}
      value={resolvedValue}
      {...props}
    />
  );
}

export type PromptInputSubmitProps = Omit<
  ComponentProps<typeof InputGroupButton>,
  "type"
> & {
  status?: ChatStatus | "ready";
};

export function PromptInputSubmit({
  className,
  status: statusProp,
  disabled,
  ...props
}: PromptInputSubmitProps) {
  const context = usePromptInputContext();
  const status = statusProp ?? context.status;
  const text = context.text.trim();
  const isStreaming = status === "streaming";
  const isSubmitted = status === "submitted";

  const computedDisabled =
    disabled ?? (isStreaming ? false : !text || isSubmitted);

  return (
    <InputGroup className="w-auto border-0 bg-transparent p-0 shadow-none">
      <InputGroupButton
        aria-label={isStreaming ? "Stop generating" : "Send message"}
        className={cn("size-8 rounded-full", className)}
        disabled={computedDisabled}
        onClick={() => {
          if (isStreaming) {
            context.onStop?.();
          }
        }}
        size="icon-sm"
        type={isStreaming ? "button" : "submit"}
        variant={isStreaming ? "outline" : "default"}
        {...props}
      >
        {isSubmitted ? (
          <Spinner className="size-4" />
        ) : isStreaming ? (
          <SquareIcon className="size-3.5 fill-current" />
        ) : (
          <CornerDownLeftIcon className="size-4" />
        )}
      </InputGroupButton>
    </InputGroup>
  );
}
