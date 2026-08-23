export default function ContactLoading() {
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
          <div className="flex flex-col gap-16">
            <div className="rounded-[28px] border border-line/70 p-6 sm:p-8 md:p-10 dark:border-line-dark/70">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="h-16 animate-pulse rounded-apple-sm bg-surface-alt dark:bg-surface-dark-alt" />
                <div className="h-16 animate-pulse rounded-apple-sm bg-surface-alt dark:bg-surface-dark-alt" />
              </div>
              <div className="mt-6 h-32 animate-pulse rounded-apple-sm bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-6 h-11 w-36 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            </div>

            <div className="rounded-[28px] border border-line/70 p-7 sm:p-8 md:p-10 dark:border-line-dark/70">
              <div className="h-3 w-24 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-3 h-7 w-72 max-w-full animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
              <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
