import type { RepositoryListViewWidgetProps } from "./typing";

function RepositoryListView({ dataSource }: RepositoryListViewWidgetProps ) {
  return (
    <ul>
      {dataSource.map(repo => (
        <li key={repo.id}>
          {repo.fullName}
          <p>{repo.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default RepositoryListView;
