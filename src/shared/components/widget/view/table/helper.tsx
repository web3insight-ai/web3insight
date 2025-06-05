import type { JSXElementConstructor } from "react";

import type { ViewFieldDescriptor, FieldRendererProps } from "../../../../types";
import type { TableColumn } from "../../../control/data-table";

import type { TableViewWidgetProps } from "./typing";

function resolveColumns(fields: TableViewWidgetProps["fields"] = []): TableColumn[] {
  const cols: TableColumn[] = (fields as ViewFieldDescriptor[]).map(field => {
    let renderFn: TableColumn["render"];

    if (field.widget) {
      const FieldWidget = field.widget as JSXElementConstructor<FieldRendererProps>;

      renderFn = (_, { row }) => <FieldWidget field={field} value={row[field.name]} />;
    }

    return {
      title: field.label,
      key: field.name,
      span: field.config?.span,
      render: renderFn,
    } as TableColumn;
  });

  cols.unshift({ title: "#", key: "serialNumber", type: "index" });

  return cols;
}

export { resolveColumns };
