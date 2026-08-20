'use client';

import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { db } from '@/services/firebase/config';

/* ===================================== */
/* TYPES */
/* ===================================== */

type BookingStatus =
  | 'pending'
  | 'reviewing'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

interface Booking {
  id: string;

  /* User */

  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;

  /* Car */

  carId: string;
  carMake?: string;
  carModel?: string;

  /* Rental */

  rentalType:
    | 'self_drive'
    | 'chauffeur';

  startDate?: unknown;
  endDate?: unknown;

  /* Location */

  pickupLocation?: string;
  dropLocation?: string;

  /* Request */

  specialRequest?: string;

  /* Pricing */

  estimatedPrice?: number;
  finalPrice?: number | null;

  /* Workflow */

  status: BookingStatus;

  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;

  /* Metadata */

  createdAt?: unknown;
  updatedAt?: unknown;
}

/* ===================================== */
/* PAGE */
/* ===================================== */

export default function BookingsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('all');

  /* =================================== */
  /* FIRESTORE */
  /* =================================== */

  useEffect(() => {
    setLoading(true);
    setError('');

    const unsubscribe = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const data =
          snapshot.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as Booking,
          );

        setBookings(data);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'ADMIN BOOKINGS ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load rental requests.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  /* =================================== */
  /* FILTER */
  /* =================================== */

  const filteredBookings =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return bookings.filter(
        (booking) => {
          /*
           * Only these statuses belong
           * to the Rental Requests page.
           *
           * confirmed  → Active Rentals
           * completed  → Completed Rentals
           */
          const isRequest =
            booking.status ===
              'pending' ||
            booking.status ===
              'reviewing' ||
            booking.status ===
              'rejected' ||
            booking.status ===
              'cancelled';

          if (!isRequest) {
            return false;
          }

          const carName =
            `${booking.carMake || ''} ${
              booking.carModel || ''
            }`.toLowerCase();

          const customerName =
            (
              booking.userName || ''
            ).toLowerCase();

          const customerEmail =
            (
              booking.userEmail || ''
            ).toLowerCase();

          const pickup =
            (
              booking.pickupLocation ||
              ''
            ).toLowerCase();

          const customerPhone =
            (
              booking.userPhone || ''
            ).toLowerCase();

          const matchesSearch =
            !searchValue ||
            carName.includes(
              searchValue,
            ) ||
            customerName.includes(
              searchValue,
            ) ||
            customerEmail.includes(
              searchValue,
            ) ||
            customerPhone.includes(
              searchValue,
            ) ||
            pickup.includes(
              searchValue,
            ) ||
            booking.id
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            status === 'all' ||
            booking.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      bookings,
      search,
      status,
    ]);

  /* =================================== */
  /* COUNTS */
  /* =================================== */

  const pendingCount =
    bookings.filter(
      (booking) =>
        booking.status === 'pending',
    ).length;

  const reviewingCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        'reviewing',
    ).length;

  const rejectedCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        'rejected',
    ).length;

  const cancelledCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        'cancelled',
    ).length;

  /* =================================== */
  /* RENDER */
  /* =================================== */

  return (
    <div>
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Rentals
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Rental Requests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review incoming rental requests before
            they become active rentals.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Open Requests
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {filteredBookings.length}
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* SUMMARY CARDS */}
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
          label="Rejected"
          value={rejectedCount}
          className="border-red-200 bg-red-50"
          valueClassName="text-red-700"
        />

        <SummaryCard
          label="Cancelled"
          value={cancelledCount}
          className="border-slate-200 bg-slate-100"
          valueClassName="text-slate-700"
        />
      </div>

      {/* ================================= */}
      {/* FILTERS */}
      {/* ================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_190px]">
          {/* Search */}

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by customer, car, email, phone, pickup or request ID..."
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

          {/* Status */}

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
              All Requests
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="reviewing">
              Reviewing
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

      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredBookings.length}
          </span>{' '}
          request
          {filteredBookings.length !==
          1
            ? 's'
            : ''}
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
            Loading rental requests...
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
        filteredBookings.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🚘
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Rental Requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              There are no requests matching your
              current filters.
            </p>

            {(search ||
              status !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                }}
                className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}

      {!loading &&
        !error &&
        filteredBookings.length >
          0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                {/* Header */}

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Rental Period
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Rental Type
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Price
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                {/* Body */}

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map(
                    (booking) => (
                      <tr
                        key={booking.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Customer */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.userName ||
                              'Unknown User'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.userEmail ||
                              booking.userPhone ||
                              'No contact'}
                          </p>
                        </td>

                        {/* Vehicle */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.carMake ||
                              'Unknown'}{' '}
                            {booking.carModel ||
                              ''}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.pickupLocation ||
                              'Pickup not specified'}
                          </p>
                        </td>

                        {/* Dates */}

                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-500">
                            {formatDate(
                              booking.startDate,
                            )}
                          </p>

                          <p className="my-1 text-[10px] font-semibold text-slate-300">
                            TO
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatDate(
                              booking.endDate,
                            )}
                          </p>
                        </td>

                        {/* Rental Type */}

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            {booking.rentalType ===
                            'chauffeur'
                              ? 'Chauffeur'
                              : 'Self Drive'}
                          </span>
                        </td>

                        {/* Price */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {typeof booking.finalPrice ===
                            'number'
                              ? `₹${booking.finalPrice.toLocaleString(
                                  'en-IN',
                                )}`
                              : typeof booking.estimatedPrice ===
                                  'number'
                                ? `₹${booking.estimatedPrice.toLocaleString(
                                    'en-IN',
                                  )}`
                                : '—'}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {typeof booking.finalPrice ===
                            'number'
                              ? 'Final'
                              : 'Estimated'}
                          </p>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              booking.status
                            }
                          />
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/bookings/${booking.id}`}
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
  status: BookingStatus;
}) {
  const config: Record<
    BookingStatus,
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

    confirmed: {
      label: 'Confirmed',
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

    completed: {
      label: 'Completed',
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
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

/* ===================================== */
/* DATE */
/* ===================================== */

function formatDate(
  value: unknown,
): string {
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
    const timestamp =
      value as {
        toDate?: () => Date;
      };

    if (
      typeof timestamp.toDate ===
      'function'
    ) {
      return timestamp
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