import { defineCatalog } from "@json-render/core";
// Reason: Import from the /schema subpath to avoid pulling in React (createContext)
// on the server side. The main "@json-render/react" entry calls createContext at
// module load time, which crashes in Route Handler (RSC) context.
import { schema } from "@json-render/react/schema";
import { z } from "zod";

// Reason: Composed series schema is shared between catalog (for prompt generation)
// and registry (for runtime type guards), so we define and export it here.
const composedSeriesSchema = z.object({
  type: z.enum(["bar", "line", "area", "scatter"]),
  dataKey: z.string(),
  yKey: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  curveType: z
    .enum(["monotone", "linear", "step", "natural", "basis"])
    .nullable()
    .optional(),
  barSize: z.number().nullable().optional(),
  stackId: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
  fillOpacity: z.number().nullable().optional(),
  dot: z.boolean().nullable().optional(),
});

// Reason: Exported so the registry can use these enums as runtime type guards.
const composedSeriesTypes = ["bar", "line", "area", "scatter"] as const;
const composedCurveTypes = [
  "monotone",
  "linear",
  "step",
  "natural",
  "basis",
] as const;

const web3InsightCatalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({
        direction: z.enum(["vertical", "horizontal"]).nullable().optional(),
        gap: z.number().nullable().optional(),
      }),
      slots: ["default"],
      description: "Flex stack container for grouping analytics content.",
    },

    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string().nullable().optional(),
      }),
      description: "KPI metric with optional detail.",
    },

    BarChart: {
      props: z.object({
        title: z.string().nullable().optional(),
        data: z.array(z.record(z.string(), z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        aggregate: z.enum(["sum", "count", "avg"]).nullable().optional(),
        color: z.string().nullable().optional(),
        height: z.number().nullable().optional(),
      }),
      description:
        'Bar chart visualization. Use { "$state": "/path" } to bind read-only data.',
    },

    LineChart: {
      props: z.object({
        title: z.string().nullable().optional(),
        data: z.array(z.record(z.string(), z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        aggregate: z.enum(["sum", "count", "avg"]).nullable().optional(),
        color: z.string().nullable().optional(),
        height: z.number().nullable().optional(),
      }),
      description:
        'Line chart for trends over time. Use { "$state": "/path" } to bind read-only data.',
    },

    ComposedChart: {
      props: z.object({
        title: z.string().nullable().optional(),
        data: z.array(z.record(z.string(), z.unknown())),
        xKey: z.string(),
        aggregate: z.enum(["sum", "count", "avg"]).nullable().optional(),
        showLegend: z.boolean().nullable().optional(),
        height: z.number().nullable().optional(),
        series: z.array(composedSeriesSchema),
      }),
      description:
        "Mixed bar+line+area chart. Each series entry specifies its chart type.",
    },

    PieChart: {
      props: z.object({
        title: z.string().nullable().optional(),
        data: z.array(z.record(z.string(), z.unknown())),
        nameKey: z.string(),
        valueKey: z.string(),
        height: z.number().nullable().optional(),
      }),
      description: "Pie or donut chart for proportional data.",
    },

    DataTable: {
      props: z.object({
        title: z.string().nullable().optional(),
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string().nullable().optional(),
          }),
        ),
        rows: z.array(z.record(z.string(), z.unknown())),
        maxRows: z.number().nullable().optional(),
      }),
      description:
        "Data table for displaying structured results. Columns define which fields to show.",
    },
  },
  // Reason: The schema requires an actions field even when empty.
  actions: {},
});

export {
  web3InsightCatalog,
  composedSeriesSchema,
  composedSeriesTypes,
  composedCurveTypes,
};
