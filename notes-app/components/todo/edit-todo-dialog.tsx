"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Todo, UpdateTodoInput } from "@/lib/types";

import { CategorySelect } from "./category-select";

type EditTodoDialogProps = {
  todo: Todo | null;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, patch: UpdateTodoInput) => void;
};

/** Controlled edit dialog. Open state is derived from `todo !== null`. */
export function EditTodoDialog({
  todo,
  categories,
  onClose,
  onSave,
}: EditTodoDialogProps) {
  return (
    <Dialog
      open={todo !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        {todo ? (
          // `key` remounts the form per to-do, so each edit starts from fresh
          // initial state — no effect-based prop syncing needed.
          <EditTodoForm
            key={todo.id}
            todo={todo}
            categories={categories}
            onSave={onSave}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditTodoForm({
  todo,
  categories,
  onSave,
  onClose,
}: {
  todo: Todo;
  categories: Category[];
  onSave: (id: string, patch: UpdateTodoInput) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(todo.label);
  const [categoryId, setCategoryId] = useState<string | null>(todo.categoryId);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Type something.");
      return;
    }
    onSave(todo.id, { label: trimmed, categoryId });
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit to-do</DialogTitle>
        <DialogDescription>
          Update the text or move it to another category.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="edit-label">To-do</Label>
          <Input
            id="edit-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? true : undefined}
            autoFocus
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-category">Category</Label>
          <CategorySelect
            id="edit-category"
            value={categoryId}
            onChange={setCategoryId}
            categories={categories}
            triggerClassName="w-full justify-between"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save changes</Button>
      </DialogFooter>
    </>
  );
}
