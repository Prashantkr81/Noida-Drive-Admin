import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-lg font-black tracking-tight">
              NOIDA <span className="text-cyan-400">DRIVE</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Portal
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            Noida Drive Management
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-7xl">
            Manage the entire
            <span className="block text-cyan-400">
              marketplace.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Centralized administration for vehicles, bookings,
            quotes, seller submissions, consultations, and users
            across the Noida Drive marketplace.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Access Admin Panel →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-slate-500">
          <span>© 2026 Noida Drive</span>
          <span>Admin Management Portal</span>
        </div>
      </footer>
    </main>
  );
}