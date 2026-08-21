'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AdminSellSubmission,
  SellSubmissionStatus,
  subscribeToAllSellSubmissions,
} from '@/services/firebase/sellSubmissions';

export default function SellSubmissionsPage() {
  const [submissions, setSubmissions] =
    useState<AdminSellSubmission[]>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('all');

  useEffect(() => {
    const unsubscribe =
      subscribeToAllSellSubmissions(
        (data) => {
          setSubmissions(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            firebaseError,
          );

          setError(
            'Unable to load sell submissions.',
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const filteredSubmissions =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return submissions.filter(
        (submission) => {
          const carName =
            `${submission.make} ${submission.model}`.toLowerCase();

          const sellerName =
            (
              submission.sellerName ||
              ''
            ).toLowerCase();

          const sellerEmail =
            (
              submission.sellerEmail ||
              ''
            ).toLowerCase();

          const matchesSearch =
            !value ||
            carName.includes(value) ||
            sellerName.includes(value) ||
            sellerEmail.includes(value);

          const matchesStatus =
            status === 'all' ||
            submission.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      submissions,
      search,
      status,
    ]);

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
          Marketplace
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Sell Submissions
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review vehicles submitted by sellers.
        </p>
      </div>

      {/* Filters */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_190px]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by car or seller..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:bg-white"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:bg-white"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="reviewing">
              Reviewing
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* Summary */}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredSubmissions.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {submissions.length}
          </span>
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading submissions...
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
        filteredSubmissions.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              🚗
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              No sell submissions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Seller submissions will appear here.
            </p>
          </div>
        )}

      {/* Table */}

      {!loading &&
        !error &&
        filteredSubmissions.length >
          0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Seller
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Expected Price
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map(
                    (submission) => (
                      <tr
                        key={submission.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {submission.make}{' '}
                            {submission.model}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {typeof submission.kilometersDriven === 'number'
                            ? `${submission.kilometersDriven.toLocaleString('en-IN')} km`
                            : 'Mileage not specified'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {submission.sellerName ||
                              'Unknown seller'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {submission.sellerEmail ||
                              submission.sellerPhone ||
                              'No contact'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {typeof submission.expectedPrice ===
                            'number'
                              ? `₹${submission.expectedPrice.toLocaleString(
                                  'en-IN',
                                )}`
                              : '—'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-500">
                            {formatDate(
                              submission.createdAt,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              submission.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/sell-submissions/${submission.id}`}
                            className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            Review
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

/* ===================================== */
/* STATUS */
/* ===================================== */

function StatusBadge({
  status,
}: {
  status: SellSubmissionStatus;
}) {
  const config: Record<
    SellSubmissionStatus,
    {
      label: string;
      className: string;
    }
  > = {
    pending: {
      label: 'Pending',
      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },

    reviewing: {
      label: 'Reviewing',
      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },

    approved: {
      label: 'Approved',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    rejected: {
      label: 'Rejected',
      className:
        'border-red-200 bg-red-50 text-red-700',
    },

    cancelled: {
      label: 'Cancelled',
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  };

  const current =
    config[status] ||
    config.pending;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* ===================================== */
/* DATE */
/* ===================================== */

function formatDate(
  value: unknown,
) {
  if (!value) {
    return 'N/A';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    const firestoreValue =
      value as {
        toDate?: () => Date;
      };

    if (
      typeof firestoreValue.toDate ===
      'function'
    ) {
      return firestoreValue
        .toDate()
        .toLocaleDateString(
          'en-IN',
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
        );
    }
  }

  return 'N/A';
}