import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { FIREBASE_CONFIG } from './model';

const firebaseApp = initializeApp(FIREBASE_CONFIG);

/** Injectable reference to Firebase Firestore. */
export const FIRESTORE: InjectionToken<Firestore> = new InjectionToken(
    'FIRESTORE',
    {
        providedIn: 'root',
        factory: () => getFirestore(firebaseApp),
    },
);

/** Injectable reference to Firebase Storage. */
export const STORAGE: InjectionToken<FirebaseStorage> = new InjectionToken(
    'STORAGE',
    {
        providedIn: 'root',
        factory: () => getStorage(firebaseApp),
    },
);

/** Injectable reference to Firebase Authentication. */
export const AUTH: InjectionToken<Auth> = new InjectionToken('AUTH', {
    providedIn: 'root',
    factory: () => getAuth(firebaseApp),
});

/** Injectable reference to Firebase Functions. */
export const FUNCTIONS: InjectionToken<Functions> = new InjectionToken(
    'FUNCTIONS',
    {
        providedIn: 'root',
        factory: () => getFunctions(firebaseApp),
    },
);
