import type { ManagerListViewWidgetProps } from "./typing";

function ManagerListView({ dataSource }: ManagerListViewWidgetProps) {
  return (
    <div>
      <p>{dataSource.length}</p>
    </div>
  );
}

export default ManagerListView;
