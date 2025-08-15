import { Link } from "@remix-run/react";
import { Card } from "@nextui-org/react";
import { Warehouse, ArrowRight } from "lucide-react";
import { useState } from "react";
import { EcosystemType } from "~/ecosystem/typing";
import { EcosystemTypeFilter } from "@/components/ecosystem-type-filter";

import type { EcosystemRankViewWidgetProps } from "./typing";

function EcosystemRankView({ dataSource }: EcosystemRankViewWidgetProps) {
  const [selectedType, setSelectedType] = useState<EcosystemType>(EcosystemType.PUBLIC_CHAIN);

  // Filter ecosystems based on selected type
  const filteredData = dataSource.filter(ecosystem => {
    if (selectedType === EcosystemType.ALL) {
      return true;
    }
    
    // Map API kind values to EcosystemType enum
    const kindMapping: Record<string, EcosystemType> = {
      'Public Chain': EcosystemType.PUBLIC_CHAIN,
      'Infrastructure': EcosystemType.INFRASTRUCTURE,
      'Community': EcosystemType.COMMUNITY,
    };

    const ecosystemType = ecosystem.kind ? kindMapping[ecosystem.kind] : undefined;
    return ecosystemType === selectedType;
  });

  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Warehouse size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Ecosystems</h3>
        </div>
        <EcosystemTypeFilter 
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Ecosystem</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Devs</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Contributors</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">New</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Repos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {filteredData.slice(0, 10).map((ecosystem, index) => (
              <tr 
                key={index} 
                className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110
                      ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                index === 1 ? 'bg-gray-100 dark:bg-surface-elevated text-gray-700 dark:text-gray-400' :
                  index === 2 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                    'bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-500'}`}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    to={`/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`} 
                    className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                  >
                    {ecosystem.eco_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {Number(ecosystem.actors_core_total).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {Number(ecosystem.actors_total).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {Number(ecosystem.actors_new_total).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {Number(ecosystem.repos_total).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-border dark:border-border-dark">
        <Link 
          to="/ecosystems" 
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          View All Ecosystems
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}

export default EcosystemRankView;
