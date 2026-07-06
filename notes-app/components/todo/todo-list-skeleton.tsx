import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder shaped like the real list (checkbox + label + badge),
 * not a centred spinner — so the layout doesn't jump when data arrives.
 */
export function TodoListSkeleton() {
  return (
    <ul
      className="divide-y divide-border rounded-xl border border-border bg-card"
      aria-busy="true"
      aria-label="Loading to-dos"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-5 shrink-0 rounded-md" />
          <Skeleton
            className="h-4 rounded"
            style={{ width: `${55 + ((i * 13) % 35)}%` }}
          />
          <Skeleton className="ml-auto h-5 w-16 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
