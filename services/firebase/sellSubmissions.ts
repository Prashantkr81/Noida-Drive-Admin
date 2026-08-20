import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from './config';
import { createNotification } from './notificationWriter';

/* ===================================== */
/* TYPES */
/* ===================================== */

export type SellSubmissionStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface AdminSellSubmission {
  id: string;

  sellerId: string;

  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;

  make: string;
  model: string;
  year: number;

  kilometersDriven?: number;

  condition:
    | 'excellent'
    | 'good'
    | 'fair'
    | 'poor';

  fuelType?: string;
  transmission?: string;
  color?: string;

  type?:
    | 'SUV'
    | 'Sedan'
    | 'Hatchback'
    | 'Luxury'
    | 'Convertible';

  images?: string[];

  expectedPrice?: number;

  status:
    SellSubmissionStatus;

  rejectionReason?: string;
  adminNotes?: string;

  reviewedBy?: string;

  listingId?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
}

/* ===================================== */
/* ALL SUBMISSIONS */
/* ===================================== */

export const subscribeToAllSellSubmissions =
  (
    onData: (
      submissions:
        AdminSellSubmission[],
    ) => void,
    onError?: (
      error: Error,
    ) => void,
  ) => {
    return onSnapshot(
      collection(
        db,
        'sellSubmissions',
      ),
      (snapshot) => {
        const submissions =
          snapshot.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as AdminSellSubmission,
          );

        submissions.sort(
          (a, b) =>
            getTimestampMillis(
              b.createdAt,
            ) -
            getTimestampMillis(
              a.createdAt,
            ),
        );

        onData(
          submissions,
        );
      },
      (error) => {
        console.error(
          'ADMIN SELL SUBMISSIONS ERROR:',
          error,
        );

        onError?.(error);
      },
    );
  };

/* ===================================== */
/* START REVIEW */
/* ===================================== */

export const startSellSubmissionReview =
  async (
    submissionId: string,
    adminId: string,
  ) => {
    const submissionRef =
      doc(
        db,
        'sellSubmissions',
        submissionId,
      );

    const snapshot =
      await getDoc(
        submissionRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Sell submission not found.',
      );
    }

    await updateDoc(
      submissionRef,
      {
        status:
          'reviewing',

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );
  };

/* ===================================== */
/* APPROVE */
/* ===================================== */

export const approveSellSubmission =
  async (
    submission:
      AdminSellSubmission,

    adminId: string,

    adminNotes: string,

    vehicleType:
      | 'SUV'
      | 'Sedan'
      | 'Hatchback'
      | 'Luxury'
      | 'Convertible',
  ) => {
    if (!vehicleType) {
      throw new Error(
        'Vehicle type is required before approval.',
      );
    }

    if (
      submission.listingId
    ) {
      throw new Error(
        'A marketplace listing already exists for this submission.',
      );
    }

    /*
     * Create marketplace car.
     */
    const carRef =
      await addDoc(
        collection(
          db,
          'cars',
        ),
        {
          make:
            submission.make,

          model:
            submission.model,

          year:
            submission.year,

          type:
            vehicleType,

          fuelType:
            submission.fuelType ||
            'Petrol',

          transmission:
            submission.transmission ||
            'Manual',

          mileage:
            submission.kilometersDriven ||
            0,

          color:
            submission.color ||
            '',

          images:
            submission.images ||
            [],

          thumbnail:
            submission.images?.[0] ||
            '',

          isAvailableForRent:
            false,

          pricePerDay:
            null,

          isListedForSale:
            true,

          salePrice:
            submission.expectedPrice ||
            0,

          ownerId:
            submission.sellerId,

          ownerName:
            submission.sellerName ||
            '',

          listingStatus:
            'approved',

          rejectionReason:
            '',

          adminNotes:
            adminNotes.trim(),

          reviewedBy:
            adminId,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

    /*
     * Update submission.
     */
    await updateDoc(
      doc(
        db,
        'sellSubmissions',
        submission.id,
      ),
      {
        status:
          'approved',

        listingId:
          carRef.id,

        adminNotes:
          adminNotes.trim(),

        rejectionReason:
          '',

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );

    /*
     * Notify seller.
     */
    try {
      await createNotification({
        userId:
          submission.sellerId,

        title:
          'Car Submission Approved',

        message: `Your ${submission.make} ${submission.model} has been approved and listed on the marketplace.`,

        type: 'sell',

        data: {
          screen:
            `/profile/sell-submissions/${submission.id}`,

          submissionId:
            submission.id,

          listingId:
            carRef.id,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'APPROVE SELL NOTIFICATION ERROR:',
        notificationError,
      );
    }

    return carRef.id;
  };

/* ===================================== */
/* REJECT */
/* ===================================== */

export const rejectSellSubmission =
  async (
    submissionId: string,

    rejectionReason: string,

    adminNotes: string,

    adminId: string,
  ) => {
    if (
      !rejectionReason.trim()
    ) {
      throw new Error(
        'Rejection reason is required.',
      );
    }

    const submissionRef =
      doc(
        db,
        'sellSubmissions',
        submissionId,
      );

    const snapshot =
      await getDoc(
        submissionRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Sell submission not found.',
      );
    }

    const submission =
      snapshot.data() as
        AdminSellSubmission;

    await updateDoc(
      submissionRef,
      {
        status:
          'rejected',

        rejectionReason:
          rejectionReason.trim(),

        adminNotes:
          adminNotes.trim(),

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          submission.sellerId,

        title:
          'Car Submission Rejected',

        message:
          'Your car submission has been rejected by our team.',

        type: 'sell',

        data: {
          screen:
            `/profile/sell-submissions/${submissionId}`,

          submissionId,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'REJECT SELL NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

/* ===================================== */
/* CANCEL */
/* ===================================== */

export const cancelSellSubmission =
  async (
    submissionId: string,
    adminId: string,
  ) => {
    const submissionRef =
      doc(
        db,
        'sellSubmissions',
        submissionId,
      );

    const snapshot =
      await getDoc(
        submissionRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Sell submission not found.',
      );
    }

    const submission =
      snapshot.data() as
        AdminSellSubmission;

    await updateDoc(
      submissionRef,
      {
        status:
          'cancelled',

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          submission.sellerId,

        title:
          'Sell Submission Cancelled',

        message:
          'Your car sale submission has been cancelled.',

        type: 'sell',

        data: {
          screen:
            `/profile/sell-submissions/${submissionId}`,

          submissionId,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'CANCEL SELL NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

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