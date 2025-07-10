import type { CommunityContributorsProps } from "./typing";

function CommunityContributors({ className, data }: CommunityContributorsProps) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-surface-dark rounded-xl shadow-subtle border border-border dark:border-border-dark p-6 ${className || ''}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Top Contributors by OpenRank
      </h3>
      <div className="space-y-4">
        {Object.entries(data).slice(0, 1).map(([month, contributors]) => (
          <div key={month}>
            <div className="text-sm text-gray-500 dark:text-gray-500 mb-2">
              {new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(contributors as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([contributor, openrank], index) => (
                  <div key={contributor} className="flex items-center justify-between p-3 bg-surface dark:bg-surface-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                        ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    index === 1 ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                        'bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500'}`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {contributor}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {typeof openrank === 'number' ? openrank.toFixed(2) : '0.00'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityContributors;
