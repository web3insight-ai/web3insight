import clsx from "clsx";
import { Avatar } from "@nextui-org/react";
import { Github } from "lucide-react";

import type { ProfileCardWidgetProps } from "./typing";
import SocialLink from "./SocialLink";

function ProfileCard({ className, developer }: ProfileCardWidgetProps) {
  const nickname = developer.nickname || developer.username;

  return (
    <div className={clsx("border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-surface-dark", className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={developer.avatar}
          className="w-12 h-12"
          fallback={nickname}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{nickname}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Github size={12} />
            <SocialLink url={developer.social.github}>{developer.username}</SocialLink>
            <span>•</span>
            <span>{developer.statistics.repository} repos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
