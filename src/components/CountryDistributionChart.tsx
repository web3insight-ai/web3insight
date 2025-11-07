'use client';

import { useMemo } from 'react';
import { Globe2 } from 'lucide-react';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import type {
  DataLabelsFormatterContextObject,
  GeoJSON,
  Options,
  SeriesMapDataOptions,
  SeriesPieDataOptions,
  TooltipFormatterContextObject,
} from 'highcharts';
import mapDataWorld from '@highcharts/map-collection/custom/world.geo.json';

type MapFeatureProperties = {
  name?: string;
  'iso-a2'?: string;
  'iso-a3'?: string;
};

type MapFeature = {
  properties?: MapFeatureProperties;
};

const mapFeatures = ((mapDataWorld as GeoJSON)?.features ?? []) as MapFeature[];

const iso3ToIso2 = new Map<string, string>();
const iso2Set = new Set<string>();

mapFeatures.forEach(feature => {
  const iso2 = feature?.properties?.['iso-a2'];
  const iso3 = feature?.properties?.['iso-a3'];
  if (iso2) {
    iso2Set.add(iso2.toUpperCase());
  }
  if (iso2 && iso3) {
    iso3ToIso2.set(iso3.toUpperCase(), iso2.toUpperCase());
  }
});

const resolveIso2Code = (code: string) => {
  const normalized = code?.toUpperCase?.() ?? '';
  if (!normalized) return 'N/A';

  if (/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }

  if (/^[A-Z]{3}$/.test(normalized)) {
    return iso3ToIso2.get(normalized) ?? normalized.slice(0, 2);
  }

  return normalized.slice(0, 2) || 'N/A';
};

type CountryDistributionItem = {
  country: string;
  total: number;
};

type ChartDatum = {
  code: string;
  label: string;
  total: number;
  percent: number;
  value: number;
};

type PieDatum = {
  name: string;
  y: number;
  code: string;
  percentValue: number;
};

interface CountryDistributionChartProps {
  data: CountryDistributionItem[];
  totalDevelopers?: number;
  className?: string;
}

function CountryDistributionChart({
  data,
  totalDevelopers = 0,
  className = '',
}: CountryDistributionChartProps) {
  const regionFormatter = useMemo(() => {
    if (typeof Intl !== 'undefined' && 'DisplayNames' in Intl) {
      const DisplayNamesCtor = (Intl as typeof Intl & { DisplayNames?: typeof Intl.DisplayNames }).DisplayNames;
      if (typeof DisplayNamesCtor === 'function') {
        return new DisplayNamesCtor(['en'], { type: 'region' });
      }
    }
    return null;
  }, []);

  const computedTotal = useMemo(() => {
    if (totalDevelopers > 0) return totalDevelopers;
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data, totalDevelopers]);

  const formattedData = useMemo<ChartDatum[]>(() => {
    if (!data?.length) {
      return [];
    }

    return [...data]
      .sort((a, b) => b.total - a.total)
      .map(item => {
        const countryCode = item.country || 'N/A';
        const iso2 = resolveIso2Code(countryCode);

        let label = iso2;
        if (regionFormatter && /^[A-Z]{2}$/.test(iso2)) {
          try {
            label = regionFormatter.of(iso2) || iso2;
          } catch {
            label = iso2;
          }
        }

        const percent = computedTotal ? (item.total / computedTotal) * 100 : 0;

        return {
          code: iso2,
          label,
          total: item.total,
          percent: Number(percent.toFixed(1)),
          value: item.total,
        };
      });
  }, [data, computedTotal, regionFormatter]);

  const leaderboardData = useMemo(() => formattedData.slice(0, 10), [formattedData]);

  const maxValue = useMemo(() => formattedData.reduce((max, item) => Math.max(max, item.total), 0), [formattedData]);

  const mapSeriesData = useMemo(
    () => formattedData.map(item => ({
      code: item.code,
      'iso-a3': item.code,
      label: item.label,
      value: item.value,
      total: item.total,
      percent: item.percent,
    })),
    [formattedData],
  );

  const pieColors = useMemo(() => ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'], []);

  const pieSeriesData = useMemo<PieDatum[]>(
    () => leaderboardData.map(item => ({
      name: item.label,
      y: item.total,
      code: item.code,
      percentValue: item.percent,
    })),
    [leaderboardData],
  );

  const mapOptions = useMemo<Options>(() => ({
    chart: {
      type: 'map',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit',
      },
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    mapNavigation: {
      enabled: true,
      enableButtons: false,
    },
    tooltip: {
      useHTML: true,
      formatter: function formatter(this: TooltipFormatterContextObject) {
        const point = this.point as TooltipFormatterContextObject['point'] & {
          code?: string;
          label?: string;
          percent?: number;
          value?: number;
        };
        const value = point?.value ?? 0;
        if (!value) {
          return `${point?.name ?? 'Unknown'}<br/>No tracked contributors`;
        }
        const percent = point?.percent ?? (computedTotal ? (value / computedTotal) * 100 : 0);
        const code = point?.code ? ` (${point.code})` : '';
        const displayName = point?.label ?? point?.name ?? 'Unknown region';
        return `
          <div style="padding:8px 12px;background:#fff;border:1px solid rgba(15,23,42,0.12);border-radius:8px;box-shadow:0 8px 20px rgba(15,23,42,0.1);min-width:180px;">
            <div style="font-size:12px;font-weight:600;color:#111827;">${displayName}${code}</div>
            <div style="font-size:12px;color:#111827;margin-top:4px;">${value.toLocaleString()} contributors</div>
            <div style="font-size:11px;color:#6B7280;">${percent.toFixed(1)}% of tracked</div>
          </div>
        `;
      },
    },
    colorAxis: {
      min: 0,
      max: maxValue || 1,
      stops: [
        [0, '#E0E7FF'],
        [0.5, '#6366F1'],
        [1, '#312E81'],
      ],
    },
    series: [
      {
        type: 'map',
        name: 'Global Contributor Distribution',
        data: mapSeriesData as SeriesMapDataOptions[],
        mapData: mapDataWorld as unknown as SeriesMapDataOptions[],
        joinBy: ['iso-a2', 'code'],
        borderColor: '#94A3B8',
        borderWidth: 0.5,
        nullColor: '#F8FAFC',
        states: {
          hover: {
            color: '#818CF8',
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    ],
  }), [computedTotal, mapSeriesData, maxValue]);

  const pieOptions = useMemo<Options>(() => ({
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      spacing: [0, 0, 32, 0],
      margin: [0, 0, 0, 0],
      style: {
        fontFamily: 'inherit',
      },
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      useHTML: true,
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      shadow: true,
      formatter: function formatter(this: TooltipFormatterContextObject) {
        const point = this.point as TooltipFormatterContextObject['point'] & { code?: string; percentValue?: number };
        const value = point?.y ?? 0;
        const percentValue = point?.percentValue ?? 0;
        const code = point?.code ? ` (${point.code})` : '';
        return `
          <div style="padding:8px 12px;background:#fff;border:1px solid rgba(15,23,42,0.12);border-radius:8px;box-shadow:0 8px 20px rgba(15,23,42,0.1);min-width:180px;">
            <div style="font-size:12px;font-weight:600;color:#111827;">${point?.name ?? 'Unknown'}${code}</div>
            <div style="font-size:12px;color:#111827;margin-top:4px;">${value.toLocaleString()} contributors</div>
            <div style="font-size:11px;color:#6B7280;">${percentValue.toFixed(1)}% of tracked</div>
          </div>
        `;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: false,
        innerSize: '46%',
        size: '50%',
        borderWidth: 0,
        borderRadius: 0,
        colors: pieColors,
        dataLabels: {
          enabled: true,
          useHTML: true,
          distance: 8,
          formatter: function formatter(this: DataLabelsFormatterContextObject) {
            const point = this.point as DataLabelsFormatterContextObject['point'] & { percentValue?: number };
            const percentValue = point?.percentValue ?? 0;
            return `<div style="text-align:center;font-size:11px;color:#1f2937;">${point?.name}<br /><span style="color:#6b7280;">${percentValue}%</span></div>`;
          },
        },
        states: {
          hover: {
            brightness: 0,
          },
        },
        center: ['50%', '55%'],
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Top Contributors',
        data: pieSeriesData as unknown as SeriesPieDataOptions[],
      },
    ],
  }), [pieColors, pieSeriesData]);

  if (formattedData.length === 0) {
    return (
      <div className={`border border-border dark:border-border-dark rounded-xl p-6 bg-white dark:bg-surface-dark text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
          <Globe2 size={16} />
          <span className="text-sm font-medium">Global Contributor Distribution</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No country or region data is available right now.
        </p>
      </div>
    );
  }

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-6 bg-white dark:bg-surface-dark ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Globe2 size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Global Contributor Distribution
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tracking {computedTotal.toLocaleString()} contributors
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0">
            <HighchartsReact
              highcharts={Highcharts}
              constructorType="mapChart"
              immutable
              options={mapOptions}
              containerProps={{ style: { height: 440 } }}
            />
          </div>
          <div className="w-full lg:w-[320px] xl:w-[360px]">
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-900 h-full flex flex-col">
              {pieSeriesData.length ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Top Contributors</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share of total tracked</p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">Top 10</div>
                  </div>
                  <div className="w-full" style={{ minHeight: 260 }}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      immutable
                      options={pieOptions}
                      containerProps={{ style: { height: 260 } }}
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>No top contributor data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryDistributionChart;
