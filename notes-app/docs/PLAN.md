# Implementation Plan: TODO App

## Overview
Build a **TODO** app on top of the approved Prisma `Note` + `Category` models
(`database/schema.prisma`). A to-do is a required **`label`** (its text), optionally
**organized by a `Category`**. Deliver create / read / update / delete + mark-complete,
category organization, efficient label filter/search, and a responsive UI with loading/error
states — the graded requirements from the README. Scope is prioritized: the README says
you're **not expected to finish everything**, so Phase 1 is the must-have core, Phase 2
the differentiators, Phase 3 polish.

## Architecture Decisions
- **Data access = direct Prisma calls.** Query Prisma directly inside Server Actions
  (mutations) and RSC (reads). **No repository abstraction and no client singleton for
  now** — unnecessary at this scope. *(If Next dev hot-reload later throws "too many
  connections", add a minimal ~8-line shared-client module — deferred until then.)*
- **Mutations = Server Actions; reads = RSC.** Mutations via `'use server'` actions,
  reads via React Server Components. Idiomatic Next 16 App Router, no API boilerplate.
  **Decided: Server Actions** (alternative considered: REST Route Handlers).
- **Validation = Zod** at the action boundary; infer types from schemas. Serves the
  README's "validations and error handling" criterion. **Decided: Zod.**
- **Filter/search via URL `searchParams`.** `?category=` + `?q=` drive Prisma `where`
  (`q` = case-insensitive `contains` on `label`, which is indexed). Shareable,
  server-rendered, RSC-friendly.
- **Styling = Tailwind v4** (already in scaffold). Server component for the list; small
  client components for the interactive add/edit form and debounced search.

## Dependency Graph
```
schema.prisma + client generated (DONE)
      │
      ▼
first migration + seed categories (Task 2, needs Postgres)
      │
      ▼
Server Actions (mutations) + RSC reads — Prisma queried directly
      │
      ├── Create (T3) ─ List (T4) ─ Edit (T5) ─ Delete (T6)
      │
      ▼
Filter by category (T7) + Search by label (T8)
      │
      ▼
Loading/error (T9) ─ Responsive (T10) ─ INSTRUCTIONS.md (T11)
```

## Task List

### Phase 0: Foundation

## Task 1: Prisma config deprecation — DEFERRED ✅
**Description:** Decision: keep the `package.json#prisma` config on Prisma v6 and defer
the `prisma.config.ts` migration. Recorded as a known follow-up in `database/SPEC.md`.
The deprecation warning is expected/benign until a Prisma 7 upgrade.
**Acceptance criteria:**
- [x] Deferral documented in `database/SPEC.md` under "Known follow-ups".
**Verification:** SPEC.md "Known follow-ups" section present.
**Dependencies:** None. **Files:** `database/SPEC.md`. **Scope:** XS (done).

## Task 2: First migration + seed categories
**Description:** Bring up Postgres (`docker compose up -d`), run
`prisma migrate dev --name init_todo_model` to create the `Note` + `Category` tables,
and add a **simple** `database/seed.ts` that prepopulates a few `Category` rows
(e.g. Work, Family, Personal) — categories only, no to-dos. Wire `prisma.seed` in
`package.json` with a lightweight TS runner (e.g. `tsx`).
**Acceptance criteria:**
- [ ] `Note` + `Category` tables exist; `prisma db seed` inserts a few categories.
**Verification:** `npx prisma studio` shows the seeded categories.
**Dependencies:** None (schema done). **Files:** `database/seed.ts`, `database/migrations/*`, `package.json`. **Scope:** S.

### Checkpoint: Foundation
- [ ] Migration applied; category rows seeded; app builds clean.

### Phase 1: Core CRUD (vertical slices)

## Task 3: Create a to-do
**Description:** `createNote` server action (Prisma direct) + a form (label text + a
category select populated from the `Category` table). Validate with Zod; revalidate the
list on success.
**Acceptance criteria:**
- [ ] Submitting persists a to-do and it appears in the list.
- [ ] Invalid input (empty label) is rejected with a visible message.
**Verification:** Create via UI → item appears; empty-label submit shows error.
**Dependencies:** T2. **Files:** `app/actions.ts`, add-form component, `app/page.tsx`. **Scope:** M.

## Task 4: List to-dos + toggle complete
**Description:** RSC page querying to-dos via Prisma (newest-first), rendering the label,
a category badge, and a checkbox. Toggling the checkbox flips `done` via a `toggleNote`
server action and re-renders (completed items de-emphasised, e.g. strikethrough).
**Acceptance criteria:**
- [ ] To-dos render newest-first; empty state shown when none.
- [ ] Toggling an item's checkbox persists `done` and updates its appearance.
**Verification:** Page shows created to-dos; checking an item marks it done after revalidate.
**Dependencies:** T2. **Files:** `app/page.tsx`, item component, `app/actions.ts`. **Scope:** M.

## Task 5: Edit a to-do
**Description:** Inline/edit form + `updateNote` action (edit the label and/or category).
**Acceptance criteria:**
- [ ] Editing persists changes; `updatedAt` advances; list reflects them.
**Verification:** Edit an item → changes visible after save.
**Dependencies:** T3, T4. **Files:** `app/actions.ts`, edit component. **Scope:** M.

## Task 6: Delete a to-do
**Description:** `deleteNote` action + confirm control; revalidate list.
**Acceptance criteria:**
- [ ] Deleting removes the item; list updates.
**Verification:** Delete → item gone after revalidate.
**Dependencies:** T4. **Files:** item component, `app/actions.ts`. **Scope:** S.

### Checkpoint: Core CRUD
- [ ] Create / read / update / delete + mark-complete all work end-to-end against Postgres.

### Phase 2: Organization & Search

## Task 7: Filter by category
**Description:** Category chips/select (loaded from the `Category` table) driving
`?category=` → filtered Prisma query.
**Acceptance criteria:**
- [ ] Selecting a category shows only its to-dos; "All" clears the filter.
**Verification:** Toggle categories → list narrows; URL reflects state.
**Dependencies:** T4. **Files:** `app/page.tsx`, filter component. **Scope:** M.

## Task 8: Search by label
**Description:** Debounced text input → `?q=` → case-insensitive `contains` on `label`,
combinable with the category filter.
**Acceptance criteria:**
- [ ] Typing filters results; combining with a category ANDs both; empty state on no match.
**Verification:** Search term narrows list; works alongside category filter.
**Dependencies:** T7. **Files:** search component, `app/page.tsx`. **Scope:** M.

### Checkpoint: Organization
- [ ] Filter + search compose correctly and are reflected in the URL.

### Phase 3: Polish

## Task 9: Loading & error states
**Description:** `loading.tsx` / `error.tsx`, empty states, and inline action-error feedback.
**Acceptance criteria:**
- [ ] Navigation shows loading UI; a thrown data error renders a recoverable error UI.
**Verification:** Throttle/force-error → correct UI appears.
**Dependencies:** T4. **Files:** `app/loading.tsx`, `app/error.tsx`, components. **Scope:** S.

## Task 10: Responsive pass
**Description:** Mobile→desktop layout, keyboard-accessible controls, sensible tap targets.
**Acceptance criteria:**
- [ ] Usable at 375px and 1280px; no horizontal scroll; controls reachable by keyboard.
**Verification:** Manual check at both widths.
**Dependencies:** T4–T8. **Files:** layout + components. **Scope:** S.

## Task 11: INSTRUCTIONS.md (submission requirement)
**Description:** Required by the README: install/run steps, stack, architecture, key
decisions & rationale.
**Acceptance criteria:**
- [ ] A reviewer can clone, follow it, and run the app + DB.
**Verification:** Dry-run the steps on a clean checkout.
**Dependencies:** Core done. **Files:** `INSTRUCTIONS.md`. **Scope:** S.

### Checkpoint: Complete
- [ ] All acceptance criteria met; app builds; ready for review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Next.js 16 API drift (async `params`/`searchParams`, Server Actions, caching/`revalidatePath`) differs from training data | High | Consult `node_modules/next/dist/docs/` + verify each API at implementation time (AGENTS.md warning). Build one slice end-to-end first (T3/T4). |
| Postgres not running → migrations blocked | Med | `docker-compose.yml` provided; document `docker compose up -d` in INSTRUCTIONS. |
| Prisma v6 `package.json#prisma` config deprecated (gone in v7) | Low | Task 1 decision. |
| Scope creep vs limited time | Med | Prioritize Phase 1; treat 2 as differentiators, 3 as polish. Stop line is the user's call. |

## Decisions (resolved)
1. **Domain:** TODO app — `Note` = a to-do with a required `label` + a `done` completion flag; `title`/`content` removed.
2. **Mutations:** Server Actions + RSC reads.
3. **Validation:** Zod at the action boundary.
4. **Scope trimmed:** no data-access repository/client singleton for now; Prisma queried directly.
5. **Seed:** simple category-only seed (no to-dos).
6. **`label` indexed** to speed up filtering/search.
7. **Prisma config deprecation:** deferred (see `database/SPEC.md`).

## Open Questions
- **Model name:** rename `Note` → `Todo` to match the domain? (Kept as `Note` for now.)
- **Category management:** users create/rename/delete categories, or just pick from the
  seeded set? Current plan assumes seeded + selecting existing.
- **Stop line / scope:** plan approved, implementation not started — how far to build
  (core CRUD → filter/search → full polish) is your call.
