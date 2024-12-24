import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import {
    collection,
    CollectionReference,
    doc,
    DocumentReference,
    FirestoreDataConverter,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { FIRESTORE } from '../../app.config';
import { Entity } from './model';

export function getConverter<TDocType extends object>(): FirestoreDataConverter<
    Entity<TDocType>
> {
    return {
        toFirestore: (data: Entity<TDocType>): TDocType => {
            // Strip out firebaseId before saving if it's in the passed-in
            // object, since that's a meta-field we use client-side only.
            const { firebaseId, ...rest } = data;
            return rest as TDocType;
        },
        fromFirestore: (snapshot: QueryDocumentSnapshot): Entity<TDocType> => {
            const data = snapshot.data() as TDocType;

            const entity: Entity<TDocType> = {
                firebaseId: snapshot.id,
                // default to null, but it will be overridden if "...data" has it
                createdAt: null,
                ...data,
            };
            return entity;
        },
    };
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
