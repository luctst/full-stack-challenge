import type { Category } from "@/lib/types";
import { categoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: Category | undefined;
  className?: string;
};

/**
 * Compact category marker: a colour dot + name. Renders nothing for
 * uncategorised to-dos to keep rows quiet. Colour is functional (scanning aid),
 * paired with the text label so it never relies on colour alone.
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) return null;
  const color = categoryColor(category.id);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", color.dot)}
        aria-hidden
      />
      {category.name}
    </span>
  );
}
