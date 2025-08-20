import clsx from "clsx";

import type { ActionBarProps } from "./typing";
import { renderButton } from "./helper";

function ActionBar({ className, actions }: ActionBarProps) {
  return (
    <div className={clsx("flex items-center gap-2 px-8 py-4", className)}>
      {actions.map(action => renderButton(action))}
    </div>
  );
}

export default ActionBar;
