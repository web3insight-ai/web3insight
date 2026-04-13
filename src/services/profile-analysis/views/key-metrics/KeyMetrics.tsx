import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import type { GitHubUser } from "../../typing";
import {
  formatNumber,
  calculateEcosystemRankings,
  hasEcosystemData,
} from "../../helper";
import {
  SectionHeader,
  NumericCell,
  SmallCapsLabel,
  MetaList,
} from "$/primitives";
import { sequentialTeal, getRechartsDefaults } from "@/lib/charts";

interface KeyMetricsProps {
  user: GitHubUser;
  className?: string;
}

export function KeyMetrics({ user, className = "" }: KeyMetricsProps) {
  if (!hasEcosystemData(user)) {
    return (
      <div className={`border-t border-rule pt-8 ${className}`}>
        <SmallCapsLabel tone="subtle">Ecosystem brief</SmallCapsLabel>
        <p className="mt-2 text-sm text-fg-muted">
          Loading ecosystem signal — this step usually lands first.
        </p>
      </div>
    );
  }

  const rankings = calculateEcosystemRankings(user.ecosystem_scores!);
  if (!rankings) return null;

  const top = rankings.slice(0, 5);
  const palette = [...sequentialTeal].reverse();

  const pieData = top.map((eco, index) => ({
    name: eco.ecosystem,
    value: eco.score,
    percentage: eco.percentage,
    color: palette[index] ?? palette[palette.length - 1],
  }));

  const totalScore = rankings.reduce((sum, eco) => sum + eco.score, 0);
  const defaults = getRechartsDefaults();

  return (
    <section className={`border-t border-rule pt-8 ${className}`}>
      <SectionHeader
        kicker="Ecosystem brief"
        title="Where this developer shows up"
        deck={
          <>
            A score-weighted breakdown of every tracked Web3 ecosystem this
            account contributed to. Ranked by cumulative activity, not repo
            count.
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-display text-[clamp(2.5rem,5vw,3.25rem)] leading-[0.95] font-semibold tabular-nums text-fg">
              {formatNumber(totalScore)}
            </span>
            <SmallCapsLabel tone="subtle">total activity score</SmallCapsLabel>
          </div>
          <MetaList
            className="mb-6"
            items={[
              { label: "Ecosystems", value: rankings.length },
              { label: "Primary", value: top[0]?.ecosystem ?? "—" },
              { label: "Method", value: "opendigger" },
            ]}
          />

          <div className="h-72 border-t border-rule pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={104}
                  paddingAngle={1}
                  stroke="none"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "Score"]}
                  contentStyle={defaults.tooltipStyle}
                  labelStyle={defaults.tooltipLabelStyle}
                  itemStyle={defaults.tooltipItemStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <SmallCapsLabel tone="subtle" className="mb-3">
            Primary ecosystems
          </SmallCapsLabel>
          <ol className="flex flex-col">
            {pieData.map((item, index) => (
              <li
                key={item.name}
                className="flex items-baseline gap-3 border-t border-rule py-3 first:border-t-0 first:pt-0"
              >
                <span className="w-5 text-[0.75rem] font-mono text-fg-subtle tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="size-2 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-[0.9375rem] text-fg truncate">
                  {item.name}
                </span>
                <div className="flex items-baseline gap-2 shrink-0">
                  <NumericCell
                    value={item.value}
                    format="compact"
                    className="text-[0.9375rem]"
                  />
                  <span className="font-mono text-[0.75rem] text-fg-subtle tabular-nums w-10 text-right">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </li>
            ))}
          </ol>
          {rankings.length > 5 && (
            <p className="mt-4 text-[0.75rem] text-fg-subtle">
              + {rankings.length - 5} more ecosystems with material activity.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
