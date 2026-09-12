/**
 * The Festro connect handshake (CONTRACT.md §Connecting a member's Festro account).
 *
 * PKCE S256. The verifier and state must stay server-side, but this app has no
 * server-side store and may run on several instances, so they ride in an
 * httpOnly cookie sealed with AES-256-GCM: the browser carries bytes it can
 * neither read nor forge.
 */

import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const CONNECT_COOKIE = "majsq_connect";

// Festro exact-matches this string. Both values are registered with Festro.
export const REDIRECT_URI =
  process.env.NODE_ENV === "production"
    ? "https://majsq.festro.com/connect/callback"
    : "http://localhost:3000/connect/callback";

type Pending = { state: string; verifier: string };

function key(): Buffer {
  const secret = process.env.MAJSQ_SERVICE_SECRET ?? "";
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("MAJSQ_SERVICE_SECRET is required to seal the connect cookie");
  }
  return createHash("sha256").update(`majsq-connect:${secret}`).digest();
}

export function seal(pending: Pending): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(pending)), cipher.final()]);
  return [iv, body, cipher.getAuthTag()].map((b) => b.toString("base64url")).join(".");
}

export function unseal(value: string | undefined): Pending | null {
  try {
    const [iv, body, tag] = (value ?? "").split(".").map((s) => Buffer.from(s, "base64url"));
    // A fixed tag length stops a truncated tag from being accepted.
    const decipher = createDecipheriv("aes-256-gcm", key(), iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    const pending = JSON.parse(Buffer.concat([decipher.update(body), decipher.final()]).toString());
    return typeof pending?.state === "string" && typeof pending?.verifier === "string" ? pending : null;
  } catch {
    return null;
  }
}

/** A fresh handshake: where to send the member, and the sealed cookie to hold meanwhile. */
export function start(): { url: string; cookie: string } {
  const verifier = randomBytes(48).toString("base64url"); // 64 url-safe chars
  const state = randomBytes(24).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url"); // unpadded
  const query = new URLSearchParams({
    client_id: "fc_majsq",
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge: challenge,
  });
  return { url: `https://festro.com/connect/authorize?${query}`, cookie: seal({ state, verifier }) };
}
