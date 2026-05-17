import type { EcosystemScore } from "../../typing";
import { calculateActivityTimeline, formatNumber } from "../../helper";
import { SmallCapsLabel } from "$/primitives";

interface ActivityAnalyticsProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

type ActivityLevel = "Very High" | "High" | "Medium" | "Low" | "Minimal";

function getActivityLevel(score: number, maxScore: number): ActivityLevel {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (percentage >= 80) return "Very High";
  if (percentage >= 60) return "High";
  if (percentage >= 40) return "Medium";
  if (percentage >= 20) return "Low";
  return "Minimal";
}

interface OverviewStat {
  label: string;
  value: string;
}

function OverviewColumn({ label, value }: OverviewStat) {
  return (
    <div className="flex flex-col gap-1">
      <SmallCapsLabel tone="subtle">{label}</SmallCapsLabel>
      <span className="font-display text-[1.25rem] leading-[1] font-semibold tabular-nums text-fg">
        {value}
      </span>
    </div>
  );
}

interface JourneyRowProps {
  label: string;
  value: React.ReactNode;
}

function JourneyRow({ label, value }: JourneyRowProps) {
  return (
    <>
      <dt className="py-3">
        <SmallCapsLabel tone="subtle">{label}</SmallCapsLabel>
      </dt>
      <dd className="py-3 font-sans text-sm text-fg text-right tabular-nums">
        {value}
      </dd>
    </>
  );
}

interface PatternRowProps {
  label: string;
  hint: string;
  value: string;
}

function PatternRow({ label, hint, value }: PatternRowProps) {
  return (
    <>
      <div className="py-3.5 flex flex-col gap-1">
        <span className="font-sans text-sm text-fg">{label}</span>
        <span className="font-sans text-[0.8125rem] leading-[1.4] text-fg-muted">
          {hint}
        </span>
      </div>
      <div className="py-3.5 self-center text-right">
        <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">
          {value}
        </span>
      </div>
    </>
  );
}

export function ActivityAnalytics({
  ecosystemScores,
  className = "",
}: ActivityAnalyticsProps) {
  const timelineData = calculateActivityTimeline(ecosystemScores);
  if (!timelineData) return null;

  const {
    firstActivity,
    lastActivity,
    totalDaysActive,
    timelineData: yearlyData,
    totalEcosystems,
  } = timelineData;

  const yearsActive = yearlyData.length;
  const mostActiveYear = yearlyData.reduce(
    (max, year) => (year.totalScore > max.totalScore ? year : max),
    yearlyData[0],
  );
  const recentActivity =
    new Date(lastActivity) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const maxYearScore = Math.max(...yearlyData.map((y) => y.totalScore));
  const currentYear = new Date().getFullYear();

  const consistencyLabel =
    yearsActive > 3 ? "High" : yearsActive > 1 ? "Medium" : "Building";
  const growthLabel =
    totalEcosystems > 10
      ? "Diverse"
      : totalEcosystems > 5
        ? "Expanding"
        : "Focused";
  const impactLabel =
    mostActiveYear.totalScore > 2000
      ? "High Impact"
      : mostActiveYear.totalScore > 1000
        ? "Solid Contributor"
        : "Steady Builder";

  const overviewStats: OverviewStat[] = [
    {
      label: "Years Active",
      value: Math.max(1, Math.round(totalDaysActive / 365)).toString(),
    },
    { label: "Contributing Years", value: yearsActive.toString() },
    { label: "Ecosystems", value: totalEcosystems.toString() },
    { label: "Peak Year", value: mostActiveYear.year.toString() },
    {
      label: "Current Status",
      value: recentActivity ? "Active" : "Dormant",
    },
  ];

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      className={`flex flex-col gap-12 border-t border-rule pt-8 ${className}`}
    >
      {/* Overview — editorial stat columns */}
      <div>
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <SmallCapsLabel>Activity Timeline Analysis</SmallCapsLabel>
          <span className="font-mono text-[0.75rem] text-fg-subtle tabular-nums">
            {yearsActive} / {Math.max(1, Math.round(totalDaysActive / 365))} yrs
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-6 border-t border-rule pt-5">
          {overviewStats.map((s) => (
            <OverviewColumn key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>

      {/* Yearly breakdown — hairline-delimited rows, 2px accent bar */}
      <div>
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <SmallCapsLabel>Yearly Activity Breakdown</SmallCapsLabel>
          <span className="font-mono text-[0.75rem] text-fg-subtle tabular-nums">
            {yearlyData.length} {yearlyData.length === 1 ? "year" : "years"}
          </span>
        </div>
        <ul className="flex flex-col border-t border-b border-rule divide-y divide-rule">
          {yearlyData.map((year) => {
            const scorePercentage =
              maxYearScore > 0 ? (year.totalScore / maxYearScore) * 100 : 0;
            const level = getActivityLevel(year.totalScore, maxYearScore);
            const isCurrentYear = year.year === currentYear;
            const isPeak = year.year === mostActiveYear.year;
            const avgScore =
              year.repos > 0 ? Math.round(year.totalScore / year.repos) : 0;

            return (
              <li key={year.year} className="py-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-display text-[1.5rem] leading-[1] font-semibold tabular-nums text-fg">
                        {year.year}
                      </span>
                      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                        {level}
                      </span>
                      {(isCurrentYear || isPeak) && (
                        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
                          {isPeak && isCurrentYear
                            ? "current · peak"
                            : isPeak
                              ? "peak"
                              : "current"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-x-6 gap-y-1 flex-wrap font-mono text-[0.75rem] text-fg-muted tabular-nums">
                      <span>
                        {year.ecosystems}{" "}
                        {year.ecosystems === 1 ? "ecosystem" : "ecosystems"}
                      </span>
                      <span>{year.repos} repositories</span>
                      <span>{avgScore} avg score</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-display text-[1.5rem] leading-[1] font-semibold tabular-nums text-fg">
                      {formatNumber(year.totalScore)}
                    </span>
                    <SmallCapsLabel tone="subtle">Total Score</SmallCapsLabel>
                  </div>
                </div>

                {/* Activity bar — flat 2px line, no rounding, accent fill */}
                <div
                  className="relative h-[2px] bg-rule"
                  role="presentation"
                  aria-hidden
                >
                  <div
                    className="h-full bg-accent transition-[width] duration-500 ease-out"
                    style={{
                      width: `${scorePercentage}%`,
                      minWidth: scorePercentage > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Journey + Patterns — side-by-side hairline ledgers */}
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="flex flex-col">
          <SmallCapsLabel className="mb-4">Development Journey</SmallCapsLabel>
          <dl className="grid grid-cols-[auto_1fr] border-t border-rule divide-y divide-rule">
            <JourneyRow
              label="Started"
              value={dateFmt.format(new Date(firstActivity))}
            />
            <JourneyRow
              label="Latest Activity"
              value={dateFmt.format(new Date(lastActivity))}
            />
            <JourneyRow
              label="Peak Period"
              value={`${mostActiveYear.year} · ${formatNumber(
                mostActiveYear.totalScore,
              )}`}
            />
            <JourneyRow
              label="Status"
              value={
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">
                  {recentActivity
                    ? "Active Developer"
                    : "Historical Contributor"}
                </span>
              }
            />
          </dl>
        </div>

        <div className="flex flex-col">
          <SmallCapsLabel className="mb-4">
            Contribution Patterns
          </SmallCapsLabel>
          <dl className="grid grid-cols-[1fr_auto] border-t border-rule divide-y divide-rule">
            <PatternRow
              label="Consistency Score"
              hint="Based on year-over-year activity"
              value={consistencyLabel}
            />
            <PatternRow
              label="Growth Trajectory"
              hint="Ecosystem expansion over time"
              value={growthLabel}
            />
            <PatternRow
              label="Impact Level"
              hint="Peak year contribution intensity"
              value={impactLabel}
            />
          </dl>
        </div>
      </div>
    </section>
  );
}
