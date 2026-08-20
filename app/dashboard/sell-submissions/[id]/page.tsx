'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  doc,
  onSnapshot,
} from 'firebase/firestore';

import {
  AdminSellSubmission,
  approveSellSubmission,
  rejectSellSubmission,
  startSellSubmissionReview,
} from '@/services/firebase/sellSubmissions';

import { db } from '@/services/firebase/config';

/* ===================================== */
/* TYPES */
/* ===================================== */

type VehicleType =
  | 'SUV'
  | 'Sedan'
  | 'Hatchback'
  | 'Luxury'
  | 'Convertible';

/* ===================================== */
/* PAGE */
/* ===================================== */

export default function SellSubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [submission, setSubmission] =
    useState<AdminSellSubmission | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [adminNotes, setAdminNotes] =
    useState('');

  const [rejectionReason, setRejectionReason] =
    useState('');

  const [vehicleType, setVehicleType] =
    useState<VehicleType | ''>('');

  /* =================================== */
  /* LOAD SUBMISSION */
  /* =================================== */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const submissionRef = doc(
      db,
      'sellSubmissions',
      id,
    );

    const unsubscribe = onSnapshot(
      submissionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSubmission(null);

          setError(
            'Sell submission not found.',
          );
        } else {
          const data = {
            id: snapshot.id,
            ...snapshot.data(),
          } as AdminSellSubmission;

          setSubmission(data);

          setAdminNotes(
            data.adminNotes || '',
          );

          setRejectionReason(
            data.rejectionReason || '',
          );

          setVehicleType(
            data.type || '',
          );

          setError('');
        }

        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'SELL SUBMISSION DETAIL ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load sell submission.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

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
        'SELL SUBMISSION ACTION ERROR:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update submission.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================== */
  /* START REVIEW */
  /* =================================== */

  const handleStartReview = () => {
    return runAction(() =>
      startSellSubmissionReview(
        id,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* APPROVE */
  /* =================================== */

  const handleApprove = () => {
    if (!submission) {
      return;
    }

    if (!vehicleType) {
      setError(
        'Please select a vehicle type before approving.',
      );

      return;
    }

    return runAction(() =>
      approveSellSubmission(
        submission,
        'admin',
        adminNotes,
        vehicleType,
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
      rejectSellSubmission(
        id,
        rejectionReason,
        adminNotes,
        'admin',
      ),
    );
  };

  /* =================================== */
  /* LOADING */
  /* =================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading submission...
        </p>
      </div>
    );
  }

  /* =================================== */
  /* NOT FOUND */
  /* =================================== */

  if (!submission) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">
          {error ||
            'Sell submission not found.'}
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
            ← Back to Sell Submissions
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Seller Submission
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {submission.make}{' '}
            {submission.model}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {submission.year} ·{' '}
            {submission.condition} ·{' '}
            {typeof submission.kilometersDriven ===
            'number'
              ? `${submission.kilometersDriven.toLocaleString(
                  'en-IN',
                )} km`
              : 'Mileage not specified'}
          </p>
        </div>

        <StatusBadge
          status={
            submission.status
          }
        />
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* ================================= */}
        {/* LEFT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Images */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {submission.images?.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {submission.images.map(
                  (
                    image,
                    index,
                  ) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${submission.make} ${submission.model} ${index + 1}`}
                      className={`w-full rounded-xl object-cover ${
                        index === 0
                          ? 'h-80 sm:col-span-2'
                          : 'h-48'
                      }`}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-4xl text-slate-300">
                🚗
              </div>
            )}
          </section>

          {/* Vehicle */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Vehicle Details
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Make"
                value={submission.make}
              />

              <Info
                label="Model"
                value={submission.model}
              />

              <Info
                label="Year"
                value={String(
                  submission.year,
                )}
              />

              <Info
                label="Kilometers"
                value={
                  typeof submission.kilometersDriven ===
                  'number'
                    ? `${submission.kilometersDriven.toLocaleString(
                        'en-IN',
                      )} km`
                    : 'Not specified'
                }
              />

              <Info
                label="Condition"
                value={
                  submission.condition
                }
              />

              <Info
                label="Fuel"
                value={
                  submission.fuelType ||
                  'Not specified'
                }
              />

              <Info
                label="Transmission"
                value={
                  submission.transmission ||
                  'Not specified'
                }
              />

              <Info
                label="Color"
                value={
                  submission.color ||
                  'Not specified'
                }
              />

              <Info
                label="Vehicle Type"
                value={
                  submission.type ||
                  'Not specified'
                }
              />
            </div>
          </section>

          {/* Seller */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Seller
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Name"
                value={
                  submission.sellerName ||
                  'Not specified'
                }
              />

              <Info
                label="Email"
                value={
                  submission.sellerEmail ||
                  'Not specified'
                }
              />

              <Info
                label="Phone"
                value={
                  submission.sellerPhone ||
                  'Not specified'
                }
              />

              <Info
                label="Seller ID"
                value={
                  submission.sellerId
                }
              />
            </div>
          </section>

          {/* Expected Price */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Seller Expectation
            </SectionTitle>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Expected Price
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {typeof submission.expectedPrice ===
                'number'
                  ? `₹${submission.expectedPrice.toLocaleString(
                      'en-IN',
                    )}`
                  : 'Not specified'}
              </p>
            </div>
          </section>

        </div>

        {/* ================================= */}
        {/* RIGHT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Review */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Review
            </SectionTitle>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review the vehicle information and
              select its marketplace category before
              approval.
            </p>

            {/* Vehicle Type */}

            {(submission.status ===
              'pending' ||
              submission.status ===
                'reviewing') && (
              <div className="mt-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Marketplace Vehicle Type
                </label>

                <select
                  value={
                    vehicleType
                  }
                  onChange={(
                    event,
                  ) =>
                    setVehicleType(
                      event.target
                        .value as VehicleType | '',
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                >
                  <option value="">
                    Select vehicle type
                  </option>

                  <option value="SUV">
                    SUV
                  </option>

                  <option value="Sedan">
                    Sedan
                  </option>

                  <option value="Hatchback">
                    Hatchback
                  </option>

                  <option value="Luxury">
                    Luxury
                  </option>

                  <option value="Convertible">
                    Convertible
                  </option>
                </select>
              </div>
            )}

            <div className="mt-5 space-y-2">

              {/* Start Review */}

              {submission.status ===
                'pending' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleStartReview
                  }
                  className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving
                    ? 'Updating...'
                    : 'Start Review'}
                </button>
              )}

              {/* Approve */}

              {(submission.status ===
                'pending' ||
                submission.status ===
                  'reviewing') && (
                <button
                  type="button"
                  disabled={
                    saving ||
                    !vehicleType
                  }
                  onClick={
                    handleApprove
                  }
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Creating Listing...'
                    : 'Approve & Create Listing'}
                </button>
              )}

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
              onChange={(event) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Internal notes..."
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </section>

          {/* Rejection */}

          {(submission.status ===
            'pending' ||
            submission.status ===
              'reviewing') && (
            <section className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
              <SectionTitle>
                Reject Submission
              </SectionTitle>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Reason for rejection..."
                className="mt-4 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
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
                  : 'Reject Submission'}
              </button>
            </section>
          )}

          {/* Existing Listing */}

          {submission.listingId && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <SectionTitle>
                Marketplace Listing
              </SectionTitle>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                A marketplace listing already
                exists for this submission.
              </p>

              <p className="mt-3 break-all text-xs font-medium text-slate-500">
                Listing ID:{' '}
                {submission.listingId}
              </p>
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
  status: AdminSellSubmission['status'];
}) {
  const config: Record<
    AdminSellSubmission['status'],
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