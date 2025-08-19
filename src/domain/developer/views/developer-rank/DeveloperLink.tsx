'use client';

import clsx from "clsx";
import Link from "next/link";

import type { DeveloperLinkProps } from "./typing";

function DeveloperLink({ className, developer: { actor_id, actor_login } }: DeveloperLinkProps) {
  const href = actor_id ? `/developers/${actor_id}` : `/developers/${actor_login}`;
  
  return (
    <Link
      className={clsx("text-gray-900 dark:text-gray-300 hover:text-primary hover:underline", className)}
      href={href}
    >
      @{actor_login}
    </Link>
  );
}

export default DeveloperLink;
