import { Github } from "lucide-react";

import { resolveDataSource } from "../../helper";
import RepoTableWidget from "../../widgets/repo-table";

import type { RepositoryRankViewWidgetProps } from "./typing";

function RepositoryRankView({ className, dataSource }: RepositoryRankViewWidgetProps) {
  return (
    <RepoTableWidget
      className={className}
      dataSource={resolveDataSource(dataSource)}
      title="Top Repositories"
      icon={<Github size={18} className="text-primary" />}
    />
  );
}

export default RepositoryRankView;
