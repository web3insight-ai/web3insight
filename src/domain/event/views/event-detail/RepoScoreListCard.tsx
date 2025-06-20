import clsx from "clsx";
import { Card, CardHeader, CardBody, Divider, Link, Chip } from "@nextui-org/react";

import type { RepoScoreListCardProps } from "./typing";

function RepoScoreListCard({ dataSource }: RepoScoreListCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
      <CardHeader className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score of Repos in Each Ecosystem</h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        {dataSource.map((eco, idx) => (
          <div className={clsx({ "mt-6 pt-6 border-t": idx !== 0 })} key={`${eco.name.replaceAll(" ", "")}-${idx}`}>
            <div className="font-semibold">{eco.name}</div>
            <div className="grid grid-cols-4 gap-9 mt-6">
              {eco.repos.map((repo, i) => (
                <div className="flex flex-col justify-between gap-2" key={`${repo.fullName}-${i}`}>
                  <div>
                    <Link className="text-sm" href={`https://github.com/${repo.fullName}`} isExternal>{repo.fullName}</Link>
                  </div>
                  <div>
                    <Chip size="sm">Score: {repo.score}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default RepoScoreListCard;
