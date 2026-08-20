'use client';

import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { auth, db } from '@/services/firebase/config';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  logoutAdmin,
} from '@/services/firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [adminUser, setAdminUser] =
    useState<User | null>(null);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setIsAdmin(false);
            setAdminUser(null);
            setCheckingAuth(false);

            router.replace('/login');

            return;
          }

          try {
            const userSnapshot =
              await getDoc(
                doc(
                  db,
                  'users',
                  user.uid,
                ),
              );

            if (
              !userSnapshot.exists() ||
              userSnapshot.data()
                .role !== 'admin'
            ) {
              await logoutAdmin();

              setIsAdmin(false);
              setAdminUser(null);
              setCheckingAuth(false);

              router.replace(
                '/login',
              );

              return;
            }

            setAdminUser(user);
            setIsAdmin(true);
            setCheckingAuth(false);
          } catch (error) {
            console.error(
              'ADMIN AUTH CHECK ERROR:',
              error,
            );

            await logoutAdmin();

            setIsAdmin(false);
            setAdminUser(null);
            setCheckingAuth(false);

            router.replace('/login');
          }
        },
      );

    return unsubscribe;
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-500">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">

            <div className="border-b border-slate-200 px-6 py-6">
              <p className="text-lg font-black tracking-tight text-slate-900">
                Noida Drive
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600">
                Admin Panel
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">

              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon="⌂"
              />

              <NavItem
                href="/dashboard/users"
                label="Users"
                icon="◉"
              />

              <SectionLabel>
                Marketplace
              </SectionLabel>

              <NavItem
                href="/dashboard/cars"
                label="Cars & Listings"
                icon="🚗"
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

              <SectionLabel>
                Rentals
              </SectionLabel>

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
                label="Completed Rides"
                icon="✓"
              />

              <SectionLabel>
                Management
              </SectionLabel>

              <NavItem
                href="/dashboard/consultations"
                label="Consultations"
                icon="◎"
              />

            </nav>

            {/* ADMIN */}

            <div className="border-t border-slate-200 p-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {adminUser?.email ||
                    'Administrator'}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  Administrator
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logoutAdmin();
                  router.replace(
                    '/login',
                  );
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Sign Out
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN */}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px] p-5 sm:p-7 lg:p-8">
            {children}
          </div>
        </main>

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
    <a
      href={href}
      className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
    >
      <span className="flex w-5 justify-center text-sm">
        {icon}
      </span>

      <span>{label}</span>
    </a>
  );
}

/* ===================================== */
/* SECTION LABEL */
/* ===================================== */

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}