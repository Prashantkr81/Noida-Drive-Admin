import {
  collection,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore';

import { db } from './config';

export interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  activeListings: number;
  rentalRequests: number;
  activeRentals: number;
  completedRides: number;
  pendingSellSubmissions: number;
  pendingQuotes: number;
  pendingConsultations: number;
}

export const getDashboardStats =
  async (): Promise<DashboardStats> => {
    const [
      usersSnapshot,
      carsSnapshot,
      activeListingsSnapshot,
      rentalRequestsSnapshot,
      activeRentalsSnapshot,
      completedRidesSnapshot,
      pendingSellSnapshot,
      pendingQuotesSnapshot,
      pendingConsultationsSnapshot,
    ] = await Promise.all([
      getCountFromServer(
        collection(db, 'users'),
      ),

      getCountFromServer(
        collection(db, 'cars'),
      ),

      getCountFromServer(
        query(
          collection(db, 'cars'),
          where(
            'listingStatus',
            '==',
            'approved',
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(db, 'bookings'),
          where(
            'status',
            'in',
            ['pending', 'reviewing'],
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(db, 'bookings'),
          where(
            'status',
            '==',
            'confirmed',
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(db, 'bookings'),
          where(
            'status',
            '==',
            'completed',
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(
            db,
            'sellSubmissions',
          ),
          where(
            'status',
            'in',
            ['pending', 'reviewing'],
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(db, 'quotes'),
          where(
            'status',
            'in',
            ['pending', 'reviewing'],
          ),
        ),
      ),

      getCountFromServer(
        query(
          collection(
            db,
            'consultations',
          ),
          where(
            'status',
            'in',
            ['pending', 'reviewing'],
          ),
        ),
      ),
    ]);

    return {
      totalUsers:
        usersSnapshot.data().count,

      totalCars:
        carsSnapshot.data().count,

      activeListings:
        activeListingsSnapshot.data().count,

      rentalRequests:
        rentalRequestsSnapshot.data().count,

      activeRentals:
        activeRentalsSnapshot.data().count,

      completedRides:
        completedRidesSnapshot.data().count,

      pendingSellSubmissions:
        pendingSellSnapshot.data().count,

      pendingQuotes:
        pendingQuotesSnapshot.data().count,

      pendingConsultations:
        pendingConsultationsSnapshot.data().count,
    };
  };