import { TodoListSkeleton } from "@/components/todo/todo-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="mt-6 mb-4 flex gap-2">
          <Skeleton className="h-8 w-full max-w-sm rounded-lg" />
        </div>
        <TodoListSkeleton />
      </div>
    </main>
  );
}
