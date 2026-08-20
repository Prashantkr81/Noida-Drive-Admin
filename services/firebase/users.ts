import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import { db } from './config';

export interface AdminUser {
  id: string;

  name?: string;
  email?: string;
  phone?: string;

  role?: string;

  createdAt?: unknown;
  updatedAt?: unknown;

  pushTokens?: string[];
}

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

export const subscribeToAllUsers = (
  onData: (
    users: AdminUser[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
) => {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users =
        snapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            }) as AdminUser,
        );

      users.sort(
        (a, b) =>
          getTimestampMillis(
            b.createdAt,
          ) -
          getTimestampMillis(
            a.createdAt,
          ),
      );

      onData(users);
    },
    (error) => {
      console.error(
        'ADMIN USERS ERROR:',
        error,
      );

      onError?.(error);
    },
  );
};