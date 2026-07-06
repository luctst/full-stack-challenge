import type { Category, Todo } from "@/lib/types";

import { TodoItem } from "./todo-item";

type TodoListProps = {
  todos: Todo[];
  categoriesById: Map<string, Category>;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoList({
  todos,
  categoriesById,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps) {
  return (
    <ul
      role="list"
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          category={
            todo.categoryId ? categoriesById.get(todo.categoryId) : undefined
          }
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
