import { CircleAlert, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  onRetry: () => void;
};

/** Recoverable error surface — scoped to the list region, always offers Retry. */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-medium text-foreground">
        Couldn&apos;t load your to-dos
      </h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Something went wrong reaching the server. Your data is safe.
      </p>
      <Button className="mt-5" variant="outline" onClick={onRetry}>
        <RotateCw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}
