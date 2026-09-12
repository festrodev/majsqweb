import type { CSSProperties } from "react";
import { calendar, picks, type Locale } from "./data";

const first = 15, last = 24, now = "15:30";
// Minutes since the first hour on the grid; CSS turns them into offsets.
const at = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m - first * 60; };
const place = (from: string, to = from) => ({ "--at": at(from), "--len": at(to) - at(from) }) as CSSProperties;

export default function Agenda({ ids, remove, locale }: { ids: string[]; remove: (id: string) => void; locale: Locale }) {
  const t = (fr: string, en: string) => locale === "fr" ? fr : en;
  const events = [
    ...calendar.map(e => ({ id: e.id, name: e.name[locale], time: e.time, end: e.end, added: false })),
    ...picks.filter(p => ids.includes(p.id)).map(p => ({ id: p.id, name: p.name, time: p.time, end: p.end, added: true })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  return <section className="agenda panel calendar-agenda" aria-label="Agenda">
    <div className="calendar-grid" style={{ "--hours": last - first } as CSSProperties}>
      {Array.from({ length: last - first }, (_, i) => <span className="calendar-hour" key={i} style={place(`${first + i}:00`)}>{first + i}:00</span>)}
      <div className="calendar-now" style={place(now)}><time>{now}</time><span className="sr-only">{t("Heure de démo", "Demo time")}</span></div>
      <ol>{events.map(e => <li className={`calendar-event ${e.added ? "added" : ""}`} key={e.id} style={place(e.time, e.end)}>
        <strong>{e.name}</strong><time>{e.time}–{e.end}</time>
        {e.added && <button onClick={() => remove(e.id)} aria-label={`${t("Retirer", "Remove")} ${e.name}`}>×</button>}
      </li>)}</ol>
    </div>
  </section>;
}
