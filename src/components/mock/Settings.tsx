"use client";

import { useRef, useState } from "react";
import type { Locale } from "./data";

type Props = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  theme: string;
  setTheme: (value: string) => void;
  reset: () => void;
};

export default function Settings({ locale, setLocale, theme, setTheme, reset }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [connections, setConnections] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [time, setTime] = useState("17:00");
  const t = (fr: string, en: string) => locale === "fr" ? fr : en;
  return <>
    <button className="settings-trigger" aria-label={t("Réglages", "Settings")} onClick={() => dialog.current?.showModal()}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 2-1 2 3h3l1-3 3-1 2-3-2-2 1-3-3-2-2 1-2-3Z"/><circle cx="11.5" cy="11" r="3"/></svg>
    </button>
    <dialog ref={dialog} className="settings-sheet" aria-labelledby="settings-title">
      <div className="settings-heading"><div><div className="eyebrow">{t("À TA FAÇON", "MAKE IT YOURS")}</div><h2 id="settings-title">{t("Réglages", "Settings")}</h2></div><button className="settings-close" aria-label={t("Fermer les réglages", "Close settings")} onClick={() => dialog.current?.close()}>×</button></div>
      <p className="settings-intro">{t("Un peu plus toi. Un peu moins à organiser.", "A little more you. A little less to organize.")}</p>
      <h3>{t("Connexions", "Connections")}</h3>
      {[['calendar', t("Calendrier", "Calendar"), t("Tes disponibilités, au même endroit", "Your availability, all in one place")], ['events', t("Événements", "Events"), t("Retrouve tes envies sur Festro", "Bring your Festro interests along")], ['music', t("Musique", "Music"), t("Des sorties au rythme de tes goûts", "Find nights that sound like you")]].map(([id, label, description]) => <div className="settings-row" key={id}><div><strong>{label}</strong><small>{description}</small></div><button className="connection-toggle" aria-label={`${connections.includes(id) ? t("Déconnecter", "Disconnect") : t("Connecter", "Connect")} ${label}`} aria-pressed={connections.includes(id)} onClick={() => setConnections(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])}>{connections.includes(id) ? t("Connecté ✓", "Connected ✓") : t("Connecter", "Connect")}</button></div>)}
      <h3>{t("Notifications", "Notifications")}</h3>
      <label className="settings-row"><span><strong>{t("L’envie de sortir", "Your evening nudge")}</strong><small>{t("Un rappel pour penser à ta soirée", "A reminder to make a little room for tonight")}</small></span><input type="checkbox" role="switch" checked={notifications} onChange={e => setNotifications(e.target.checked)}/></label>
      <label className="settings-row"><span><strong>{t("Heure du rappel", "Reminder time")}</strong><small>{t("Heure locale de Montréal", "Montréal local time")}</small></span><input type="time" value={time} disabled={!notifications} required onChange={e => { if (e.target.value) setTime(e.target.value); }}/></label>
      <h3>{t("Préférences", "Preferences")}</h3>
      <div className="settings-row"><strong>{t("Langue", "Language")}</strong><div className="named-options" aria-label={t("Langue", "Language")}><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button><span aria-hidden="true">|</span><button aria-pressed={locale === "fr"} onClick={() => setLocale("fr")}>FR</button></div></div>
      <div className="settings-row"><strong>{t("Apparence", "Appearance")}</strong><div className="named-options" aria-label={t("Apparence", "Appearance")}><button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>{t("Sombre", "Dark")}</button><span aria-hidden="true">|</span><button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>{t("Clair", "Light")}</button></div></div>
      <p className="settings-footnote">{t("Démo : connexions et rappels simulés pour cette session. Aucune notification réelle n’est envoyée.", "Demo: connections and reminders are simulated for this session. No real notifications are sent.")}</p>
      <button className="text-button" onClick={() => { dialog.current?.close(); reset(); }}>{t("Recommencer la démo", "Reset demo")}</button>
    </dialog>
  </>;
}
