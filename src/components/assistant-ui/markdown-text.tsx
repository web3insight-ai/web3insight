"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { type FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import clsx from "clsx";

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={defaultComponents}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="mt-2.5 flex items-center justify-between rounded-t-[2px] border border-rule border-b-0 bg-bg-raised px-3 py-1.5 text-xs">
      <span className="font-mono text-fg-muted lowercase">{language}</span>
      <button
        type="button"
        onClick={onCopy}
        className="p-1 rounded-[2px] hover:bg-bg-sunken text-fg-muted transition-colors"
        aria-label="Copy code"
      >
        {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      </button>
    </div>
  );
};

const useCopyToClipboard = ({ copiedDuration = 3000 } = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

// Reason: memoizeMarkdownComponents prevents unnecessary re-renders during streaming
const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={clsx(
        "mb-2 scroll-m-20 font-semibold text-base text-fg first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={clsx(
        "mt-3 mb-1.5 scroll-m-20 font-semibold text-sm text-fg first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={clsx(
        "mt-2.5 mb-1 scroll-m-20 font-semibold text-sm text-fg first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={clsx(
        "mt-2 mb-1 scroll-m-20 font-medium text-sm text-fg first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={clsx(
        "my-2.5 text-sm text-fg leading-relaxed first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={clsx(
        "text-accent underline underline-offset-2 hover:opacity-80",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={clsx("font-semibold text-fg", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={clsx(
        "my-2.5 border-rule border-l-2 pl-3 text-fg-muted italic",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={clsx(
        "my-2 ml-4 list-disc text-sm text-fg marker:text-fg-muted [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={clsx(
        "my-2 ml-4 list-decimal text-sm text-fg marker:text-fg-muted [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={clsx("leading-relaxed", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={clsx("my-2 border-rule", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="my-2 overflow-x-auto">
      <table
        className={clsx(
          "w-full border-separate border-spacing-0 text-sm",
          className,
        )}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={clsx("", className)} {...props} />
  ),
  tbody: ({ className, ...props }) => (
    <tbody className={clsx("", className)} {...props} />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={clsx("m-0 border-b border-rule p-0 first:border-t", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={clsx(
        "bg-bg-sunken px-2.5 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={clsx(
        "border-b border-l border-rule px-2.5 py-1.5 text-left text-sm text-fg last:border-r",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={clsx(
        "overflow-x-auto rounded-t-none rounded-b-[2px] border border-rule border-t-0 bg-bg-raised p-3 text-xs leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={clsx(
          !isCodeBlock &&
            "rounded-[2px] border border-rule bg-bg-raised px-1.5 py-0.5 font-mono text-[0.85em] text-accent",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
});
