import * as React from "react";
import { cn } from "@/lib/utils";

type Token =
  | { type: "keyword"; text: string }
  | { type: "string"; text: string }
  | { type: "comment"; text: string }
  | { type: "ident"; text: string }
  | { type: "punct"; text: string }
  | { type: "prompt"; text: string }
  | { type: "plain"; text: string };

type Line = Token[];

type TerminalPanelProps = {
  title?: string;
  lines: Line[];
  className?: string;
  showCursor?: boolean;
};

const tokenClass: Record<Token["type"], string> = {
  keyword: "font-semibold text-fg",
  string: "text-accent",
  comment: "text-fg-muted/70",
  ident: "text-fg/80",
  punct: "text-fg-muted",
  prompt: "text-accent",
  plain: "text-fg/80",
};

export function TerminalPanel({
  title = "web3insight",
  lines,
  className,
  showCursor = true,
}: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "relative border border-rule-strong rounded-[2px] bg-bg-raised overflow-hidden font-mono text-[13px]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-rule bg-bg/40 px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          {title}
        </span>
        <span className="text-[10px] tracking-widest text-fg-muted/70">
          &gt;_
        </span>
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-4 leading-6">
        {lines.map((line, li) => (
          <div key={li} className="whitespace-pre">
            {line.map((tok, ti) => (
              <span key={ti} className={tokenClass[tok.type]}>
                {tok.text}
              </span>
            ))}
            {showCursor && li === lines.length - 1 && (
              <span
                aria-hidden
                className="animate-cursor ml-0.5 inline-block h-[0.9em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
              />
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}

export type { Token, Line };
