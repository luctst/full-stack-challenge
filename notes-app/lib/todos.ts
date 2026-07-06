"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  Category,
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@/lib/types";

/**
 * Prisma-backed data layer for to-dos. Exposes the async signatures the client
 * hook (`hooks/use-todos.ts`) calls — all to-do reads and mutations flow here.
 *
 * Every export is a Server Function (`"use server"`) invoked from a Client
 * Component: reads run on mount, mutations run from event handlers. Returns are
 * always plain, serialisable objects — Prisma `DateTime` is mapped to ISO
 * strings and no Prisma class instances cross the client boundary.
 *
 * Reads intentionally stay client-called (not RSC) so `next build` never touches
 * the database.
 */

// --- Validation (throws on invalid; the client hook catches → rolls back + toasts) ---

const createSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  // null = uncategorised; a non-empty string references an existing Category.
  categoryId: z.string().min(1).nullable(),
});

const updateSchema = z.object({
  label: z.string().trim().min(1, "Label is required").optional(),
  categoryId: z.string().min(1).nullable().optional(),
  done: z.boolean().optional(),
});

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

// --- Mapping: Prisma `Note` row → UI `Todo` (Date → ISO string, plain object) ---

type NoteRow = {
  id: string;
  label: string;
  done: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toTodo(note: NoteRow): Todo {
  return {
    id: note.id,
    label: note.label,
    done: note.done,
    categoryId: note.categoryId,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

// --- Reads ---

export async function getTodos(): Promise<Todo[]> {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
  return notes.map(toTodo);
}

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// --- Mutations ---

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstError(parsed.error));
  }

  const created = await prisma.note.create({
    data: {
      label: parsed.data.label,
      // Persist the FK directly: null = uncategorised, `done` defaults to false.
      categoryId: parsed.data.categoryId,
    },
  });
  return toTodo(created);
}

export async function updateTodo(
  id: string,
  patch: UpdateTodoInput,
): Promise<Todo> {
  const parsed = updateSchema.safeParse(patch);
  if (!parsed.success) {
    throw new Error(firstError(parsed.error));
  }

  // Only touch fields present in the patch. Prisma treats `undefined` as
  // "leave unchanged"; an explicit `null` on categoryId clears the FK (the UI
  // supports moving a to-do back to uncategorised).
  const data: Prisma.NoteUncheckedUpdateInput = {};
  if (parsed.data.label !== undefined) {
    data.label = parsed.data.label;
  }
  if (parsed.data.categoryId !== undefined) {
    data.categoryId = parsed.data.categoryId;
  }
  if (parsed.data.done !== undefined) {
    data.done = parsed.data.done;
  }

  const updated = await prisma.note.update({ where: { id }, data });
  return toTodo(updated);
}

export async function deleteTodo(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
}
