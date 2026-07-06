"use client";

import { useState } from "react";
import type { FormEvent, RefObject } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, CreateTodoInput } from "@/lib/types";

import { CategorySelect } from "./category-select";

type AddTodoFormProps = {
  categories: Category[];
  onAdd: (input: CreateTodoInput) => Promise<boolean>;
  inputRef?: RefObject<HTMLInputElement | null>;
};

/**
 * Primary create surface. Validates a non-empty label, keeps the typed text on
 * failure, and retains the selected category between adds for fast entry.
 */
export function AddTodoForm({ categories, onAdd, inputRef }: AddTodoFormProps) {
  const [label, setLabel] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Type something to add.");
      inputRef?.current?.focus();
      return;
    }

    setSubmitting(true);
    const ok = await onAdd({ label: trimmed, categoryId });
    setSubmitting(false);

    if (ok) {
      setLabel(""); // keep the category selected for rapid multi-add
      setError(null);
      inputRef?.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="new-todo" className="sr-only">
            New to-do
          </label>
          <Input
            id="new-todo"
            ref={inputRef}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Add a to-do…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "new-todo-error" : undefined}
            className="h-10"
          />
        </div>
        <CategorySelect
          value={categoryId}
          onChange={setCategoryId}
          categories={categories}
          triggerClassName="h-10 w-full justify-between sm:w-40"
        />
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 w-full sm:w-auto"
        >
          <Plus />
          Add
        </Button>
      </div>
      {error ? (
        <p id="new-todo-error" role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
