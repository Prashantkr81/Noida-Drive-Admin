import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import { db } from './config';

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

  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Convert Firestore Timestamp / Date / string
 * into milliseconds.
 */
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
    const firestoreValue =
      value as {
        toMillis?: () => number;
        toDate?: () => Date;
      };

    if (
      typeof firestoreValue.toMillis ===
      'function'
    ) {
      return firestoreValue.toMillis();
    }

    if (
      typeof firestoreValue.toDate ===
      'function'
    ) {
      return firestoreValue
        .toDate()
        .getTime();
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  return 0;
}

/**
 * Subscribe to all cars for Admin Panel.
 *
 * No Firestore orderBy is used because some
 * existing documents may not contain createdAt.
 */
export const subscribeToAllCars = (
  onData: (cars: Car[]) => void,
  onError?: (error: Error) => void,
) => {
  const carsCollection = collection(
    db,
    'cars',
  );

  return onSnapshot(
    carsCollection,
    (snapshot) => {
      const cars = snapshot.docs.map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as Car,
      );

      // Newest first when createdAt exists.
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