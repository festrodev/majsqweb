import { cookies } from "next/headers";
import { link } from "@/lib/agent";
import { CONNECT_COOKIE, REDIRECT_URI, unseal } from "@/lib/connect";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * /connect/callback — Festro sends the member back here with ?code&state.
 *
 * The state must match the one sealed in the connect cookie. The agent, not
 * this app, exchanges the code with maj$q's client secret. The sealed cookie
 * expires on its own after ten minutes: a page can't delete cookies, and the
 * code is single-use at Festro anyway.
 */

export const dynamic = "force-dynamic";

async function connect(code: unknown, state: unknown): Promise<string | null> {
  if (typeof code !== "string" || typeof state !== "string") return null;
  const jar = await cookies();
  const pending = unseal(jar.get(CONNECT_COOKIE)?.value);
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!pending || !sessionId || pending.state !== state) return null;
  try {
    const reply = await link({
      sessionId,
      code,
      codeVerifier: pending.verifier,
      redirectUri: REDIRECT_URI,
    });
    return reply.connected ? reply.display_name || "Festro" : null;
  } catch {
    return null;
  }
}

export default async function ConnectCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code, state } = await searchParams;
  const name = await connect(code, state);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">
        {name ? `Connecté comme ${name} ✅` : "La connexion à Festro n’a pas abouti."}
      </h1>
      {name ? null : (
        <p className="text-sm text-ink-2">
          Le lien a peut-être expiré.{" "}
          <a className="text-link underline-offset-4 hover:underline" href="/connect">
            Réessayer
          </a>
        </p>
      )}
      <a
        href="/chat"
        className="mx-auto rounded-[var(--radius-card)] bg-lamp px-5 py-3 font-semibold text-lamp-ink"
      >
        Aller au chat
      </a>
    </main>
  );
}
