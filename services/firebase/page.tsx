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

  const filteredUsers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return users;
      }

      return users.filter(
        (user) =>
          (
            user.name || ''
          )
            .toLowerCase()
            .includes(value) ||
          (
            user.email || ''
          )
            .toLowerCase()
            .includes(value) ||
          (
            user.phone || ''
          )
            .toLowerCase()
            .includes(value) ||
          user.id
            .toLowerCase()
            .includes(value),
      );
    }, [
      users,
      search,
    ]);

  useEffect(() => {
    const unsubscribe =
      subscribeToAllUsers(
        (data) => {
          setUsers(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
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

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
          Management
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Users
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View registered Noida Drive users.
        </p>
      </div>

      {/* Search */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by name, email, phone or user ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
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

      {/* Summary */}

      <div className="mb-5">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredUsers.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {users.length}
          </span>{' '}
          users
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading users...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        filteredUsers.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ◉
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              No users found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try a different search.
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
                      Contact
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
                    (user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-600">
                              {(
                                user.name ||
                                user.email ||
                                'U'
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {user.name ||
                                  'Unnamed User'}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
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
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              user.role ===
                              'admin'
                                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                : 'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                          >
                            {user.role ===
                            'admin'
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
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}