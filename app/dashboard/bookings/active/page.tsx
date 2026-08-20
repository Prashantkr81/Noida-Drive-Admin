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

interface ActiveRental {
  id: string;

  userId: string;
  userName?: string;
  userPhone?: string;

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

  estimatedPrice?: number;
  finalPrice?: number | null;

  status:
    | 'pending'
    | 'reviewing'
    | 'confirmed'
    | 'rejected'
    | 'cancelled'
    | 'completed';
}

export default function ActiveRentalsPage() {
  const [rentals, setRentals] =
    useState<ActiveRental[]>([]);

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
        'confirmed',
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
              }) as ActiveRental,
          );

        setRentals(data);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'ACTIVE RENTALS ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load active rentals.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Rentals
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Active Rentals
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Vehicles currently rented by customers.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          {rentals.length} Active
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading active rentals...
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
        rentals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
              🚙
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-800">
              No Active Rentals
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Confirmed rental requests will appear here.
            </p>
          </div>
        )}

      {/* Table */}

      {!loading &&
        !error &&
        rentals.length > 0 && (
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
                      Pickup
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Final Price
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Type
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rentals.map(
                    (rental) => (
                      <tr
                        key={rental.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {rental.userName ||
                              'Unknown User'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {rental.userPhone ||
                              rental.userId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {rental.carMake ||
                              '—'}{' '}
                            {rental.carModel ||
                              ''}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-500">
                            {formatDate(
                              rental.startDate,
                            )}
                          </p>

                          <p className="my-1 text-[10px] text-slate-300">
                            to
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatDate(
                              rental.endDate,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-40 truncate text-xs text-slate-500">
                            {rental.pickupLocation ||
                              'Not specified'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {typeof rental.finalPrice ===
                            'number'
                              ? `₹${rental.finalPrice.toLocaleString(
                                  'en-IN',
                                )}`
                              : '—'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            {rental.rentalType ===
                            'chauffeur'
                              ? 'Chauffeur'
                              : 'Self Drive'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/bookings/${rental.id}`}
                            className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            Manage
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