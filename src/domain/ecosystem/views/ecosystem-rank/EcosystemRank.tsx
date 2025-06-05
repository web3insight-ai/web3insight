import { Link } from "@remix-run/react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Warehouse } from "lucide-react";

import type { EcosystemRankViewWidgetProps } from "./typing";

function EcosystemRankView({ dataSource }: EcosystemRankViewWidgetProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
      <CardHeader className="px-6 py-5">
        <div className="flex items-center gap-2">
          <Warehouse size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Ecosystems</h3>
        </div>
      </CardHeader>
      <Divider />

      {/* Ecosystem header row */}
      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">#</div>
        <div className="col-span-7 text-xs font-medium text-gray-500 dark:text-gray-400">Ecosystem</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">Total Devs</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">Core Devs</div>
      </div>

      <CardBody className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {dataSource.map((ecosystem, index) => (
            <div key={index} className="px-6 py-4 grid grid-cols-12 gap-2 items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
              {/* Rank indicator */}
              <div className="col-span-1">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                  ${index === 0 ? 'bg-primary/10 text-primary' :
              index === 1 ? 'bg-secondary/10 text-secondary' :
                'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  text-xs font-medium`}>{index + 1}</span>
              </div>

              {/* Ecosystem name and growth */}
              <div className="col-span-7 flex items-center gap-2 ">
                <Link to={`/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`} className="font-medium text-gray-900 dark:text-gray-300 hover:text-primary hover:underline">
                  {ecosystem.eco_name}
                </Link>
              </div>

              {/* Total developer count */}
              <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">
                {Number(ecosystem.actors_total).toLocaleString()}
              </div>

              {/* Core developer count */}
              <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">
                {Number(ecosystem.actors_core_total).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default EcosystemRankView;
