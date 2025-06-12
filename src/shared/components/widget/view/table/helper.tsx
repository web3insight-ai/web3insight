import type { JSXElementConstructor } from "react";

import { type ButtonProps, Button } from "@nextui-org/react";

import type { ViewFieldDescriptor, FieldRendererProps } from "../../../../types";
import type { TableColumn } from "../../../control/data-table";

import type { TableViewWidgetProps } from "./typing";

function resolveColumns({
  fields = [],
  actions = [],
}: Pick<TableViewWidgetProps, "fields" | "actions">): TableColumn[] {
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

  const singleActions = actions.filter(action => !action.context || action.context === "single");

  if (singleActions.length > 0) {
    cols.push({
      title: "Actions",
      key: "_SYS_ACTION_COL_",
      render: (_, { row }) => (
        <div className="flex items-center gap-2 px-4">
          {singleActions.map(action => {
            let color: ButtonProps["color"] = "default";
            let variant: ButtonProps["variant"] = "bordered";

            if (action.primary) {
              color = "primary";
              variant = "solid";
            }

            return (
              <Button
                key={action.name}
                color={color}
                variant={variant}
                size="sm"
                onClick={() => action.execute?.(row)}
              >
                {action.text}
              </Button>
            );
          })}
        </div>
      ),
    });
  }

  return cols;
}

export { resolveColumns };
