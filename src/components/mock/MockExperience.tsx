"use client";

import { useEffect, useRef, useState } from "react";
import { interests, picks, readProfile, replyTo, storageKey, type Interest, type Locale, type Profile } from "./data";
import "./mock.css";
import Settings from "./Settings";
import RealMap from "./RealMap";
import Agenda from "./Agenda";

function Icon({ name = "spark" }: { name?: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "arrow" ? <path d="M5 12h14m-6-6 6 6-6 6" /> : name === "pin" ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></> : name === "food" ? <><path d="M5 3v6c0 3 5 3 5 0V3M7.5 3v18M19 21V3c-5 3-5 10 0 10"/></> : name === "sports" ? <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M6 5c8 3 8 11 0 14M18 5c-8 3-8 11 0 14"/></> : name === "events" ? <><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></> : name === "clock" ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> : name === "calendar" ?<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18m-13 5h2m4 0h2"/></> : <path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>}
  </svg>;
}

function CityMap() {
  return <svg className="city-map" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="blocks" width="65" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)"><rect width="65" height="48" fill="var(--map-color-0)"/><rect x="5" y="5" width="55" height="38" rx="3" fill="var(--map-color-1)" stroke="var(--map-color-2)" strokeWidth=".7"/><path d="M25 6v36M45 6v36M6 23h53" stroke="var(--map-color-3)"/></pattern>
      <radialGradient id="map-light"><stop stopColor="var(--map-color-4)" stopOpacity=".08"/><stop offset="1" stopColor="var(--map-color-5)" stopOpacity=".3"/></radialGradient>
    </defs>
    <rect width="1000" height="800" fill="url(#blocks)"/>
    <path d="M0 90Q160 0 260 85L330 235 235 330 120 310 0 385Z" fill="var(--map-color-6)" stroke="var(--map-color-7)" strokeWidth="3"/>
    <path d="M40 170Q110 40 210 110T230 265 65 260 40 170M65 190Q115 90 195 135T202 233 80 240Z" fill="none" stroke="var(--map-color-8)" strokeWidth="1"/>
    <path d="m580 235 118-68 77 122-117 68Z" fill="var(--map-color-9)" stroke="var(--map-color-10)" strokeWidth="3"/>
    <path d="M649 226q-30 25 6 40t16 42" fill="none" stroke="var(--map-color-11)" strokeWidth="14"/>
    <path d="M-80 760Q200 640 430 736T830 620 1100 670" fill="none" stroke="var(--map-color-12)" strokeWidth="125"/>
    <g fill="none" stroke="var(--map-color-13)" strokeWidth="4"><path d="M-30 560 920 90M80 800 1020 340M180 800 20 440 770 50M290 0 720 800M500 0 890 740"/></g>
    <g fill="none" stroke="var(--map-color-14)" strokeWidth="1" opacity=".7"><path d="M-30 560 920 90M80 800 1020 340M290 0 720 800"/></g>
    <g fontFamily="monospace" fontSize="11" letterSpacing="3" fill="var(--map-color-15)"><text x="110" y="190">MONT ROYAL</text><text x="390" y="280">LE PLATEAU</text><text x="675" y="425">LA FONTAINE</text><text x="330" y="610">LE VILLAGE</text><text x="150" y="495">MILE END</text><text x="700" y="745">SAINT-LAURENT</text></g>
    <g fontFamily="sans-serif" fontSize="9" fill="var(--map-color-16)"><text x="352" y="407" transform="rotate(-26 352 407)">Avenue du Mont-Royal</text><text x="480" y="495" transform="rotate(62 480 495)">Rue Saint-Denis</text><text x="705" y="540" transform="rotate(-26 705 540)">Rue Sherbrooke</text></g>
    <rect width="1000" height="800" fill="url(#map-light)"/>
  </svg>;
}

export default function MockExperience() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [locale, setLocale] = useState<Locale>("fr");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [chosen, setChosen] = useState<Interest[]>([]);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string>("food");
  const [agenda, setAgenda] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState("dark");
  const [mobile, setMobile] = useState("map");
  const title = useRef<HTMLHeadingElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const t = (fr: string, en: string) => locale === "fr" ? fr : en;

  // Browser storage is read after hydration so server and initial client HTML match.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = readProfile(localStorage.getItem(storageKey));
      if (saved) { setProfile(saved); setLocale(saved.locale); setSelected(saved.interests[0] ?? "food"); }
      else setLocale(navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en");
    } catch { /* Storage is optional; the demo remains usable in memory. */ }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (ready) title.current?.focus(); }, [step, profile, ready]);
  useEffect(() => { conversation.current?.scrollTo({ top: conversation.current.scrollHeight }); }, [messages]);

  function finish() {
    const p: Profile = { name: name.trim(), interests: chosen, note: note.trim(), locale };
    if (!p.name || !(p.interests.length || p.note)) return;
    try { localStorage.setItem(storageKey, JSON.stringify(p)); } catch { setNotice(t("La sauvegarde locale est indisponible. Cette session reste utilisable.", "Local storage is unavailable. You can still use this session.")); }
    setProfile(p); setSelected(chosen[0] ?? "food");
  }
  function reset() {
    try { localStorage.removeItem(storageKey); } catch { /* Reset the in-memory session too. */ }
    setProfile(null); setName(""); setChosen([]); setNote(""); setStep(0); setAgenda([]); setMessages([]); setDraft(""); setNotice(""); setMobile("map");
  }
  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const reply = replyTo(value, locale);
    setMessages(prev => [...prev, { role: "user", text: value }, { role: "assistant", text: reply.text }]);
    if (reply.id) setSelected(reply.id);
    setDraft("");
  }
  function add(id: string) {
    const p = picks.find(p => p.id === id) ?? picks[0];
    setAgenda(prev => prev.includes(id) ? prev : [...prev, id]);
    setNotice(t(`${p.name} ajouté à ton agenda.`, `${p.name} added to your agenda.`));
  }
  const pick = picks.find(p => p.id === selected) ?? picks[0];
  const ordered = [...picks].sort((a, b) => Number(profile?.interests.includes(b.id)) - Number(profile?.interests.includes(a.id)));
  return <main className={`mock-app ${profile ? "dashboard" : "onboarding"}`} data-theme={theme} lang={locale}>
    {profile ? <RealMap selected={selected} onSelect={setSelected} locale={locale}/> : <div className="world"><CityMap /></div>}
    {!profile && <header className="mock-header">
      <div className="brand" aria-label="maj$q"><span className="brand-mark"><Icon /></span>maj<span>$</span>q<span className="brand-period">.</span></div>
      <div className="location"><Icon name="pin"/> MONTRÉAL <span> / </span> {t("APRÈS LES HEURES", "AFTER HOURS")}</div>
      <div className="header-actions"><span className="demo-badge">{t("DÉMO", "DEMO")}</span><button onClick={() => setLocale(locale === "fr" ? "en" : "fr")} aria-label={t("Switch to English", "Passer en français")}>{locale === "fr" ? "EN" : "FR"}</button><button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t("Changer le thème", "Toggle theme")}>{theme === "dark" ? "☼" : "☾"}</button>{profile && <button className="reset" onClick={reset}>{t("Recommencer", "Reset demo")}</button>}</div>
    </header>}
    {profile && <Settings locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} reset={reset} />}
    {!ready ? <div className="loading">{t("On prépare ta soirée…", "Getting your evening ready…")}</div> : !profile ? <>
      <div className="ambient-orbit" aria-hidden="true"><i/><i/><i/><i/><span>✦</span></div>
      <section className="onboarding-content" key={step}>
        <div className="eyebrow">{t("MOINS PLANIFIER. PLUS VIVRE.", "LESS PLANNING. MORE LIVING.")}</div>
        {step === 0 ? <form onSubmit={e => { e.preventDefault(); if (name.trim()) setStep(1); }}>
          <h1 ref={title} tabIndex={-1}>{t("Salut 👋 Je suis", "Hi 👋 I'm")} <span>maj$q.</span><br/>{t("Et toi ?", "And you?")}</h1>
          <p>{t("Les meilleures soirées commencent par un salut.", "The best nights start with a hello.")}<br/>{t("Dis-moi ton prénom. On s’occupe de la suite.", "Tell me your name. We’ll take it from there.")}</p>
          <label className="input-label" htmlFor="name">{t("TON PRÉNOM", "YOUR FIRST NAME")}</label>
          <input id="name" className="name-input" placeholder={t("On t’appelle comment ?", "What should we call you?")} autoComplete="given-name" maxLength={40} required value={name} onChange={e => setName(e.target.value)}/>
          <button className="primary" disabled={!name.trim()}>{t("On fait connaissance", "Let’s get acquainted")}<Icon name="arrow"/></button>
        </form> : step === 1 ? <form onSubmit={e => { e.preventDefault(); if (chosen.length || note.trim()) setStep(2); }}>
          <h1 ref={title} tabIndex={-1}>{t("Alors", "So")}, {name.trim()}.<br/><span>{t("On sort pour quoi ?", "What’s your kind of night?")}</span></h1>
          <p>{t("Choisis ce qui te ressemble. Une envie, ou les trois.", "Pick what feels like you. One interest, or all three.")}</p>
          <fieldset className="interest-grid"><legend className="sr-only">{t("Tes intérêts", "Your interests")}</legend>{interests.map((id, i) => <label className={`interest ${chosen.includes(id) ? "active" : ""}`} key={id}><input type="checkbox" checked={chosen.includes(id)} onChange={() => setChosen(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])}/><Icon name={id}/><span>{[t("Restaurants", "Restaurants"), t("Événements & rencontres", "Events & meetups"), t("Événements sportifs", "Sports events")][i]}</span></label>)}</fieldset>
          <label className="input-label" htmlFor="note">{t("OU DIS-LE AVEC TES MOTS", "OR SAY IT IN YOUR OWN WORDS")}</label><textarea id="note" rows={2} maxLength={300} placeholder={t("Un quartier, une envie, un sujet de conversation…", "A neighbourhood, a mood, something to talk about…")} value={note} onChange={e => setNote(e.target.value)}/>
          <div className="step-actions"><button className="text-button" type="button" onClick={() => setStep(0)}>← {t("Retour", "Back")}</button><button className="primary" disabled={!chosen.length && !note.trim()}>{t("Ça me ressemble", "That sounds like me")}<Icon name="arrow"/></button></div>
        </form> : <div>
          <h1 ref={title} tabIndex={-1}>{t("Ta prochaine", "Your next")}<br/><span>{t("belle soirée t’attend.", "good night starts here.")}</span></h1><p>{t("Tes envies, tes idées, ton petit coin de Montréal.", "Your interests, your plans, your little corner of Montréal.")}<br/>{t("Connecte-toi pour retrouver tout ça.", "Sign in to make yourself at home.")}</p>
          <div className="login-card"><span className="login-avatar">{name.trim().slice(0, 1).toUpperCase()}</span><div><strong>{name.trim()}</strong><small>{t("Ton profil de démonstration", "Your demo profile")}</small></div><span className="check">✓</span></div>
          <button className="primary" onClick={finish}>{t("Connecter Festro", "Connect Festro")}<Icon name="arrow"/></button><button className="guest" onClick={finish}>{t("Continuer sans compte", "Continue without an account")}</button>
          <small className="login-note">{t("Connexion simulée. Aucun compte ni mot de passe nécessaire.", "Simulated sign-in. No account or password needed.")}</small><button className="text-button" onClick={() => setStep(1)}>← {t("Retour", "Back")}</button>
        </div>}
      </section>
      <footer className="onboarding-footer"><span>45.5019° N &nbsp; 73.5674° W</span><ol className="steps" aria-label={t("Progression", "Progress")}>{[t("Bonjour", "Hello"), t("Tes envies", "Your interests"), t("C’est parti", "You’re in")].map((label, i) => <li key={i} aria-current={step === i ? "step" : undefined} className={i <= step ? "current" : ""}><span>{i < step ? "✓" : `0${i + 1}`}</span>{label}</li>)}</ol><span>{t("LA VILLE EST À TOI.", "THE CITY IS YOURS.")}</span></footer>
    </> : <>
      <div className="dashboard-heading"><div><div className="eyebrow">{t("SAMEDI 12 SEPTEMBRE · SOIRÉE DÉMO", "SATURDAY, SEPTEMBER 12 · DEMO EVENING")}</div><h1 ref={title} tabIndex={-1}>{t("On sort", "Let’s go out")}, <span>{profile.name}.</span></h1><p>{t("Trois idées. Toute une soirée à inventer.", "Three little possibilities. One evening to make yours.")}</p></div><span className="tonight">◷ &nbsp; {t("Ce soir", "Tonight")}</span></div>
      <nav className="mobile-tabs" aria-label={t("Vues", "Views")}>{["map", "picks", "agenda", "chat"].map((v, i) => <button key={v} aria-pressed={mobile === v} onClick={() => setMobile(v)}>{[t("Carte", "Map"), t("Idées", "Picks"), t("Agenda", "Agenda"), "Chat"][i]}</button>)}</nav>
      <div className="dashboard-body" data-mobile={mobile}>
        <section className="recommendations" aria-label={t("Recommandations", "Recommendations")}><div className="section-label"><span><Icon/> {t("CHOISI POUR TOI", "PICKED FOR YOU")}</span><span>03</span></div>{ordered.map(p => <button className="pick" key={p.id} aria-pressed={selected === p.id} onClick={() => { setSelected(p.id); setMobile("map"); }}>
          <span className="pick-row"><strong>{p.name}</strong><span className="pick-time"><Icon name="clock"/>{p.time}</span></span>
          <span className="pick-venue"><Icon name={p.id}/>{p.venue}</span>
          <span className="pick-summary">{p[locale]}</span>
          <span className="pick-row pick-match">{profile.interests.includes(p.id) ? t("Selon tes envies", "Matches your interests") : t("À découvrir", "Something to discover")}<Icon name="pin"/></span>
        </button>)}</section>
        <section className="map-stage" aria-label={t("Détails du lieu", "Place details")}><div className="map-detail" aria-live="polite"><div className="eyebrow">{pick.category[locale]} · {pick.time}</div><h2>{pick.name}</h2><p><Icon name="pin"/>{pick.address}</p><button className="primary" disabled={agenda.includes(pick.id)} onClick={() => add(pick.id)}><Icon name="calendar"/>{agenda.includes(pick.id) ? t("Ajouté à l’agenda ✓", "Added to agenda ✓") : t("Ajouter au calendrier", "Add to calendar")}</button></div><div className="map-caption">{t("MONTRÉAL · LIEUX DE DÉMONSTRATION", "MONTRÉAL · DEMO LOCATIONS")}</div></section>
        <Agenda ids={agenda} locale={locale} add={add} remove={id => setAgenda(prev => prev.filter(value => value !== id))}/>
        <section className="chat panel" aria-label={t("Assistant de démonstration", "Demo assistant")}><div className="panel-heading"><span className="assistant-icon"><Icon/></span><div><h2>maj$q</h2><small>{t("Ton complice de sortie", "Your going-out companion")}</small></div><span className="chat-status" title={t("Démo locale", "Local demo")}/></div><div className="chat-messages" ref={conversation} role="log" aria-label={t("Conversation", "Conversation")} aria-live="polite"><div className="chat-date">{t("LE DÉBUT D’UNE BELLE SOIRÉE", "THE START OF A GOOD EVENING")}</div><div className="message assistant"><span className="message-label">maj$q</span><p>{t(`Salut ${profile.name}. J’ai trois idées pour toi, juste ici à Montréal.`, `Hey ${profile.name}. I’ve found three ideas for you, right here in Montréal.`)}</p><p>{t("On construit ta soirée ensemble ?", "Want to put an evening together?")}</p></div>{profile.note && <div className="message user"><span className="message-label">{t("TES ENVIES", "ON YOUR MIND")}</span><p>{profile.note}</p></div>}{messages.map((m, i) => <div key={i} className={`message ${m.role}`}><span className="message-label">{m.role === "user" ? profile.name : "maj$q"}</span><p>{m.text}</p></div>)}</div><div className="chat-bottom"><div className="suggestions">{[t("Un bon resto ?", "Somewhere to eat?"), t("Du jazz ce soir", "Live music tonight"), t("Un peu de sport", "A little sport")].map(s => <button key={s} onClick={() => send(s)}>{s} ↗</button>)}</div><form className="chat-input" onSubmit={e => { e.preventDefault(); send(draft); }}><label className="sr-only" htmlFor="message">{t("Ton message", "Your message")}</label><input id="message" maxLength={1000} value={draft} onChange={e => setDraft(e.target.value)} placeholder={t("Une envie ? Dis-moi…", "What are you in the mood for?")}/><button disabled={!draft.trim()} aria-label={t("Envoyer", "Send")}><Icon name="arrow"/></button></form></div></section>
      </div>
    </>}
    <div className={`notice ${notice ? "visible" : ""}`} role="status">{notice}{notice && <button onClick={() => setNotice("")} aria-label={t("Fermer", "Dismiss")}>×</button>}</div>
  </main>;
}
