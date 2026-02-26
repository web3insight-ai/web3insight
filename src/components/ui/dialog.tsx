"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  placement?: "center" | "top";
  backdrop?: "opaque" | "blur" | "transparent";
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  placement = "center",
  backdrop = "opaque",
}: ModalProps) {
  return (
    <BaseDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={clsx(
            "fixed inset-0 z-50 transition-opacity duration-200",
            backdrop === "blur" && "bg-black/40 backdrop-blur-sm",
            backdrop === "opaque" && "bg-black/50",
            backdrop === "transparent" && "bg-transparent",
          )}
        />
        <BaseDialog.Popup
          className={clsx(
            "fixed z-50 w-[calc(100%-2rem)] rounded-xl bg-white dark:bg-surface-dark",
            "border border-border dark:border-border-dark shadow-2xl",
            "animate-scale-in",
            sizeClasses[size],
            placement === "center" &&
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            placement === "top" && "left-1/2 top-20 -translate-x-1/2",
          )}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx("flex flex-col", className)} {...props}>
      {children}
    </div>
  ),
);
ModalContent.displayName = "ModalContent";

function ModalHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-b border-border dark:border-border-dark",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <BaseDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
          {children}
        </BaseDialog.Title>
      ) : (
        children
      )}
    </div>
  );
}

function ModalBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function ModalFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-t border-border dark:border-border-dark flex justify-end gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter };
export type { ModalProps };
