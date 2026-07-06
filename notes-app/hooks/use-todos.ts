"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  Category,
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@/lib/types";
import * as api from "@/lib/todos";

export type LoadStatus = "loading" | "ready" | "error";

/**
 * Owns to-do + category state and every mutation. All mutations are OPTIMISTIC:
 * the UI updates instantly, then reconciles with the API and rolls back
 * with a toast on failure — the persistence-feedback model chosen in DESIGN.md.
 * Data layer is `@/lib/todos` (Prisma-backed Server Actions); the optimistic
 * contract here is unchanged from the former mock.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const load = useCallback(async () => {
    // No synchronous setState here — the first mount relies on the default
    // "loading" state, and state only updates after the awaited fetch resolves.
    try {
      const [nextTodos, nextCategories] = await Promise.all([
        api.getTodos(),
        api.getCategories(),
      ]);
      setTodos(nextTodos);
      setCategories(nextCategories);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // Retry re-enters the loading state; called from an event handler, not an effect.
  const reload = useCallback(() => {
    setStatus("loading");
    void load();
  }, [load]);

  useEffect(() => {
    // Initial client-side fetch on mount. `load` only sets state after an
    // awaited request, so there's no synchronous cascading render — but the
    // lint heuristic can't see past the await. This effect disappears once
    // reads move to RSC with the real backend (see lib/todos.ts).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const addTodo = useCallback(
    async (input: CreateTodoInput): Promise<boolean> => {
      const optimistic: Todo = {
        id: `optimistic_${Date.now()}`,
        label: input.label.trim(),
        done: false,
        categoryId: input.categoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos((prev) => [optimistic, ...prev]);
      try {
        const saved = await api.createTodo(input);
        setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? saved : t)));
        return true;
      } catch {
        setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
        toast.error("Couldn't add to-do", {
          description: "Your text was kept — try again.",
        });
        return false;
      }
    },
    [],
  );

  const patchTodo = useCallback(
    async (id: string, patch: UpdateTodoInput) => {
      const previous = todos.find((t) => t.id === id);
      if (!previous) return;
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      try {
        const saved = await api.updateTodo(id, patch);
        setTodos((prev) => prev.map((t) => (t.id === id ? saved : t)));
      } catch {
        setTodos((prev) => prev.map((t) => (t.id === id ? previous : t)));
        toast.error("Couldn't save change");
      }
    },
    [todos],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      void patchTodo(id, { done: !current.done });
    },
    [todos, patchTodo],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return;
      const removed = todos[index];

      // Optimistically remove from the UI, but DEFER the real delete until the
      // undo window closes. Undo just cancels the pending delete, so there's no
      // delete↔restore race against the (future) server.
      setTodos((prev) => prev.filter((t) => t.id !== id));

      const reinsert = () =>
        setTodos((prev) => {
          const next = [...prev];
          next.splice(index, 0, removed);
          return next;
        });

      let settled = false;
      const undo = () => {
        if (settled) return;
        settled = true;
        reinsert();
      };
      const commit = () => {
        if (settled) return;
        settled = true;
        void api.deleteTodo(id).catch(() => {
          reinsert();
          toast.error("Couldn't delete to-do");
        });
      };

      toast("To-do deleted", {
        duration: 5000,
        action: { label: "Undo", onClick: undo },
        onAutoClose: commit,
        onDismiss: commit,
      });
    },
    [todos],
  );

  return {
    todos,
    categories,
    status,
    reload,
    addTodo,
    patchTodo,
    toggleTodo,
    deleteTodo,
  };
}
