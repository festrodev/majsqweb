/**
 * The server-side client for the maj$q agent.
 *
 * Everything in this file runs on the server only. The service secret and the
 * agent URL are never exposed to the browser — no `NEXT_PUBLIC_` prefix, and
 * every call goes through a route handler under `src/app/api/`.
 *
 * The contract this implements:
 * https://github.com/festrodev/majsq/blob/main/docs/CONTRACT.md
 */

import "server-only";

const AGENT_URL = (process.env.MAJSQ_AGENT_URL ?? "http://localhost:8000").replace(/\/$/, "");
const SERVICE_SECRET = process.env.MAJSQ_SERVICE_SECRET ?? "";

export type Question = {
  name: "time_slot" | "band" | "category" | "area" | "budget";
  question: string;
  options: { value: string; label: string }[];
};

export type Pick = {
  short_id: string;
  title: string;
  venue_name: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  start_datetime: string | null;
  start_time_known: boolean;
  end_datetime: string | null;
  is_free: boolean | null;
  tags: string[];
  organizer_name: string | null;
  url: string;
  why: string;
};

export type Reply = {
  text: string;
  question: Question | null;
  picks: Pick[];
  share_id: string;
  map_url: string;
  state: Record<string, unknown>;
  suggest_connect: boolean;
  poll: { question: string; options: string[] } | null;
};

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (SERVICE_SECRET) h["X-Majsq-Service-Secret"] = SERVICE_SECRET;
  return h;
}

export class AgentError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AGENT_URL}${path}`, {
      ...init,
      headers: headers(),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (cause) {
    throw new AgentError(`agent unreachable: ${String(cause)}`);
  }
  if (!response.ok) {
    throw new AgentError(`agent returned ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Advance a conversation by one turn. `sessionId` is the majsq_session cookie. */
export function turn(args: {
  sessionId: string;
  text?: string;
  chosen?: Record<string, string>;
  locale?: string;
}): Promise<Reply> {
  return call<Reply>("/api/turn/", {
    method: "POST",
    body: JSON.stringify({
      channel: "web",
      kind: "web",
      // Identity comes from the httpOnly cookie the server set — never from
      // anything the browser put in a request body. See CONTRACT.md §Identity.
      conversation_id: args.sessionId,
      participant_id: args.sessionId,
      locale: args.locale ?? "fr",
      text: args.text ?? "",
      ...(args.chosen ? { chosen: args.chosen } : {}),
    }),
  });
}

export function slots(locale = "fr") {
  return call<{ slots: { key: string; label: string; emoji: string }[]; bands: { key: string; label: string }[] }>(
    `/api/slots/?locale=${locale}`,
  );
}

export function categories(opts: { locale?: string; counts?: boolean; timeSlot?: string } = {}) {
  const q = new URLSearchParams({ locale: opts.locale ?? "fr" });
  if (opts.counts) q.set("counts", "1");
  if (opts.timeSlot) q.set("time_slot", opts.timeSlot);
  return call<{ categories: { key: string; label: string; emoji: string; count?: number }[] }>(
    `/api/categories/?${q}`,
  );
}

/** The public map-share payload. No secret required — the id is the credential. */
export function share(shareId: string) {
  return call<{ share_id: string; time_slot: string; category: string; picks: Pick[]; created_at: string }>(
    `/api/shares/${encodeURIComponent(shareId)}/`,
  );
}
