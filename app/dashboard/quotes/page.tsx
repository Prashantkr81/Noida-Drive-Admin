'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AdminQuote,
  subscribeToAllQuotes,
} from '@/services/firebase/quotes';

export default function QuotesPage() {
  const [quotes, setQuotes] =
    useState<AdminQuote[]>([]);

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
      subscribeToAllQuotes(
        (data) => {
          setQuotes(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            'ADMIN QUOTES PAGE ERROR:',
            firebaseError,
          );

          setError(
            'Unable to load quotes.',
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const filteredQuotes =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return quotes.filter((quote) => {
        const matchesSearch =
          !value ||
          `${quote.carMake || ''} ${
            quote.carModel || ''
          }`
            .toLowerCase()
            .includes(value) ||
          (
            quote.buyerName || ''
          )
            .toLowerCase()
            .includes(value) ||
          (
            quote.buyerPhone || ''
          )
            .toLowerCase()
            .includes(value) ||
          quote.carId
            .toLowerCase()
            .includes(value);

        const matchesStatus =
          status === 'all' ||
          quote.status === status;

        return (
          matchesSearch &&
          matchesStatus
        );
      });
    }, [
      quotes,
      search,
      status,
    ]);

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Marketplace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Quotes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review buyer quote requests.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
          {filteredQuotes.length} quotes
        </div>
      </div>

      {/* Filters */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_190px]">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by buyer, car or car ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
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

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
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

            <option value="accepted">
              Accepted
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="withdrawn">
              Withdrawn
            </option>
          </select>
        </div>
      </div>

      {/* Summary */}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredQuotes.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {quotes.length}
          </span>
        </p>

        {(search ||
          status !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('all');
            }}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading quotes...
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
        filteredQuotes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ◇
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              No quotes found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or status filter.
            </p>
          </div>
        )}

      {/* Table */}

      {!loading &&
        !error &&
        filteredQuotes.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Buyer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Offer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Message
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.map(
                    (quote) => (
                      <tr
                        key={quote.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {quote.buyerName ||
                              'Unknown buyer'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {quote.buyerPhone ||
                              quote.buyerId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {quote.carMake ||
                              '—'}{' '}
                            {quote.carModel ||
                              ''}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {quote.carId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            ₹
                            {Number(
                              quote.offeredPrice ||
                                0,
                            ).toLocaleString(
                              'en-IN',
                            )}
                          </p>
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate text-xs text-slate-500">
                            {quote.message ||
                              'No message'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              quote.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/quotes/${quote.id}`}
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
  status: AdminQuote['status'];
}) {
  const config: Record<
    AdminQuote['status'],
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

    accepted: {
      label: 'Accepted',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    rejected: {
      label: 'Rejected',
      className:
        'border-red-200 bg-red-50 text-red-700',
    },

    withdrawn: {
      label: 'Withdrawn',
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