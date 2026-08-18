'use client';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { db } from '@/services/firebase/config';

type BookingStatus =
  | 'pending'
  | 'reviewing'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

interface Booking {
  id: string;

  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;

  carId: string;
  carMake?: string;
  carModel?: string;

  rentalType:
    | 'self_drive'
    | 'chauffeur';

  startDate?: unknown;
  endDate?: unknown;

  pickupLocation: string;
  dropLocation?: string;

  specialRequest?: string;

  estimatedPrice?: number;
  finalPrice?: number | null;

  status: BookingStatus;

  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
}

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

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      orderBy(
        'createdAt',
        'desc',
      ),
    );

    const unsubscribe = onSnapshot(
      q,
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

  const filteredBookings =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return bookings.filter(
        (booking) => {
          const matchesSearch =
            !searchValue ||
            `${booking.carMake || ''} ${
              booking.carModel || ''
            }`
              .toLowerCase()
              .includes(searchValue) ||
            (
              booking.userName || ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              booking.userEmail || ''
            )
              .toLowerCase()
              .includes(searchValue) ||
            booking.pickupLocation
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            status === 'all' ||
            booking.status ===
              status;

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

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Marketplace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Rental Requests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review and manage customer rental requests.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
          {filteredBookings.length} requests
        </div>
      </div>

      {/* Filters */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by customer, car, email or pickup location..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400"
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

            <option value="confirmed">
              Confirmed
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">
            Loading rental requests...
          </p>
        </div>
      )}

      {/* Error */}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              🚘
            </div>

            <h2 className="mt-4 font-semibold text-slate-800">
              No rental requests found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or status filter.
            </p>
          </div>
        )}

      {/* Table */}

      {!loading &&
        !error &&
        filteredBookings.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dates
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

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map(
                    (booking) => (
                      <tr
                        key={booking.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.userName ||
                              'Unknown'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.userEmail ||
                              booking.userPhone ||
                              'No contact'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.carMake ||
                              '—'}{' '}
                            {booking.carModel ||
                              ''}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.pickupLocation}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-500">
                            {formatDate(
                              booking.startDate,
                            )}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            →
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(
                              booking.endDate,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            {booking.rentalType ===
                            'chauffeur'
                              ? 'Chauffeur'
                              : 'Self Drive'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {booking.finalPrice !=
                            null
                              ? `₹${Number(
                                  booking.finalPrice,
                                ).toLocaleString(
                                  'en-IN',
                                )}`
                              : booking.estimatedPrice
                                ? `₹${Number(
                                    booking.estimatedPrice,
                                  ).toLocaleString(
                                    'en-IN',
                                  )}`
                                : '—'}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {booking.finalPrice !=
                            null
                              ? 'Final'
                              : 'Estimated'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              booking.status
                            }
                          />
                        </td>

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
/* STATUS */
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
        'bg-amber-50 text-amber-700 border-amber-200',
    },

    reviewing: {
      label: 'Reviewing',
      className:
        'bg-blue-50 text-blue-700 border-blue-200',
    },

    confirmed: {
      label: 'Confirmed',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200',
    },

    rejected: {
      label: 'Rejected',
      className:
        'bg-red-50 text-red-700 border-red-200',
    },

    cancelled: {
      label: 'Cancelled',
      className:
        'bg-slate-100 text-slate-600 border-slate-200',
    },

    completed: {
      label: 'Completed',
      className:
        'bg-violet-50 text-violet-700 border-violet-200',
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
    value !== null &&
    'toDate' in value
  ) {
    const date = (
      value as {
        toDate: () => Date;
      }
    ).toDate();

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
  }

  return 'N/A';
}