import type { JSXElementConstructor } from "react";

import { type ButtonProps, Button } from "@nextui-org/react";

import type { DataValue, ViewFieldDescriptor, FieldRendererProps } from "../../../../types";
import type { TableColumn } from "../../../control/data-table";

import type { TableViewAction, ActionGroup, TableViewWidgetProps } from "./typing";

function resolveActionGroup(actions: TableViewWidgetProps["actions"] = []): ActionGroup {
  const group: ActionGroup = { inline: [], others: [] };

  actions.forEach(action => {
    if (!action.context || action.context === "single") {
      group.inline.push(action);
    } else {
      group.others.push(action);
    }
  });

  return group;
}

function renderButton(action: TableViewAction, payload: Record<string, DataValue> = {}) {
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
      onClick={() => action.execute?.(payload)}
    >
      {action.text}
    </Button>
  );
}

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

  if (actions.length > 0) {
    cols.push({
      title: "Actions",
      key: "_SYS_ACTION_COL_",
      render: (_, { row }) => (
        <div className="flex items-center gap-2 px-4">
          {actions.map(action => renderButton(action, row))}
        </div>
      ),
    });
  }

  return cols;
}

export { resolveActionGroup, renderButton, resolveColumns };
