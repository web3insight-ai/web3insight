"use client";

import type { LucideIcon } from "lucide-react";
import { BrainIcon, ChevronDownIcon, DotIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  memo,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type ChainOfThoughtStepStatus = "active" | "complete" | "pending";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null,
);

function useChainOfThought() {
  const context = use(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought",
    );
  }
  return context;
}

export type ChainOfThoughtProps = ComponentProps<typeof Collapsible> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// Reason: web3insight has no `@radix-ui/react-use-controllable-state`; mirror the
// hand-rolled controlled/uncontrolled pattern already used by reasoning.tsx.
export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : uncontrolledOpen;

    const setIsOpen = useCallback(
      (nextOpen: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      [isControlled, onOpenChange],
    );

    const contextValue = useMemo<ChainOfThoughtContextValue>(
      () => ({ isOpen }),
      [isOpen],
    );

    return (
      <ChainOfThoughtContext value={contextValue}>
        <Collapsible
          className={cn("not-prose w-full", className)}
          onOpenChange={setIsOpen}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ChainOfThoughtContext>
    );
  },
);
ChainOfThought.displayName = "ChainOfThought";

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  icon?: LucideIcon;
};

export const ChainOfThoughtHeader = memo(
  ({
    className,
    children,
    icon: Icon = BrainIcon,
    ...props
  }: ChainOfThoughtHeaderProps) => {
    const { isOpen } = useChainOfThought();

    return (
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-[2px] px-1 py-1 text-left text-fg-muted text-sm transition-colors hover:text-fg",
          className,
        )}
        {...props}
      >
        <Icon className="size-4 shrink-0" />
        <div className="min-w-0 flex-1">{children ?? "Chain of Thought"}</div>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </CollapsibleTrigger>
    );
  },
);
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";

const stepStatusStyles: Record<ChainOfThoughtStepStatus, string> = {
  active: "text-fg",
  complete: "text-fg-muted",
  pending: "text-fg-subtle/60",
};

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: ChainOfThoughtStepStatus;
  showConnector?: boolean;
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon = DotIcon,
    label,
    description,
    status = "complete",
    showConnector = true,
    children,
    ...props
  }: ChainOfThoughtStepProps) => (
    <div
      className={cn(
        "grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3 text-sm animate-step-in",
        stepStatusStyles[status],
        className,
      )}
      {...props}
    >
      <div className="relative flex h-6 w-5 shrink-0 items-center justify-center">
        <div className="flex h-6 w-5 items-center justify-center">
          <Icon className="size-4" />
        </div>
        {showConnector && (
          <div className="absolute top-6 bottom-[-0.75rem] left-1/2 -translate-x-1/2 border-rule border-l" />
        )}
      </div>
      <div className="min-w-0 space-y-1 overflow-hidden">
        <div>{label}</div>
        {description && (
          <div className="text-fg-subtle text-xs leading-5">{description}</div>
        )}
        {children}
      </div>
    </div>
  ),
);
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
>;

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => (
    <CollapsibleContent
      className={cn(
        "collapsible-animated mt-2 space-y-3 overflow-hidden text-fg outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </CollapsibleContent>
  ),
);
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
