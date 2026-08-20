'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AdminConsultation,
  ConsultationStatus,
  subscribeToAllConsultations,
} from '@/services/firebase/consultations';

export default function ConsultationsPage() {
  const [consultations, setConsultations] =
    useState<AdminConsultation[]>([]);

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
      subscribeToAllConsultations(
        (data) => {
          setConsultations(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            'ADMIN CONSULTATIONS PAGE ERROR:',
            firebaseError,
          );

          setError(
            'Unable to load consultations.',
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const filteredConsultations =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return consultations.filter(
        (consultation) => {
          const matchesSearch =
            !searchValue ||
            (
              consultation.userName ||
              ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              consultation.userEmail ||
              ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              consultation.userPhone ||
              ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              consultation.subject ||
              ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            consultation.message
              .toLowerCase()
              .includes(searchValue) ||
            consultation.id
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            status === 'all' ||
            consultation.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      consultations,
      search,
      status,
    ]);

  const pendingCount =
    consultations.filter(
      (item) =>
        item.status === 'pending',
    ).length;

  const reviewingCount =
    consultations.filter(
      (item) =>
        item.status ===
        'reviewing',
    ).length;

  const contactedCount =
    consultations.filter(
      (item) =>
        item.status ===
        'contacted',
    ).length;

  const completedCount =
    consultations.filter(
      (item) =>
        item.status ===
        'completed',
    ).length;

  return (
    <div>
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Consultations
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage customer consultation requests.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {filteredConsultations.length}
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={pendingCount}
          className="border-amber-200 bg-amber-50"
          valueClassName="text-amber-700"
        />

        <SummaryCard
          label="Reviewing"
          value={reviewingCount}
          className="border-blue-200 bg-blue-50"
          valueClassName="text-blue-700"
        />

        <SummaryCard
          label="Contacted"
          value={contactedCount}
          className="border-cyan-200 bg-cyan-50"
          valueClassName="text-cyan-700"
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
          className="border-emerald-200 bg-emerald-50"
          valueClassName="text-emerald-700"
        />
      </div>

      {/* ================================= */}
      {/* FILTERS */}
      {/* ================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by customer, subject, message or ID..."
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

            <option value="contacted">
              Contacted
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredConsultations.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {consultations.length}
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

      {/* ================================= */}
      {/* LOADING */}
      {/* ================================= */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading consultations...
          </p>
        </div>
      )}

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ================================= */}
      {/* EMPTY */}
      {/* ================================= */}

      {!loading &&
        !error &&
        filteredConsultations.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
              ◎
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Consultations
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Customer consultation requests will
              appear here.
            </p>
          </div>
        )}

      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}

      {!loading &&
        !error &&
        filteredConsultations.length >
          0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Preferred Method
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredConsultations.map(
                    (consultation) => (
                      <tr
                        key={consultation.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Customer */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {consultation.userName ||
                              'Unknown Customer'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {consultation.userEmail ||
                              consultation.userPhone ||
                              'No contact'}
                          </p>
                        </td>

                        {/* Subject */}

                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {consultation.subject ||
                              'General Consultation'}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {consultation.message}
                          </p>
                        </td>

                        {/* Contact */}

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                              {consultation.userPhone ||
                                'No phone'}
                            </p>

                            <p className="text-xs text-slate-500">
                              {consultation.userEmail ||
                                'No email'}
                            </p>
                          </div>
                        </td>

                        {/* Method */}

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            {consultation.preferredContactMethod ===
                            'email'
                              ? 'Email'
                              : 'Phone'}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              consultation.status
                            }
                          />
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/consultations/${consultation.id}`}
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
      className={`rounded-2xl border p-5 ${className}`}
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

/* ===================================== */
/* STATUS BADGE */
/* ===================================== */

function StatusBadge({
  status,
}: {
  status: ConsultationStatus;
}) {
  const config: Record<
    ConsultationStatus,
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

    contacted: {
      label: 'Contacted',
      className:
        'border-cyan-200 bg-cyan-50 text-cyan-700',
    },

    completed: {
      label: 'Completed',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    cancelled: {
      label: 'Cancelled',
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  };

  const current =
    config[status] ??
    config.pending;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}