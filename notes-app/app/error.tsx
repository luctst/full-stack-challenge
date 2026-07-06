"use client";

import { ErrorState } from "@/components/todo/error-state";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <ErrorState onRetry={reset} />
      </div>
    </main>
  );
}
