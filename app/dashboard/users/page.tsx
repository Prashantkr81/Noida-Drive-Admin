'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AdminUser,
  subscribeToAllUsers,
} from '@/services/firebase/users';

export default function UsersPage() {
  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  useEffect(() => {
    const unsubscribe =
      subscribeToAllUsers(
        (data) => {
          setUsers(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            'ADMIN USERS PAGE ERROR:',
            firebaseError,
          );

          setError(
            'Unable to load users.',
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const filteredUsers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return users;
      }

      return users.filter(
        (user) =>
          (user.name || '')
            .toLowerCase()
            .includes(value) ||
          (user.email || '')
            .toLowerCase()
            .includes(value) ||
          (user.phone || '')
            .toLowerCase()
            .includes(value) ||
          user.id
            .toLowerCase()
            .includes(value),
      );
    }, [users, search]);

  const adminCount =
    users.filter(
      (user) =>
        user.role === 'admin',
    ).length;

  const regularUserCount =
    users.length - adminCount;

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Users
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage registered Noida Drive users.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Users
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {users.length}
          </p>
        </div>
      </div>

      {/* Summary */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Regular Users"
          value={regularUserCount}
          className="border-slate-200 bg-white"
          valueClassName="text-slate-900"
        />

        <SummaryCard
          label="Administrators"
          value={adminCount}
          className="border-cyan-200 bg-cyan-50"
          valueClassName="text-cyan-700"
        />
      </div>

      {/* Search */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by name, email, phone or user ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch('')
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading users...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
              ◉
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Users Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {search
                ? 'No users match your search.'
                : 'No user documents exist in Firestore yet.'}
            </p>
          </div>
        )}

      {/* Table */}

      {!loading &&
        !error &&
        filteredUsers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      User
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      User ID
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(
                    (user) => {
                      const displayName =
                        user.name ||
                        'Unnamed User';

                      const initial =
                        (
                          user.name ||
                          user.email ||
                          'U'
                        )
                          .charAt(0)
                          .toUpperCase();

                      const isAdmin =
                        user.role ===
                        'admin';

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-600">
                                {initial}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {displayName}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {user.email ||
                                    'No email'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs text-slate-500">
                              {user.phone ||
                                'No phone'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                isAdmin
                                  ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                  : 'border-slate-200 bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isAdmin
                                ? 'Admin'
                                : 'User'}
                            </span>
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate text-xs text-slate-400">
                              {user.id}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboard/users/${user.id}`}
                              className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

/* ===================================== */
/* SUMMARY CARD */
/* ===================================== */

function SummaryCard({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: number;
  className: string;
  valueClassName: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${className}`}
    >
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}