export type Locale = "fr" | "en";
export type Interest = "food" | "events" | "sports";
export type Profile = { name: string; interests: Interest[]; note: string; locale: Locale };
export const storageKey = "majsq.mock.profile.v1";
export const interests: Interest[] = ["food", "events", "sports"];
export const picks = [
  { id: "food", name: "Le petit rendez-vous", venue: "Bistro du Plateau", time: "18:00", end: "19:00", longitude: -73.5817, latitude: 45.5245,
    fr: "Une table, de bonnes conversations et une soirée qui commence doucement.", en: "A little table, good conversation, and an easy start to your evening.",
    address: "Avenue du Mont-Royal · Plateau", category: { fr: "À table", en: "Food & friends" } },
  { id: "events", name: "Jazz sous les étoiles", venue: "Square Saint-Louis", time: "20:00", end: "21:00", longitude: -73.5694, latitude: 45.5171,
    fr: "Un concert intime en plein air. Viens pour la musique, reste pour les rencontres.", en: "An intimate outdoor set. Come for the music, stay for the conversation.",
    address: "Rue Saint-Denis · Le Plateau", category: { fr: "Musique & rencontres", en: "Music & meetups" } },
  { id: "sports", name: "Un match au parc", venue: "Parc La Fontaine", time: "16:00", end: "17:00", longitude: -73.5698, latitude: 45.5274,
    fr: "Un match amical, tous niveaux. Juste une bonne raison de sortir jouer.", en: "A friendly pickup game for every level. A good reason to get outside.",
    address: "Avenue du Parc-La Fontaine", category: { fr: "On bouge", en: "Get moving" } },
] as const;
// ponytail: fixed demo calendar; a real one comes from the user's calendar provider.
export const calendar = [
  { id: "coffee", name: { fr: "Café avec Sam", en: "Coffee with Sam" }, time: "15:00", end: "15:45" },
  { id: "call", name: { fr: "Appel avec maman", en: "Call with Mom" }, time: "17:15", end: "17:45" },
  { id: "walk", name: { fr: "Balade au canal", en: "Canal walk" }, time: "21:30", end: "22:30" },
] as const;

export function readProfile(raw: string | null): Profile | null {
  try {
    const p = JSON.parse(raw ?? "null");
    if (!p || typeof p.name !== "string" || !p.name.trim() || p.name.length > 40 ||
      !Array.isArray(p.interests) || !p.interests.length || !p.interests.every((i: Interest) => interests.includes(i)) ||
      typeof p.note !== "string" || p.note.length > 300 || !["fr", "en"].includes(p.locale)) return null;
    return p;
  } catch { return null; }
}

// ponytail: scripted demo replies only; real intent handling belongs to the agent.
export function replyTo(text: string, locale: Locale) {
  const q = text.toLowerCase();
  const pick = /\b(sports?|match|play|jouer)\b/.test(q) ? picks[2] : /\b(jazz|music|musique|concert)\b/.test(q) ? picks[1] : /\b(food|eat|dinner|resto|restaurant|manger|table)\b/.test(q) ? picks[0] : null;
  return { id: pick?.id, text: pick ? `${pick.name} · ${pick.time}. ${pick[locale]}` : locale === "fr"
    ? "On commence par un dîner, un concert ou un match ? Choisis une idée sur la carte pour en savoir plus, puis ajoute-la à ton agenda."
    : "Shall we start with dinner, live music, or a game? Choose a pick on the map to explore it, then add it to your agenda." };
}
