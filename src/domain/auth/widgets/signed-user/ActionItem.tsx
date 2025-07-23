import clsx from "clsx";
import { Link } from "@remix-run/react";

import type { ActionItemProps } from "./typing";

function ActionItem({
  text,
  icon: ActionIcon,
  action,
  renderType,
  danger = false,
}: ActionItemProps) {
  const actionClassName = clsx(
    "flex items-center px-4 py-2 text-sm transition-colors duration-200",
    {
      "w-full text-left": renderType === "button",
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20": danger,
      "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50": !danger,
    },
  );

  const actionContent = (
    <>
      <ActionIcon size={15} className={clsx("mr-2", { "text-gray-500 dark:text-gray-400": !danger })} />
      {text}
    </>
  );

  return renderType === "button" ? (
    <button className={actionClassName} onClick={action}>
      {actionContent}
    </button>
  ) : (
    <Link className={actionClassName} to={action}>
      {actionContent}
    </Link>
  );
}

export default ActionItem;
