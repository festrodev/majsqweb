# majsqweb

The web face of **maj$q** — the agent that plans your night out from inside
your group chat.

Same agent as the Telegram bot, same three steps, rendered as a browser
conversation instead of inline keyboards: pick a window, pick a category, let
it read what you already said, get three real events and a map.

Part of the [maj$q](https://github.com/festrodev/majsq) project, built at the
AI Tinkerers "Agents, Everywhere" hackathon, Montréal, 12 September 2026.

| Repo | What it is |
|---|---|
| [`majsq`](https://github.com/festrodev/majsq) | The agent. Brain, catalog access, conversation store, HTTP contract. |
| **`majsqweb`** | This. Next.js 16 + CopilotKit. |
| [`majsqbot`](https://github.com/festrodev/majsqbot) | The Telegram surface. |

## Read first

This repo follows the shared docs in `majsq`:
[`DESIGN.md`](https://github.com/festrodev/majsq/blob/main/docs/DESIGN.md)
(tokens, strings, the five components) ·
[`CONTRACT.md`](https://github.com/festrodev/majsq/blob/main/docs/CONTRACT.md)
(the API) ·
[`TEAM.md`](https://github.com/festrodev/majsq/blob/main/docs/TEAM.md).
The ready-to-paste session prompt for this repo is
[`docs/prompts/web.md`](https://github.com/festrodev/majsq/blob/main/docs/prompts/web.md).

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · CopilotKit 1.71 ·
AG-UI client · MapLibre GL.

## Pages

| Route | What it does |
|---|---|
| `/` | Welcome. Sign in with Festro is offered and emphasized, never required. |
| `/chat` | The conversation. Chips for the window and category, clarifying questions as human-in-the-loop actions, three pick cards rendered as generative UI. |
| `/m/[share_id]` | The map behind a share link. Public event fields only. |
| `/settings` | Connections and notifications. |
| `/connect` | Starts the Festro connect handshake (PKCE) and redirects to Festro. |
| `/connect/callback` | Verifies `state`, has the agent link the account, shows who is connected. |

## Run it

The agent has to be running first — see the
[majsq README](https://github.com/festrodev/majsq#run-it). It works offline
with `FESTRO_MOCK=1`, so you don't need any Festro credentials.

```bash
cp .env.example .env.local     # set MAJSQ_SERVICE_SECRET to match the agent
npm install
npm run dev                    # http://localhost:3000
```

## How it talks to the agent

The browser never holds a secret and never calls Festro. Route handlers under
`src/app/api/` add the service secret server-side and proxy to the agent:

```
browser ──► /api/turn (route handler) ──► agent POST /api/turn/ ──► Festro
```

CopilotKit's runtime lives at `src/app/api/copilotkit/[[...slug]]/route.ts` and
registers the agent as a remote AG-UI agent. The model key stays on the server
there too.

MIT licensed.

## UI/UX prototype

Open `http://localhost:3000/?mock` after `npm run dev` (use the port printed
by Next.js if 3000 is occupied). This mode needs no agent, account, or API key.
The original root page remains available without the `mock` query parameter.

The three onboarding screens collect a name, interests, and an optional note.
“Connect Festro” and the guest button both simulate sign-in. The profile is
saved in browser local storage; **Reset demo** clears it and restarts onboarding.
Agenda changes and chat messages last for the current page session only.

The dashboard uses a real OpenStreetMap map and three fictional
activities on September 12, 2026. Select a card or pin to inspect it, add it to
the agenda, or use the chat suggestions for scripted replies. French is the
default; the header switches language and theme. On phones, use the Map, Picks,
Agenda, and Chat tabs. Motion respects reduced-motion preferences.

Checks: `npm run lint`, `npx tsc --noEmit`, and
`node --experimental-strip-types tests/mock.test.mjs` (Node 22.6+), and
`node --conditions=react-server tests/connect.test.mjs` for the connect handshake.
Production build: `npm run build`; `npm run build -- --webpack` is an alternate
for environments that restrict Turbopack's internal port binding. The shared font stylesheet falls back to system fonts when offline.

The map-first refinement moves language, appearance, and reset into the settings
drawer. Calendar, events, and music connections can be toggled locally; reminder
preferences default to 17:00. These controls simulate session-only settings and
never connect accounts or schedule real notifications.

The map now uses the installed MapLibre renderer with standard OpenStreetMap
raster tiles (no API key), browser caching, and visible attribution. Network
access is required for map tiles; the remaining experience stays mocked. Pins
are approximate demonstration locations, not verified event listings. Map
selection follows recommendation/chat choices. The agenda is a read-only
calendar for the demo evening (15:00–24:00) with a fixed demo time of 15:30; picks
added from the map appear as removable events. Settings use EN | FR and named
appearance buttons.
