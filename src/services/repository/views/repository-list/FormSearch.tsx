"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";

import {
  repoListSearchSchema,
  type RepoListSearchInput,
} from "@/lib/form/schemas";

import type { FormSearchWidgetProps } from "./typing";

const orderOptions = [
  { label: "Repo ID", value: "id" },
  { label: "GitHub Org", value: "org" },
] as const;

const directionOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
] as const;

function FormSearch({ onSearch }: FormSearchWidgetProps) {
  const { control, handleSubmit } = useForm<RepoListSearchInput>({
    resolver: zodResolver(repoListSearchSchema),
    defaultValues: {
      search: "",
      order: "id",
      direction: "asc",
    },
  });

  const onSubmit = (data: RepoListSearchInput) => {
    onSearch(data);
  };

  return (
    <form
      className="flex items-end gap-4 md:gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex-grow grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <Input
              label="Keyword"
              variant="underlined"
              size="sm"
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          name="order"
          control={control}
          render={({ field }) => (
            <Select
              label="Order"
              selectedKeys={[field.value]}
              variant="underlined"
              size="sm"
              onChange={(e) => field.onChange(e.target.value)}
            >
              {orderOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          )}
        />
        <Controller
          name="direction"
          control={control}
          render={({ field }) => (
            <Select
              label="Direction"
              selectedKeys={[field.value]}
              variant="underlined"
              size="sm"
              onChange={(e) => field.onChange(e.target.value)}
            >
              {directionOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          )}
        />
      </div>
      <Button className="flex-shrink-0" type="submit" color="primary">
        Search
      </Button>
    </form>
  );
}

export default FormSearch;
