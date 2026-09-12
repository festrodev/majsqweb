/**
 * Who the browser is, decided on the server.
 *
 * A random id in an httpOnly cookie. It is the conversation id AND the
 * participant id for the web surface (CONTRACT.md §Identity). The browser can
 * read nothing and forge nothing.
 */

import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "majsq_session";

function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Read the session id, minting one if this is a first visit. */
export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = newId();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}
