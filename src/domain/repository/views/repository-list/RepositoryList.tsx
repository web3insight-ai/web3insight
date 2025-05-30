import RepoTableWidget from "../../widgets/repo-table";

import type { RepositoryListViewWidgetProps } from "./typing";

function RepositoryListView({ dataSource }: RepositoryListViewWidgetProps ) {
  return (
    <RepoTableWidget dataSource={dataSource} />
  );
}

export default RepositoryListView;
