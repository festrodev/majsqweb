/**
 * The browser's only way to reach the agent.
 *
 * Adds the service secret server-side and resolves identity from the cookie,
 * so neither ever travels to the client.
 */

import { NextResponse } from "next/server";
import { AgentError, turn } from "@/lib/agent";
import { getSessionId } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    chosen?: Record<string, string>;
    locale?: string;
  };
  const sessionId = await getSessionId();

  try {
    const reply = await turn({
      sessionId,
      text: body.text,
      chosen: body.chosen,
      locale: body.locale,
    });
    return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof AgentError) {
      // The user-facing string is DESIGN.md `error.agent`; the surface renders
      // it. Here we only say that the agent, not the browser, is the problem.
      return NextResponse.json({ detail: "agent_unavailable" }, { status: 502 });
    }
    throw error;
  }
}
