"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import clsx from "clsx";

interface SwitchProps {
  isSelected?: boolean;
  onValueChange?: (checked: boolean) => void;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

const sizeMap = {
  sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
  md: { track: "w-11 h-6", thumb: "w-4 h-4", translate: "translate-x-5" },
};

function Switch({
  isSelected,
  onValueChange,
  size = "md",
  className,
  ...props
}: SwitchProps) {
  const sizes = sizeMap[size];

  return (
    <BaseSwitch.Root
      checked={isSelected}
      onCheckedChange={onValueChange}
      className={clsx(
        "group relative inline-flex items-center rounded-full transition-colors duration-200 cursor-pointer",
        sizes.track,
        "data-[checked]:bg-primary bg-gray-300 dark:bg-gray-600",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={clsx(
          "block rounded-full bg-white shadow-sm transition-transform duration-200 ml-0.5",
          sizes.thumb,
          `group-data-[checked]:${sizes.translate}`,
        )}
      />
    </BaseSwitch.Root>
  );
}

export { Switch };
export type { SwitchProps };
