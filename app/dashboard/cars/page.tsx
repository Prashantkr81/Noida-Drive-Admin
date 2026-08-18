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
  const [cars, setCars] = useState<Car[]>(
    [],
  );

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
        const matchesSearch =
          !searchValue ||
          `${car.make} ${car.model}`
            .toLowerCase()
            .includes(searchValue) ||
          car.ownerName
            ?.toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          status === 'all' ||
          car.listingStatus === status;

        const matchesListingType =
          listingType === 'all' ||
          (listingType === 'rent' &&
            car.isAvailableForRent) ||
          (listingType === 'sale' &&
            car.isListedForSale);

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
      {/* Header */}

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

      {/* Filters */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by car or owner..."
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

          <select
            value={listingType}
            onChange={(event) =>
              setListingType(
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400"
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

      {/* Count */}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredCars.length}
          </span>{' '}
          vehicles
        </p>
      </div>

      {/* States */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">
            Loading vehicles...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Cars */}

      {!loading &&
        !error &&
        filteredCars.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              🚗
            </div>

            <h2 className="mt-4 font-semibold text-slate-800">
              No cars found
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}

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

  return (
    <Link
      href={`/dashboard/cars/${car.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
    >
      {/* Image */}

      <div className="relative h-52 overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-300">
            🚗
          </div>
        )}

        <div className="absolute left-3 top-3">
          <StatusBadge
            status={car.listingStatus}
          />
        </div>
      </div>

      {/* Content */}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              {car.make}
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {car.model}
            </h2>
          </div>

          <p className="text-sm font-semibold text-slate-500">
            {car.year}
          </p>
        </div>

        {/* Specs */}

        <div className="mt-4 flex flex-wrap gap-2">
          <Spec text={car.type} />
          <Spec text={car.fuelType} />
          <Spec text={car.transmission} />
          <Spec
            text={`${car.mileage.toLocaleString(
              'en-IN',
            )} km`}
          />
        </div>

        {/* Pricing */}

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sale Price
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {car.salePrice
                  ? `₹${car.salePrice.toLocaleString(
                      'en-IN',
                    )}`
                  : '—'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Rent / Day
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {car.pricePerDay
                  ? `₹${car.pricePerDay.toLocaleString(
                      'en-IN',
                    )}`
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Listing modes */}

        <div className="mt-4 flex gap-2">
          {car.isAvailableForRent && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
              Rental
            </span>
          )}

          {car.isListedForSale && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
              For Sale
            </span>
          )}

          {!car.isAvailableForRent &&
            !car.isListedForSale && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                Unlisted
              </span>
            )}
        </div>

        {/* Owner */}

        <div className="mt-4 text-xs text-slate-400">
          Owner:{' '}
          <span className="font-medium text-slate-600">
            {car.ownerName ||
              'No owner'}
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
  const config = {
    pending: {
      label: 'Pending',
      className:
        'bg-amber-50 text-amber-700 border-amber-200',
    },

    approved: {
      label: 'Approved',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200',
    },

    rejected: {
      label: 'Rejected',
      className:
        'bg-red-50 text-red-700 border-red-200',
    },

    sold: {
      label: 'Sold',
      className:
        'bg-violet-50 text-violet-700 border-violet-200',
    },

    inactive: {
      label: 'Inactive',
      className:
        'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const current =
    config[status];

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* ===================================== */
/* SPEC */
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