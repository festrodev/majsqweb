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
