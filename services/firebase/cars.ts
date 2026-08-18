import {
  collection,
  onSnapshot,
  orderBy,
  query,
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

  mileage: number;
  color?: string;

  images: string[];
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
 * Subscribe to ALL cars for the admin panel.
 *
 * Unlike the mobile app:
 * - does not filter by rent availability
 * - does not filter by sale listing
 * - does not filter by approval status
 *
 * Admin needs visibility into every listing.
 */
export const subscribeToAllCars = (
  onData: (cars: Car[]) => void,
  onError?: (error: Error) => void,
) => {
  const q = query(
    collection(db, 'cars'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const cars = snapshot.docs.map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as Car,
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