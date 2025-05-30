import { Link } from "@remix-run/react";
import { Card, CardBody } from "@nextui-org/react";

import type { EcosystemListViewWidgetProps } from "./typing";

function EcosystemListView({ dataSource }: EcosystemListViewWidgetProps) {
  return (
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
  );
}

export default EcosystemListView;
