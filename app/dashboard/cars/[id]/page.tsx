'use client';

import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Car,
  ListingStatus,
} from '@/services/firebase/cars';
import { db } from '@/services/firebase/config';

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [car, setCar] =
    useState<Car | null>(null);

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

  useEffect(() => {
    if (!id) return;

    const carRef = doc(
      db,
      'cars',
      id,
    );

    const unsubscribe = onSnapshot(
      carRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setCar(null);
          setError('Car not found.');
        } else {
          const data = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Car;

          setCar(data);
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
          'CAR DETAIL ERROR:',
          firebaseError,
        );

        setError(
          'Unable to load car details.',
        );

        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  const updateStatus = async (
    status: ListingStatus,
    reason = '',
  ) => {
    if (!car) return;

    try {
      setSaving(true);

      await updateDoc(
        doc(db, 'cars', car.id),
        {
          listingStatus: status,

          adminNotes:
            adminNotes.trim(),

          rejectionReason:
            reason.trim(),

          updatedAt:
            serverTimestamp(),

          reviewedBy:
            'admin',
        },
      );
    } catch (err) {
      console.error(
        'UPDATE CAR STATUS ERROR:',
        err,
      );

      setError(
        'Unable to update listing status.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    await updateStatus(
      'approved',
      '',
    );
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError(
        'Please enter a rejection reason.',
      );
      return;
    }

    setError('');

    await updateStatus(
      'rejected',
      rejectionReason,
    );
  };

  const handleInactive = async () => {
    await updateStatus(
      'inactive',
      '',
    );
  };

  const handleSaveNotes =
    async () => {
      if (!car) return;

      try {
        setSaving(true);

        await updateDoc(
          doc(
            db,
            'cars',
            car.id,
          ),
          {
            adminNotes:
              adminNotes.trim(),

            rejectionReason:
              rejectionReason.trim(),

            updatedAt:
              serverTimestamp(),
          },
        );

        setError('');
      } catch (err) {
        console.error(
          'SAVE CAR NOTES ERROR:',
          err,
        );

        setError(
          'Unable to save admin notes.',
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading car...
        </p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="font-semibold text-red-700">
          {error || 'Car not found.'}
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
            ← Back to Cars
          </button>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Listing Review
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {car.make} {car.model}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {car.year} · {car.type || 'Car'} ·{' '}
            {typeof car.mileage === 'number'
                ? `${car.mileage.toLocaleString(
                    'en-IN',
                )} km`
                : 'Mileage not specified'}
            </p>
        </div>

        <StatusBadge
          status={car.listingStatus}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main grid */}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Left */}

        <div className="space-y-6">
          {/* Images */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-2 p-3 sm:grid-cols-2">
              {car.images?.length ? (
                car.images.map(
                  (
                    image,
                    index,
                  ) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${car.make} ${car.model} ${index + 1}`}
                      className={`w-full rounded-xl object-cover ${
                        index === 0
                          ? 'h-72 sm:col-span-2'
                          : 'h-44'
                      }`}
                    />
                  ),
                )
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-4xl text-slate-300 sm:col-span-2">
                  🚗
                </div>
              )}
            </div>
          </section>

          {/* Vehicle information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Vehicle Information
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Make"
                value={car.make}
              />

              <Info
                label="Model"
                value={car.model}
              />

              <Info
                label="Year"
                value={String(
                  car.year,
                )}
              />

              <Info
                label="Type"
                value={car.type}
              />

              <Info
                label="Fuel"
                value={car.fuelType}
              />

              <Info
                label="Transmission"
                value={
                  car.transmission
                }
              />

              <Info
                label="Mileage"
                value={
                    typeof car.mileage === 'number'
                    ? `${car.mileage.toLocaleString(
                        'en-IN',
                        )} km`
                    : 'Not specified'
                }
                />

              <Info
                label="Color"
                value={
                  car.color ||
                  'Not specified'
                }
              />
            </div>
          </section>

          {/* Listing information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Listing Information
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Rental"
                value={
                  car.isAvailableForRent
                    ? 'Available'
                    : 'Not listed'
                }
              />

              <Info
                label="Rental Price"
                value={
                  car.pricePerDay
                    ? `₹${car.pricePerDay.toLocaleString(
                        'en-IN',
                      )} / day`
                    : '—'
                }
              />

              <Info
                label="For Sale"
                value={
                  car.isListedForSale
                    ? 'Listed'
                    : 'Not listed'
                }
              />

              <Info
                label="Sale Price"
                value={
                  car.salePrice
                    ? `₹${car.salePrice.toLocaleString(
                        'en-IN',
                      )}`
                    : '—'
                }
              />
            </div>
          </section>

          {/* Owner */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Owner
            </SectionTitle>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info
                label="Name"
                value={
                  car.ownerName ||
                  'Not specified'
                }
              />

              <Info
                label="Owner ID"
                value={
                  car.ownerId ||
                  'Not specified'
                }
              />
            </div>
          </section>
        </div>

        {/* Right */}

        <div className="space-y-6">
          {/* Review actions */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Listing Review
            </SectionTitle>

            <p className="mt-2 text-sm text-slate-500">
              Manage the current marketplace
              status for this vehicle.
            </p>

            <div className="mt-5 space-y-3">
              <button
                disabled={saving}
                onClick={
                  handleApprove
                }
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : 'Approve Listing'}
              </button>

              <button
                disabled={saving}
                onClick={
                  handleInactive
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Mark Inactive
              </button>
            </div>
          </section>

          {/* Rejection */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Rejection
            </SectionTitle>

            <p className="mt-2 text-sm text-slate-500">
              A rejection reason should be
              stored for future review/audit.
            </p>

            <textarea
              value={
                rejectionReason
              }
              onChange={(event) =>
                setRejectionReason(
                  event.target.value,
                )
              }
              placeholder="Enter rejection reason..."
              rows={5}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:bg-white"
            />

            <button
              disabled={saving}
              onClick={
                handleReject
              }
              className="mt-3 w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              Reject Listing
            </button>
          </section>

          {/* Admin Notes */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Admin Notes
            </SectionTitle>

            <textarea
              value={adminNotes}
              onChange={(event) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              placeholder="Internal notes..."
              rows={5}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:bg-white"
            />

            <button
              disabled={saving}
              onClick={
                handleSaveNotes
              }
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Save Notes
            </button>
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
  status: Car['listingStatus'];
}) {
  const styles: Record<
    Car['listingStatus'],
    string
  > = {
    pending:
      'bg-amber-50 text-amber-700 border-amber-200',

    approved:
      'bg-emerald-50 text-emerald-700 border-emerald-200',

    rejected:
      'bg-red-50 text-red-700 border-red-200',

    sold:
      'bg-violet-50 text-violet-700 border-violet-200',

    inactive:
      'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() +
        status.slice(1)}
    </span>
  );
}