'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import {
  DashboardStats,
  getDashboardStats,
} from '@/services/firebase/dashboard';

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalCars: 0,
  activeListings: 0,
  rentalRequests: 0,
  activeRentals: 0,
  completedRides: 0,
  pendingSellSubmissions: 0,
  pendingQuotes: 0,
  pendingConsultations: 0,
};

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats>(
      initialStats,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');

      const data =
        await getDashboardStats();

      setStats(data);
    } catch (err) {
      console.error(
        'DASHBOARD STATS ERROR:',
        err,
      );

      setError(
        'Unable to load dashboard statistics.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const pendingActions =
    stats.rentalRequests +
    stats.pendingSellSubmissions +
    stats.pendingQuotes +
    stats.pendingConsultations;

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your Noida Drive marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon="◉"
          loading={loading}
        />

        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          description={`${stats.totalCars} total cars`}
          icon="▣"
          loading={loading}
        />

        <StatCard
          title="Active Rentals"
          value={stats.activeRentals}
          description="Currently rented"
          icon="◷"
          loading={loading}
        />

        <StatCard
          title="Pending Actions"
          value={pendingActions}
          description="Require attention"
          icon="!"
          loading={loading}
        />
      </div>

      {/* Marketplace Summary */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SummaryPanel
          title="Rentals"
          items={[
            {
              label: 'Requests',
              value: stats.rentalRequests,
              href: '/dashboard/bookings',
            },
            {
              label: 'Active',
              value: stats.activeRentals,
              href: '/dashboard/bookings/active',
            },
            {
              label: 'Completed',
              value: stats.completedRides,
              href: '/dashboard/bookings/completed',
            },
          ]}
        />

        <SummaryPanel
          title="Marketplace"
          items={[
            {
              label: 'Cars',
              value: stats.totalCars,
              href: '/dashboard/cars',
            },
            {
              label: 'Active Listings',
              value: stats.activeListings,
              href: '/dashboard/cars',
            },
            {
              label: 'Pending Quotes',
              value: stats.pendingQuotes,
              href: '/dashboard/quotes',
            },
          ]}
        />

        <SummaryPanel
          title="Seller Activity"
          items={[
            {
              label: 'Pending Submissions',
              value:
                stats.pendingSellSubmissions,
              href: '/dashboard/sell-submissions',
            },
            {
              label: 'Pending Consultations',
              value:
                stats.pendingConsultations,
              href: '/dashboard/consultations',
            },
            {
              label: 'Total Users',
              value: stats.totalUsers,
              href: '/dashboard/users',
            },
          ]}
        />
      </div>

      {/* Attention */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Requires Attention
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Work waiting for administrator action
            </p>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
            {pendingActions} pending
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <AttentionRow
            title="Rental Requests"
            value={stats.rentalRequests}
            href="/dashboard/bookings"
          />

          <AttentionRow
            title="Sell Submissions"
            value={stats.pendingSellSubmissions}
            href="/dashboard/sell-submissions"
          />

          <AttentionRow
            title="Quotes"
            value={stats.pendingQuotes}
            href="/dashboard/quotes"
          />

          <AttentionRow
            title="Consultations"
            value={stats.pendingConsultations}
            href="/dashboard/consultations"
          />
        </div>
      </div>
    </div>
  );
}

/* ===================================== */
/* STAT CARD */
/* ===================================== */

function StatCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-600">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {loading ? '—' : value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ===================================== */
/* SUMMARY PANEL */
/* ===================================== */

function SummaryPanel({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    value: number;
    href: string;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">
        {title}
      </h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-slate-50"
          >
            <span className="text-sm text-slate-500">
              {item.label}
            </span>

            <span className="text-sm font-bold text-slate-800">
              {item.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ===================================== */
/* ATTENTION ROW */
/* ===================================== */

function AttentionRow({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:border-cyan-100 hover:bg-cyan-50/40"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Open admin work
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            value > 0
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {value}
        </span>

        <span className="text-slate-300">
          →
        </span>
      </div>
    </Link>
  );
}