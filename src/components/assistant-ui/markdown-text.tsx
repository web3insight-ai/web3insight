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
    <div className="mt-2.5 flex items-center justify-between rounded-t-lg border border-gray-200 dark:border-gray-700 border-b-0 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs">
      <span className="font-medium text-gray-500 dark:text-gray-400 lowercase">
        {language}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
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
        "mb-2 scroll-m-20 font-semibold text-base text-gray-900 dark:text-gray-100 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={clsx(
        "mt-3 mb-1.5 scroll-m-20 font-semibold text-sm text-gray-900 dark:text-gray-100 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={clsx(
        "mt-2.5 mb-1 scroll-m-20 font-semibold text-sm text-gray-900 dark:text-gray-100 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={clsx(
        "mt-2 mb-1 scroll-m-20 font-medium text-sm text-gray-900 dark:text-gray-100 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={clsx(
        "my-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={clsx(
        "text-primary underline underline-offset-2 hover:opacity-80",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong
      className={clsx(
        "font-semibold text-gray-900 dark:text-gray-100",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={clsx(
        "my-2.5 border-gray-300 dark:border-gray-600 border-l-2 pl-3 text-gray-500 dark:text-gray-400 italic",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={clsx(
        "my-2 ml-4 list-disc text-sm text-gray-700 dark:text-gray-300 marker:text-gray-400 [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={clsx(
        "my-2 ml-4 list-decimal text-sm text-gray-700 dark:text-gray-300 marker:text-gray-400 [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={clsx("leading-relaxed", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr
      className={clsx("my-2 border-gray-200 dark:border-gray-700", className)}
      {...props}
    />
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
      className={clsx(
        "m-0 border-b border-gray-200 dark:border-gray-700 p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={clsx(
        "bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 first:rounded-tl-lg last:rounded-tr-lg",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={clsx(
        "border-b border-l border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 last:border-r",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={clsx(
        "overflow-x-auto rounded-t-none rounded-b-lg border border-gray-200 dark:border-gray-700 border-t-0 bg-gray-50 dark:bg-gray-900 p-3 text-xs leading-relaxed",
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
            "rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-[0.85em] text-primary",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
});
