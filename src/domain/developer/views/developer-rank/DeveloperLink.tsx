import clsx from "clsx";
import { Link } from "@remix-run/react";

import type { DeveloperLinkProps } from "./typing";

function DeveloperLink({ className, developer: { actor_id, actor_login } }: DeveloperLinkProps) {
  return (
    <Link
      className={clsx("text-gray-900 dark:text-gray-300 hover:text-primary hover:underline", className)}
      to={`/developers/${actor_id}`}
    >
      @{actor_login}
    </Link>
  );
}

export default DeveloperLink;
