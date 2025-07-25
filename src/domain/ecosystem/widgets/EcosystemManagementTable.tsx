import { useState, useMemo } from "react";
import { Link } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Input, Pagination, Button,
} from "@nextui-org/react";
import { Search, Warehouse, Database, Users, Settings } from "lucide-react";

import { EcosystemType } from "../typing";
import type { EcosystemWithStats } from "../typing";
import { EcosystemTypeFilter } from "@/components/ecosystem-type-filter";

interface EcosystemManagementTableProps {
  ecosystems: EcosystemWithStats[];
}

function EcosystemManagementTable({ ecosystems }: EcosystemManagementTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;
  const [filterValue, setFilterValue] = useState("");
  const [selectedType, setSelectedType] = useState<EcosystemType>(EcosystemType.ALL);

  // Calculate totals
  const totalEcosystems = ecosystems.length;
  const totalRepositories = ecosystems.reduce((acc, eco) => acc + Number(eco.repos_total), 0);
  const totalDevelopers = ecosystems.reduce((acc, eco) => acc + Number(eco.actors_total), 0);
  const totalCoreDevelopers = ecosystems.reduce((acc, eco) => acc + Number(eco.actors_core_total), 0);

  // Filter ecosystems based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...ecosystems];

    if (filterValue) {
      filtered = filtered.filter(ecosystem =>
        ecosystem.eco_name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [ecosystems, filterValue]);

  // Sort filtered ecosystems by actors_total (descending)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return Number(b.actors_total) - Number(a.actors_total);
    });
  }, [filteredItems]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Warehouse size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Ecosystems</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEcosystems.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                <Database size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Repositories</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalRepositories.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                <Users size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Total Developers</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDevelopers.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                <Users size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Core Developers</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCoreDevelopers.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <EcosystemTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search ecosystems..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            startContent={<Search size={18} className="text-gray-400" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Ecosystems Table */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Warehouse size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ecosystem Analytics</h3>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Ecosystem</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Repos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Devs</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Core</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">New</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((ecosystem, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <tr
                      key={ecosystem.eco_name}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110
                            ${absoluteIndex === 1 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                      absoluteIndex === 2 ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400' :
                        absoluteIndex === 3 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                          'bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500'}`}>
                            {absoluteIndex}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                        >
                          {ecosystem.eco_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(ecosystem.repos_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(ecosystem.actors_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(ecosystem.actors_core_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(ecosystem.actors_new_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          as={Link}
                          to={`/admin/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`}
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary"
                        >
                          <Settings size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No ecosystems available.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
            <Pagination
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default EcosystemManagementTable;
