# Spec: Notes Data Model (Prisma)

## Objective
Introduce the persistence layer for the note-taking app by defining a Prisma
schema for a `Note` model. This is the foundation the rest of the app (CRUD,
organization, search/filter) builds on.

A note can be **created, edited, deleted**, is **organized by a category**
(topic), and carries an optional **label**. Success = a valid Prisma schema
that generates a typed client and models the domain the README asks for.

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
npx prisma migrate dev --name init_note_model
```

## Project Structure
```
notes-app/
  database/
    SPEC.md            → this spec
    schema.prisma      → datasource, generator, Note model, Category enum
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

/// High-level topic a note belongs to. Fixed set — extend as needed.
enum Category {
  PERSONAL
  WORK
  FAMILY
  IDEAS
  TODO
}

model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   @default("")
  category  Category @default(PERSONAL) // "topic"
  label     String?                     // free-form single label (see note)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])  // fast filtering by topic
  @@index([createdAt]) // fast sorting (newest first)
}
```

### Decisions
- **`category` = enum** — type-safe, self-documenting, prevents typos. Fixed
  set of real-world topics; trivially extendable. Indexed for efficient filtering.
- **`label` = `String?`** — deliberately kept simple. A single, optional,
  free-form label.
- **`id` = `cuid()`** — collision-resistant, URL-safe, Prisma-idiomatic.
- **timestamps** — `createdAt` / `updatedAt` for sorting and audit.

### Known simplification & upgrade path
`label` is a plain string, not a relational tag system. This was an explicit
choice to avoid over-engineering. **Upgrade path** if multi-tag filtering is
later required: promote to a `Label` model with a many-to-many relation
(`labels Label[]`), giving reuse, rename, and indexed tag filtering.

## Testing Strategy
No unit tests for a schema. Verification is via Prisma's own tooling:
- `npx prisma validate` — schema is syntactically & semantically valid.
- `npx prisma format` — canonical formatting, no diffs.
- `npx prisma generate` — typed client generates without error.

## Boundaries
- **Always:** keep the schema formatted (`prisma format`); index columns used
  for filter/sort; keep secrets out of git (`.env` stays ignored).
- **Ask first:** adding dependencies (prisma/@prisma/client — approved as
  inherent to this task); changing the enum value set; running migrations
  against any shared DB.
- **Never:** commit `.env` / real `DATABASE_URL`; hand-edit generated
  migration SQL after it's applied.

## Success Criteria
- [ ] `database/schema.prisma` exists with `Note` model + `Category` enum.
- [ ] `package.json` points Prisma at `database/schema.prisma`.
- [ ] `npx prisma validate` passes.
- [ ] `npx prisma format` produces no changes.
- [ ] `npx prisma generate` succeeds (typed `Note` client available).
- [ ] `.env.example` documents `DATABASE_URL`; `.env` is gitignored.

## Open Questions
- Enum values: proposed `PERSONAL | WORK | FAMILY | IDEAS | TODO` — adjust?
- Should `content` be required (no default) rather than defaulting to `""`?

## Local Postgres (docker-compose)

A `docker-compose.yml` at the project root spins up a local Postgres 16 instance
matching the credentials in `.env.example`.

```bash
docker compose up -d          # start Postgres
npx prisma migrate dev --name init_note_model   # create tables
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
