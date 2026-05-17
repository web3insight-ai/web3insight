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
      <div className="rounded-[2px] border border-rule bg-bg-raised overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GitFork size={18} className="text-accent" />
            <div>
              <p className="text-base font-semibold text-fg">
                Top Repositories
              </p>
              <p className="font-mono text-xs text-fg-muted tabular-nums">
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
            startContent={<Search size={14} className="text-fg-subtle" />}
            classNames={{
              base: "w-full sm:w-56",
              inputWrapper: "bg-bg-raised border border-rule",
            }}
          />
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-rule">
                  <th className="pb-3 pr-3 text-[10px] font-medium text-fg-subtle uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="pb-3 pr-3 text-[10px] font-medium text-fg-subtle uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="pb-3 pr-3 text-[10px] font-medium text-fg-subtle uppercase tracking-wider text-right w-20">
                    Devs
                  </th>
                  <th className="pb-3 text-[10px] font-medium text-fg-subtle uppercase tracking-wider w-32 hidden sm:table-cell">
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
                        className="border-b border-rule/40 hover:bg-bg-sunken transition-colors group"
                      >
                        <td className="py-2.5 pr-3">
                          <span
                            className={`font-mono text-[11px] tabular-nums ${globalIdx <= 3 ? "font-bold text-accent" : "text-fg-muted"}`}
                          >
                            {String(globalIdx).padStart(3, "0")}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <a
                            href={`https://github.com/${repo.repo_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-fg hover:text-accent transition-colors font-medium"
                          >
                            {repo.repo_name}
                            <ExternalLink
                              size={10}
                              className="opacity-0 group-hover:opacity-50 transition-opacity"
                            />
                          </a>
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-fg tabular-nums">
                            <Users size={10} className="text-fg-subtle" />
                            {Number(repo.developer_count).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <div className="w-full bg-bg-sunken rounded-[2px] h-1">
                            <motion.div
                              className="bg-accent/70 h-1 rounded-[2px]"
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
                  cursor: "bg-accent text-accent-fg",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
