"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressProps {
  value: string;
  chars?: number;
  copyable?: boolean;
  className?: string;
}

export function Address({
  value,
  chars = 4,
  copyable = true,
  className,
}: AddressProps) {
  const [copied, setCopied] = useState(false);

  const truncated =
    value.length > chars * 2 + 2
      ? `${value.slice(0, chars + 2)}…${value.slice(-chars)}`
      : value;

  async function copy(event: React.MouseEvent) {
    event.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.8125rem] text-fg-muted",
        className,
      )}
      title={value}
    >
      <span>{truncated}</span>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          className="opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          aria-label={copied ? "Copied" : "Copy address"}
        >
          {copied ? (
            <Check size={11} className="text-accent" />
          ) : (
            <Copy size={11} />
          )}
        </button>
      )}
    </span>
  );
}
