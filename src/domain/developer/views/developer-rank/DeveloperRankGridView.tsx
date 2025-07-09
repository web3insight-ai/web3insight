import { Card, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { Crown, ArrowRight } from "lucide-react";
import { Link } from "@remix-run/react";
import { useState } from "react";

import RepoLinkWidget from "../../../repository/widgets/repo-link";

import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperLink from "./DeveloperLink";
import type { ActorRankRecord } from "~/api/typing";

function DeveloperRankGridView({ dataSource }: Pick<DeveloperRankViewWidgetProps, "dataSource">) {
  const displayedData = dataSource.slice(0, 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<ActorRankRecord | null>(null);

  const handleShowAllRepos = (developer: ActorRankRecord) => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  };
  
  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5">
          {displayedData.map((dev, index) => (
            <div key={index} className={`relative p-5 ${index === 0 ? 'border-t-4 border-primary' : index === 1 ? 'border-t-4 border-secondary' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <DeveloperLink className="font-semibold" developer={dev} />
                    {index === 0 && <Crown size={14} className="text-primary fill-primary" />}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dev.total_commit_count.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">score</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Projects</p>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  {dev.top_repos.slice(0, 2).map(proj => (
                    <li key={`${dev.actor_id}-${proj.repo_id}`} className="truncate" title={proj.repo_name}>
                      <RepoLinkWidget repo={proj.repo_name} />
                    </li>
                  ))}
                </ul>
                {dev.top_repos.length > 2 && (
                  <button
                    onClick={() => handleShowAllRepos(dev)}
                    className="mt-1 text-xs text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    +{dev.top_repos.length - 2} more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-border-dark">
          <Link 
            to="/developers" 
            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            View All Developers
            <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {/* Modal for showing all repositories */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">All Repositories</h3>
            {selectedDeveloper && (
              <p className="text-sm text-gray-500">@{selectedDeveloper.actor_login}</p>
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDeveloper?.top_repos.map((repo) => (
                <div
                  key={repo.repo_id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <RepoLinkWidget
                    repo={repo.repo_name}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary"
                  />
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DeveloperRankGridView;
