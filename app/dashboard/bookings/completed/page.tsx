'use client';

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { db } from '@/services/firebase/config';

interface CompletedRide {
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

  pickupLocation?: string;
  dropLocation?: string;

  estimatedPrice?: number;
  finalPrice?: number | null;

  status: 'completed';

  completedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export default function CompletedRidesPage() {
  const [rides, setRides] =
    useState<CompletedRide[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      where(
        'status',
        '==',
        'completed',
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
              }) as CompletedRide,
          );

        setRides(data);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'COMPLETED RIDES ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load completed rides.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

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
            Completed Rides
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review completed customer rentals and
            release vehicles when ready.
          </p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
            Completed
          </p>

          <p className="mt-1 text-lg font-bold text-violet-700">
            {rides.length}
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* LOADING */}
      {/* ================================= */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading completed rides...
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
        rides.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              ✓
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No Completed Rides
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Completed rentals will appear here
              once Admin marks an active rental as
              completed.
            </p>
          </div>
        )}

      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}

      {!loading &&
        !error &&
        rides.length > 0 && (
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
                      Rental Period
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Final Price
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rides.map((ride) => (
                    <tr
                      key={ride.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Customer */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {ride.userName ||
                            'Unknown User'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {ride.userEmail ||
                            ride.userPhone ||
                            'No contact'}
                        </p>
                      </td>

                      {/* Vehicle */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {ride.carMake ||
                            'Unknown'}{' '}
                          {ride.carModel ||
                            ''}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {ride.carId}
                        </p>
                      </td>

                      {/* Dates */}

                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-500">
                          {formatDate(
                            ride.startDate,
                          )}
                        </p>

                        <p className="my-1 text-[10px] font-semibold text-slate-300">
                          TO
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDate(
                            ride.endDate,
                          )}
                        </p>
                      </td>

                      {/* Price */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {typeof ride.finalPrice ===
                          'number'
                            ? `₹${ride.finalPrice.toLocaleString(
                                'en-IN',
                              )}`
                            : '—'}
                        </p>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                          Completed
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/bookings/${ride.id}`}
                          className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
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