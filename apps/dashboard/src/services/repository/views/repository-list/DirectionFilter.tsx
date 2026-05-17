import type { ChangeEventHandler } from "react";
import { Select, SelectItem } from "@/components/ui";

import type { SearchValue, SelectableFilterWidgetProps } from "./typing";

function DirectionFilter({
  value = "asc",
  onChange,
}: SelectableFilterWidgetProps<SearchValue["direction"]>) {
  const options = [
    { label: "ASC", value: "asc" },
    { label: "DESC", value: "desc" },
  ];

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.target.value as SearchValue["direction"]);
  };

  return (
    <Select
      label="Direction"
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

export default DirectionFilter;
