# Implementation Plan: Notes App

## Overview
Build the note-taking app on top of the approved Prisma `Note` model
(`database/schema.prisma`). Deliver create / read / update / delete, organization
by `category` (enum) + `label` (string), efficient search & filter, and a
responsive UI with loading/error states — the graded requirements from the README.
Scope is prioritized: the README states you're **not expected to finish everything**,
so Phases 0–1 are the must-have core, Phase 2 the differentiators, Phase 3 polish.

## Architecture Decisions
- **Data access layer.** A Prisma client singleton at `database/client.ts` (guards
  against connection exhaustion during Next dev hot-reload) + a thin repository
  `database/notes.ts` holding all queries. Keeps Prisma out of components; one place
  to change data logic. *(Rationale: testability, separation of concerns.)*
- **Mutations = Server Actions; reads = RSC.** Mutations via `'use server'` actions,
  reads via React Server Components calling the repository directly. Idiomatic Next 16
  App Router, no API boilerplate, progressive enhancement. **Decided: Server Actions**
  (alternative considered: REST Route Handlers under `app/api/*`).
- **Validation = Zod** at the action boundary; infer types from schemas. Directly
  serves the README's "validations and error handling" criterion. New dependency. **Decided: Zod.**
- **Search/filter via URL `searchParams`.** `?category=` + `?q=` drive Prisma `where`
  (case-insensitive `contains`). Shareable, server-rendered, RSC-friendly. Full-text
  (`tsvector`) is a documented later upgrade; `contains` is right for this scope.
- **Styling = Tailwind v4** (already in scaffold). Server components for lists;
  small client components for the interactive editor and debounced search.

## Dependency Graph
```
schema.prisma (DONE)
      │
      ▼
prisma client singleton + repository (Task 2)
      │
      ├── first migration + seed (Task 3, needs Postgres)
      │
      ▼
Server Actions (mutations) + RSC reads
      │
      ├── Create (T4) ─ List (T5) ─ Edit (T6) ─ Delete (T7)
      │
      ▼
Filter by category (T8) + Search (T9)
      │
      ▼
Loading/error (T10) ─ Responsive (T11) ─ INSTRUCTIONS.md (T12)
```

## Task List

### Phase 0: Foundation

## Task 1: Prisma config deprecation — DEFERRED ✅
**Description:** Decision: keep the `package.json#prisma` config on Prisma v6 and defer
the `prisma.config.ts` migration. Recorded as a known follow-up in `database/SPEC.md`
(migration path: `prisma.config.ts` + `process.loadEnvFile()`, zero new deps). The
deprecation warning is expected/benign until a Prisma 7 upgrade.
**Acceptance criteria:**
- [x] Deferral documented in `database/SPEC.md` under "Known follow-ups".
**Verification:** SPEC.md "Known follow-ups" section present.
**Dependencies:** None. **Files:** `database/SPEC.md`. **Scope:** XS (done).

## Task 2: Prisma client singleton + repository
**Description:** Add `database/client.ts` (singleton) and `database/notes.ts` with typed
functions: `listNotes({category?, q?})`, `getNote(id)`, `createNote(input)`,
`updateNote(id, input)`, `deleteNote(id)`.
**Acceptance criteria:**
- [ ] All components/actions import DB access only from `database/notes.ts`.
- [ ] Functions are fully typed off the generated Prisma client.
**Verification:** `npx tsc --noEmit` clean; `npm run build` succeeds.
**Dependencies:** T1 (schema/client). **Files:** `database/client.ts`, `database/notes.ts`. **Scope:** S.

## Task 3: First migration + seed
**Description:** Bring up Postgres (`docker compose up -d`), run
`prisma migrate dev --name init_note_model`, add a `database/seed.ts` inserting a few
notes across categories.
**Acceptance criteria:**
- [ ] `Note` table exists; seed inserts ≥3 notes spanning ≥2 categories.
**Verification:** `npx prisma studio` (or a `listNotes()` script) shows seeded rows.
**Dependencies:** T2. **Files:** `database/seed.ts`, `database/migrations/*`, `package.json` (seed script). **Scope:** S.

### Checkpoint: Foundation
- [ ] Build clean, DB reachable, seed rows present, no data-layer type errors.

### Phase 1: Core CRUD (vertical slices)

## Task 4: Create a note
**Description:** `createNote` server action + a form (title, content, category select,
optional label). Revalidate the list on success.
**Acceptance criteria:**
- [ ] Submitting persists a note and it appears in the list.
- [ ] Invalid input (empty title) is rejected with a visible message.
**Verification:** Create via UI → row appears; empty-title submit shows error.
**Dependencies:** T2 (+T3 to see it). **Files:** `app/notes/new/*`, `app/actions.ts`, form component. **Scope:** M.

## Task 5: List notes
**Description:** RSC page reading `listNotes()`, rendering newest-first with title,
snippet, category badge, and label.
**Acceptance criteria:**
- [ ] Notes render newest-first; empty state shown when none.
**Verification:** Page shows seeded + created notes.
**Dependencies:** T2. **Files:** `app/page.tsx` (or `app/notes/page.tsx`), note card component. **Scope:** M.

## Task 6: Edit a note
**Description:** Edit route with a pre-filled form + `updateNote` action.
**Acceptance criteria:**
- [ ] Editing persists changes; `updatedAt` advances; list reflects them.
**Verification:** Edit a note → changes visible after save.
**Dependencies:** T4, T5. **Files:** `app/notes/[id]/edit/*`, `app/actions.ts`. **Scope:** M.

## Task 7: Delete a note
**Description:** `deleteNote` action + confirm control; revalidate list.
**Acceptance criteria:**
- [ ] Deleting removes the note; list updates; no orphaned UI.
**Verification:** Delete → note gone after refresh/revalidate.
**Dependencies:** T5. **Files:** note card component, `app/actions.ts`. **Scope:** S.

### Checkpoint: Core CRUD
- [ ] Create / read / update / delete all work end-to-end against Postgres.

### Phase 2: Organization & Search

## Task 8: Filter by category
**Description:** Category chips/select driving `?category=` → filtered `listNotes`.
**Acceptance criteria:**
- [ ] Selecting a category shows only its notes; "All" clears the filter.
**Verification:** Toggle categories → list narrows correctly; URL reflects state.
**Dependencies:** T5. **Files:** `app/page.tsx`, filter component, `database/notes.ts`. **Scope:** M.

## Task 9: Search notes
**Description:** Debounced text input → `?q=` → case-insensitive `contains` on
title/content, combinable with the category filter.
**Acceptance criteria:**
- [ ] Typing filters results; combining with a category ANDs both; empty state on no match.
**Verification:** Search term narrows list; works alongside category filter.
**Dependencies:** T8. **Files:** search component, `app/page.tsx`, `database/notes.ts`. **Scope:** M.

### Checkpoint: Organization
- [ ] Filter + search compose correctly and are reflected in the URL.

### Phase 3: Polish

## Task 10: Loading & error states
**Description:** `loading.tsx` / `error.tsx`, empty states, and inline action-error feedback.
**Acceptance criteria:**
- [ ] Navigation shows loading UI; a thrown data error renders a recoverable error UI.
**Verification:** Throttle/force-error → correct UI appears.
**Dependencies:** T5. **Files:** `app/loading.tsx`, `app/error.tsx`, components. **Scope:** S.

## Task 11: Responsive pass
**Description:** Mobile→desktop layout, keyboard-accessible controls, sensible tap targets.
**Acceptance criteria:**
- [ ] Usable at 375px and 1280px; no horizontal scroll; controls reachable by keyboard.
**Verification:** Manual check at both widths.
**Dependencies:** T5–T9. **Files:** layout + components. **Scope:** S.

## Task 12: INSTRUCTIONS.md (submission requirement)
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
| Next.js 16 API drift (async `params`/`searchParams`, Server Actions, caching/`revalidatePath`) differs from training data | High | Consult `node_modules/next/dist/docs/` + verify each API at implementation time (AGENTS.md warning). Build one slice end-to-end first (T4/T5) to surface surprises early. |
| Postgres not running → migrations blocked | Med | `docker-compose.yml` provided; document `docker compose up -d` in INSTRUCTIONS. |
| Prisma v6 `package.json#prisma` config deprecated (gone in v7) | Low | Task 1 decision. |
| Scope creep vs limited time | Med | Prioritize Phases 0–1; treat 2 as differentiators, 3 as polish. Stop line is the user's call. |

## Decisions (resolved)
1. **Mutations:** Server Actions + RSC reads.
2. **Validation:** Zod at the action boundary.
3. **Prisma config deprecation:** Deferred — documented in `database/SPEC.md` (migrate to `prisma.config.ts` before upgrading to Prisma 7).

## Open Questions
- **Stop line / scope:** plan is **approved** but implementation is **not started**. How
  far to build (core CRUD → search/filter → full polish) is your call when you're ready
  to kick off. Suggested order per the phases above.
