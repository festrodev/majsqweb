/**
 * The token gallery — the design lead's working surface.
 *
 * Every color, radius and type size in the product, on one page, in both
 * themes. Change a value in globals.css and see everything that depends on it
 * move. Not linked from anywhere in the product; it is a tool, not a page.
 */

const GROUND = [
  ["night", "page background"],
  ["surface", "cards, sheets, chat bubbles"],
  ["surface-2", "hover, nested, unselected chip"],
  ["line", "borders, dividers"],
] as const;

const INK = [
  ["ink", "primary text"],
  ["ink-2", "metadata, secondary"],
  ["ink-3", "placeholders, disabled"],
] as const;

const ACCENT = [
  ["lamp", "the one accent: primary button, selected chip, map marker"],
  ["lamp-ink", "text on lamp"],
] as const;

const SEMANTIC = [
  ["ok", "confirmed"],
  ["warn", "widened, degraded"],
  ["error", "failed"],
  ["link", "inline links"],
] as const;

function Swatch({ name, note }: { name: string; note: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* The fill is an inline CSS variable, not `bg-${name}`. Tailwind can
          only generate classes it can see as complete strings at build time,
          so a template-literal class name compiles to nothing and the swatch
          renders invisible — which is exactly what happened here first. */}
      <div
        className="h-12 w-12 shrink-0 rounded-[var(--radius-input)] border border-line"
        style={{ background: `var(--majsq-${name})` }}
      />
      <div className="min-w-0">
        <div className="font-mono text-sm text-ink">--majsq-{name}</div>
        <div className="text-sm text-ink-2">{note}</div>
      </div>
    </div>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(([name, note]) => (
          <Swatch key={name} name={name} note={note} />
        ))}
      </div>
    </section>
  );
}

export default function TokensPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-2">
          maj$q · design tokens
        </p>
        <h1 className="font-display text-4xl font-bold text-ink">
          Everything the product is allowed to look like
        </h1>
        <p className="max-w-[60ch] text-ink-2">
          Defined in <code className="font-mono text-sm">src/app/globals.css</code>.
          Components use these through Tailwind utilities and never hard-code a
          hex value. Switch your OS theme to see the light set.
        </p>
      </header>

      <Group title="Ground" items={GROUND} />
      <Group title="Ink" items={INK} />
      <Group title="Accent — exactly one" items={ACCENT} />
      <Group title="Semantic — state, never decoration" items={SEMANTIC} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-ink">Type</h2>
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <p className="font-display text-4xl font-bold text-ink">
            Quoi faire ce soir ?
          </p>
          <p className="font-display text-2xl font-bold text-ink">
            3 idées pour du théâtre
          </p>
          <p className="text-lg font-semibold text-ink">Théâtre du Nouveau Monde</p>
          <p className="text-ink">
            Le corps, la voix et la lumière dans une salle de quatre cents places.
          </p>
          <p className="text-sm text-ink-2 tabular">
            samedi 13 sept. · 20:00 · Gratuit
          </p>
          <p className="font-mono text-sm text-ink-3">short_id r9e340uq</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-ink">Shape</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface px-5 py-4 text-sm text-ink-2">
            card · 12px
          </div>
          <div className="rounded-[var(--radius-chip)] border border-line bg-surface-2 px-4 py-2 text-sm text-ink">
            chip · pill
          </div>
          <div className="rounded-[var(--radius-chip)] bg-lamp px-4 py-2 text-sm font-semibold text-lamp-ink">
            chip · selected
          </div>
          <div className="rounded-[var(--radius-input)] border border-line bg-surface px-4 py-2 text-sm text-ink-3">
            input · 8px
          </div>
        </div>
      </section>
    </main>
  );
}
