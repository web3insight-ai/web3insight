import { Link } from "@remix-run/react";

import type { EcosystemListViewWidgetProps } from "./typing";

function EcosystemListView({ dataSource }: EcosystemListViewWidgetProps) {
  return (
    <ul>
      {dataSource.map(eco => (
        <li key={eco.name.replaceAll(" ", "")}>
          <Link to={`/admin/ecosystems/${encodeURIComponent(eco.name)}`}>
            {eco.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default EcosystemListView;
