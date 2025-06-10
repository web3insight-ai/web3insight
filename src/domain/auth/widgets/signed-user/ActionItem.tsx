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
    "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
    {
      "w-full text-left": renderType === "button",
      "text-red-600": danger,
    },
  );

  const actionContent = (
    <>
      <ActionIcon size={15} className={clsx("mr-2", { "text-gray-500": !danger })} />
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
