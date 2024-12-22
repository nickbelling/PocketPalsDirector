import {
    ApplicationConfig,
    InjectionToken,
    provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { routes } from './app.routes';

const FIREBASE_CONFIG: FirebaseOptions = {
    projectId: 'pocket-pals-director',
    appId: '1:421698142516:web:9fd5531992f213bba56561',
    storageBucket: 'pocket-pals-director.firebasestorage.app',
    apiKey: 'AIzaSyAI7PBhNb177728aLV5U4LZsA0PgUvipIQ',
    authDomain: 'pocket-pals-director.firebaseapp.com',
    messagingSenderId: '421698142516',
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);

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

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes),
        provideAnimationsAsync(),
    ],
};
