export default function ExperienceLoading() {
  return (
    <>
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="mb-12 h-4 w-28 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />

          <div className="flex flex-col items-center text-center">
            <div className="h-3 w-16 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="mt-5 h-[64px] w-full max-w-3xl animate-pulse rounded-2xl bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="mt-6 h-5 w-full max-w-xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pb-28">
        <div className="mx-auto w-full max-w-4xl px-6 sm:px-8">
          <div className="flex flex-col gap-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-t border-line/40 py-10 dark:border-line-dark/40 md:py-12"
              >
                <div className="grid gap-7 md:grid-cols-[170px_1fr] md:gap-12 md:pl-6">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="h-3 w-20 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  </div>

                  <div className="flex flex-col">
                    <div className="h-3 w-8 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="mt-3 h-7 w-56 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="mt-5 h-4 w-full max-w-2xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="mt-3 h-4 w-10/12 max-w-2xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="mt-6 flex gap-2">
                      <div className="h-7 w-16 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                      <div className="h-7 w-20 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                      <div className="h-7 w-14 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
