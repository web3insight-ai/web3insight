import type { ChangeEventHandler } from "react";
import { Select, SelectItem } from "@/components/ui";

import type { SearchValue, SelectableFilterWidgetProps } from "./typing";

function OrderFilter({
  value = "id",
  onChange,
}: SelectableFilterWidgetProps<SearchValue["order"]>) {
  const options = [
    { label: "Repo ID", value: "id" },
    { label: "GitHub Org", value: "org" },
  ];

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.target.value as SearchValue["order"]);
  };

  return (
    <Select
      label="Order"
      selectedKeys={[value]}
      variant="underlined"
      size="sm"
      onChange={handleChange}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value}>{opt.label}</SelectItem>
      ))}
    </Select>
  );
}

export default OrderFilter;
