'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  Car,
  subscribeToAllCars,
} from '@/services/firebase/cars';

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('all');

  const [listingType, setListingType] =
    useState('all');

  useEffect(() => {
    const unsubscribe =
      subscribeToAllCars(
        (data) => {
          setCars(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            'ADMIN CARS PAGE ERROR:',
            firebaseError,
          );

          setError(
            'Unable to load cars.',
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  const filteredCars =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return cars.filter((car) => {
        const carName =
          `${car.make || ''} ${
            car.model || ''
          }`.toLowerCase();

        const ownerName =
          (
            car.ownerName || ''
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          carName.includes(
            searchValue,
          ) ||
          ownerName.includes(
            searchValue,
          );

        const matchesStatus =
          status === 'all' ||
          car.listingStatus === status;

        const matchesListingType =
          listingType === 'all' ||
          (listingType === 'rent' &&
            car.isAvailableForRent ===
              true) ||
          (listingType === 'sale' &&
            car.isListedForSale === true);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesListingType
        );
      });
    }, [
      cars,
      search,
      status,
      listingType,
    ]);

  return (
    <div>
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Marketplace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Cars & Listings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage rental and marketplace vehicles.
          </p>
        </div>

        <Link
          href="/dashboard/cars/new"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
        >
          + Add Car
        </Link>
      </div>

      {/* ================================= */}
      {/* FILTERS */}
      {/* ================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
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
              placeholder="Search by car or owner..."
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
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="sold">
              Sold
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          {/* Listing type */}

          <select
            value={listingType}
            onChange={(event) =>
              setListingType(
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            <option value="all">
              All Types
            </option>

            <option value="rent">
              Rental
            </option>

            <option value="sale">
              For Sale
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
            {filteredCars.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {cars.length}
          </span>{' '}
          vehicles
        </p>

        {(search ||
          status !== 'all' ||
          listingType !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('all');
              setListingType('all');
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
            Loading vehicles...
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

          <button
            type="button"
            onClick={() => {
              setError('');
              setLoading(true);
            }}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================================= */}
      {/* EMPTY STATE */}
      {/* ================================= */}

      {!loading &&
        !error &&
        filteredCars.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🚗
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No cars found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              No vehicles match your current
              search or filters.
            </p>

            {(search ||
              status !== 'all' ||
              listingType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setListingType('all');
                }}
                className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      {/* ================================= */}
      {/* CAR GRID */}
      {/* ================================= */}

      {!loading &&
        !error &&
        filteredCars.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCars.map(
              (car) => (
                <CarCard
                  key={car.id}
                  car={car}
                />
              ),
            )}
          </div>
        )}
    </div>
  );
}

/* ===================================== */
/* CAR CARD */
/* ===================================== */

function CarCard({
  car,
}: {
  car: Car;
}) {
  const image =
    car.thumbnail ||
    car.images?.[0];

  const mileageText =
    typeof car.mileage ===
    'number'
      ? `${car.mileage.toLocaleString(
          'en-IN',
        )} km`
      : 'Mileage not specified';

  const hasRental =
    car.isAvailableForRent === true;

  const hasSale =
    car.isListedForSale === true;

  return (
    <Link
      href={`/dashboard/cars/${car.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
    >
      {/* Image */}

      <div className="relative h-52 overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={`${car.make || ''} ${
              car.model || ''
            }`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-slate-100 text-slate-300">
            <span className="text-4xl">
              🚗
            </span>

            <span className="mt-2 text-xs">
              No image
            </span>
          </div>
        )}

        {/* Status */}

        <div className="absolute left-3 top-3">
          <StatusBadge
            status={
              car.listingStatus
            }
          />
        </div>

        {/* Listing type */}

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {hasRental && (
            <span className="rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              Rental
            </span>
          )}

          {hasSale && (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              For Sale
            </span>
          )}
        </div>
      </div>

      {/* Content */}

      <div className="p-5">
        {/* Name */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">
              {car.make || 'Unknown Make'}
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
              {car.model ||
                'Unknown Model'}
            </h2>
          </div>

          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {car.year || '—'}
          </span>
        </div>

        {/* Specs */}

        <div className="mt-4 flex flex-wrap gap-2">
          {car.type && (
            <Spec text={car.type} />
          )}

          {car.fuelType && (
            <Spec
              text={car.fuelType}
            />
          )}

          {car.transmission && (
            <Spec
              text={
                car.transmission
              }
            />
          )}

          <Spec text={mileageText} />
        </div>

        {/* Prices */}

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Sale Price
            </p>

            <p className="mt-1 truncate text-base font-bold text-slate-900">
              {typeof car.salePrice ===
                'number'
                ? `₹${car.salePrice.toLocaleString(
                    'en-IN',
                  )}`
                : '—'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Rent / Day
            </p>

            <p className="mt-1 truncate text-base font-bold text-slate-900">
              {typeof car.pricePerDay ===
                'number'
                ? `₹${car.pricePerDay.toLocaleString(
                    'en-IN',
                  )}`
                : '—'}
            </p>
          </div>
        </div>

        {/* Owner */}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Owner
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-600">
              {car.ownerName ||
                'Not specified'}
            </p>
          </div>

          <span className="shrink-0 text-sm text-slate-300 transition group-hover:text-cyan-500">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ===================================== */
/* STATUS BADGE */
/* ===================================== */

function StatusBadge({
  status,
}: {
  status: Car['listingStatus'];
}) {
  const config: Record<
    Car['listingStatus'],
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

    sold: {
      label: 'Sold',
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
    },

    inactive: {
      label: 'Inactive',
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  };

  const current =
    config[status] ??
    config.inactive;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* ===================================== */
/* SPEC CHIP */
/* ===================================== */

function Spec({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">
      {text}
    </span>
  );
}