import { Link } from "@remix-run/react";
import { Button, Card, CardHeader, CardFooter, Divider } from "@nextui-org/react";
import { Github, ArrowRight } from "lucide-react";

import type { RepositoryRankWidgetProps } from "./typing";

function RepositoryRankWidget({ dataSource }: RepositoryRankWidgetProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
      {/* Repository icon header */}
      <CardHeader className="px-8 py-5">
        <div className="flex items-center gap-2">
          <Github size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
        </div>
      </CardHeader>
      <Divider />

      {/* Repository header row */}
      <div className="px-8 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">#</div>
        <div className="col-span-5 text-xs font-medium text-gray-500 dark:text-gray-400">Repository</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Stars</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Forks</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Issues (open)</div>
      </div>

      {/* Repository rows */}
      <div>
        {dataSource.map((repo, index) => (
          <div
            key={index}
            className="px-8 py-4 grid grid-cols-12 gap-2 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
          >
            {/* Rank number */}
            <div className="col-span-1">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                text-xs font-medium`}>{index + 1}</span>
            </div>

            {/* Repository name */}
            <div className="col-span-5 flex items-center">
              <Link to={`/repository/${repo.repo_name}`} className="font-medium text-gray-900 dark:text-white hover:text-primary hover:underline">
                {repo.repo_name}
              </Link>
              {repo.growth && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${repo.isPositive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                  'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                  {repo.growth}
                </span>
              )}
            </div>

            {/* Stars */}
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              {repo.star_count.toLocaleString()}
            </div>

            {/* Forks */}
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              {repo.forks_count.toLocaleString()}
            </div>

            {/* Issues */}
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-end gap-1">
                <span>{repo.open_issues_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with right-aligned button */}
      <Divider />
      <CardFooter className="px-6 py-3">
        <Button
          as={Link}
          to="/repositories"
          color="primary"
          variant="light"
          size="sm"
          endContent={<ArrowRight size={14} />}
          className="ml-auto"
        >
          View all repositories
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RepositoryRankWidget;
