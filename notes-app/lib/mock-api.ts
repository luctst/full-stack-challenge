import type {
  Category,
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@/lib/types";
import { MOCK_CATEGORIES, MOCK_TODOS } from "@/lib/mock-data";

/**
 * In-memory mock data source. This is the ONLY file that should change when the
 * real backend lands: replace each function body with a Prisma-backed Server
 * Action of the same signature and the UI keeps working untouched.
 *
 * Each call is async + latency-simulated so the UI exercises real loading/error
 * paths (skeletons, optimistic rollback) rather than resolving synchronously.
 */

let todos: Todo[] = [...MOCK_TODOS];
const categories: Category[] = [...MOCK_CATEGORIES];

const LATENCY_MS = 450;

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowIso(): string {
  return new Date().toISOString();
}

function genId(): string {
  // Good enough for a mock; the real layer uses Prisma cuid().
  return `todo_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Failure injection for demoing/handling error states. Off by default. Flip via
 * `setFailureRate(1)` in a console to see every mutation roll back gracefully.
 */
let failureRate = 0;
export function setFailureRate(rate: number): void {
  failureRate = Math.min(1, Math.max(0, rate));
}
function maybeFail(action: string): void {
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error(`Mock failure: ${action}`);
  }
}

export async function getCategories(): Promise<Category[]> {
  await delay(150);
  return [...categories];
}

export async function getTodos(): Promise<Todo[]> {
  await delay();
  maybeFail("getTodos");
  // Newest first, matching the RSC query the plan describes.
  return [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  await delay();
  maybeFail("createTodo");
  const todo: Todo = {
    id: genId(),
    label: input.label.trim(),
    done: false,
    categoryId: input.categoryId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  todos = [todo, ...todos];
  return todo;
}

export async function updateTodo(
  id: string,
  patch: UpdateTodoInput,
): Promise<Todo> {
  await delay();
  maybeFail("updateTodo");
  const existing = todos.find((t) => t.id === id);
  if (!existing) throw new Error(`Todo ${id} not found`);
  const updated: Todo = {
    ...existing,
    ...patch,
    label: patch.label !== undefined ? patch.label.trim() : existing.label,
    updatedAt: nowIso(),
  };
  todos = todos.map((t) => (t.id === id ? updated : t));
  return updated;
}

export async function deleteTodo(id: string): Promise<void> {
  await delay();
  maybeFail("deleteTodo");
  todos = todos.filter((t) => t.id !== id);
}

/** Restore a previously deleted to-do (backs the Undo affordance). */
export async function restoreTodo(todo: Todo): Promise<Todo> {
  await delay(150);
  todos = [todo, ...todos.filter((t) => t.id !== todo.id)];
  return todo;
}
