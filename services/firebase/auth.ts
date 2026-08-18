import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from './config';

export const loginAdmin = async (
  email: string,
  password: string,
) => {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

  const user = credential.user;

  const userSnapshot = await getDoc(
    doc(db, 'users', user.uid),
  );

  if (!userSnapshot.exists()) {
    await signOut(auth);

    throw new Error(
      'Admin profile not found.',
    );
  }

  const userData =
    userSnapshot.data();

  if (userData.role !== 'admin') {
    await signOut(auth);

    throw new Error(
      'You are not authorized to access the admin panel.',
    );
  }

  return {
    uid: user.uid,
    email: user.email,
    ...userData,
  };
};

export const logoutAdmin =
  async () => {
    await signOut(auth);
  };