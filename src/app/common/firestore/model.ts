import { FirebaseOptions } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { getConverter } from './utils';

/** @inheritdoc */
export const FIREBASE_CONFIG: FirebaseOptions = {
    projectId: 'pocket-pals-director',
    appId: '1:421698142516:web:9fd5531992f213bba56561',
    storageBucket: 'pocket-pals-director.firebasestorage.app',
    apiKey: 'AIzaSyAI7PBhNb177728aLV5U4LZsA0PgUvipIQ',
    authDomain: 'pocket-pals-director.firebaseapp.com',
    messagingSenderId: '421698142516',
};

/** HTTPS base URL for the corsProxy Firebase Function. */
export const CORS_PROXY_FUNCTION_URL = `https://${FIREBASE_CONFIG.projectId}.web.app/corsproxy`;

/** HTTPS base URL for the sgdbProxy Firebase Function. */
export const SGDB_PROXY_FUNCTION_URL = `https://${FIREBASE_CONFIG.projectId}.web.app/sgdbproxy`;

/** HTTPS base URL for the steamSpyProxy Firebase Function. */
export const STEAM_SPY_PROXY_FUNCTION_URL = `https://${FIREBASE_CONFIG.projectId}.web.app/steamspyproxy`;

/** Base URL for items uploaded to Firebase Storage publicly. */
export const PUBLIC_STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o`;

/**
 * Represents a single entity in Firebase Firestore. When materializing an
 * entity from Firebase using {@link getConverter}, the entity's Firebase ID is
 * set as the `id` property.
 */
export type Entity<TEntity extends object> = TEntity & {
    id: string;
    createdAt: Timestamp | null;
};
