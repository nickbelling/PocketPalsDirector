import { DestroyRef, inject, signal, Signal } from '@angular/core';
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
    query,
    QueryDocumentSnapshot,
    setDoc,
} from 'firebase/firestore';
import { FIRESTORE } from '../app.config';

function getConverter<T extends object>(): FirestoreDataConverter<Entity<T>> {
    return {
        toFirestore: (data: Entity<T>): T => {
            const stripped: T = { ...data };
            return stripped;
        },
        fromFirestore: (snapshot: QueryDocumentSnapshot): Entity<T> => {
            const data = snapshot.data() as T;
            const entity: Entity<T> = {
                firebaseId: snapshot.id,
                ...data,
            };
            return entity;
        },
    };
}

export type Entity<TEntity extends object> = TEntity & { firebaseId: string };

export abstract class BaseGameDatabaseService<
    TState extends object,
    TQuestion extends object
> {
    /** Reference to the configured Firestore instance. */
    private _firestore = inject(FIRESTORE);

    /** DestroyRef used for unsubscribing from snapshots. */
    private _destroyRef = inject(DestroyRef);

    /** Reference to state document, used for updating */
    private _stateRef: DocumentReference<TState, DocumentData>;

    /** Reference to questions collection, used for adding/removing */
    private _questionsRef: CollectionReference<TQuestion, DocumentData>;

    /** Default state, used when resetting state */
    private _defaultState: TState;

    /** The current state of this game's state. */
    public state: Signal<TState>;

    /** The current set of questions for this game. */
    public questions: Signal<Entity<TQuestion>[]>;

    /** @constructor */
    constructor(path: string, defaultState: TState) {
        this._defaultState = defaultState;

        // Create the typed converters for use with this game
        const stateConverter = getConverter<TState>();
        const questionConverter = getConverter<TQuestion>();

        // Create the state/question signals. These are ONLY updateable from
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
            stateConverter
        );

        // Set up a snapshot of the TState document.
        const unsubState = onSnapshot(this._stateRef, (snapshot) => {
            // Either this is the document or it's null/undefined.
            // If null/undefined, use the defaultState.
            const documentData = snapshot.data() || defaultState;

            // Update the signal with the new data.
            stateSignal.set(documentData);
        });

        // Create a reference to the TQuestion collection.
        this._questionsRef = collection(
            this._firestore,
            `${path}/questions`
        ).withConverter(questionConverter);

        // Create a query across the collection.
        const questionsQuery = query(this._questionsRef).withConverter(
            questionConverter
        );

        // Set up a snapshot of the TQuestion collection.
        const unsubQuestions = onSnapshot(questionsQuery, (snapshot) => {
            // Create a new copy of the array.
            const collectionData: Entity<TQuestion>[] = [];
            snapshot.forEach((doc) => {
                collectionData.push(doc.data());
            });

            // Update the signal with the new array.
            questionsSignal.set(collectionData);
        });

        // Unsubscribe from the snapshots when the
        this._destroyRef.onDestroy(() => {
            unsubState();
            unsubQuestions();
        });
    }

    public async setState(state: TState): Promise<void> {
        await setDoc(this._stateRef, state);
    }

    public async resetState(): Promise<void> {
        await this.setState(this._defaultState);
    }

    public async addQuestion(question: TQuestion): Promise<void> {
        await addDoc(this._questionsRef, question);
    }

    public async removeQuestion(question: Entity<TQuestion>): Promise<void> {
        const questionDocRef = doc(
            this._firestore,
            `${this._questionsRef.path}/${question.firebaseId}`
        );
        await deleteDoc(questionDocRef);
    }
}
