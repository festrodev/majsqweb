import { notFound } from "next/navigation";
import PickMap from "@/components/PickMap";
import { share, type Pick } from "@/lib/agent";

/**
 * /m/[share_id] — the map behind a share link.
 *
 * This is what someone taps from a Telegram group, so the constraints are not
 * the usual ones: no cookie, no login, one bar of signal, standing outside.
 *
 * The unguessable id is the credential and the payload is public event fields
 * only, so there is deliberately no auth here. The three picks are rendered
 * BOTH as markers and as a list below — the list is what a screen reader gets,
 * what a pick with no coordinates falls back to, and what still works if
 * MapLibre fails to load on a bad connection.
 */

export const dynamic = "force-dynamic";

// Every event in the catalog is in Montréal, and this page is rendered on the
// SERVER — whose clock is UTC on Cloud Run. Without an explicit zone, a show
// tonight at 21:00 formatted as "dimanche 13 sept. · 01 h 00": the right
// instant, the wrong night, on the one page people open to decide where to go.
// The zone belongs on both calls; passing it to only one produces a date and a
// time from different days, which is worse than either error alone.
const MONTREAL = "America/Montreal";

function whenLabel(pick: Pick, locale = "fr-CA") {
  if (!pick.start_datetime) return "";
  const start = new Date(pick.start_datetime);
  if (Number.isNaN(start.getTime())) return "";
  const day = start.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: MONTREAL,
  });
  // start_time_known=false means the catalog has a date but no confirmed hour.
  // Printing "00:00" there would invent a fact the source never gave.
  if (pick.start_time_known === false) return day;
  return `${day} · ${start.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: MONTREAL,
  })}`;
}

export default async function MapSharePage({
  params,
}: {
  params: Promise<{ share_id: string }>;
}) {
  const { share_id } = await params;

  let data;
  try {
    data = await share(share_id);
  } catch {
    notFound();
  }

  const picks = data.picks ?? [];
  const located = picks.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-2">
          maj$q
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">
          {picks.length === 1 ? "Une idée" : `${picks.length} idées`} pour votre soirée
        </h1>
        <p className="text-sm text-ink-2">
          Choisies dans le catalogue de Festro. Touchez un numéro pour ouvrir
          l&apos;événement.
        </p>
      </header>

      {located > 0 ? <PickMap picks={picks} /> : null}

      <ol className="flex list-none flex-col gap-3 p-0">
        {picks.map((pick, index) => (
          <li
            key={pick.short_id}
            className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4"
          >
            <span
              aria-hidden
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lamp font-display text-sm font-bold text-lamp-ink"
            >
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <a
                href={pick.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-ink underline-offset-4 hover:underline"
              >
                {pick.title}
              </a>
              <p className="text-sm text-ink-2 tabular">
                {[
                  whenLabel(pick),
                  pick.venue_name,
                  pick.is_free ? "Gratuit" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {pick.why ? (
                <p className="text-sm italic text-ink-2">{pick.why}</p>
              ) : null}
              {typeof pick.latitude !== "number" ? (
                <p className="text-sm text-ink-3">Lieu à confirmer</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-ink-3">
        <a
          className="text-link underline-offset-4 hover:underline"
          href="https://festro.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir plus sur Festro
        </a>
      </p>
    </main>
  );
}
