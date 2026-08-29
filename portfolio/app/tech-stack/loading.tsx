export default function TechStackLoading() {
  return (
    <>
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="mb-12 h-4 w-28 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />

          <div className="max-w-3xl">
            <div className="h-3 w-16 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="mt-5 h-[56px] w-64 animate-pulse rounded-2xl bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="mt-6 h-5 w-full max-w-xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-14">
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="flex flex-col gap-7">
                <div className="flex items-baseline justify-between gap-4 border-b border-line/50 pb-4 dark:border-line-dark/50">
                  <div className="h-6 w-32 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                  <div className="h-3 w-12 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {Array.from({ length: group === 3 ? 3 : 6 + group }).map(
                    (_, pill) => (
                      <div
                        key={pill}
                        className="h-[38px] animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt"
                        style={{ width: `${88 + ((pill * 37) % 72)}px` }}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
