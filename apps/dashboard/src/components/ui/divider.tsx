import clsx from "clsx";

interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

function Divider({ className, orientation = "horizontal" }: DividerProps) {
  return (
    <div
      className={clsx(
        "bg-border dark:bg-border-dark",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
      role="separator"
    />
  );
}

export { Divider };
export type { DividerProps };
