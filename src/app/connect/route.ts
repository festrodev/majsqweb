/**
 * /connect — start the Festro handshake and send the member to Festro.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONNECT_COOKIE, start } from "@/lib/connect";
import { getSessionId } from "@/lib/session";

export async function GET() {
  // The callback links this session, so it has to exist before we leave.
  await getSessionId();
  const { url, cookie } = start();
  (await cookies()).set(CONNECT_COOKIE, cookie, {
    httpOnly: true,
    // Lax still sends it on Festro's top-level redirect back to the callback.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/connect",
    maxAge: 60 * 10,
  });
  redirect(url);
}
