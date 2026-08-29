export default function AboutLoading() {
  return (
    <>
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="mb-12 h-4 w-28 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />

          <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
            <div className="mx-auto w-full max-w-[360px]">
              <div className="aspect-[0.92] w-full animate-pulse rounded-[28px] bg-surface-alt dark:bg-surface-dark-alt" />
            </div>

            <div className="flex flex-col items-start">
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-5 h-[56px] w-full max-w-3xl animate-pulse rounded-2xl bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-7 h-5 w-full max-w-2xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-5 h-4 w-2/3 max-w-xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-8 h-11 w-44 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-24 md:py-28">
        <div className="mx-auto w-full max-w-4xl px-6 sm:px-8">
          <div className="flex flex-col gap-8">
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="h-[42px] w-full max-w-3xl animate-pulse rounded-2xl bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="flex max-w-2xl flex-col gap-4">
              <div className="h-4 w-full animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="h-4 w-11/12 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
