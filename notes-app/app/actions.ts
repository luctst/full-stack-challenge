"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

// One tiny schema drives create + update; the update variant just adds `id`.
const noteSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  categoryId: z.string().min(1).optional(),
});

const updateSchema = noteSchema.extend({
  id: z.string().min(1, "Note id is required"),
});

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

export async function createNote(formData: FormData): Promise<ActionResult> {
  const parsed = noteSchema.safeParse({
    label: formData.get("label") ?? "",
    // "" (no category selected) → undefined so the optional field passes.
    categoryId: formData.get("categoryId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }

  await prisma.note.create({ data: parsed.data });
  revalidatePath("/");
  return { ok: true };
}

export async function updateNote(formData: FormData): Promise<ActionResult> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id") ?? "",
    label: formData.get("label") ?? "",
    // ponytail: an omitted/empty categoryId leaves the existing category
    // unchanged (Prisma treats `undefined` as "don't touch"). Clearing a
    // category isn't supported yet — upgrade path: send an explicit `null`.
    categoryId: formData.get("categoryId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }

  const { id, ...data } = parsed.data;
  await prisma.note.update({ where: { id }, data });
  revalidatePath("/");
  return { ok: true };
}

export async function toggleNote(id: string, done: boolean): Promise<void> {
  await prisma.note.update({ where: { id }, data: { done } });
  revalidatePath("/");
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
  revalidatePath("/");
}
