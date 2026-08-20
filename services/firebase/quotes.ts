import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from './config';

/* ===================================== */
/* UPDATE STATUS */
/* ===================================== */

export const updateQuoteStatus = async (
  quoteId: string,
  status: QuoteStatus,
  reviewedBy: string,
) => {
  const quoteRef = doc(
    db,
    'quotes',
    quoteId,
  );

  await updateDoc(quoteRef, {
    status,
    reviewedBy,
    updatedAt: serverTimestamp(),
  });
};

/* ===================================== */
/* TYPES */
/* ===================================== */

export type QuoteStatus =
  | 'pending'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface AdminQuote {
  id: string;

  carId: string;
  carMake?: string;
  carModel?: string;

  buyerId: string;
  buyerName?: string;
  buyerPhone?: string;

  sellerId?: string;

  offeredPrice: number;
  message?: string;

  status: QuoteStatus;

  createdAt?: unknown;
  updatedAt?: unknown;

  reviewedBy?: string;
}

/* ===================================== */
/* DATE HELPER */
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

/* ===================================== */
/* GET ALL QUOTES */
/* ===================================== */

/**
 * Admin receives every quote.
 *
 * We intentionally do not use Firestore
 * orderBy('createdAt') because existing
 * documents may not have createdAt.
 */
export const subscribeToAllQuotes = (
  onData: (quotes: AdminQuote[]) => void,
  onError?: (error: Error) => void,
) => {
  return onSnapshot(
    collection(db, 'quotes'),
    (snapshot) => {
      console.log(
        '🔥 ADMIN QUOTES COUNT:',
        snapshot.size,
      );

      const quotes = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        } as AdminQuote),
      );

      console.log(
        '🔥 ADMIN QUOTES DATA:',
        quotes,
      );

      onData(quotes);
    },
    (error) => {
      console.error(
        '🔥 ADMIN QUOTES ERROR:',
        error,
      );

      onError?.(error);
    },
  );
};
/* ===================================== */
/* START REVIEW */
/* ===================================== */

export const startQuoteReview =
  async (
    quoteId: string,
    reviewedBy: string,
  ) => {
    await updateQuoteStatus(
      quoteId,
      'reviewing',
      reviewedBy,
    );
  };

/* ===================================== */
/* ACCEPT */
/* ===================================== */

export const acceptQuote = async (
  quoteId: string,
  reviewedBy: string,
) => {
  await updateQuoteStatus(
    quoteId,
    'accepted',
    reviewedBy,
  );
};

/* ===================================== */
/* REJECT */
/* ===================================== */

export const rejectQuote = async (
  quoteId: string,
  reviewedBy: string,
) => {
  await updateQuoteStatus(
    quoteId,
    'rejected',
    reviewedBy,
  );
};

/* ===================================== */
/* WITHDRAW */
/* ===================================== */

export const withdrawQuote =
  async (
    quoteId: string,
    reviewedBy: string,
  ) => {
    await updateQuoteStatus(
      quoteId,
      'withdrawn',
      reviewedBy,
    );
  };