# Getting Started with notes-app

## What is this?

A TODO app—built on a solid backend foundation. A to-do is a required **label** (its text), optionally organized by a **Category**, with **create, read, update, delete, and mark-complete** operations. The backend and database layer are complete and verified; the interactive UI is coming next (see "Current Status" below).

## Tech Stack

- **Next.js 16.2.9** — React App Router (full-stack framework)
- **React 19.2.4** — UI
- **TypeScript 5** — type safety
- **Prisma 6.19.3** — ORM and schema management
- **PostgreSQL 16** — persistent data store
- **Zod 4.4.3** — runtime schema validation
- **Tailwind CSS v4** — styling
- **tsx 4.23.0** — TypeScript script runner (for the seed)

## Prerequisites

Before you start, have these installed:

- **Node.js** (v18+, project targets @types/node 20)
- **npm** (comes with Node)
- **Docker & Docker Compose** (required to run PostgreSQL locally)

To check:
```bash
node --version    # Should be v18+
npm --version     # Should be v8+
docker --version  # Should exist
```

## Getting Started (5 minutes)

Follow these steps in order. Each command is explained below.

```bash
# 1. Clone and enter the directory
cd notes-app

# 2. Install dependencies
npm install

# 3. Set up the environment file
cp .env.example .env

# 4. Start PostgreSQL (runs in the background)
docker compose up -d

# 5. Apply database migrations
npm run db:migrate

# 6. Seed the database with initial categories
npm run db:seed

# 7. Start the dev server
npm run dev
```

Open http://localhost:3000 in your browser. The page is live; changes to code auto-reload.

### Step-by-step Explanation

| Command | What it does |
|---------|------------|
| `npm install` | Fetches Next.js, React, Prisma, and other dependencies from npm. |
| `cp .env.example .env` | Copies the environment template. `DATABASE_URL` already points to the local Postgres service in `docker-compose.yml`. |
| `docker compose up -d` | Starts a PostgreSQL 16 container called `notes-app-db` on port 5432 and runs it in the background. The `-d` flag means "detached." |
| `npm run db:migrate` | Applies pending database migrations (currently, the initial schema that creates `Note` and `Category` tables). Run this only once; Prisma tracks applied migrations. |
| `npm run db:seed` | Inserts a few seed categories (`Work`, `Family`, `Personal`) into the database so you have something to organize notes with. |
| `npm run dev` | Starts Next.js dev server with hot-reload. Changes to files are reflected instantly. |

### Stopping the Database

When done for the day:
```bash
docker compose down
```

This shuts down the Postgres container cleanly. Your data persists in Docker's volume and will be there next time you run `docker compose up -d`.

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server with hot-reload (http://localhost:3000). |
| `npm run build` | Create an optimized production build (runs TypeScript checks and bundling). |
| `npm run start` | Serve the production build (requires `npm run build` first). |
| `npm run lint` | Run ESLint to check code style. |
| `npm run db:generate` | Regenerate the Prisma client (run this after editing `database/schema.prisma`). |
| `npm run db:migrate` | Apply pending migrations or create a new one. |
| `npm run db:seed` | Run `database/seed.ts` to populate the database. |
| `npm run db:studio` | Open Prisma Studio in your browser to inspect and edit database records interactively (http://localhost:5555). |

## Project Structure

```
notes-app/
├── app/
│   ├── page.tsx                    # Main page (currently the default scaffold; TODO UI coming)
│   ├── layout.tsx                  # Root layout (HTML wrapper, global CSS)
│   └── actions.ts                  # Server Actions: createNote, updateNote, toggleNote, deleteNote
├── lib/
│   └── prisma.ts                   # Shared Prisma client singleton (prevents dev hot-reload connection leaks)
├── database/
│   ├── schema.prisma               # Data model: Category and Note tables
│   ├── seed.ts                     # Seeds the initial categories (Work, Family, Personal)
│   └── migrations/
│       └── 20260706142739_init_todo_model/
│           └── migration.sql       # The migration that creates tables and indexes
├── .env.example                    # Environment template (copy to .env to use locally)
├── docker-compose.yml              # PostgreSQL service config
├── package.json                    # Dependencies and npm scripts
├── tsconfig.json                   # TypeScript config
├── INSTRUCTIONS.md                 # This file
├── AGENTS.md                       # Note: Next.js 16 has breaking API changes from older versions
└── docs/
    └── PLAN.md                     # Full implementation plan with architecture decisions and task breakdown
```

## How It Works

### Data Model

```
┌─────────────┐         ┌────────────────┐
│  Category   │         │      Note      │
├─────────────┤         ├────────────────┤
│ id (pk)     │         │ id (pk)        │
│ name        │◄────────│ label          │
│ createdAt   │ 1     * │ done           │
│ updatedAt   │         │ categoryId (fk)│
│             │         │ createdAt      │
└─────────────┘         │ updatedAt      │
                        └────────────────┘

One category has many notes.
A note optionally belongs to one category.
Deleting a category sets its notes' categoryId to null.
```

### Request & Data Flow

```
Browser                 Server (Next.js)              Database
──────────────────────────────────────────────────────────────

User submits form
  │
  ├──→ POST to Server Action (createNote)
  │       ↓
  │    Validate with Zod
  │       ↓
  │    Insert via Prisma
  │       ↓
  │    revalidatePath('/') ←──┐
  │                           │
  │  ← Responds { ok: true }  │
  │                           │
  └─────────────────────────────────────

User navigates to /
  │
  ├──→ React Server Component renders
  │       ↓
  │    Query Prisma directly
  │       │
  │       └──────────────────────→ SELECT * FROM Note...
  │                                 ↓
  │                               Return rows
  │       ←──────────────────────────┘
  │       ↓
  │    Render HTML list
  │
  └──→ Browser receives HTML (search-engine friendly, instant paint)

User checks a checkbox
  │
  ├──→ toggleNote(id, done) Server Action
  │       ↓
  │    UPDATE Note.done = !done
  │       ↓
  │    revalidatePath('/') ←────────┐
  │  ← Responds                      │
  │                                  │
  └───────────────────────────────────
       (page re-renders with updated state)
```

**Key points:**
- **Mutations** (create/update/delete) use **Server Actions** — idiomatic Next.js 16 App Router.
- **Reads** use **React Server Components** — query the database directly, no API layer.
- **Validation** happens with **Zod** at the action boundary; invalid input returns `{ ok: false, error: "..." }`.
- **Revalidation** via `revalidatePath('/')` tells Next.js to re-render the page on the next request, keeping it in sync.
- **Filter & search** (planned) will happen via URL params (`?category=Work&q=urgent`) — the RSC reads these `searchParams` and pass them to Prisma's `where` clause.

## Current Status & Roadmap

### ✅ Done (This Branch)

- Data model (Category + Note) designed and migrated to PostgreSQL.
- Three seed categories (Work, Family, Personal) ready to use.
- All four Server Actions implemented and validated with Zod (`createNote`, `updateNote`, `toggleNote`, `deleteNote`).
- `lib/prisma.ts` singleton set up to handle dev hot-reload safely.
- Backend architecture tested and ready.

### 🔨 In Progress (Next Phases)

The interactive TODO UI is being built in phases:

- **Phase 1: Core CRUD** — Create, read, update, delete, and mark-complete via the UI.
- **Phase 2: Organization & Search** — Filter by category, search by label, and compose filters.
- **Phase 3: Polish** — Loading states, error boundaries, responsive design.

Currently, `app/page.tsx` is the default Next.js scaffold; it will be replaced with the actual TODO list, add-form, and interactive components as development progresses.

### How to Explore the Backend

To see the database and Server Actions in action right now:

1. **Browse the schema and data:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio in your browser. You can inspect the seeded categories and manually add test notes to verify the schema.

2. **Review the code:**
   - `database/schema.prisma` — defines Category and Note.
   - `app/actions.ts` — the four mutations that will be called from the UI once built.
   - `database/seed.ts` — how initial data is populated.

3. **Read the full plan:**
   - `docs/PLAN.md` — detailed architecture decisions, task breakdown, and rationale.

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"

PostgreSQL is not running.

**Fix:**
```bash
docker compose up -d
docker compose ps          # Check that the container is running
```

If the container exists but is not healthy, check logs:
```bash
docker compose logs db     # Show Postgres logs
```

### "too many connections" errors during dev

This typically means the Prisma client is being recreated on each hot-reload. The singleton in `lib/prisma.ts` prevents this, but if you see it, stop the dev server and restart:
```bash
npm run dev
```

### Changes to `database/schema.prisma` not reflected

After editing the schema, regenerate the Prisma client:
```bash
npm run db:generate
```

Then restart the dev server.

### "migration pending" error

You skipped the migrate step. Run:
```bash
npm run db:migrate
```

### "migration not found" after git changes

Prisma migrated your database already, but git brought in a new migration. Inspect the situation:
```bash
npm run db:migrate         # Prisma will show you what's pending
```

## Next Steps

1. **Read the full plan:** See `docs/PLAN.md` for architecture, task list, and decisions.
2. **Explore with Prisma Studio:** Run `npm run db:studio` to browse the schema and data.
3. **Run the seed:** `npm run db:seed` to repopulate test categories anytime.
4. **Start coding the UI:** Once the next branch is ready, the Server Actions are here and ready to be called from React components.

## Questions?

If something doesn't work:
- Check the troubleshooting section above.
- Verify all prerequisites are installed (`node`, `npm`, `docker`).
- Ensure `docker compose up -d` shows the Postgres container running.
- Check the `AGENTS.md` note about Next.js 16 API differences.
- Review `docs/PLAN.md` for context on architecture and decisions.

Happy building!
