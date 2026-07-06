"use client";

import { useMemo, useRef, useState } from "react";
import { ListTodo, Plus, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTodos } from "@/hooks/use-todos";
import type { Todo } from "@/lib/types";

import { AddTodoForm } from "./add-todo-form";
import { CategoryFilter } from "./category-filter";
import { EditTodoDialog } from "./edit-todo-dialog";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { SearchBar } from "./search-bar";
import { TodoList } from "./todo-list";
import { TodoListSkeleton } from "./todo-list-skeleton";

export function TodoApp() {
  const {
    todos,
    categories,
    status,
    reload,
    addTodo,
    patchTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [activeCategory, setActiveCategory] = useState("all");
  const [editing, setEditing] = useState<Todo | null>(null);
  const addInputRef = useRef<HTMLInputElement | null>(null);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return todos.filter((todo) => {
      const matchesCategory =
        activeCategory === "all" || todo.categoryId === activeCategory;
      const matchesQuery = q === "" || todo.label.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [todos, debouncedQuery, activeCategory]);

  const remaining = todos.filter((todo) => !todo.done).length;

  function clearFilters() {
    setQuery("");
    setActiveCategory("all");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          To-dos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {status === "ready"
            ? todos.length === 0
              ? "Nothing here yet."
              : remaining === 0
              ? "You're all caught up."
              : `${remaining} thing${remaining === 1 ? "" : "s"} left to do.`
            : " "}
        </p>
      </header>

      <AddTodoForm
        categories={categories}
        onAdd={addTodo}
        inputRef={addInputRef}
      />

      <div className="mt-6 flex flex-col gap-3">
        <SearchBar value={query} onChange={setQuery} />
        {categories.length > 0 ? (
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        ) : null}
      </div>

      <section className="mt-4" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <TodoListSkeleton />
        ) : status === "error" ? (
          <ErrorState onRetry={reload} />
        ) : todos.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="size-6" aria-hidden />}
            title="No to-dos yet"
            description="Add your first one above and it'll show up right here."
            action={
              <Button onClick={() => addInputRef.current?.focus()}>
                <Plus />
                Add a to-do
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" aria-hidden />}
            title="No matches"
            description={
              query.trim()
                ? `Nothing matches “${query.trim()}”.`
                : "No to-dos in this category yet."
            }
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <TodoList
              todos={filtered}
              categoriesById={categoriesById}
              onToggle={toggleTodo}
              onEdit={setEditing}
              onDelete={deleteTodo}
            />
            <p
              role="status"
              className="mt-3 px-1 text-xs text-muted-foreground"
            >
              Showing {filtered.length} of {todos.length}
            </p>
          </>
        )}
      </section>

      <EditTodoDialog
        todo={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={patchTodo}
      />
    </div>
  );
}
