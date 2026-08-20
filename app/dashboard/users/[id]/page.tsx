'use client';

import {
  doc,
  onSnapshot,
} from 'firebase/firestore';
import {
  useEffect,
  useState,
} from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  AdminUser,
} from '@/services/firebase/users';

import { db } from '@/services/firebase/config';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [user, setUser] =
    useState<AdminUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const userRef = doc(
      db,
      'users',
      id,
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setUser(null);
          setError('User not found.');
        } else {
          setUser({
            id: snapshot.id,
            ...snapshot.data(),
          } as AdminUser);

          setError('');
        }

        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'USER DETAIL ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load user.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading user...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">
          {error || 'User not found.'}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayName =
    user.name ||
    'Unnamed User';

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm font-medium text-slate-400 hover:text-slate-700"
        >
          ← Back to Users
        </button>

        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
          User Management
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {displayName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          User ID: {user.id}
        </p>
      </div>

      {/* PROFILE */}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <SectionTitle>
            Profile Information
          </SectionTitle>

          <div className="mt-6 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-xl font-bold text-cyan-600">
              {(
                displayName ||
                'U'
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {user.email ||
                  'No email'}
              </p>
            </div>

          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Info
              label="Name"
              value={
                user.name ||
                'Not specified'
              }
            />

            <Info
              label="Email"
              value={
                user.email ||
                'Not specified'
              }
            />

            <Info
              label="Phone"
              value={
                user.phone ||
                'Not specified'
              }
            />

            <Info
              label="Role"
              value={
                user.role ===
                'admin'
                  ? 'Administrator'
                  : 'User'
              }
            />

            <Info
              label="User ID"
              value={user.id}
            />

            <Info
              label="Push Tokens"
              value={String(
                user.pushTokens
                  ?.length || 0,
              )}
            />
          </div>

        </section>

        {/* ACCOUNT */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <SectionTitle>
            Account
          </SectionTitle>

          <div className="mt-5">

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Status
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-700">
                Active
              </p>
            </div>

            {user.role ===
              'admin' && (
              <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  Access
                </p>

                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  Administrator
                </p>
              </div>
            )}

          </div>

        </section>

      </div>

      {/* ACTIVITY PLACEHOLDER */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <SectionTitle>
          Marketplace Activity
        </SectionTitle>

        <p className="mt-2 text-sm text-slate-500">
          User booking, quote, sell-submission,
          and listing activity will be shown
          here.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ActivityCard
            label="Bookings"
            value="—"
          />

          <ActivityCard
            label="Quotes"
            value="—"
          />

          <ActivityCard
            label="Sell Submissions"
            value="—"
          />

          <ActivityCard
            label="Listings"
            value="—"
          />

        </div>

      </section>

      {/* NOTE */}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold text-amber-800">
          User management actions are not
          enabled yet.
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-700">
          We'll add controlled admin actions
          after the activity data layer is
          connected.
        </p>
      </section>

    </div>
  );
}

/* ===================================== */
/* HELPERS */
/* ===================================== */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-base font-bold text-slate-900">
      {children}
    </h2>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ActivityCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}