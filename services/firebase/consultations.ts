import {
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

export type ConsultationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'completed'
  | 'cancelled';

export interface AdminConsultation {
  id: string;

  userId: string;

  userName?: string;
  userEmail?: string;
  userPhone?: string;

  subject?: string;
  message: string;

  preferredContactMethod?:
    | 'phone'
    | 'email';

  preferredDate?: string;

  status: ConsultationStatus;

  adminNotes?: string;
  reviewedBy?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
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
/* GET ALL CONSULTATIONS */
/* ===================================== */

export const subscribeToAllConsultations =
  (
    onData: (
      consultations:
        AdminConsultation[],
    ) => void,
    onError?: (
      error: Error,
    ) => void,
  ) => {
    return onSnapshot(
      collection(
        db,
        'consultations',
      ),
      (snapshot) => {
        const consultations =
          snapshot.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as AdminConsultation,
          );

        consultations.sort(
          (a, b) =>
            getTimestampMillis(
              b.createdAt,
            ) -
            getTimestampMillis(
              a.createdAt,
            ),
        );

        onData(
          consultations,
        );
      },
      (error) => {
        console.error(
          'ADMIN CONSULTATIONS ERROR:',
          error,
        );

        onError?.(error);
      },
    );
  };

/* ===================================== */
/* START REVIEW */
/* ===================================== */

export const startConsultationReview =
  async (
    consultationId: string,
    adminId: string,
  ) => {
    const consultationRef =
      doc(
        db,
        'consultations',
        consultationId,
      );

    const snapshot =
      await getDoc(
        consultationRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Consultation not found.',
      );
    }

    await updateDoc(
      consultationRef,
      {
        status: 'reviewing',

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );
  };

/* ===================================== */
/* MARK CONTACTED */
/* ===================================== */

export const markConsultationContacted =
  async (
    consultationId: string,
    adminId: string,
    adminNotes: string,
  ) => {
    const consultationRef =
      doc(
        db,
        'consultations',
        consultationId,
      );

    const snapshot =
      await getDoc(
        consultationRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Consultation not found.',
      );
    }

    const consultation =
      snapshot.data() as
        AdminConsultation;

    await updateDoc(
      consultationRef,
      {
        status: 'contacted',

        reviewedBy:
          adminId,

        adminNotes:
          adminNotes.trim(),

        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          consultation.userId,

        title:
          'Consultation Update',

        message:
          'Our team has contacted you regarding your consultation request.',

        type: 'consultation',

        data: {
          screen:
            `/consultations/${consultationId}`,

          consultationId,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'CONTACTED CONSULTATION NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

/* ===================================== */
/* COMPLETE CONSULTATION */
/* ===================================== */

export const completeConsultation =
  async (
    consultationId: string,
    adminId: string,
    adminNotes: string,
  ) => {
    const consultationRef =
      doc(
        db,
        'consultations',
        consultationId,
      );

    const snapshot =
      await getDoc(
        consultationRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Consultation not found.',
      );
    }

    const consultation =
      snapshot.data() as
        AdminConsultation;

    await updateDoc(
      consultationRef,
      {
        status: 'completed',

        reviewedBy:
          adminId,

        adminNotes:
          adminNotes.trim(),

        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          consultation.userId,

        title:
          'Consultation Completed',

        message:
          'Your consultation request has been completed.',

        type: 'consultation',

        data: {
          screen:
            `/consultations/${consultationId}`,

          consultationId,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'COMPLETE CONSULTATION NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };

/* ===================================== */
/* CANCEL CONSULTATION */
/* ===================================== */

export const cancelConsultation =
  async (
    consultationId: string,
    adminId: string,
  ) => {
    const consultationRef =
      doc(
        db,
        'consultations',
        consultationId,
      );

    const snapshot =
      await getDoc(
        consultationRef,
      );

    if (!snapshot.exists()) {
      throw new Error(
        'Consultation not found.',
      );
    }

    const consultation =
      snapshot.data() as
        AdminConsultation;

    await updateDoc(
      consultationRef,
      {
        status: 'cancelled',

        reviewedBy:
          adminId,

        updatedAt:
          serverTimestamp(),
      },
    );

    try {
      await createNotification({
        userId:
          consultation.userId,

        title:
          'Consultation Cancelled',

        message:
          'Your consultation request has been cancelled.',

        type: 'consultation',

        data: {
          screen:
            `/consultations/${consultationId}`,

          consultationId,
        },
      });
    } catch (
      notificationError
    ) {
      console.error(
        'CANCEL CONSULTATION NOTIFICATION ERROR:',
        notificationError,
      );
    }
  };