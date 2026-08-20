import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from './config';

import {
  createNotification,
} from './notificationWriter';

/* ===================================== */
/* TYPES */
/* ===================================== */

export type BookingStatus =
  | 'pending'
  | 'reviewing'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface AdminBooking {
  id: string;

  /* User */

  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;

  /* Car */

  carId: string;
  carMake?: string;
  carModel?: string;

  /* Rental */

  rentalType:
    | 'self_drive'
    | 'chauffeur';

  startDate?: unknown;
  endDate?: unknown;

  /* Location */

  pickupLocation: string;
  dropLocation?: string;

  /* User request */

  specialRequest?: string;

  /* Pricing */

  estimatedPrice?: number;
  finalPrice?: number | null;

  /* Admin workflow */

  status: BookingStatus;

  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;

  /* Metadata */

  createdAt?: unknown;
  updatedAt?: unknown;
}

/* ===================================== */
/* GET ALL BOOKINGS */
/* ===================================== */

export const subscribeToAllBookings = (
  onData: (
    bookings: AdminBooking[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
) => {
  const bookingsCollection =
    collection(
      db,
      'bookings',
    );

  const q = query(
    bookingsCollection,
    orderBy(
      'createdAt',
      'desc',
    ),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings =
        snapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            }) as AdminBooking,
        );

      onData(bookings);
    },
    (error) => {
      console.error(
        'ADMIN BOOKINGS ERROR:',
        error,
      );

      onError?.(error);
    },
  );
};

/* ===================================== */
/* UPDATE STATUS */
/* ===================================== */

export const updateBookingStatus =
  async (
    bookingId: string,
    status: BookingStatus,
    reviewedBy: string,
  ) => {
    const bookingRef = doc(
      db,
      'bookings',
      bookingId,
    );

    await updateDoc(
      bookingRef,
      {
        status,
        reviewedBy,
        updatedAt:
          serverTimestamp(),
      },
    );
  };

/* ===================================== */
/* UPDATE BOOKING */
/* ===================================== */

export const updateBooking = async (
  bookingId: string,
  data: {
    finalPrice?: number | null;
    adminNotes?: string;
    rejectionReason?: string;
    status?: BookingStatus;
    reviewedBy?: string;
  },
) => {
  const bookingRef = doc(
    db,
    'bookings',
    bookingId,
  );

  await updateDoc(
    bookingRef,
    {
      ...data,
      updatedAt:
        serverTimestamp(),
    },
  );
};

/* ===================================== */
/* CONFIRM BOOKING */
/* ===================================== */

export const confirmBooking = async (
  bookingId: string,
  finalPrice: number,
  adminNotes: string,
  reviewedBy: string,
) => {
  const bookingRef = doc(
    db,
    'bookings',
    bookingId,
  );

  /*
   * Read booking first so we know
   * which user should receive the
   * notification.
   */
  const snapshot =
    await import(
      'firebase/firestore'
    ).then(
      ({ getDoc }) =>
        getDoc(bookingRef),
    );

  if (!snapshot.exists()) {
    throw new Error(
      'Booking not found.',
    );
  }

  const booking =
    snapshot.data() as AdminBooking;

  await updateDoc(
    bookingRef,
    {
      status: 'confirmed',

      finalPrice,

      adminNotes:
        adminNotes.trim(),

      rejectionReason: '',

      reviewedBy,

      updatedAt:
        serverTimestamp(),
    },
  );

  /*
   * Notify customer.
   *
   * Notification failure must NOT
   * make the booking confirmation fail.
   */
  try {
    await createNotification({
      userId:
        booking.userId,

      title:
        'Rental Confirmed',

      message: `${
        booking.carMake ||
        'Your vehicle'
      } ${
        booking.carModel || ''
      } rental has been confirmed.`,

      type: 'booking',

      data: {
        screen: `/bookings/${bookingId}`,
        bookingId,
      },
    });
  } catch (notificationError) {
    console.error(
      'CONFIRM BOOKING NOTIFICATION ERROR:',
      notificationError,
    );
  }
};

/* ===================================== */
/* REJECT BOOKING */
/* ===================================== */

export const rejectBooking = async (
  bookingId: string,
  rejectionReason: string,
  adminNotes: string,
  reviewedBy: string,
) => {
  if (
    !rejectionReason.trim()
  ) {
    throw new Error(
      'Rejection reason is required.',
    );
  }

  const bookingRef = doc(
    db,
    'bookings',
    bookingId,
  );

  const snapshot =
    await import(
      'firebase/firestore'
    ).then(
      ({ getDoc }) =>
        getDoc(bookingRef),
    );

  if (!snapshot.exists()) {
    throw new Error(
      'Booking not found.',
    );
  }

  const booking =
    snapshot.data() as AdminBooking;

  await updateDoc(
    bookingRef,
    {
      status: 'rejected',

      rejectionReason:
        rejectionReason.trim(),

      adminNotes:
        adminNotes.trim(),

      reviewedBy,

      updatedAt:
        serverTimestamp(),
    },
  );

  try {
    await createNotification({
      userId:
        booking.userId,

      title:
        'Rental Request Rejected',

      message:
        'Your rental request has been rejected by our team.',

      type: 'booking',

      data: {
        screen: `/bookings/${bookingId}`,
        bookingId,
      },
    });
  } catch (notificationError) {
    console.error(
      'REJECT BOOKING NOTIFICATION ERROR:',
      notificationError,
    );
  }
};

/* ===================================== */
/* MARK COMPLETED */
/* ===================================== */

export const completeBooking =
  async (
    bookingId: string,
    reviewedBy: string,
  ) => {
    const bookingRef = doc(
      db,
      'bookings',
      bookingId,
    );

    const snapshot =
      await import(
        'firebase/firestore'
      ).then(
        ({ getDoc }) =>
          getDoc(bookingRef),
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Booking not found.',
      );
    }

    const booking =
      snapshot.data() as AdminBooking;

    await updateDoc(
      bookingRef,
      {
        status: 'completed',
        reviewedBy,
        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          booking.userId,

        title:
          'Rental Completed',

        message:
          'Your rental has been marked as completed.',

        type: 'booking',

        data: {
          screen: `/bookings/${bookingId}`,
          bookingId,
        },
      });
    } catch (notificationError) {
      console.error(
        'COMPLETE BOOKING NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

/* ===================================== */
/* CANCEL BOOKING */
/* ===================================== */

export const cancelBooking =
  async (
    bookingId: string,
    reviewedBy: string,
  ) => {
    const bookingRef = doc(
      db,
      'bookings',
      bookingId,
    );

    const snapshot =
      await import(
        'firebase/firestore'
      ).then(
        ({ getDoc }) =>
          getDoc(bookingRef),
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Booking not found.',
      );
    }

    const booking =
      snapshot.data() as AdminBooking;

    await updateDoc(
      bookingRef,
      {
        status: 'cancelled',
        reviewedBy,
        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          booking.userId,

        title:
          'Rental Cancelled',

        message:
          'Your rental request has been cancelled.',

        type: 'booking',

        data: {
          screen: `/bookings/${bookingId}`,
          bookingId,
        },
      });
    } catch (notificationError) {
      console.error(
        'CANCEL BOOKING NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

/* ===================================== */
/* START REVIEW */
/* ===================================== */

export const startBookingReview =
  async (
    bookingId: string,
    reviewedBy: string,
  ) => {
    await updateBookingStatus(
      bookingId,
      'reviewing',
      reviewedBy,
    );
  };

/* ===================================== */
/* CAR RENTAL AVAILABILITY */
/* ===================================== */

export const makeCarAvailableForRental =
  async (
    carId: string,
    adminId: string,
  ) => {
    if (!carId) {
      throw new Error(
        'Car ID is required.',
      );
    }

    await updateDoc(
      doc(
        db,
        'cars',
        carId,
      ),
      {
        isAvailableForRent: true,

        updatedAt:
          serverTimestamp(),

        reviewedBy: adminId,
      },
    );
  };

export const makeCarUnavailableForRental =
  async (
    carId: string,
    adminId: string,
  ) => {
    if (!carId) {
      throw new Error(
        'Car ID is required.',
      );
    }

    await updateDoc(
      doc(
        db,
        'cars',
        carId,
      ),
      {
        isAvailableForRent: false,

        updatedAt:
          serverTimestamp(),

        reviewedBy: adminId,
      },
    );
  };