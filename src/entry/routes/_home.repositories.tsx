import { json, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Divider, Input, Dropdown, DropdownTrigger,
  DropdownMenu, DropdownItem, Button, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Pagination,
} from "@nextui-org/react";
import { Github, Filter, SortAsc, SortDesc, Search, ArrowUpRight, ArrowDownRight, GitBranch, GitPullRequest } from "lucide-react";
import { useState, useMemo } from "react";

import { getTitle } from "@/utils/app";

export const meta: MetaFunction = () => {
  const title = `All Repositories - ${getTitle()}`;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: "Comprehensive analytics for all Web3 repositories including developer activity, stars, forks and contributions.",
    },
  ];
};

const generateChartData = (points: number, isPositive: boolean = true, volatility: number = 5) => {
  const data = [];
  let value = Math.random() * 50 + 50;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * volatility;
    value = Math.max(0, value + change);
    data.push(value);
  }

  return data;
};

export const loader = async () => {
  // In a real app, you would fetch the actual data and handle pagination
  // For this example, we'll generate mock data

  // Generate mock repository data
  const repositories = [
    {
      name: "ethereum/go-ethereum",
      ecosystem: "Ethereum",
      stars: 42300,
      forks: 12690,
      prs: 7416,
      prGrowth: "+12",
      issues: 4635,
      openIssues: 927,
      lastActivityDays: 0,
      growth: "-3.4%",
      isPositive: false,
      chartData: generateChartData(20, false, 3),
    },
    {
      name: "solana-labs/solana",
      ecosystem: "Solana",
      stars: 28900,
      forks: 8670,
      prs: 6128,
      prGrowth: "+0",
      issues: 3830,
      openIssues: 766,
      lastActivityDays: 0,
      growth: "-9.6%",
      isPositive: false,
      chartData: generateChartData(20, false, 4),
    },
    {
      name: "paritytech/substrate",
      ecosystem: "Polkadot",
      stars: 23400,
      forks: 7020,
      prs: 5112,
      prGrowth: "+19",
      issues: 3195,
      openIssues: 639,
      lastActivityDays: 0,
      growth: "-7.7%",
      isPositive: false,
      chartData: generateChartData(20, false, 3),
    },
    {
      name: "near/nearcore",
      ecosystem: "Near",
      stars: 18600,
      forks: 5580,
      prs: 3948,
      prGrowth: "+25",
      issues: 2467,
      openIssues: 493,
      lastActivityDays: 0,
      growth: "-3.5%",
      isPositive: false,
      chartData: generateChartData(20, false, 2),
    },
    {
      name: "cosmos/cosmos-sdk",
      ecosystem: "Cosmos",
      stars: 15200,
      forks: 4560,
      prs: 3576,
      prGrowth: "+0",
      issues: 2235,
      openIssues: 447,
      lastActivityDays: 0,
      growth: "+11.3%",
      isPositive: true,
      chartData: generateChartData(20, true, 5),
    },
    {
      name: "starkware-libs/cairo",
      ecosystem: "Starknet",
      stars: 12780,
      forks: 3834,
      prs: 2864,
      prGrowth: "+34",
      issues: 1785,
      openIssues: 357,
      lastActivityDays: 0,
      growth: "+24.8%",
      isPositive: true,
      chartData: generateChartData(20, true, 8),
    },
    {
      name: "solana-labs/solana-program-library",
      ecosystem: "Solana",
      stars: 9500,
      forks: 2850,
      prs: 2135,
      prGrowth: "+7",
      issues: 1330,
      openIssues: 266,
      lastActivityDays: 0,
      growth: "+4.2%",
      isPositive: true,
      chartData: generateChartData(20, true, 4),
    },
    {
      name: "aptos-labs/aptos-core",
      ecosystem: "Aptos",
      stars: 8460,
      forks: 2538,
      prs: 1903,
      prGrowth: "+15",
      issues: 1186,
      openIssues: 237,
      lastActivityDays: 0,
      growth: "+21.5%",
      isPositive: true,
      chartData: generateChartData(20, true, 7),
    },
    {
      name: "ethereum/consensus-specs",
      ecosystem: "Ethereum",
      stars: 7840,
      forks: 2352,
      prs: 1764,
      prGrowth: "+3",
      issues: 1098,
      openIssues: 220,
      lastActivityDays: 0,
      growth: "-1.3%",
      isPositive: false,
      chartData: generateChartData(20, false, 2),
    },
    {
      name: "polkadot-js/api",
      ecosystem: "Polkadot",
      stars: 7320,
      forks: 2196,
      prs: 1648,
      prGrowth: "+5",
      issues: 1025,
      openIssues: 205,
      lastActivityDays: 0,
      growth: "+3.7%",
      isPositive: true,
      chartData: generateChartData(20, true, 3),
    },
    {
      name: "sui-foundation/sui",
      ecosystem: "Sui",
      stars: 6750,
      forks: 2025,
      prs: 1519,
      prGrowth: "+28",
      issues: 945,
      openIssues: 189,
      lastActivityDays: 0,
      growth: "+29.4%",
      isPositive: true,
      chartData: generateChartData(20, true, 8),
    },
    {
      name: "osmosis-labs/osmosis",
      ecosystem: "Cosmos",
      stars: 6230,
      forks: 1869,
      prs: 1402,
      prGrowth: "+9",
      issues: 872,
      openIssues: 174,
      lastActivityDays: 0,
      growth: "+5.8%",
      isPositive: true,
      chartData: generateChartData(20, true, 4),
    },
    {
      name: "ethereum/EIPs",
      ecosystem: "Ethereum",
      stars: 5950,
      forks: 1785,
      prs: 1339,
      prGrowth: "+2",
      issues: 833,
      openIssues: 167,
      lastActivityDays: 0,
      growth: "+1.2%",
      isPositive: true,
      chartData: generateChartData(20, true, 2),
    },
    {
      name: "uniswap/v3-core",
      ecosystem: "Ethereum",
      stars: 5480,
      forks: 1644,
      prs: 1233,
      prGrowth: "+0",
      issues: 767,
      openIssues: 153,
      lastActivityDays: 2,
      growth: "-2.1%",
      isPositive: false,
      chartData: generateChartData(20, false, 2),
    },
    {
      name: "arbitrum/nitro",
      ecosystem: "Arbitrum",
      stars: 5120,
      forks: 1536,
      prs: 1152,
      prGrowth: "+17",
      issues: 717,
      openIssues: 143,
      lastActivityDays: 0,
      growth: "+18.5%",
      isPositive: true,
      chartData: generateChartData(20, true, 7),
    },
    {
      name: "optimism/optimism",
      ecosystem: "Optimism",
      stars: 4890,
      forks: 1467,
      prs: 1100,
      prGrowth: "+13",
      issues: 685,
      openIssues: 137,
      lastActivityDays: 0,
      growth: "+15.2%",
      isPositive: true,
      chartData: generateChartData(20, true, 6),
    },
    {
      name: "ethereum/solidity",
      ecosystem: "Ethereum",
      stars: 4650,
      forks: 1395,
      prs: 1046,
      prGrowth: "+4",
      issues: 651,
      openIssues: 130,
      lastActivityDays: 0,
      growth: "+2.8%",
      isPositive: true,
      chartData: generateChartData(20, true, 3),
    },
    {
      name: "OpenZeppelin/openzeppelin-contracts",
      ecosystem: "Ethereum",
      stars: 4380,
      forks: 1314,
      prs: 986,
      prGrowth: "+1",
      issues: 613,
      openIssues: 123,
      lastActivityDays: 0,
      growth: "+0.7%",
      isPositive: true,
      chartData: generateChartData(20, true, 2),
    },
    {
      name: "ton-blockchain/ton",
      ecosystem: "TON",
      stars: 4150,
      forks: 1245,
      prs: 934,
      prGrowth: "+11",
      issues: 581,
      openIssues: 116,
      lastActivityDays: 0,
      growth: "+13.6%",
      isPositive: true,
      chartData: generateChartData(20, true, 6),
    },
    {
      name: "avalanchego/avalanchego",
      ecosystem: "Avalanche",
      stars: 3920,
      forks: 1176,
      prs: 882,
      prGrowth: "+6",
      issues: 549,
      openIssues: 110,
      lastActivityDays: 0,
      growth: "+8.2%",
      isPositive: true,
      chartData: generateChartData(20, true, 5),
    },
  ];

  return json({
    repositories,
    totalRepositories: repositories.length,
    totalStars: repositories.reduce((acc, repo) => acc + repo.stars, 0),
    totalForks: repositories.reduce((acc, repo) => acc + repo.forks, 0),
    totalPRs: repositories.reduce((acc, repo) => acc + repo.prs, 0),
  });
};

export default function AllRepositoriesPage() {
  const { repositories, totalRepositories, totalStars, totalForks, totalPRs } = useLoaderData<typeof loader>();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "stars",
    direction: "descending",
  });

  // Simple line chart component
  const MiniChart = ({ data, color = "primary", height = 40 }: { data: number[], color?: string, height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <div className="w-full h-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${range || 1}`} preserveAspectRatio="none">
          <path
            d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${i} ${max - d + min}`).join(" ")}
            fill="none"
            stroke={`var(--${color})`}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      </div>
    );
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

  // Filter repositories based on search query
  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.ecosystem.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [repositories, searchQuery]);

  // Sort filtered repositories
  const sortedRepositories = useMemo(() => {
    return [...filteredRepositories].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];

      if (typeof first === 'string' && typeof second === 'string') {
        return sortDescriptor.direction === "ascending"
          ? first.localeCompare(second)
          : second.localeCompare(first);
      }

      return sortDescriptor.direction === "ascending"
        ? (first as number) - (second as number)
        : (second as number) - (first as number);
    });
  }, [filteredRepositories, sortDescriptor]);

  // Calculate pagination
  const paginatedRepositories = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRepositories.slice(start, end);
  }, [sortedRepositories, page, rowsPerPage]);

  const pages = Math.ceil(sortedRepositories.length / rowsPerPage);

  // Handle sorting change
  const handleSortChange = (column: string) => {
    setSortDescriptor(prev => ({
      column,
      direction: prev.column === column && prev.direction === "ascending"
        ? "descending"
        : "ascending",
    }));
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Github size={24} className="text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Repositories</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Comprehensive analytics and insights across Web3 repositories.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <Github size={20} className="text-primary" />
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
                <div className="p-3 bg-yellow-500/10 rounded-xl flex-shrink-0">
                  <span className="text-yellow-500 text-lg">★</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Stars</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalStars.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl flex-shrink-0">
                  <GitBranch size={20} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Forks</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalForks.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <GitPullRequest size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pull Requests</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPRs.toLocaleString()}
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
              placeholder="Search repositories or ecosystems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  Repository Name {sortDescriptor.column === "name" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="ecosystem" onClick={() => handleSortChange("ecosystem")}>
                  Ecosystem {sortDescriptor.column === "ecosystem" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="stars" onClick={() => handleSortChange("stars")}>
                  Stars {sortDescriptor.column === "stars" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="forks" onClick={() => handleSortChange("forks")}>
                  Forks {sortDescriptor.column === "forks" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
                <DropdownItem key="prs" onClick={() => handleSortChange("prs")}>
                  Pull Requests {sortDescriptor.column === "prs" && (
                    sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                  )}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Repositories Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-6">
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Github size={18} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Repository Analytics</h3>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-0 py-0">
            <Table
              aria-label="Repositories analytics table"
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
                <TableColumn>REPOSITORY</TableColumn>
                <TableColumn>ECOSYSTEM</TableColumn>
                <TableColumn>STARS</TableColumn>
                <TableColumn>FORKS</TableColumn>
                <TableColumn>PULL REQUESTS</TableColumn>
                <TableColumn>ISSUES</TableColumn>
                <TableColumn>ACTIVITY</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedRepositories.map((repo, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <TableRow key={repo.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                          ${absoluteIndex <= 3 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                          text-xs font-medium`}>{absoluteIndex}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/repository/${repo.name}`} className="font-medium text-primary hover:underline">
                            {repo.name}
                          </Link>
                          <GrowthIndicator value={repo.growth} isPositive={repo.isPositive} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/ecosystem/${repo.ecosystem.toLowerCase()}`} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                          {repo.ecosystem}
                        </Link>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {repo.stars.toLocaleString()}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <GitBranch size={14} className="text-gray-400" />
                        {repo.forks.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{repo.prs.toLocaleString()}</span>
                          {repo.prGrowth !== "+0" && (
                            <span className={`text-xs ${repo.prGrowth.startsWith("+") ? "text-success" : "text-danger"}`}>
                              {repo.prGrowth}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{repo.issues.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">({repo.openIssues} open)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20 h-8">
                          <MiniChart data={repo.chartData} color={repo.isPositive ? "success" : "danger"} />
                        </div>
                      </TableCell>
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
