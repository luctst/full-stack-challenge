// Functional colour-coding for categories — helps the eye scan/group to-dos
// (as Todoist/Things do). Not decoration: it serves the "organise" requirement.
// A small fixed palette keyed by category id keeps colours stable across renders.

const PALETTE = [
  { dot: "bg-sky-500", ring: "ring-sky-500/20" },
  { dot: "bg-amber-500", ring: "ring-amber-500/20" },
  { dot: "bg-violet-500", ring: "ring-violet-500/20" },
  { dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
  { dot: "bg-rose-500", ring: "ring-rose-500/20" },
  { dot: "bg-cyan-500", ring: "ring-cyan-500/20" },
];

const NEUTRAL = { dot: "bg-muted-foreground/40", ring: "ring-border" };

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function categoryColor(categoryId: string | null): {
  dot: string;
  ring: string;
} {
  if (!categoryId) return NEUTRAL;
  return PALETTE[hash(categoryId) % PALETTE.length];
}
