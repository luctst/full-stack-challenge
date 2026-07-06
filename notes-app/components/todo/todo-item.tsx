"use client";

import { useRef } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category, Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CategoryBadge } from "./category-badge";

type TodoItemProps = {
  todo: Todo;
  category: Category | undefined;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({
  todo,
  category,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const checkboxId = `todo-${todo.id}`;
  const itemRef = useRef<HTMLLIElement>(null);

  function handleDelete() {
    // Capture a focus target BEFORE this row unmounts, then restore focus after
    // the delete commits so keyboard focus never drops to <body>.
    const li = itemRef.current;
    const sibling = (li?.nextElementSibling ??
      li?.previousElementSibling) as HTMLElement | null;
    onDelete(todo.id);
    requestAnimationFrame(() => {
      const next =
        sibling?.querySelector<HTMLElement>('[data-slot="button"]') ??
        document.getElementById("new-todo");
      next?.focus();
    });
  }

  return (
    <li ref={itemRef} className="flex items-center gap-3 px-4 py-3">
      <Checkbox
        id={checkboxId}
        checked={todo.done}
        onCheckedChange={() => onToggle(todo.id)}
        className="size-5"
      />
      {/* Native label association gives a large hit target + accessible name. */}
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex-1 cursor-pointer text-sm leading-snug break-words select-none",
          todo.done && "text-muted-foreground line-through",
        )}
      >
        {todo.label}
      </label>

      {category ? <CategoryBadge category={category} /> : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for “${todo.label}”`}
              className="relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-['']"
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(todo)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
