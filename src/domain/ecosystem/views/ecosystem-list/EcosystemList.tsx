import { Link } from "@remix-run/react";
import { Card, CardBody } from "@nextui-org/react";

import type { EcosystemListViewWidgetProps } from "./typing";

function EcosystemListView({ dataSource }: EcosystemListViewWidgetProps) {
  return dataSource.length > 0 ? (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {dataSource.map(eco => (
        <li key={eco.name.replaceAll(" ", "")}>
          <Link to={`/admin/ecosystems/${encodeURIComponent(eco.name)}`}>
            <Card>
              <CardBody className="min-h-40 items-center justify-center">
                {eco.name}
              </CardBody>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <div className="p-16 text-center rounded-2xl bg-slate-100">
      <p className="text-gray-500">No ecosystems available.</p>
    </div>
  );
}

export default EcosystemListView;
