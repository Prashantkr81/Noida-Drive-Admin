'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  CarType,
  FuelType,
  TransmissionType,
  createAdminCar,
} from '@/services/firebase/cars';

export default function NewCarPage() {
  const router = useRouter();

  const [make, setMake] =
    useState('');

  const [model, setModel] =
    useState('');

  const [year, setYear] =
    useState('');

  const [type, setType] =
    useState<CarType>('SUV');

  const [fuelType, setFuelType] =
    useState<FuelType>('Petrol');

  const [transmission, setTransmission] =
    useState<TransmissionType>(
      'Automatic',
    );

  const [mileage, setMileage] =
    useState('');

  const [color, setColor] =
    useState('');

  const [pricePerDay, setPricePerDay] =
    useState('');

  const [salePrice, setSalePrice] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [location, setLocation] =
    useState('');

  const [features, setFeatures] =
    useState('');

  const [images, setImages] =
    useState('');

  const [isAvailableForRent, setIsAvailableForRent] =
    useState(true);

  const [isListedForSale, setIsListedForSale] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      setSaving(true);

      const imageList =
        images
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean);

      const featureList =
        features
          .split(',')
          .map((feature) =>
            feature.trim(),
          )
          .filter(Boolean);

      const carId =
        await createAdminCar(
          {
            make,
            model,

            year:
              Number(year),

            type,

            fuelType,

            transmission,

            mileage:
              Number(mileage) || 0,

            color,

            images:
              imageList,

            thumbnail:
              imageList[0] || '',

            isAvailableForRent,

            pricePerDay:
              Number(pricePerDay) ||
              0,

            isListedForSale,

            salePrice:
              Number(salePrice) ||
              0,

            description,

            location,

            features:
              featureList,
          },

          'admin',
        );

      console.log(
        'ADMIN CAR CREATED:',
        carId,
      );

      setSuccess(
        'Car created successfully.',
      );

      setTimeout(() => {
        router.push(
          '/dashboard/cars',
        );
      }, 700);
    } catch (err) {
      console.error(
        'CREATE ADMIN CAR ERROR:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create car.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8">
        <Link
          href="/dashboard/cars"
          className="text-sm font-medium text-slate-400 hover:text-slate-700"
        >
          ← Back to Cars
        </Link>

        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-cyan-600">
          Inventory
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Add New Car
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add a Noida Drive vehicle to the rental or
          marketplace inventory.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"
      >

        {/* ================================= */}
        {/* LEFT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Basic */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Basic Information
            </SectionTitle>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Make"
                value={make}
                onChange={setMake}
                placeholder="BMW"
                required
              />

              <Field
                label="Model"
                value={model}
                onChange={setModel}
                placeholder="X5"
                required
              />

              <Field
                label="Year"
                value={year}
                onChange={setYear}
                placeholder="2025"
                type="number"
                required
              />

              <SelectField
                label="Vehicle Type"
                value={type}
                onChange={(value) =>
                  setType(
                    value as CarType,
                  )
                }
                options={[
                  'SUV',
                  'Sedan',
                  'Hatchback',
                  'Luxury',
                  'Convertible',
                ]}
              />

              <SelectField
                label="Fuel Type"
                value={fuelType}
                onChange={(value) =>
                  setFuelType(
                    value as FuelType,
                  )
                }
                options={[
                  'Petrol',
                  'Diesel',
                  'Electric',
                  'Hybrid',
                ]}
              />

              <SelectField
                label="Transmission"
                value={transmission}
                onChange={(value) =>
                  setTransmission(
                    value as TransmissionType,
                  )
                }
                options={[
                  'Manual',
                  'Automatic',
                ]}
              />

              <Field
                label="Mileage (km)"
                value={mileage}
                onChange={setMileage}
                placeholder="25000"
                type="number"
              />

              <Field
                label="Color"
                value={color}
                onChange={setColor}
                placeholder="White"
              />
            </div>
          </section>

          {/* Rental */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Rental
            </SectionTitle>

            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Available for Rental
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Show this vehicle in the user app Rent section.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  isAvailableForRent
                }
                onChange={(event) =>
                  setIsAvailableForRent(
                    event.target.checked,
                  )
                }
                className="h-5 w-5 accent-cyan-500"
              />
            </label>

            {isAvailableForRent && (
              <div className="mt-4">
                <Field
                  label="Price Per Day (₹)"
                  value={
                    pricePerDay
                  }
                  onChange={
                    setPricePerDay
                  }
                  placeholder="12000"
                  type="number"
                  required
                />
              </div>
            )}
          </section>

          {/* Marketplace */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Marketplace
            </SectionTitle>

            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  List for Sale
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Also show this vehicle in the marketplace.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  isListedForSale
                }
                onChange={(event) =>
                  setIsListedForSale(
                    event.target.checked,
                  )
                }
                className="h-5 w-5 accent-cyan-500"
              />
            </label>

            {isListedForSale && (
              <div className="mt-4">
                <Field
                  label="Sale Price (₹)"
                  value={
                    salePrice
                  }
                  onChange={
                    setSalePrice
                  }
                  placeholder="1500000"
                  type="number"
                  required
                />
              </div>
            )}
          </section>

          {/* Details */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Additional Details
            </SectionTitle>

            <div className="mt-5 space-y-4">
              <Field
                label="Location"
                value={location}
                onChange={setLocation}
                placeholder="Greater Noida"
              />

              <TextArea
                label="Description"
                value={
                  description
                }
                onChange={
                  setDescription
                }
                placeholder="Premium SUV available for rental..."
              />

              <TextArea
                label="Features"
                value={features}
                onChange={setFeatures}
                placeholder="Sunroof, Leather Seats, Android Auto, 360 Camera"
              />
            </div>
          </section>

        </div>

        {/* ================================= */}
        {/* RIGHT */}
        {/* ================================= */}

        <div className="space-y-6">

          {/* Images */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>
              Images
            </SectionTitle>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Enter one image URL per line.
            </p>

            <textarea
              value={images}
              onChange={(event) =>
                setImages(
                  event.target.value,
                )
              }
              rows={8}
              placeholder={`https://example.com/car-1.jpg
https://example.com/car-2.jpg`}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </section>

          {/* Publish Status */}

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Admin Inventory
            </p>

            <h2 className="mt-2 text-lg font-bold text-emerald-800">
              Ready to Publish
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-700">
              Cars created here are approved immediately
              because they are controlled inventory.
            </p>

            <div className="mt-4 space-y-2 text-xs text-emerald-700">
              <p>
                ✓ Admin ownership
              </p>

              <p>
                ✓ Listing status: Approved
              </p>

              <p>
                ✓ Rental availability controlled by Admin
              </p>
            </div>
          </section>

          {/* Submit */}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Creating Car...'
              : 'Create Car'}
          </button>

          <Link
            href="/dashboard/cars"
            className="block w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

        </div>
      </form>
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
/* FIELD */
/* ===================================== */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
      />
    </div>
  );
}

/* ===================================== */
/* SELECT */
/* ===================================== */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

/* ===================================== */
/* TEXT AREA */
/* ===================================== */

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        rows={4}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
      />
    </div>
  );
}