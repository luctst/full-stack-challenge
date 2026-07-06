"use client";

import type { ReactNode } from "react";

import { categoryColor } from "@/lib/category-color";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: Category[];
  active: string; // "all" or a category id
  onChange: (next: string) => void;
};

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Horizontal, wrapping category filter. "All" clears the filter. */
export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      <Chip selected={active === "all"} onClick={() => onChange("all")}>
        All
      </Chip>
      {categories.map((category) => {
        const selected = active === category.id;
        const color = categoryColor(category.id);
        return (
          <Chip
            key={category.id}
            selected={selected}
            onClick={() => onChange(category.id)}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                selected ? "bg-primary-foreground" : color.dot,
              )}
              aria-hidden
            />
            {category.name}
          </Chip>
        );
      })}
    </div>
  );
}
