import { BarChart3 } from 'lucide-react';

export function DashboardPage() {
  return (
    <main className="min-h-full px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="heading-page">Dashboard</h1>
        <p className="mt-0.5 text-[11px] text-primary/50">Overview of your research ethics submissions</p>
      </header>

      <article className="flex flex-col items-center justify-center rounded-xl border border-primary/10 bg-white py-20 text-center shadow-sm">
        <figure className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/6" aria-hidden>
          <BarChart3 className="size-7 text-primary/30" />
        </figure>
        <h2 className="heading-section">Analytics coming soon</h2>
        <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-primary/50">
          Dashboard reporting and analytics will be available in a future release.
        </p>
      </article>
    </main>
  );
}
