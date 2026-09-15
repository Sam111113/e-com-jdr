export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center font-sans dark:bg-black">
      <main className="flex max-w-xl flex-col items-center gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Environnement de développement — non public
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Le site est en construction
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Cette page est un socle technique provisoire (tâche T1.3). Elle
          n&apos;est accessible qu&apos;à l&apos;équipe, via le réseau privé
          Tailscale et un mot de passe, et n&apos;est pas indexée par les
          moteurs de recherche.
        </p>
      </main>
    </div>
  );
}
