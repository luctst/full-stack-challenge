# Spec: TODO Data Model (Prisma)

## Objective
Introduce the persistence layer by defining a Prisma schema. The app is a **TODO**
(not a full note-taking app): the `Note` model represents a to-do item whose text lives
in **`label`**, optionally **organized by a `Category`**. This is the foundation the
rest of the app (CRUD, organization, filter/search) builds on.

A to-do can be **created, edited, deleted, marked complete** and **organized by a
category**. Success = a valid Prisma schema that generates a typed client and models
the domain.

## Tech Stack
- Next.js 16.2.9 / React 19 / TypeScript 5 (existing scaffold)
- **Prisma** ORM + `@prisma/client` (new dependency — see Boundaries)
- **PostgreSQL** datasource

## Commands
```bash
# Install (adds prisma tooling)
npm install -D prisma
npm install @prisma/client

# Validate & format the schema
npx prisma validate
npx prisma format

# Generate the typed client (no DB needed)
npx prisma generate

# Create/apply the first migration (needs a running Postgres)
npx prisma migrate dev --name init_todo_model

# Prepopulate a few starter categories (needs the migration applied)
npx prisma db seed
```

## Project Structure
```
notes-app/
  database/
    SPEC.md            → this spec
    schema.prisma      → datasource, generator, Note + Category models
    seed.ts            → prepopulates a few Category rows (simple, categories only)
    migrations/        → generated SQL migrations (created by migrate dev)
  .env                 → DATABASE_URL (gitignored)
  .env.example         → committed template for DATABASE_URL
  package.json         → adds `prisma.schema` path + prisma deps
```
The schema lives in `database/` (not the default `prisma/`) via a
`"prisma": { "schema": "database/schema.prisma" }` entry in `package.json`.

## Data Model

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// A user-managed topic that groups to-dos. One category has many to-dos.
model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  notes     Note[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Note {
  id         String    @id @default(cuid())
  label      String                      // the to-do item's text (required)
  done       Boolean   @default(false)    // completion state
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId String?                     // FK — nullable; SetNull on category delete
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([categoryId]) // fast filtering by topic
  @@index([createdAt])  // fast sorting (newest first)
  @@index([label])      // fast label filtering / search
}
```

### Decisions
- **`label` = indexed, required `String`** — holds the to-do's text (the app is a
  TODO, so this is the core field). Indexed (`@@index([label])`) to speed up
  label-based filtering and exact/prefix lookups. (A substring `%term%` search would
  need a Postgres trigram/GIN index — out of scope for now.)
- **No `title` / `content`** — removed in the TODO pivot; a to-do is just its `label`
  plus an optional `category`.
- **`done` = `Boolean @default(false)`** — completion state; new to-dos start active.
  No index (booleans have low selectivity, so Postgres rarely benefits from one).
- **`category` = relational `Category` model** (one-to-many). User-manageable topics
  with a unique `name`; a to-do references at most one via a nullable, indexed
  `categoryId`. `onDelete: SetNull` keeps to-dos when their category is deleted.
- **`id` = `cuid()`** — collision-resistant, URL-safe, Prisma-idiomatic.
- **timestamps** — `createdAt` / `updatedAt` for sorting and audit.

### Known simplification & upgrade path
`label` is a plain string (the to-do text). If free-form tagging is later needed, a
separate `Label` model + many-to-many is the upgrade path. Deleting a category nulls
its to-dos' FK (`onDelete: SetNull`) rather than deleting them.

## Testing Strategy
No unit tests for a schema. Verification is via Prisma's own tooling:
- `npx prisma validate` — schema is syntactically & semantically valid.
- `npx prisma format` — canonical formatting, no diffs.
- `npx prisma generate` — typed client generates without error.

## Boundaries
- **Always:** keep the schema formatted (`prisma format`); index columns used for
  filter/sort; keep secrets out of git (`.env` stays ignored).
- **Ask first:** adding dependencies (prisma/@prisma/client — approved as inherent to
  this task); changing the category model or its relations; running migrations against
  any shared DB.
- **Never:** commit `.env` / real `DATABASE_URL`; hand-edit generated migration SQL
  after it's applied.

## Success Criteria
- [ ] `database/schema.prisma` defines `Note` (required `label`, `done` flag, optional category) and `Category` models (one-to-many).
- [ ] `package.json` points Prisma at `database/schema.prisma`.
- [ ] `npx prisma validate` passes.
- [ ] `npx prisma format` produces no changes.
- [ ] `npx prisma generate` succeeds (typed client available).
- [ ] `database/seed.ts` prepopulates a few categories.
- [ ] `.env.example` documents `DATABASE_URL`; `.env` is gitignored.

## Open Questions
- Category FK: currently **optional** (`categoryId String?`, `onDelete: SetNull`) so
  to-dos can be uncategorized — switch to a **required** relation if every to-do must
  belong to a category.
- Rename the model `Note` → `Todo` to match the domain? (Kept as `Note` for now.)

## Local Postgres (docker-compose)

A `docker-compose.yml` at the project root spins up a local Postgres 16 instance
matching the credentials in `.env.example`.

```bash
docker compose up -d          # start Postgres
npx prisma migrate dev --name init_todo_model   # create tables
npx prisma db seed            # prepopulate categories
docker compose down           # stop (add -v to wipe data)
```

## Known follow-ups
- **Prisma config deprecation (deferred).** Prisma warns that the
  `package.json#prisma` config block is deprecated and will be removed in
  **Prisma 7**. We deliberately keep it for now (works fine on the installed
  v6.19.3). **Migration path when upgrading to v7:** move the schema pointer to a
  `prisma.config.ts` file and, because that disables Prisma's automatic `.env`
  loading, call Node's built-in `process.loadEnvFile()` in that config (zero new
  dependencies). Tracked as Task 1 in `docs/PLAN.md`.
