import Link from 'next/link';
import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">

          {/* Logo */}

          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-sm font-bold text-white shadow-sm">
                ND
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Noida Drive
                </p>

                <p className="text-xs text-slate-400">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}

          <nav className="flex-1 px-3 py-5">

            <NavSection title="Overview">
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon="▦"
              />
            </NavSection>

            <NavSection title="Marketplace">
              <NavItem
                href="/dashboard/cars"
                label="Cars & Listings"
                icon="▣"
              />

              <NavItem
                href="/dashboard/quotes"
                label="Quotes"
                icon="◇"
              />

              <NavItem
                href="/dashboard/sell-submissions"
                label="Sell Submissions"
                icon="◆"
              />
            </NavSection>

            <NavSection title="Rentals">
                <NavItem
                    href="/dashboard/bookings"
                    label="Rental Requests"
                    icon="▤"
                />

                <NavItem
                    href="/dashboard/bookings/active"
                    label="Active Rentals"
                    icon="◷"
                />

                <NavItem
                    href="/dashboard/bookings/completed"
                    label="Completed Rentals"
                    icon="✓"
                />
            </NavSection>

            <NavSection title="Management">
              <NavItem
                href="/dashboard/users"
                label="Users"
                icon="◉"
              />

              <NavItem
                href="/dashboard/consultations"
                label="Consultations"
                icon="◎"
              />
            </NavSection>

          </nav>

          {/* Bottom */}

          <div className="border-t border-slate-200 p-4">

            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-400">
                SIGNED IN AS
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                Administrator
              </p>
            </div>

            <button
              type="button"
              className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>

          </div>
        </aside>

        {/* Main */}

        <main className="min-w-0 flex-1">

          {/* Top Bar */}

          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">

            <div>
              <p className="text-xs text-slate-400">
                Administration
              </p>

              <p className="text-sm font-semibold text-slate-800">
                Noida Drive
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                🔔
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                A
              </div>

            </div>
          </header>

          {/* Content */}

          <div className="p-6 lg:p-8">
            {children}
          </div>

        </main>

      </div>
    </div>
  );
}

/* ===================================== */
/* NAV SECTION */
/* ===================================== */

function NavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

/* ===================================== */
/* NAV ITEM */
/* ===================================== */

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400 transition group-hover:bg-white group-hover:text-cyan-600">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}