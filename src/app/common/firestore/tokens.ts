import { InjectionToken } from '@angular/core';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { FirebaseStorage, getStorage } from 'firebase/storage';

const FIREBASE_CONFIG: FirebaseOptions = {
    projectId: 'pocket-pals-director',
    appId: '1:421698142516:web:9fd5531992f213bba56561',
    storageBucket: 'pocket-pals-director.firebasestorage.app',
    apiKey: 'AIzaSyAI7PBhNb177728aLV5U4LZsA0PgUvipIQ',
    authDomain: 'pocket-pals-director.firebaseapp.com',
    messagingSenderId: '421698142516',
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);

export const FIREBASE_PROJECT_ID = FIREBASE_CONFIG.projectId;
export const FIREBASE_STORAGE_BUCKET = FIREBASE_CONFIG.storageBucket;

export const FIRESTORE: InjectionToken<Firestore> = new InjectionToken(
    'FIRESTORE',
    {
        providedIn: 'root',
        factory: () => getFirestore(firebaseApp),
    },
);

export const STORAGE: InjectionToken<FirebaseStorage> = new InjectionToken(
    'STORAGE',
    {
        providedIn: 'root',
        factory: () => getStorage(firebaseApp),
    },
);

export const AUTH: InjectionToken<Auth> = new InjectionToken('AUTH', {
    providedIn: 'root',
    factory: () => getAuth(firebaseApp),
});

export const FUNCTIONS: InjectionToken<Functions> = new InjectionToken(
    'FUNCTIONS',
    {
        providedIn: 'root',
        factory: () => getFunctions(firebaseApp),
    },
);
