import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperRankTableView from "./DeveloperRankTableView";
import DeveloperRankGridView from "./DeveloperRankGridView";

function DeveloperRankView({ dataSource, view }: DeveloperRankViewWidgetProps) {
  return view === "grid" ? (
    <DeveloperRankGridView dataSource={dataSource} />
  ) : (
    <DeveloperRankTableView dataSource={dataSource} />
  );
}

export default DeveloperRankView;
