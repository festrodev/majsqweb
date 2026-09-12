/**
 * Placeholder. The real welcome screen is the first build task — see
 * docs/prompts/web.md in the majsq repo.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-4 px-5 py-16">
      <h1 className="font-display text-4xl font-bold text-ink">
        Salut 👋 Je suis maj$q.
      </h1>
      <p className="text-ink-2">
        L&apos;agent qui planifie ta soirée, depuis ta conversation de groupe.
      </p>
      <p className="text-sm text-ink-3">
        Écran d&apos;accueil à construire. Les tokens sont prêts —{" "}
        <a className="text-link underline" href="/dev/tokens">
          /dev/tokens
        </a>
      </p>
    </main>
  );
}
