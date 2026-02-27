"use client";

import type { UIMessage } from "ai";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactElement } from "react";
import {
  createContext,
  memo,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Streamdown } from "streamdown";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { streamdownStreamingAnimation } from "./streamdown-animation";
import { streamdownPlugins } from "./streamdown-plugins";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full max-w-[95%] flex-col gap-2",
        from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
        className,
      )}
      {...props}
    />
  );
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export function MessageContent({
  className,
  children,
  ...props
}: MessageContentProps) {
  return (
    <div
      className={cn(
        "is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-md",
        "group-[.is-user]:ml-auto group-[.is-user]:rounded-2xl group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
        "group-[.is-assistant]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type MessageActionsProps = ComponentProps<"div">;

export function MessageActions({ className, ...props }: MessageActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props} />
  );
}

export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

// Reason: The dashboard's Tooltip uses a single-component API with `content` prop,
// unlike shadcn's Tooltip/TooltipTrigger/TooltipContent pattern from euka.
export function MessageAction({
  tooltip,
  label,
  children,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: MessageActionProps) {
  const button = (
    <Button size={size} type="button" variant={variant} {...props}>
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return <Tooltip content={tooltip}>{button}</Tooltip>;
}

interface MessageBranchContextValue {
  branches: ReactElement[];
  currentBranch: number;
  goToNext: () => void;
  goToPrevious: () => void;
  setBranches: (branches: ReactElement[]) => void;
  totalBranches: number;
}

const MessageBranchContext = createContext<MessageBranchContextValue | null>(
  null,
);

function useMessageBranch() {
  const context = use(MessageBranchContext);
  if (!context) {
    throw new Error(
      "MessageBranch components must be used within MessageBranch",
    );
  }

  return context;
}

export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
};

export function MessageBranch({
  className,
  defaultBranch = 0,
  onBranchChange,
  ...props
}: MessageBranchProps) {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);
  const [branches, setBranches] = useState<ReactElement[]>([]);

  const handleBranchChange = useCallback(
    (nextBranch: number) => {
      setCurrentBranch(nextBranch);
      onBranchChange?.(nextBranch);
    },
    [onBranchChange],
  );

  const goToPrevious = useCallback(() => {
    if (branches.length === 0) {
      return;
    }

    const nextBranch =
      currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
    handleBranchChange(nextBranch);
  }, [branches.length, currentBranch, handleBranchChange]);

  const goToNext = useCallback(() => {
    if (branches.length === 0) {
      return;
    }

    const nextBranch =
      currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
    handleBranchChange(nextBranch);
  }, [branches.length, currentBranch, handleBranchChange]);

  const contextValue = useMemo<MessageBranchContextValue>(
    () => ({
      branches,
      currentBranch,
      goToNext,
      goToPrevious,
      setBranches,
      totalBranches: branches.length,
    }),
    [branches, currentBranch, goToNext, goToPrevious],
  );

  return (
    <MessageBranchContext value={contextValue}>
      <div
        className={cn("grid w-full gap-2 [&>div]:pb-0", className)}
        {...props}
      />
    </MessageBranchContext>
  );
}

export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>;

export function MessageBranchContent({
  children,
  ...props
}: MessageBranchContentProps) {
  const { branches, currentBranch, setBranches } = useMessageBranch();

  const childrenArray = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).filter(
        Boolean,
      ) as ReactElement[],
    [children],
  );

  useEffect(() => {
    if (branches.length !== childrenArray.length) {
      setBranches(childrenArray);
    }
  }, [branches.length, childrenArray, setBranches]);

  return childrenArray.map((branch, index) => (
    <div
      key={branch.key}
      className={cn(
        "grid gap-2 overflow-hidden [&>div]:pb-0",
        index === currentBranch ? "block" : "hidden",
      )}
      {...props}
    >
      {branch}
    </div>
  ));
}

export type MessageBranchSelectorProps = ComponentProps<"div">;

export function MessageBranchSelector({
  className,
  ...props
}: MessageBranchSelectorProps) {
  const { totalBranches } = useMessageBranch();

  if (totalBranches <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border bg-background p-0.5",
        className,
      )}
      {...props}
    />
  );
}

export type MessageBranchPreviousProps = ComponentProps<typeof Button>;

export function MessageBranchPrevious({
  children,
  ...props
}: MessageBranchPreviousProps) {
  const { goToPrevious, totalBranches } = useMessageBranch();

  return (
    <Button
      aria-label="Previous branch"
      disabled={totalBranches <= 1}
      onClick={goToPrevious}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronLeftIcon className="size-3.5" />}
    </Button>
  );
}

export type MessageBranchNextProps = ComponentProps<typeof Button>;

export function MessageBranchNext({
  children,
  ...props
}: MessageBranchNextProps) {
  const { goToNext, totalBranches } = useMessageBranch();

  return (
    <Button
      aria-label="Next branch"
      disabled={totalBranches <= 1}
      onClick={goToNext}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronRightIcon className="size-3.5" />}
    </Button>
  );
}

export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;

export function MessageBranchPage({
  className,
  ...props
}: MessageBranchPageProps) {
  const { currentBranch, totalBranches } = useMessageBranch();

  return (
    <span
      className={cn("px-2 text-xs text-muted-foreground", className)}
      {...props}
    >
      {currentBranch + 1} of {totalBranches}
    </span>
  );
}

export type MessageToolbarProps = ComponentProps<"div">;

export function MessageToolbar({ className, ...props }: MessageToolbarProps) {
  return (
    <div
      className={cn(
        "mt-1 flex w-full items-center justify-between gap-2",
        className,
      )}
      {...props}
    />
  );
}

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => {
    return (
      <Streamdown
        animated={streamdownStreamingAnimation}
        className={cn(
          "size-full break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className,
        )}
        plugins={streamdownPlugins}
        {...props}
      />
    );
  },
);
