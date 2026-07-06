// Domain types — mirror the Prisma models in `database/schema.prisma`.
// A `Todo` is the app-facing shape of a `Note` (label + done + optional Category).
// Kept UI-friendly (ISO string timestamps) so it serialises cleanly across the
// client/server boundary when the mock layer is swapped for real Server Actions.

export type Category = {
  id: string;
  name: string;
};

export type Todo = {
  id: string;
  label: string;
  done: boolean;
  categoryId: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
};

/** Input accepted when creating a to-do. */
export type CreateTodoInput = {
  label: string;
  categoryId: string | null;
};

/** Partial patch accepted when editing a to-do. */
export type UpdateTodoInput = {
  label?: string;
  categoryId?: string | null;
  done?: boolean;
};
