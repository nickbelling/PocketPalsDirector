import { computed, DestroyRef, inject, signal, Signal } from '@angular/core';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import {
    Entity,
    FIRESTORE,
    getConverter,
    STORAGE,
} from '../../../common/firestore';

export type GameStateLike = object & { currentQuestion: string | null };
export type GameQuestionLike = object;

/**
 * An abstract base class that games can implement to reduce boilerplate around
 * management of data in Firebase, such as question lists, game state, and
 * associated files in Storage.
 */
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

    /** The Firestore object converter for TState objects. */
    private _stateConverter = getConverter<TState>();

    /** The Firestore object converter for TQuestion objects. */
    private _questionConverter = getConverter<TQuestion>();

    /** The current state of this game's state. */
    public readonly state: Signal<TState>;

    /** The current set of questions for this game. */
    public readonly questions: Signal<Entity<TQuestion>[]>;

    /** The Firebase ID of the current question. */
    public readonly currentQuestionId = computed<string | null>(
        () => this.state().currentQuestion,
    );

    /**
     * The index of the current question in the "questions" array. If no current
     * question is set, returns -1.
     */
    public readonly currentQuestionIndex = computed<number>(() => {
        const currentQuestionId = this.currentQuestionId();
        const questions = this.questions();

        if (currentQuestionId) {
            return questions.findIndex((q) => q.id === currentQuestionId);
        } else {
            return -1;
        }
    });

    /** The current question entity, or undefined if no question is selected. */
    public readonly currentQuestion = computed<Entity<TQuestion> | undefined>(
        () => {
            const currentQuestionIndex = this.currentQuestionIndex();
            const questions = this.questions();
            return questions[currentQuestionIndex];
        },
    );

    /**
     * The next question entity after the current one, or undefined if the
     * current question is the last one.
     */
    public readonly nextQuestion = computed<Entity<TQuestion> | undefined>(
        () => {
            const currentQuestionIndex = this.currentQuestionIndex();
            const questions = this.questions();
            const nextQuestion = questions[currentQuestionIndex + 1];
            return nextQuestion;
        },
    );

    /** The number of questions remaining after the "current" question. */
    public readonly questionsRemaining = computed<number>(() => {
        const currentQuestionIndex = this.currentQuestionIndex();
        const questions = this.questions();

        return questions.length - 1 - currentQuestionIndex;
    });

    /** @constructor */
    constructor(path: string, defaultState: TState) {
        this._path = path;
        this._defaultState = defaultState;

        // Create the state/question signals. These are ONLY updatable from
        // within this constructor, so their public types are just `Signal<T>`,
        // even though here we're creating `WritableSignal<T>`s for use later on
        // in the callbacks, and we just set the public properties to their
        // references.
        const stateSignal = signal<TState>(defaultState);
        this.state = stateSignal;
        const questionsSignal = signal<Entity<TQuestion>[]>([]);
        this.questions = questionsSignal;

        // Create a reference to the TState document in Firestore.
        this._stateRef = doc(this._firestore, path).withConverter(
            this._stateConverter,
        );

        // Set up a snapshot updated callback of the TState document.
        const unsubscribeState: Unsubscribe = onSnapshot(
            this._stateRef,
            (snapshot) => {
                // Either we got the document, or it's null/undefined.
                // If null/undefined, use the defaultState.
                const documentData = snapshot.data() || defaultState;

                // Update the signal with the new data.
                stateSignal.set(documentData);
            },
        );

        // Create a reference to the TQuestion collection in Firestore.
        this._questionsRef = collection(
            this._firestore,
            `${path}/questions`,
        ).withConverter(this._questionConverter);

        // Create a query across the collection.
        const questionsQuery = query(
            this._questionsRef,
            orderBy('createdAt'),
        ).withConverter(this._questionConverter);

        // Set up a snapshot updated callback of the TQuestion collection.
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

        // Unsubscribe from the snapshots when this service is destroyed.
        this._destroyRef.onDestroy(() => {
            unsubscribeState();
            unsubscribeQuestions();
        });
    }

    //#region Overridable CRUD hooks

    /** Gets a descriptive string representing the question. */
    public abstract getQuestionString(question: TQuestion): string;

    /** Fired before the requested question is added. */
    protected async beforeAddQuestion(question: TQuestion): Promise<void> {}

    /**
     * Fired after a question is added. The "question" parameter is a
     * fully-resolved entity post-add (i.e. it has an ID), but may not yet exist
     * in the "questions" array - do not use it for storing or comparison.
     */
    protected async afterAddQuestion(
        question: Entity<TQuestion>,
    ): Promise<void> {}

    /** Fired before a question is edited. */
    protected async beforeEditQuestion(
        id: string,
        question: TQuestion | Partial<TQuestion>,
    ): Promise<void> {}

    /**
     * Fired after a question is edited. The "question" parameter is a
     * fully-resolved entity post-edit, but may not yet exist in the "questions"
     * array - do not use it for storing or comparison.
     */
    protected async afterEditQuestion(
        question: Entity<TQuestion>,
    ): Promise<void> {}

    /** Fired before a question is deleted. */
    protected async beforeDeleteQuestion(
        question: Entity<TQuestion>,
    ): Promise<void> {}

    /**
     * Fired after a question is deleted. The "question" parameter *may* still
     * exist in the "questions" array at this point, but it has been deleted
     * from the server.
     */
    protected async afterDeleteQuestion(
        question: Entity<TQuestion>,
    ): Promise<void> {}

    //#endregion

    /**
     * Sets or updates the current state of the game.
     * @param state The new state object to set, or a partial implementation.
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
        await this.beforeAddQuestion(question);

        const newDocRef = await addDoc(this._questionsRef, {
            ...question,
            createdAt: serverTimestamp(),
        });
        const addedEntity = await getDoc(
            newDocRef.withConverter(this._questionConverter),
        );

        await this.afterAddQuestion(addedEntity.data()!);
    }

    /**
     * Edits a question.
     * @param id The Firebase ID of the question to edit.
     * @param question The updated question, or a partial implementation.
     * @returns The edited question.
     */
    public async editQuestion(
        id: string,
        question: TQuestion | Partial<TQuestion>,
    ): Promise<Entity<TQuestion>> {
        await this.beforeEditQuestion(id, question);

        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${id}`,
        ).withConverter(this._questionConverter);
        await setDoc(questionDocRef, question, { merge: true });

        const editedEntity = await getDoc(
            questionDocRef.withConverter(this._questionConverter),
        );

        await this.afterEditQuestion(editedEntity.data()!);
        return editedEntity.data()!;
    }

    /**
     * Explicitly sets the `createdAt` value of the given question to a specific
     * point in time. Because questions are ordered by their `createdAt` value,
     * this allows you to reorder them by swapping their `createdAt` values.
     * @param id The Firebase ID of the question to set the timestamp of.
     * @param timestamp The timestamp to set, in milliseconds since epoch.
     */
    public async setQuestionTimestamp(
        id: string,
        timestamp: Timestamp,
    ): Promise<void> {
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${id}`,
        );
        await setDoc(questionDocRef, { createdAt: timestamp }, { merge: true });
    }

    /**
     * Removes the given question from the question collection for this game.
     */
    public async deleteQuestion(question: Entity<TQuestion>): Promise<void> {
        await this.beforeDeleteQuestion(question);
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${question.id}`,
        );
        await deleteDoc(questionDocRef);
        await this.afterDeleteQuestion(question);
    }

    /**
     * Uploads a file to storage for this service.
     * @param file The file to upload.
     * @param subPath The path (within this service's path) to upload the file to.
     * @param onProgress Optional callback for reporting upload progress.
     * @returns The full internal storage path of the file. NOTE: this must be
     * converted to a download URL using the "getDownloadUrl" function or the
     * "resolveStorageUrl" function if used publicly.
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
            // Ensure the file is publicly accessible
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
     */
    public async deleteFile(subPath: string): Promise<void> {
        const path = `${this._path}/${subPath}`;
        const fileRef = ref(this._storage, path);
        await deleteObject(fileRef);
    }
}
