export default function ProjectsLoading() {
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
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="mb-5 h-px w-full bg-surface-alt dark:bg-surface-dark-alt" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-apple border border-line/70 dark:border-line-dark/70"
              >
                <div className="aspect-[16/10] w-full animate-pulse bg-surface-alt dark:bg-surface-dark-alt" />
                <div className="flex flex-col gap-3 p-6">
                  <div className="h-3 w-16 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="h-4 w-12 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  <div className="flex gap-2">
                    <div className="h-7 w-16 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                    <div className="h-7 w-14 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  </div>
                  <div className="mt-2 h-10 w-32 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
