import { json, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Input, Dropdown, DropdownTrigger,
  DropdownMenu, DropdownItem, Button, Pagination, Modal, ModalContent, ModalHeader, ModalBody,
} from "@nextui-org/react";
import { Filter, SortAsc, SortDesc, Search, Users, GitCommit, Code, Trophy } from "lucide-react";
import { useState, useMemo } from "react";
import { fetchStatisticsRank } from "~/statistics/repository";
import type { ActorRankRecord } from "~/api/typing";
import RepoLinkWidget from "~/repository/widgets/repo-link";

export const meta: MetaFunction = () => {
  return [
    { title: "All Developers | Web3 Insights" },
    { property: "og:title", content: "All Developers | Web3 Insights" },
    { name: "description", content: "Top contributors and developers across Web3 ecosystems with activity metrics and contributions" },
  ];
};

export const loader = async () => {
  try {
    const rankResult = await fetchStatisticsRank();
    
    const developers = rankResult.success ? rankResult.data.developer : [];
    
    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }

    // Calculate totals from the real data
    const totalCommits = developers.reduce((acc, dev) => acc + Number(dev.total_commit_count), 0);
    const coreDevelopers = developers.filter(dev => Number(dev.total_commit_count) > 100).length;
    const activeDevelopers = developers.filter(dev => Number(dev.total_commit_count) > 10).length;

    return json({
      developers,
      totalDevelopers: developers.length,
      totalCommits,
      coreDevelopers,
      activeDevelopers,
    });
  } catch (error) {
    console.error("Loader error in developers route:", error);
    
    return json({
      developers: [],
      totalDevelopers: 0,
      totalCommits: 0,
      coreDevelopers: 0,
      activeDevelopers: 0,
    });
  }
};

export default function AllDevelopersPage() {
  const { developers, totalDevelopers, totalCommits, coreDevelopers, activeDevelopers } = useLoaderData<typeof loader>();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Modal state for showing all repos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<ActorRankRecord | null>(null);

  // Filtering and sorting state
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "total_commit_count",
    direction: "descending",
  });

  // Filter developers based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...developers];

    if (filterValue) {
      filtered = filtered.filter(developer =>
        developer.actor_login.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [developers, filterValue]);

  // Sort filtered developers
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof ActorRankRecord];
      const second = b[sortDescriptor.column as keyof ActorRankRecord];

      if (first === undefined || second === undefined) return 0;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  // Handle sorting change
  const handleSortChange = (column: string) => {
    setSortDescriptor(prev => ({
      column,
      direction: prev.column === column && prev.direction === "ascending"
        ? "descending"
        : "ascending",
    }));
  };

  // Handle showing all repos
  const handleShowAllRepos = (developer: ActorRankRecord) => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">All Developers</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Top contributors and developers across Web3 ecosystems
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">Total Developers</p>
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
                  <Trophy size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">Core Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {coreDevelopers.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                  <Code size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">Active Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeDevelopers.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <GitCommit size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">Total Commits</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCommits.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search developers..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              startContent={<Search size={18} className="text-gray-400" />}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Filter size={18} />}
                >
                  Sort By
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Sort options">
                <DropdownItem key="actor_login" onClick={() => handleSortChange("actor_login")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Developer Name</span>
                    {sortDescriptor.column === "actor_login" && (
                      sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </DropdownItem>
                <DropdownItem key="total_commit_count" onClick={() => handleSortChange("total_commit_count")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Commits</span>
                    {sortDescriptor.column === "total_commit_count" && (
                      sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Developers Table */}
        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
          <CardHeader className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Developer Analytics</h3>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Developer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Commits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Top Repos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {paginatedItems.map((developer, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <tr 
                      key={developer.actor_id} 
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                          to={`/developers/${developer.actor_id}`} 
                          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                        >
                          @{developer.actor_login}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(developer.total_commit_count).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {developer.top_repos.slice(0, 3).map((repo) => (
                            <div
                              key={repo.repo_id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800"
                            >
                              <RepoLinkWidget
                                repo={repo.repo_name}
                                className="text-gray-700 dark:text-gray-300 hover:text-primary"
                              />
                              <span className="ml-1 text-gray-500 dark:text-gray-500">{repo.commit_count}</span>
                            </div>
                          ))}
                          {developer.top_repos.length > 3 && (
                            <button
                              onClick={() => handleShowAllRepos(developer)}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              +{developer.top_repos.length - 3} more
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Modal for showing all repositories */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">All Repositories</h3>
            {selectedDeveloper && (
              <p className="text-sm text-gray-500">@{selectedDeveloper.actor_login}</p>
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDeveloper?.top_repos.map((repo) => (
                <div
                  key={repo.repo_id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <RepoLinkWidget
                    repo={repo.repo_name}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary"
                  />
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
