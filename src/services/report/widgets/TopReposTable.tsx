"use client";

import { useState, useMemo } from "react";
import { Input, Pagination } from "@/components/ui";
import { Search, GitFork, Users, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, createViewportAnimation } from "@/utils/animations";
import type { RepoParticipation } from "../typing";

interface TopReposTableProps {
  data: RepoParticipation[];
}

const PAGE_SIZE = 20;

export default function TopReposTable({ data }: TopReposTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((repo) => repo.repo_name.toLowerCase().includes(q));
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredData, page],
  );

  const maxDevCount = useMemo(
    () => data.reduce((max, r) => Math.max(max, Number(r.developer_count)), 0),
    [data],
  );

  return (
    <motion.div variants={fadeInUp} {...createViewportAnimation()}>
      <div className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10">
              <GitFork size={18} className="text-secondary" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                Top Repositories
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data.length} repos ranked by developer participation
              </p>
            </div>
          </div>
          <Input
            size="sm"
            placeholder="Search repos..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            startContent={<Search size={14} className="text-gray-400" />}
            classNames={{
              base: "w-full sm:w-56",
              inputWrapper:
                "bg-gray-50 dark:bg-gray-900 border border-border dark:border-border-dark",
            }}
          />
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="pb-3 pr-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="pb-3 pr-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="pb-3 pr-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right w-20">
                    Devs
                  </th>
                  <th className="pb-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32 hidden sm:table-cell">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedData.map((repo, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                    const barWidth =
                      maxDevCount > 0
                        ? (Number(repo.developer_count) / maxDevCount) * 100
                        : 0;

                    return (
                      <motion.tr
                        key={repo.repo_id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className="border-b border-border/30 dark:border-border-dark/30 hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors group"
                      >
                        <td className="py-2.5 pr-3">
                          <span
                            className={`text-xs tabular-nums ${globalIdx <= 3 ? "font-bold text-primary" : "text-gray-400 dark:text-gray-500"}`}
                          >
                            {globalIdx}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <a
                            href={`https://github.com/${repo.repo_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors font-medium"
                          >
                            {repo.repo_name}
                            <ExternalLink
                              size={10}
                              className="opacity-0 group-hover:opacity-50 transition-opacity"
                            />
                          </a>
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                            <Users
                              size={10}
                              className="text-gray-400 dark:text-gray-500"
                            />
                            {Number(repo.developer_count).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1">
                            <motion.div
                              className="bg-primary/60 h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{
                                delay: idx * 0.015 + 0.1,
                                duration: 0.5,
                              }}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                size="sm"
                showControls
                classNames={{
                  cursor: "bg-primary text-white",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
