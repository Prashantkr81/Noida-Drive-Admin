'use client';

import {
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  AdminBooking,
  cancelBooking,
  completeBooking,
  confirmBooking,
  makeCarAvailableForRental,
  rejectBooking,
  startBookingReview,
} from '@/services/firebase/bookings';

import { db } from '@/services/firebase/config';

/* ===================================== */
/* PAGE */
/* ===================================== */

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [booking, setBooking] =
    useState<AdminBooking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [finalPrice, setFinalPrice] =
    useState('');

  const [adminNotes, setAdminNotes] =
    useState('');

  const [rejectionReason, setRejectionReason] =
    useState('');

  const [carAvailableForRent, setCarAvailableForRent] =
    useState<boolean | null>(null);

  /* =================================== */
  /* LOAD BOOKING */
  /* =================================== */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const bookingRef = doc(
      db,
      'bookings',
      id,
    );

    const unsubscribe = onSnapshot(
      bookingRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setBooking(null);

          setError(
            'Rental request not found.',
          );
        } else {
          const data = {
            id: snapshot.id,
            ...snapshot.data(),
          } as AdminBooking;

          setBooking(data);

          setFinalPrice(
            data.finalPrice != null
              ? String(data.finalPrice)
              : '',
          );

          setAdminNotes(
            data.adminNotes || '',
          );

          setRejectionReason(
            data.rejectionReason || '',
          );

          setError('');
        }

        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'BOOKING DETAIL ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load rental request.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  /* =================================== */
  /* LOAD CAR AVAILABILITY */
  /* =================================== */

  useEffect(() => {
    if (!booking?.carId) {
      setCarAvailableForRent(null);
      return;
    }

    let active = true;

    const loadCarAvailability =
      async () => {
        try {
          const carSnapshot =
            await getDoc(
              doc(
                db,
                'cars',
                booking.carId,
              ),
            );

          if (!active) {
            return;
          }

          if (carSnapshot.exists()) {
            setCarAvailableForRent(
              carSnapshot.data()
                .isAvailableForRent ===
                true,
            );
          } else {
            setCarAvailableForRent(null);
          }
        } catch (firebaseError) {
          console.error(
            'CAR AVAILABILITY ERROR:',
            firebaseError,
          );

          if (active) {
            setCarAvailableForRent(null);
          }
        }
      };

    loadCarAvailability();

    return () => {
      active = false;
    };
  }, [booking?.carId]);

  /* =================================== */
  /* ACTION WRAPPER */
  /* =================================== */

  const runAction = async (
    action: () => Promise<void>,
  ) => {
    try {
      setSaving(true);
      setError('');

      await action();
    } catch (err) {
      console.error(
        'BOOKING ACTION ERROR:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update booking.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================== */
  /* START REVIEW */
  /* =================================== */

  const handleReview = () => {
    return runAction(() =>
      startBookingReview(
        id,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* CONFIRM */
  /* =================================== */

  const handleConfirm = () => {
    if (!finalPrice.trim()) {
      setError(
        'Please enter a final price.',
      );
      return;
    }

    const price =
      Number(finalPrice);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        'Please enter a valid final price.',
      );
      return;
    }

    return runAction(() =>
      confirmBooking(
        id,
        price,
        adminNotes,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* REJECT */
  /* =================================== */

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setError(
        'Please provide a rejection reason.',
      );
      return;
    }

    return runAction(() =>
      rejectBooking(
        id,
        rejectionReason,
        adminNotes,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* CANCEL */
  /* =================================== */

  const handleCancel = () => {
    return runAction(() =>
      cancelBooking(
        id,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* COMPLETE */
  /* =================================== */

  const handleComplete = () => {
    return runAction(() =>
      completeBooking(
        id,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* MAKE AVAILABLE */
  /* =================================== */

  const handleMakeAvailable =
    () => {
      if (!booking?.carId) {
        setError(
          'Car ID is missing for this rental.',
        );
        return;
      }

      return runAction(
        async () => {
          await makeCarAvailableForRental(
            booking.carId,
            'admin',
          );

          setCarAvailableForRent(
            true,
          );
        },
      );
    };

  /* =================================== */
  /* LOADING */
  /* =================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading rental request...
        </p>
      </div>
    );
  }

  /* =================================== */
  /* NOT FOUND */
  /* =================================== */

  if (!booking) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">
          {error ||
            'Rental request not found.'}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* =================================== */
  /* UI */
  /* =================================== */

  return (
    <div className="space-y-6">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            ← Back to Rental Requests
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Rental Request
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {booking.carMake ||
              'Car'}{' '}
            {booking.carModel ||
              ''}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Request ID: {booking.id}
          </p>
        </div>

        <StatusBadge
          status={booking.status}
        />
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================= */}
      {/* MAIN GRID */}
      {/* ================================= */}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* ================================= */}
        {/* LEFT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Customer */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Customer
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Name"
                value={
                  booking.userName ||
                  'Not specified'
                }
              />

              <Info
                label="Email"
                value={
                  booking.userEmail ||
                  'Not specified'
                }
              />

              <Info
                label="Phone"
                value={
                  booking.userPhone ||
                  'Not specified'
                }
              />

              <Info
                label="User ID"
                value={
                  booking.userId
                }
              />
            </div>
          </section>

          {/* Vehicle */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Vehicle
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Vehicle"
                value={`${booking.carMake || '—'} ${
                  booking.carModel || ''
                }`}
              />

              <Info
                label="Car ID"
                value={
                  booking.carId
                }
              />

              <Info
                label="Rental Type"
                value={
                  booking.rentalType ===
                  'chauffeur'
                    ? 'Chauffeur'
                    : 'Self Drive'
                }
              />
            </div>
          </section>

          {/* Rental Details */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Rental Details
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Start Date"
                value={formatDate(
                  booking.startDate,
                )}
              />

              <Info
                label="End Date"
                value={formatDate(
                  booking.endDate,
                )}
              />

              <Info
                label="Pickup Location"
                value={
                  booking.pickupLocation ||
                  'Not specified'
                }
              />

              <Info
                label="Drop Location"
                value={
                  booking.dropLocation ||
                  'Not specified'
                }
              />
            </div>
          </section>

          {/* Special Request */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Special Request
            </SectionTitle>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                {booking.specialRequest ||
                  'No special request provided.'}
              </p>
            </div>
          </section>

        </div>

        {/* ================================= */}
        {/* RIGHT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Request Status */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Request Status
            </SectionTitle>

            <div className="mt-4">
              <StatusBadge
                status={booking.status}
              />
            </div>

            <div className="mt-5 space-y-2">

              {/* Pending → Review */}

              {booking.status ===
                'pending' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleReview
                  }
                  className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving
                    ? 'Updating...'
                    : 'Start Review'}
                </button>
              )}

              {/* Pending / Reviewing → Confirm */}

              {(booking.status ===
                'pending' ||
                booking.status ===
                  'reviewing') && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleConfirm
                  }
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : 'Confirm Rental'}
                </button>
              )}

              {/* Active → Complete */}

              {booking.status ===
                'confirmed' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleComplete
                  }
                  className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
                >
                  {saving
                    ? 'Updating...'
                    : 'Mark Rental Completed'}
                </button>
              )}

              {/* Cancel */}

              {booking.status !==
                'completed' &&
                booking.status !==
                  'cancelled' &&
                booking.status !==
                  'rejected' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleCancel
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel Rental
                </button>
              )}

            </div>
          </section>

          {/* Pricing */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Pricing
            </SectionTitle>

            <div className="mt-5">

              <Info
                label="Estimated Price"
                value={
                  typeof booking.estimatedPrice ===
                  'number'
                    ? `₹${booking.estimatedPrice.toLocaleString(
                        'en-IN',
                      )}`
                    : '—'
                }
              />

              <div className="mt-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Final Price
                </label>

                <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-cyan-400">
                  <span className="flex items-center bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                    ₹
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      finalPrice
                    }
                    onChange={(
                      event,
                    ) =>
                      setFinalPrice(
                        event.target.value.replace(
                          /[^0-9]/g,
                          '',
                        ),
                      )
                    }
                    placeholder="Enter final price"
                    className="w-full bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Admin Notes */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Admin Notes
            </SectionTitle>

            <textarea
              value={
                adminNotes
              }
              onChange={(
                event,
              ) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Internal admin notes..."
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </section>

          {/* Rejection */}

          {(booking.status ===
            'pending' ||
            booking.status ===
              'reviewing') && (
            <section className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
              <SectionTitle>
                Reject Request
              </SectionTitle>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(
                  event,
                ) =>
                  setRejectionReason(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Reason for rejection..."
                className="mt-4 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-red-400"
              />

              <button
                type="button"
                disabled={saving}
                onClick={
                  handleReject
                }
                className="mt-3 w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {saving
                  ? 'Rejecting...'
                  : 'Reject Request'}
              </button>
            </section>
          )}

          {/* ================================= */}
          {/* RELEASE VEHICLE */}
          {/* ================================= */}

          {booking.status ===
            'completed' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <SectionTitle>
                Rental Availability
              </SectionTitle>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This rental has been completed.
                The vehicle remains unavailable
                until an administrator explicitly
                releases it for the next rental.
              </p>

              <div className="mt-5">

                {carAvailableForRent ===
                true ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      ✓ Vehicle Available for
                      Rental
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-600">
                      Customers can now see this
                      vehicle in the Rent section.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={
                      saving ||
                      carAvailableForRent ===
                        null
                    }
                    onClick={
                      handleMakeAvailable
                    }
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? 'Updating...'
                      : carAvailableForRent ===
                          null
                        ? 'Checking Vehicle...'
                        : 'Make Available for Rental'}
                  </button>
                )}

              </div>

            </section>
          )}

        </div>
      </div>
    </div>
  );
}

/* ===================================== */
/* SECTION TITLE */
/* ===================================== */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-base font-bold text-slate-900">
      {children}
    </h2>
  );
}

/* ===================================== */
/* INFO */
/* ===================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
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
  status: AdminBooking['status'];
}) {
  const config: Record<
    AdminBooking['status'],
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
      label: 'Active Rental',
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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${current.className}`}
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