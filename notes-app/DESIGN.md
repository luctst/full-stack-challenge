# DESIGN.md — Notes App

Design plan for the Qalea note-taking challenge. Reviewed on the **brief-required** scope
(interaction states + responsive), the two axes the brief explicitly grades. Identity/IA
work was consciously deferred — see `TODOS.md`.

## Stack
Next.js 16.2.9 · React 19.2.4 · TypeScript · Tailwind v4 (`@theme` tokens in `globals.css`)
· shadcn/ui (Radix). Geist font already wired. Default shadcn visual styling (identity pass skipped).

## Resolved decisions
| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Persistence feedback | **Optimistic UI** everywhere | Brief grades "overall fluidity"; instant updates, revert + toast on failure |
| 2 | Delete | **Instant + 5s Undo toast** (no confirm dialog) | Forgiving partner to optimistic; a modal would fight the model |
| 3 | Edit / save | **Debounced autosave** with `Saving… → Saved` microcopy | No manual Save button |
| 4 | Classification | **Tags, many-to-many** | Most flexible, simplest model; filter = chip toggles |
| 5 | Mobile master-detail | **Bottom-sheet editor** (vaul Drawer) | Chosen over drill-in; mitigations below |

## Interaction state matrix
Every cell = what the USER sees. Skeletons match content shape (never bare spinners);
errors are region-scoped and NEVER discard user input; empty states always carry the next action.

```
FEATURE        | LOADING                        | EMPTY                                   | ERROR                                          | SUCCESS
---------------|--------------------------------|-----------------------------------------|------------------------------------------------|---------------------------
Notes list     | 5–6 skeleton rows (title+snippet| First run: warm headline + "Create your | Inline error card IN the list region + Retry.  | List renders newest-first,
               | bars), not a centered spinner  | first note" primary button, not "None". | Sidebar stays usable. Never blank white.       | active note highlighted
Create note    | Optimistic insert; button pending| n/a                                     | Toast "Couldn't create note." Draft kept in    | Note in list; cursor auto-
               |                                |                                         | editor — nothing typed is lost.                | focuses title field
Edit / update  | Debounced autosave "Saving…"   | n/a                                     | Banner "Changes not saved — Retry." Local      | "Saved" + relative time
               |                                |                                         | edits retained, never discarded.               | ("saved just now")
Delete note    | Row dims while pending          | n/a                                     | Toast "Couldn't delete." Row restored.         | Instant remove + Undo (5s)
Classify (tag) | Chip shows pending tick         | "Add a tag" ghost affordance on note    | Toast + chip reverts.                          | Chip appears; filter counts
               |                                |                                         |                                                | update live
Search / filter| Debounced 300ms; field spinner  | "No notes match 'query'." + Clear search| Falls back to all notes + quiet "Search        | Filtered results + count
               | only if >300ms                 | action; echo the query back.            | unavailable." Never blank.                     | ("3 of 12")
```

## Responsive layouts
```
DESKTOP ≥1024px                    TABLET 768–1023px            MOBILE <768px (bottom sheet)
┌──────────────┬────────────────┐  ┌─────────┬───────────┐      ┌────────────────┐
│ SIDEBAR ~320 │ EDITOR flex-1  │  │ SIDEBAR │ EDITOR    │      │ 🔍 search      │
│ 🔍 search    │  title         │  │ ~260 🔍 │  title    │      │ #work #ideas › │
│ #work #ideas │  body…         │  │ ▸ note  │  body…    │      │ ▸ note row     │
│ ▸ note row   │  Saving…       │  │ ▸ note  │  Saved ✓  │      │ ▸ note row (+) │
│ [+ New]      │                │  │ [+ New] │           │      └──────tap──────┘
└──────────────┴────────────────┘  └─────────┴───────────┘      → sheet ~92%, expands to 100%
 both panes visible                 both visible, tags→dropdown    when keyboard opens; scrolls;
                                                                   title + Saving pinned top
```

### Mobile bottom-sheet mitigations (it was rated 6/10 — these neutralize the risks)
- Opens tall (~92%), drag handle + scrim; **auto-expands to full height when keyboard appears**.
- Long notes scroll inside the sheet; title + `Saving…` pinned at top.
- Built on shadcn **Drawer (vaul)** → focus-trap, `Esc`-to-close, `aria-modal`, swipe-to-dismiss free.

## Accessibility floor (mostly free via Radix)
- **Keyboard:** `↑/↓` through list, `Enter` opens, `⌘/Ctrl+K` focuses search, `Esc` closes sheet/dialog.
  Visible focus ring everywhere, never stripped.
- **Screen reader:** `<nav>` sidebar + `<main>` editor landmarks. `aria-live="polite"` region
  announces `Saving…/Saved`, search result count, and every error toast.
- **Touch:** list rows, chips, FAB, delete all ≥44px.
- **Contrast:** body text ≥4.5:1 — verify shadcn `muted-foreground` before using for essential text.

## Consciously NOT done (see TODOS.md)
Visual identity / anti-slop pass (skipped by choice), emotional-journey storyboard,
empty-state personality, and a11y beyond the floor (RTL, reduced-motion).
