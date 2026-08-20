'use client';

import {
  doc,
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
  acceptQuote,
  AdminQuote,
  rejectQuote,
  startQuoteReview,
  withdrawQuote,
} from '@/services/firebase/quotes';

import { db } from '@/services/firebase/config';

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [quote, setQuote] =
    useState<AdminQuote | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const quoteRef = doc(
      db,
      'quotes',
      id,
    );

    const unsubscribe = onSnapshot(
      quoteRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setQuote(null);
          setError('Quote not found.');
        } else {
          setQuote({
            id: snapshot.id,
            ...snapshot.data(),
          } as AdminQuote);

          setError('');
        }

        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          'QUOTE DETAIL ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load quote.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  const runAction = async (
    action: () => Promise<void>,
  ) => {
    try {
      setSaving(true);
      setError('');

      await action();
    } catch (err) {
      console.error(
        'QUOTE ACTION ERROR:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update quote.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReview = () =>
    runAction(() =>
      startQuoteReview(
        id,
        'admin',
      ),
    );

  const handleAccept = () =>
    runAction(() =>
      acceptQuote(
        id,
        'admin',
      ),
    );

  const handleReject = () =>
    runAction(() =>
      rejectQuote(
        id,
        'admin',
      ),
    );

  const handleWithdraw = () =>
    runAction(() =>
      withdrawQuote(
        id,
        'admin',
      ),
    );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading quote...
        </p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">
          {error || 'Quote not found.'}
        </p>

        <button
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm font-medium text-slate-400 hover:text-slate-700"
          >
            ← Back to Quotes
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Quote Request
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {quote.carMake || 'Car'}{' '}
            {quote.carModel || ''}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quote ID: {quote.id}
          </p>
        </div>

        <StatusBadge
          status={quote.status}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

        {/* LEFT */}

        <div className="space-y-6">

          {/* Buyer */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Buyer
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Name"
                value={
                  quote.buyerName ||
                  'Not specified'
                }
              />

              <Info
                label="Phone"
                value={
                  quote.buyerPhone ||
                  'Not specified'
                }
              />

              <Info
                label="Buyer ID"
                value={
                  quote.buyerId
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
                label="Make"
                value={
                  quote.carMake ||
                  '—'
                }
              />

              <Info
                label="Model"
                value={
                  quote.carModel ||
                  '—'
                }
              />

              <Info
                label="Car ID"
                value={
                  quote.carId
                }
              />

              <Info
                label="Seller ID"
                value={
                  quote.sellerId ||
                  'Not specified'
                }
              />
            </div>
          </section>

          {/* Offer */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Buyer Offer
            </SectionTitle>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Offered Price
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                ₹
                {Number(
                  quote.offeredPrice || 0,
                ).toLocaleString(
                  'en-IN',
                )}
              </p>
            </div>
          </section>

          {/* Message */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Buyer Message
            </SectionTitle>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                {quote.message ||
                  'No message provided.'}
              </p>
            </div>
          </section>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* Actions */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Quote Actions
            </SectionTitle>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage the current quote workflow.
            </p>

            <div className="mt-5 space-y-2">

              {quote.status ===
                'pending' && (
                <button
                  disabled={saving}
                  onClick={
                    handleReview
                  }
                  className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Start Review
                </button>
              )}

              {(quote.status ===
                'pending' ||
                quote.status ===
                  'reviewing') && (
                <>
                  <button
                    disabled={saving}
                    onClick={
                      handleAccept
                    }
                    className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Accept Quote
                  </button>

                  <button
                    disabled={saving}
                    onClick={
                      handleReject
                    }
                    className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject Quote
                  </button>
                </>
              )}

              {quote.status !==
                'withdrawn' &&
                quote.status !==
                  'rejected' && (
                <button
                  disabled={saving}
                  onClick={
                    handleWithdraw
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Withdraw Quote
                </button>
              )}

            </div>
          </section>

          {/* Status information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Status
            </SectionTitle>

            <div className="mt-5">
              <StatusBadge
                status={
                  quote.status
                }
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {getStatusDescription(
                quote.status,
              )}
            </p>
          </section>

          {/* Request info */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Request Information
            </SectionTitle>

            <div className="mt-5">
              <Info
                label="Submitted"
                value={formatDate(
                  quote.createdAt,
                )}
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ===================================== */
/* HELPERS */
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

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function getStatusDescription(
  status: AdminQuote['status'],
) {
  switch (status) {
    case 'pending':
      return 'This quote is waiting for admin review.';

    case 'reviewing':
      return 'This quote is currently under review.';

    case 'accepted':
      return 'This quote has been accepted.';

    case 'rejected':
      return 'This quote has been rejected.';

    case 'withdrawn':
      return 'This quote has been withdrawn.';

    default:
      return '';
  }
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