import { computed, DestroyRef, inject, signal, Signal } from '@angular/core';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    FirestoreDataConverter,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    serverTimestamp,
    setDoc,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import { FIRESTORE, STORAGE } from '../../app.config';

function getConverter<T extends object>(): FirestoreDataConverter<Entity<T>> {
    return {
        toFirestore: (data: Entity<T>): T => {
            // Strip out firebaseId before saving if it's in the passed-in
            // object, since that's a meta-field we use client-side only.
            const { firebaseId, ...rest } = data;
            return rest as T;
        },
        fromFirestore: (snapshot: QueryDocumentSnapshot): Entity<T> => {
            // "createdAt" is stored as a Timestamp object in Firebase, but we
            // want to interpret it as a number on this side.
            const data = snapshot.data() as T & {
                createdAt?: { toMillis: () => number } | number;
            };

            // Convert the createdAt timestamp to a number.
            const createdAt =
                typeof data.createdAt === 'number'
                    ? data.createdAt
                    : (data.createdAt?.toMillis() ?? 0);

            const entity: Entity<T> = {
                firebaseId: snapshot.id,
                ...data,
                createdAt,
            };
            return entity;
        },
    };
}

export type Entity<TEntity extends object> = TEntity & {
    firebaseId: string;
    createdAt: number;
};

export type GameStateLike = object & { currentQuestion: string | null };
export type GameQuestionLike = object;

export abstract class BaseGameDatabase<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    /** Reference to the configured Firestore instance. */
    private _firestore = inject(FIRESTORE);

    /** Reference to the configured Storage instance. */
    private _storage = inject(STORAGE);

    /** DestroyRef used for unsubscribing from snapshots. */
    private _destroyRef = inject(DestroyRef);

    /** Reference to state document, used for updating */
    private _stateRef: DocumentReference<TState, DocumentData>;

    /** Reference to questions collection, used for adding/removing */
    private _questionsRef: CollectionReference<TQuestion, DocumentData>;

    /** Default state, used when resetting state */
    private _defaultState: TState;

    /**
     * The path used for all items associated with this service, both in the
     * database and in file storage.
     */
    private _path: string;

    /** The current state of this game's state. */
    public readonly state: Signal<TState>;

    /** The current set of questions for this game. */
    public readonly questions: Signal<Entity<TQuestion>[]>;

    /** The Firebase ID of the current question. */
    public readonly currentQuestionId = computed<string | null>(
        () => this.state().currentQuestion,
    );

    /** The current question entity. */
    public readonly currentQuestion = computed<Entity<TQuestion> | undefined>(
        () => {
            const currentQuestion = this.currentQuestionId();
            const questions = this.questions();

            if (currentQuestion) {
                return questions.find((q) => q.firebaseId === currentQuestion);
            } else {
                return undefined;
            }
        },
    );

    /** @constructor */
    constructor(path: string, defaultState: TState) {
        this._path = path;
        this._defaultState = defaultState;

        // Create the typed converters for use with this game
        const stateConverter = getConverter<TState>();
        const questionConverter = getConverter<TQuestion>();

        // Create the state/question signals. These are ONLY updatable from
        // within this constructor, so their public types are just `Signal<T>`,
        // even though here we're creating `WritableSignal<T>`s for use later on
        // in the callbacks, and we just setting the public properties to their
        // references.
        const stateSignal = signal<TState>(defaultState);
        this.state = stateSignal;
        const questionsSignal = signal<Entity<TQuestion>[]>([]);
        this.questions = questionsSignal;

        // Create a reference to the TState document.
        this._stateRef = doc(this._firestore, path).withConverter(
            stateConverter,
        );

        // Set up a snapshot of the TState document.
        const unsubscribeState: Unsubscribe = onSnapshot(
            this._stateRef,
            (snapshot) => {
                // Either this is the document or it's null/undefined.
                // If null/undefined, use the defaultState.
                const documentData = snapshot.data() || defaultState;

                // Update the signal with the new data.
                stateSignal.set(documentData);
            },
        );

        // Create a reference to the TQuestion collection.
        this._questionsRef = collection(
            this._firestore,
            `${path}/questions`,
        ).withConverter(questionConverter);

        // Create a query across the collection.
        const questionsQuery = query(
            this._questionsRef,
            orderBy('createdAt'),
        ).withConverter(questionConverter);

        // Set up a snapshot of the TQuestion collection.
        const unsubscribeQuestions: Unsubscribe = onSnapshot(
            questionsQuery,
            (snapshot) => {
                // Create a new copy of the array.
                const collectionData: Entity<TQuestion>[] = [];
                snapshot.forEach((doc) => {
                    collectionData.push(doc.data());
                });

                // Update the signal with the new array.
                questionsSignal.set(collectionData);
            },
        );

        // Unsubscribe from the snapshots when the
        this._destroyRef.onDestroy(() => {
            unsubscribeState();
            unsubscribeQuestions();
        });
    }

    /**
     * Sets the current state of the game.
     * @param state The new state object to set.
     */
    public async setState(state: TState | Partial<TState>): Promise<void> {
        await setDoc(this._stateRef, state, { merge: true });
    }

    /**
     * Resets the current state of the game to the default state.
     */
    public async resetState(): Promise<void> {
        await this.setState(this._defaultState);
    }

    /**
     * Adds a question to the question collection for this game.
     * @param question The question to add.
     */
    public async addQuestion(question: TQuestion): Promise<void> {
        await addDoc(this._questionsRef, {
            ...question,
            createdAt: serverTimestamp(),
        });
    }

    /**
     * Edits a question.
     * @param firebaseId The Firebase ID of the question to edit.
     * @param question The updated question.
     */
    public async editQuestion(
        firebaseId: string,
        question: TQuestion | Partial<TQuestion>,
    ): Promise<void> {
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${firebaseId}`,
        );
        await setDoc(questionDocRef, question, { merge: true });
    }

    /**
     * Explicitly sets the `createdAt` value of the given question to a specific
     * point in time. Because questions are ordered by their `createdAt` value,
     * this allows you to reorder them by swapping their `createdAt` values.
     * @param firebaseId The Firebase ID of the question to set the timestamp of.
     * @param timestamp The timestamp to set, in milliseconds since epoch.
     */
    public async setQuestionTimestamp(
        firebaseId: string,
        timestamp: number,
    ): Promise<void> {
        const newCreatedAt = Timestamp.fromMillis(timestamp);
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${firebaseId}`,
        );
        await setDoc(
            questionDocRef,
            { createdAt: newCreatedAt },
            { merge: true },
        );
    }

    /**
     * Removes the given question from the question collection for this game.
     */
    public async deleteQuestion(question: Entity<TQuestion>): Promise<void> {
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${question.firebaseId}`,
        );
        await deleteDoc(questionDocRef);
    }

    /**
     * Uploads a file to storage for this service.
     * @param file The file to upload.
     * @param subPath The path (within this service's path) to upload the file to.
     * @param onProgress Optional callback for reporting upload progress.
     * @returns The full internal storage path of the file. NOTE: this must be
     * converted to a download URL using the "getDownloadUrl" function.
     */
    public async uploadFile(
        file: File,
        subPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<string> {
        const uploadPath = `${this._path}/${subPath}`;
        const storageRef = ref(this._storage, uploadPath);

        // Upload the file
        const uploadTask = uploadBytesResumable(storageRef, file, {
            cacheControl: 'public, max-age=31536000',
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    // If the onProgress callback is defined, fire it
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => reject(error),
                async () => {
                    resolve(uploadPath);
                },
            );
        });
    }

    /**
     * Deletes an uploaded file from storage for this service.
     * @param path The Firebase path to the file to delete (not the download URL).
     * @param isFullPath True if the path is a full path; false if it is only a
     * subpath.
     */
    public async deleteFile(
        path: string,
        isFullPath: boolean = true,
    ): Promise<void> {
        if (!isFullPath) {
            // Path is not a full path, append it to this database's main path
            path = `${this._path}/${path}`;
        }

        const fileRef = ref(this._storage, path);
        await deleteObject(fileRef);
    }

    // public async getDownloadUrl(
    //     path: string,
    //     isFullPath: boolean = true,
    // ): Promise<string> {
    //     if (!isFullPath) {
    //         // Path is not a full path, append it to this database's main path
    //         path = `${this._path}/${path}`;
    //     }

    //     const fileRef = ref(this._storage, path);
    //     return await getDownloadURL(fileRef);
    // }
}
