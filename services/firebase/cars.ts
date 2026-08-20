import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './config';

/* ===================================== */
/* TYPES */
/* ===================================== */

export type CarType =
  | 'SUV'
  | 'Sedan'
  | 'Hatchback'
  | 'Luxury'
  | 'Convertible';

export type FuelType =
  | 'Petrol'
  | 'Diesel'
  | 'Electric'
  | 'Hybrid';

export type TransmissionType =
  | 'Manual'
  | 'Automatic';

export type ListingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'sold'
  | 'inactive';

export interface Car {
  id: string;

  make: string;
  model: string;
  year: number;

  type: CarType;
  fuelType: FuelType;
  transmission: TransmissionType;

  mileage?: number;
  color?: string;

  images?: string[];
  thumbnail?: string;

  isAvailableForRent: boolean;
  pricePerDay?: number;

  isListedForSale: boolean;
  salePrice?: number;

  ownerId?: string;
  ownerName?: string;

  listingStatus: ListingStatus;

  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;

  description?: string;
  location?: string;
  features?: string[];

  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CreateAdminCarData {
  make: string;
  model: string;
  year: number;

  type: CarType;
  fuelType: FuelType;
  transmission: TransmissionType;

  mileage?: number;
  color?: string;

  images?: string[];
  thumbnail?: string;

  isAvailableForRent: boolean;
  pricePerDay?: number;

  isListedForSale: boolean;
  salePrice?: number;

  description?: string;
  location?: string;
  features?: string[];
}

/* ===================================== */
/* TIMESTAMP HELPER */
/* ===================================== */

function getTimestampMillis(
  value: unknown,
): number {
  if (!value) {
    return 0;
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
        toDate?: () => Date;
      };

    if (
      typeof timestamp.toMillis ===
      'function'
    ) {
      return timestamp.toMillis();
    }

    if (
      typeof timestamp.toDate ===
      'function'
    ) {
      return timestamp
        .toDate()
        .getTime();
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed =
      Date.parse(value);

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  }

  return 0;
}

/* ===================================== */
/* SUBSCRIBE TO ALL CARS */
/* ===================================== */

export const subscribeToAllCars = (
  onData: (
    cars: Car[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
) => {
  const carsCollection =
    collection(
      db,
      'cars',
    );

  return onSnapshot(
    carsCollection,
    (snapshot) => {
      const cars =
        snapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            }) as Car,
        );

      cars.sort(
        (a, b) =>
          getTimestampMillis(
            b.createdAt,
          ) -
          getTimestampMillis(
            a.createdAt,
          ),
      );

      onData(cars);
    },
    (error) => {
      console.error(
        'ADMIN CARS ERROR:',
        error,
      );

      onError?.(error);
    },
  );
};

/* ===================================== */
/* CREATE ADMIN CAR */
/* ===================================== */

export const createAdminCar =
  async (
    data: CreateAdminCarData,
    adminId: string,
  ) => {
    if (!data.make.trim()) {
      throw new Error(
        'Car make is required.',
      );
    }

    if (!data.model.trim()) {
      throw new Error(
        'Car model is required.',
      );
    }

    if (
      !data.year ||
      data.year < 1900
    ) {
      throw new Error(
        'Please enter a valid car year.',
      );
    }

    if (data.isAvailableForRent) {
      if (
        data.pricePerDay == null ||
        data.pricePerDay <= 0
      ) {
        throw new Error(
          'Price per day is required for rental cars.',
        );
      }
    }

    if (data.isListedForSale) {
      if (
        data.salePrice == null ||
        data.salePrice <= 0
      ) {
        throw new Error(
          'Sale price is required for marketplace listings.',
        );
      }
    }

    const carRef =
      await addDoc(
        collection(
          db,
          'cars',
        ),
        {
          /* Basic */

          make:
            data.make.trim(),

          model:
            data.model.trim(),

          year:
            data.year,

          type:
            data.type,

          fuelType:
            data.fuelType,

          transmission:
            data.transmission,

          /* Vehicle */

          mileage:
            data.mileage || 0,

          color:
            data.color?.trim() ||
            '',

          /* Images */

          images:
            data.images || [],

          thumbnail:
            data.thumbnail ||
            data.images?.[0] ||
            '',

          /* Rental */

          isAvailableForRent:
            data.isAvailableForRent,

          pricePerDay:
            data.isAvailableForRent
              ? data.pricePerDay ||
                0
              : null,

          /* Marketplace */

          isListedForSale:
            data.isListedForSale,

          salePrice:
            data.isListedForSale
              ? data.salePrice ||
                0
              : null,

          /* Extra */

          description:
            data.description?.trim() ||
            '',

          location:
            data.location?.trim() ||
            '',

          features:
            data.features || [],

          /* Admin */

          ownerId:
            adminId,

          ownerName:
            'Noida Drive',

          listingStatus:
            'approved',

          rejectionReason:
            '',

          adminNotes:
            '',

          reviewedBy:
            adminId,

          /* Metadata */

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

    return carRef.id;
  };