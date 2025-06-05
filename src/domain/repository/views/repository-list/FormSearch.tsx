import { type FormEventHandler, useState } from "react";
import { Form } from "@remix-run/react";
import { Input, Button } from "@nextui-org/react";

import type { SearchValue, FormSearchWidgetProps } from "./typing";
import OrderFilterWidget from "./OrderFilter";
import DirectionFilterWidget from "./DirectionFilter";

function FormSearch({ onSearch }: FormSearchWidgetProps) {
  const [search, setSearch] = useState<SearchValue>({ search: "", order: "id", direction: "asc" });

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();
    onSearch({ ...search });
  };

  const handleFilterChange = <K extends keyof SearchValue>(name: K, value: SearchValue[K]) => {
    setSearch(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Form className="flex items-end gap-4 md:gap-6" onSubmit={handleSubmit}>
      <div className="flex-grow grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Input
          label="Keyword"
          variant="underlined"
          size="sm"
          value={search.search}
          onValueChange={handleFilterChange.bind(null, "search")}
        />
        <OrderFilterWidget value={search.order} onChange={handleFilterChange.bind(null, "order")} />
        <DirectionFilterWidget value={search.direction} onChange={handleFilterChange.bind(null, "direction")} />
      </div>
      <Button className="flex-shrink-0" type="submit" color="primary">
        Search
      </Button>
    </Form>
  );
}

export default FormSearch;
