import clsx from "clsx";

import { Card, CardBody, Avatar } from "@nextui-org/react";
import { Github } from "lucide-react";

import type { ProfileCardWidgetProps } from "./typing";
import SocialLink from "./SocialLink";

function ProfileCard({ className, developer }: ProfileCardWidgetProps) {
  const nickname = developer.nickname || developer.username;

  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none", className)}>
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex items-center justify-center">
            <Avatar
              src={developer.avatar}
              className="w-32 h-32 text-large"
              fallback={nickname}
            />
          </div>
          <div className="md:w-3/4">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{nickname}</h1>
            </div>
            {developer.description && <p className="text-gray-700 dark:text-gray-300 mb-4">{developer.description}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Github size={16} className="text-gray-500" />
                <SocialLink url={developer.social.github}>{developer.username}</SocialLink>
              </div>

              {developer.social.twitter && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <SocialLink url={`https://x.com/${developer.social.twitter}`}>@{developer.social.twitter}</SocialLink>
                </div>
              )}

              {developer.social.website && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <SocialLink url={developer.social.website} />
                </div>
              )}

              {developer.location && <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{developer.location}</span>
              </div>}
            </div>

            {/* <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Joined {developer.joinedDate}</span>
              <span>•</span>
              <span>{developer.stats.repositories} repositories</span>
              <span>•</span>
              <GrowthIndicator value={developer.stats.growth} isPositive={developer.stats.isPositive} />
            </div> */}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ProfileCard;
