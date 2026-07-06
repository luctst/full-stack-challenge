# TODOS — Design debt

Deferred during the brief-required design review. Ordered by impact on the graded UX axis.

## 1. Empty-state warmth & personality
- **What:** Give the first-run and "no results" states a voice — a line of warm copy, maybe a
  simple mark/illustration, beyond the functional "Create your first note" button already specced.
- **Why:** First impression of the app is an empty screen; warmth here is disproportionately
  memorable in a review setting.
- **Pros:** Cheap, high signal of care. **Cons:** Risks tipping into cute if overdone.
- **Context:** Functional empty states are already in DESIGN.md; this is the personality layer.
- **Depends on:** Nothing.

## 2. Emotional-journey storyboard (Pass 3, skipped)
- **What:** Map the first-5-seconds / first-5-minutes / returning-user arc and check each moment
  has a supporting design detail.
- **Why:** Surfaces friction the state matrix misses (e.g. what a returning user with 200 notes feels).
- **Pros:** Catches scale/first-run gaps early. **Cons:** More valuable once core flows exist.
- **Depends on:** Core CRUD built.

## 3. Accessibility beyond the floor
- **What:** RTL support, `prefers-reduced-motion` for the sheet/toasts, full screen-reader walkthrough.
- **Why:** The floor in DESIGN.md covers keyboard/landmarks/contrast; these are the next tier.
- **Pros:** Robustness. **Cons:** Diminishing returns for an interview deliverable.
- **Depends on:** UI implemented.

> Visual identity / anti-slop was reviewed and **explicitly skipped** — not tracked here.
