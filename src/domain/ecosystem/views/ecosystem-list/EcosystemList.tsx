import { Link } from "@remix-run/react";
import { Card, CardBody } from "@nextui-org/react";

import type { EcosystemListViewWidgetProps } from "./typing";

function EcosystemListView({ dataSource }: EcosystemListViewWidgetProps) {
  return dataSource.length > 0 ? (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {dataSource.map(eco => (
        <li key={eco.name.replaceAll(" ", "")}>
          <Link to={`/admin/ecosystems/${encodeURIComponent(eco.name)}`}>
            <Card className="hover:shadow-hover hover:scale-[1.02] transition-all duration-200 border border-border dark:border-border-dark">
              <CardBody className="min-h-40 items-center justify-center bg-surface dark:bg-surface-dark">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                  {eco.name}
                </span>
              </CardBody>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <div className="p-16 text-center rounded-2xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
      <p className="text-gray-500 dark:text-gray-400">No ecosystems available.</p>
    </div>
  );
}

export default EcosystemListView;
