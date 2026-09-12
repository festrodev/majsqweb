import Link from "next/link";
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
 *
 * Every failure path names itself. The first version returned `null` for all
 * six of them and rendered one sentence — "la connexion n'a pas abouti" — so a
 * real failure was indistinguishable from an expired link, and the only way to
 * find out which had happened was to query Festro's database for an unconsumed
 * grant. A handshake with this many moving parts has to say which part moved
 * wrong.
 */

export const dynamic = "force-dynamic";

type Outcome =
  | { ok: true; name: string }
  | { ok: false; reason: Reason };

type Reason =
  | "missing_params" // Festro sent us here without ?code&state
  | "no_pending" // the sealed cookie is gone — expired, or a different browser
  | "no_session" // majsq_session missing, so we have nobody to link to
  | "state_mismatch" // the cookie is from a different handshake
  | "exchange_failed" // the agent or Festro refused the code
  | "not_connected"; // the agent answered, but said no

async function connect(code: unknown, state: unknown): Promise<Outcome> {
  if (typeof code !== "string" || typeof state !== "string") {
    return { ok: false, reason: "missing_params" };
  }

  const jar = await cookies();
  const pending = unseal(jar.get(CONNECT_COOKIE)?.value);
  const sessionId = jar.get(SESSION_COOKIE)?.value;

  if (!pending) return { ok: false, reason: "no_pending" };
  if (!sessionId) return { ok: false, reason: "no_session" };
  if (pending.state !== state) return { ok: false, reason: "state_mismatch" };

  try {
    const reply = await link({
      sessionId,
      code,
      codeVerifier: pending.verifier,
      redirectUri: REDIRECT_URI,
    });
    if (!reply.connected) return { ok: false, reason: "not_connected" };
    return { ok: true, name: reply.display_name || "Festro" };
  } catch (error) {
    // Server-side only. The code is single-use and short-lived, but it is still
    // a credential, so it never reaches the log — only which step failed.
    console.error("[connect] exchange failed:", String(error));
    return { ok: false, reason: "exchange_failed" };
  }
}

const EXPLANATION: Record<Reason, string> = {
  missing_params: "Festro ne nous a pas renvoyé de code. Recommence depuis le début.",
  no_pending:
    "Le lien a expiré, ou tu as terminé dans un autre navigateur que celui où tu as commencé.",
  no_session: "Ta session s'est perdue en chemin. Recommence depuis le début.",
  state_mismatch:
    "Une autre tentative de connexion a été démarrée entre-temps. Recommence, sans ouvrir /connect deux fois.",
  exchange_failed:
    "Festro a refusé le code — il est peut-être expiré (5 minutes). Recommence.",
  not_connected: "Festro a répondu, mais la connexion n'a pas été enregistrée.",
};

export default async function ConnectCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code, state } = await searchParams;
  const outcome = await connect(code, state);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">
        {outcome.ok
          ? `Connecté comme ${outcome.name} ✅`
          : "La connexion à Festro n'a pas abouti."}
      </h1>

      {outcome.ok ? (
        <p className="text-sm text-ink-2">
          Tes goûts comptent maintenant dans tes suggestions. Dans un groupe, touche{" "}
          <b>🙋 Utiliser mes goûts ici</b> pour les activer là-bas aussi.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-2">{EXPLANATION[outcome.reason]}</p>
          <p className="font-mono text-xs text-ink-3">{outcome.reason}</p>
          <a
            className="text-link text-sm underline-offset-4 hover:underline"
            href="/connect"
          >
            Réessayer
          </a>
        </>
      )}

      {/* `/chat` does not exist. Sending people there was the 404 that made a
          failed connection look like a broken site. */}
      <Link
        href="/"
        className="mx-auto rounded-[var(--radius-card)] bg-lamp px-5 py-3 font-semibold text-lamp-ink"
      >
        Retour à maj$q
      </Link>
    </main>
  );
}
