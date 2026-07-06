import type { Category, Todo } from "@/lib/types";

// Seeded categories mirror `database/seed.ts` (Work / Family / Personal).
export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_work", name: "Work" },
  { id: "cat_family", name: "Family" },
  { id: "cat_personal", name: "Personal" },
];

// A small, realistic starter set — deliberately NOT lorem ipsum, so layout
// problems (long labels, wrapping, done vs. active, uncategorised) show up early.
export const MOCK_TODOS: Todo[] = [
  {
    id: "todo_1",
    label: "Send the Q3 roadmap draft to Priya for review",
    done: false,
    categoryId: "cat_work",
    createdAt: "2026-07-06T09:12:00.000Z",
    updatedAt: "2026-07-06T09:12:00.000Z",
  },
  {
    id: "todo_2",
    label: "Book dentist appointment for the kids",
    done: false,
    categoryId: "cat_family",
    createdAt: "2026-07-05T18:40:00.000Z",
    updatedAt: "2026-07-05T18:40:00.000Z",
  },
  {
    id: "todo_3",
    label: "Renew gym membership before it lapses",
    done: false,
    categoryId: "cat_personal",
    createdAt: "2026-07-05T08:05:00.000Z",
    updatedAt: "2026-07-05T08:05:00.000Z",
  },
  {
    id: "todo_4",
    label: "Reply to the recruiter about the Thursday slot",
    done: true,
    categoryId: "cat_work",
    createdAt: "2026-07-04T14:22:00.000Z",
    updatedAt: "2026-07-04T16:00:00.000Z",
  },
  {
    id: "todo_5",
    label: "Pick up dry cleaning",
    done: true,
    categoryId: null,
    createdAt: "2026-07-03T11:00:00.000Z",
    updatedAt: "2026-07-03T12:30:00.000Z",
  },
];
