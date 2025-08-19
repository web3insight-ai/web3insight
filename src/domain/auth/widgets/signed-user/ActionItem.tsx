import clsx from "clsx";
import Link from "next/link";
import { Lock } from "lucide-react";

import type { ActionItemProps } from "./typing";

function ActionItem({
  text,
  icon: ActionIcon,
  action,
  renderType,
  danger = false,
  disabled = false,
}: ActionItemProps) {
  const actionClassName = clsx(
    "flex items-center px-4 py-2 text-sm transition-colors duration-200",
    {
      "w-full text-left": renderType === "button",
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20": danger && !disabled,
      "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50": !danger && !disabled,
      "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60": disabled,
    },
  );

  const IconComponent = disabled ? Lock : ActionIcon;
  const actionContent = (
    <>
      <IconComponent size={15} className={clsx("mr-2", { "text-gray-500 dark:text-gray-400": !danger && !disabled })} />
      {text}
    </>
  );

  if (disabled) {
    return (
      <div className={actionClassName}>
        {actionContent}
      </div>
    );
  }

  return renderType === "button" ? (
    <button className={actionClassName} onClick={action}>
      {actionContent}
    </button>
  ) : (
    <Link className={actionClassName} href={action}>
      {actionContent}
    </Link>
  );
}

export default ActionItem;
