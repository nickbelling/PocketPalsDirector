import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import {
    collection,
    CollectionReference,
    doc,
    DocumentReference,
    FirestoreDataConverter,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import { Entity, PUBLIC_STORAGE_BASE_URL } from './model';
import { FIRESTORE } from './tokens';

/**
 * Creates a data converter that handles materializing entities from Firestore
 * in the correct type (and wrapping them as {@link Entity<T>} types with the
 * correct ID), as well as ensuring if those types are passed back for setting,
 * the additional properties are stripped out.
 * @returns A typed Firestore converter for the given generic type.
 */
export function getConverter<TDocType extends object>(): FirestoreDataConverter<
    Entity<TDocType>
> {
    return {
        toFirestore: (data: Entity<TDocType>): TDocType => {
            // Strip out id before saving if it's in the passed-in
            // object, since that's a meta-field we use client-side only.
            const { id, ...rest } = data;
            return rest as TDocType;
        },
        fromFirestore: (snapshot: QueryDocumentSnapshot): Entity<TDocType> => {
            const data = snapshot.data() as TDocType;

            const entity: Entity<TDocType> = {
                id: snapshot.id,
                // default to null, but it will be overridden if "...data" has it
                createdAt: null,
                ...data,
            };
            return entity;
        },
    };
}

/**
 * Gets the Firestore document at the provided path. This is a point-in-time
 * snapshot of the document which does not update.
 *
 * NOTE: Must be called from an injection context (e.g. service constructor).
 *
 * @param path The complete Firestore path to the document to fetch.
 * @returns The document if found, or `undefined` otherwise.
 */
export async function getDocument<TDocType extends object>(
    path: string,
): Promise<Entity<TDocType> | undefined> {
    assertInInjectionContext(getDocument);

    const firestore = inject(FIRESTORE);
    const converter = getConverter<TDocType>();

    const docRef = doc(firestore, path).withConverter(converter);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        return docSnapshot.data();
    } else {
        return undefined;
    }
}

/**
 * Subscribes to changes for the document on the given Firebase document path,
 * and invokes the provided callback each time the document changes server-side.
 *
 * Handles properly disposing of the subscription once the caller itself is
 * disposed.
 *
 * NOTE: Must be called from an injection context (e.g. service constructor).
 *
 * @param path The Firebase path to the document.
 * @param defaultObj The default object to use if the document is not found.
 * @param snapshotCallback The callback to invoke each time the document changes.
 * @returns The Firebase docRef of the document.
 */
export function subscribeToDocument<TDocType extends object>(
    path: string,
    snapshotCallback: (obj: TDocType | undefined) => void,
): DocumentReference<TDocType> {
    assertInInjectionContext(subscribeToDocument);

    // Inject required services
    const firestore = inject(FIRESTORE);
    const destroyRef = inject(DestroyRef);

    // Get the converter for this type
    const converter = getConverter<TDocType>();

    // Set up the snapshot and have it call the callback when the document
    // changes in some way
    const docRef = doc(firestore, path).withConverter(converter);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data();
        snapshotCallback(data);
    });

    // Handle unsubscribing from the snapshot when the destroyRef is invoked
    destroyRef.onDestroy(() => {
        unsubscribe();
    });

    return docRef;
}

/**
 * Subscribes to all documents within the given Firebase collection path, and
 * invokes the provided callback each time any of the documents in the
 * collection change server-side.
 *
 * Handles properly disposing of the subscription once the caller itself is
 * disposed.
 *
 * @param path The Firebase path to the collection.
 * @param snapshotCallback The callback to invoke each time the collection changes.
 * @param queryConstraint The constraint to provide to the collection query. By
 * default, uses "orderBy('createdAt')".
 * @returns The Firebase collectionRef of the collection.
 */
export function subscribeToCollection<TDocType extends object>(
    path: string,
    snapshotCallback: (arr: Entity<TDocType>[]) => void,
    queryConstraint: QueryConstraint = orderBy('createdAt'),
): CollectionReference<TDocType> {
    assertInInjectionContext(subscribeToCollection);

    // Inject required services
    const firestore = inject(FIRESTORE);
    const destroyRef = inject(DestroyRef);

    // Get the converter for this type
    const converter = getConverter<TDocType>();

    // Set up the snapshot and have it call the callback when the collection
    // changes in some way
    const collectionRef = collection(firestore, path).withConverter(converter);

    const constraints = [];
    if (queryConstraint) {
        constraints.push(queryConstraint);
    }

    const collectionQuery = query(collectionRef, ...constraints).withConverter(
        converter,
    );
    const unsubscribe = onSnapshot(collectionQuery, (snapshot) => {
        const arr: Entity<TDocType>[] = [];
        snapshot.forEach((obj) => arr.push(obj.data()));
        snapshotCallback(arr);
    });

    // Handle unsubscribing from the snapshot when the destroyRef is invoked
    destroyRef.onDestroy(() => {
        unsubscribe();
    });

    return collectionRef;
}

/**
 * For a given path in Firebase Storage, resolves a publicly accessible URL for
 * it.
 *
 * Because this is synchronous and does not make a call to the Firebase servers
 * to validate it, the returned URL may be invalid if the asset is not public or
 * if it does not exist. If you need to check the validity of a storage path,
 * use Firebase Storage's {@link getDownloadURL} function instead.
 *
 * @param storagePath The path in Firebase Storage to the asset.
 * @param cacheBuster A cache buster to add to the URL (e.g. `"t=12345"`).
 * @returns A URL to the publicly available asset.
 */
export function resolveStorageUrl(
    storagePath: string,
    cacheBuster?: string,
): string {
    const encodedPath = encodeURIComponent(storagePath);
    let suffix = '?alt=media';

    if (cacheBuster) {
        suffix = `${suffix}&${cacheBuster}`;
    }

    return `${PUBLIC_STORAGE_BASE_URL}/${encodedPath}${suffix}`;
}
