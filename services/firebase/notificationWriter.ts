import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './config';

export type NotificationType =
  | 'booking'
  | 'quote'
  | 'sell'
  | 'consultation'
  | 'system';

interface CreateNotificationData {
  userId: string;

  title: string;

  message: string;

  type: NotificationType;

  data?: Record<string, string>;
}

export const createNotification =
  async (
    data: CreateNotificationData,
  ) => {
    if (!data.userId) {
      throw new Error(
        'Notification userId is required.',
      );
    }

    if (!data.title.trim()) {
      throw new Error(
        'Notification title is required.',
      );
    }

    if (!data.message.trim()) {
      throw new Error(
        'Notification message is required.',
      );
    }

    const notificationRef =
      await addDoc(
        collection(
          db,
          'notifications',
        ),
        {
          userId:
            data.userId,

          title:
            data.title.trim(),

          message:
            data.message.trim(),

          type:
            data.type,

          data:
            data.data || {},

          isRead:
            false,

          createdAt:
            serverTimestamp(),
        },
      );

    return notificationRef.id;
  };