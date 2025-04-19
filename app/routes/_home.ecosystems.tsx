import { json, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Divider, Input, Dropdown, DropdownTrigger,
  DropdownMenu, DropdownItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Pagination
} from "@nextui-org/react";
import { Filter, SortAsc, SortDesc, Search, ArrowUpRight, ArrowDownRight, Warehouse, Database, Code2, Users } from "lucide-react";
import { useState, useMemo } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "All Ecosystems | Web3 Insights" },
    { property: "og:title", content: "All Ecosystems | Web3 Insights" },
    { name: "description", content: "Comprehensive overview of all blockchain and Web3 ecosystems with analytics and insights" },
  ];
};

type EcosystemData = {
  id: string;
  name: string;
  repositories: number;
  developers: number;
  commits: number;
  growth: number;
  tvl: number;
  description: string;
};

export const loader = async () => {
  // Mock data - would be replaced with actual data fetch
  const ecosystems: EcosystemData[] = [
    {
      id: "ethereum",
      name: "Ethereum",
      repositories: 1250,
      developers: 4500,
      commits: 84200,
      growth: 12.5,
      tvl: 89.2,
      description: "Leading smart contract platform with the largest developer ecosystem"
    },
    {
      id: "solana",
      name: "Solana",
      repositories: 780,
      developers: 2800,
      commits: 41500,
      growth: 28.3,
      tvl: 19.8,
      description: "High-performance blockchain focused on speed and low transaction costs"
    },
    {
      id: "polkadot",
      name: "Polkadot",
      repositories: 620,
      developers: 1950,
      commits: 38700,
      growth: 8.7,
      tvl: 12.5,
      description: "Multi-chain network enabling cross-blockchain transfers of any data or asset types"
    },
    {
      id: "cosmos",
      name: "Cosmos",
      repositories: 580,
      developers: 1720,
      commits: 31200,
      growth: 15.4,
      tvl: 9.1,
      description: "Ecosystem of blockchains designed to scale and interoperate with each other"
    },
    {
      id: "avalanche",
      name: "Avalanche",
      repositories: 490,
      developers: 1450,
      commits: 27800,
      growth: 20.1,
      tvl: 15.3,
      description: "Platform for launching decentralized applications and enterprise blockchain deployments"
    },
    {
      id: "near",
      name: "NEAR Protocol",
      repositories: 310,
      developers: 980,
      commits: 19500,
      growth: 16.8,
      tvl: 5.7,
      description: "Blockchain designed for usability with sharding technology"
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      repositories: 280,
      developers: 750,
      commits: 15300,
      growth: 38.2,
      tvl: 8.4,
      description: "Layer 2 scaling solution for Ethereum that increases throughput and reduces costs"
    },
    {
      id: "optimism",
      name: "Optimism",
      repositories: 250,
      developers: 720,
      commits: 14100,
      growth: 35.9,
      tvl: 7.2,
      description: "Layer 2 scaling solution for Ethereum using optimistic rollups"
    },
    {
      id: "polygon",
      name: "Polygon",
      repositories: 410,
      developers: 1350,
      commits: 22800,
      growth: 14.2,
      tvl: 11.5,
      description: "Protocol and framework for building and connecting Ethereum-compatible blockchain networks"
    },
    {
      id: "aptos",
      name: "Aptos",
      repositories: 190,
      developers: 520,
      commits: 9800,
      growth: 42.5,
      tvl: 3.8,
      description: "Layer 1 blockchain built with Move programming language focusing on safety and usability"
    }
  ];

  return json({
    ecosystems,
    totalEcosystems: ecosystems.length,
    totalRepositories: ecosystems.reduce((acc, ecosystem) => acc + ecosystem.repositories, 0),
    totalDevelopers: ecosystems.reduce((acc, ecosystem) => acc + ecosystem.developers, 0),
    totalCommits: ecosystems.reduce((acc, ecosystem) => acc + ecosystem.commits, 0)
  });
};

export default function AllEcosystemsPage() {
  const { ecosystems, totalEcosystems, totalRepositories, totalDevelopers, totalCommits } = useLoaderData<typeof loader>();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filtering and sorting state
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "repositories",
    direction: "descending"
  });

  // Filter ecosystems based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...ecosystems];

    if (filterValue) {
      filtered = filtered.filter(ecosystem =>
        ecosystem.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        ecosystem.description.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [ecosystems, filterValue]);

  // Sort filtered ecosystems
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof EcosystemData];
      const second = b[sortDescriptor.column as keyof EcosystemData];

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
        : "ascending"
    }));
  };

  // Growth indicator component
  const GrowthIndicator = ({ value, isPositive = true }: { value: string, isPositive?: boolean }) => {
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Warehouse size={24} className="text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Ecosystems</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Compare metrics across all blockchain and Web3 ecosystems
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <Warehouse size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ecosystems</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalEcosystems.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <Database size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Repositories</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalRepositories.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                  <Users size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalDevelopers.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                  <Code2 size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Commits</p>
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
              placeholder="Search ecosystems..."
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
                <DropdownItem key="name" onClick={() => handleSortChange("name")}>
                  Ecosystem Name {sortDescriptor.column === "name" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="repositories" onClick={() => handleSortChange("repositories")}>
                  Repositories {sortDescriptor.column === "repositories" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="developers" onClick={() => handleSortChange("developers")}>
                  Developers {sortDescriptor.column === "developers" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="commits" onClick={() => handleSortChange("commits")}>
                  Commits {sortDescriptor.column === "commits" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="growth" onClick={() => handleSortChange("growth")}>
                  Growth {sortDescriptor.column === "growth" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="tvl" onClick={() => handleSortChange("tvl")}>
                  TVL {sortDescriptor.column === "tvl" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Ecosystems Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-6">
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Warehouse size={18} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ecosystem Analytics</h3>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-0 py-0">
            <Table
              aria-label="Ecosystems analytics table"
              bottomContent={
                <div className="flex justify-center">
                  <Pagination
                    page={page}
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>ECOSYSTEM</TableColumn>
                <TableColumn>REPOSITORIES</TableColumn>
                <TableColumn>DEVELOPERS</TableColumn>
                <TableColumn>COMMITS</TableColumn>
                <TableColumn>GROWTH</TableColumn>
                <TableColumn>TVL</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((ecosystem, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <TableRow key={ecosystem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                          ${absoluteIndex <= 3 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                          text-xs font-medium`}>{absoluteIndex}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/ecosystem/${ecosystem.id}`} className="font-medium text-primary hover:underline">
                            {ecosystem.name}
                          </Link>
                          <GrowthIndicator value={`${ecosystem.growth}%`} isPositive={ecosystem.growth > 0} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {ecosystem.description}
                        </p>
                      </TableCell>
                      <TableCell>{ecosystem.repositories.toLocaleString()}</TableCell>
                      <TableCell>{ecosystem.developers.toLocaleString()}</TableCell>
                      <TableCell>{ecosystem.commits.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {ecosystem.growth > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-rose-500 mr-1" />
                          )}
                          <span className={ecosystem.growth > 0 ? "text-emerald-500" : "text-rose-500"}>
                            {Math.abs(ecosystem.growth)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>${ecosystem.tvl}B</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}