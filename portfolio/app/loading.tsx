export default function HomeLoading() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-4 w-40 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          <div className="mt-6 h-[72px] w-full max-w-3xl animate-pulse rounded-2xl bg-surface-alt dark:bg-surface-dark-alt" />
          <div className="mt-7 h-8 w-[300px] max-w-full animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          <div className="mt-6 h-5 w-full max-w-xl animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          <div className="mt-9 flex gap-3">
            <div className="h-12 w-36 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
            <div className="h-12 w-36 animate-pulse rounded-full bg-surface-alt dark:bg-surface-dark-alt" />
          </div>
        </div>
      </div>
    </section>
  );
}
