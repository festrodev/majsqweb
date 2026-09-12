import type { CSSProperties } from "react";
import { calendar, picks, type Locale } from "./data";

const first = 15, last = 23, now = "15:30";
// Minutes since the first hour on the grid; CSS turns them into a share of the grid's height.
const at = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m - first * 60; };
const place = (from: string, to = from) => ({ "--at": at(from), "--len": at(to) - at(from) }) as CSSProperties;

export default function Agenda({ ids, add, remove, locale }: { ids: string[]; add: (id: string) => void; remove: (id: string) => void; locale: Locale }) {
  const t = (fr: string, en: string) => locale === "fr" ? fr : en;
  // Picks not yet added sit in their free slot as suggestions, so the gaps between plans are one tap from filled.
  const events = [
    ...calendar.map(e => ({ id: e.id, name: e.name[locale], time: e.time, end: e.end, kind: "busy" })),
    ...picks.map(p => ({ id: p.id, name: p.name, time: p.time, end: p.end, kind: ids.includes(p.id) ? "added" : "suggested" })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  return <section className="agenda panel calendar-agenda" aria-label="Agenda">
    <div className="section-label"><span>{t("CE SOIR", "TONIGHT")}</span><span>{calendar.length + ids.length} {t("PRÉVUS", "PLANNED")}</span></div>
    <div className="calendar-grid" style={{ "--hours": last - first, "--span": (last - first) * 60 } as CSSProperties}>
      {Array.from({ length: last - first }, (_, i) => <span className="calendar-hour" key={i} style={place(`${first + i}:00`)}>{first + i}:00</span>)}
      <div className="calendar-now" style={place(now)}><time>{now}</time><span className="sr-only">{t("Heure de démo", "Demo time")}</span></div>
      <ol>{events.map(e => <li className={`calendar-event ${e.kind}`} key={e.id} style={place(e.time, e.end)}>
        <strong>{e.name}</strong><time>{e.time}–{e.end}</time>
        {e.kind === "added" && <button onClick={() => remove(e.id)} aria-label={`${t("Retirer", "Remove")} ${e.name}`}>×</button>}
        {e.kind === "suggested" && <button onClick={() => add(e.id)} aria-label={`${t("Ajouter", "Add")} ${e.name}`}>+</button>}
      </li>)}</ol>
    </div>
  </section>;
}
