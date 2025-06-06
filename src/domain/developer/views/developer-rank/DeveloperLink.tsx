import clsx from "clsx";

import type { DeveloperLinkProps } from "./typing";

function DeveloperLink({ className, developer: { actor_id, actor_login } }: DeveloperLinkProps) {
  return (
    <a
      className={clsx("text-gray-900 dark:text-gray-300 hover:text-primary hover:underline", className)}
      href={`/developers/${actor_id}`}
    >
      @{actor_login}
    </a>
  );
}

export default DeveloperLink;
