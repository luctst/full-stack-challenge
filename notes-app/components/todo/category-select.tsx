"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

const NONE = "none";

type CategorySelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  categories: Category[];
  id?: string;
  triggerClassName?: string;
};

/** Shared category picker used by both the add form and the edit dialog. */
export function CategorySelect({
  value,
  onChange,
  categories,
  id,
  triggerClassName,
}: CategorySelectProps) {
  // Base UI reads `items` to render the selected value's label in the trigger.
  const items: Record<string, string> = { [NONE]: "No category" };
  for (const category of categories) items[category.id] = category.name;

  return (
    <Select
      items={items}
      value={value ?? NONE}
      onValueChange={(next) => onChange(next === NONE ? null : (next as string))}
    >
      <SelectTrigger id={id} aria-label="Category" className={triggerClassName}>
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No category</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
