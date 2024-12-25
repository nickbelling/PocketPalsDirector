import {
    computed,
    DestroyRef,
    inject,
    Injectable,
    signal,
} from '@angular/core';
import {
    addDoc,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    serverTimestamp,
    setDoc,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 } from 'uuid';
import { FIRESTORE, STORAGE } from '../../app.config';
import {
    Entity,
    getConverter,
    resizeImage,
    subscribeToCollection,
    subscribeToDocument,
} from '../../common';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STATE_DOC_PATH,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerState,
    DEFAULT_BUZZER_STATE,
} from '../model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerDirectorDataStore {
    private _firestore = inject(FIRESTORE);
    private _storage = inject(STORAGE);
    private _destroyRef = inject(DestroyRef);
    private _stateRef: DocumentReference<BuzzerState, DocumentData>;
    private _playersRef: CollectionReference<BuzzerPlayer, DocumentData>;
    private _connectedState = signal<boolean>(false);
    private _connectedPlayers = signal<boolean>(false);
    private _playerConverter = getConverter<BuzzerPlayer>();

    public readonly state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    public readonly players = signal<Entity<BuzzerPlayer>[]>([]);
    public connected = computed(() => {
        return this._connectedState() && this._connectedPlayers();
    });

    constructor() {
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this._connectedState.set(true);
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );

        this._playersRef = subscribeToCollection(
            BUZZERS_PLAYERS_COLLECTION_PATH,
            (data) => {
                this._connectedPlayers.set(true);
                this.players.set(data);
            },
        );

        this._destroyRef.onDestroy(() => {
            this._connectedState.set(false);
            this._connectedPlayers.set(false);
        });
    }

    public async setState(
        state: BuzzerState | Partial<BuzzerState>,
    ): Promise<void> {
        await setDoc(this._stateRef, state, { merge: true });
    }

    public async enableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: true });
    }

    public async disableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: false });
    }

    public async addPlayer(player: BuzzerPlayer): Promise<void> {
        await addDoc(this._playersRef, {
            ...player,
            createdAt: serverTimestamp(),
        });
    }

    public async editPlayer(
        playerId: string,
        player: BuzzerPlayer | Partial<BuzzerPlayer>,
    ): Promise<void> {
        const playerRef = doc(
            this._firestore,
            `${this._playersRef.path}/${playerId}`,
        );
        await setDoc(playerRef, player, { merge: true });
    }

    public async deletePlayer(player: Entity<BuzzerPlayer>): Promise<void> {
        if (player.image) {
            const fileRef = ref(
                this._storage,
                `${BUZZERS_STORAGE_IMAGES_PATH}/${player.image}`,
            );
            await deleteObject(fileRef);
        }

        if (player.soundEffect) {
            const fileRef = ref(
                this._storage,
                `${BUZZERS_STORAGE_SOUNDS_PATH}/${player.soundEffect}`,
            );
            await deleteObject(fileRef);
        }

        const playerRef = doc(
            this._firestore,
            `${this._playersRef.path}/${player.firebaseId}`,
        );
        await deleteDoc(playerRef);
    }

    public async buzzInPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, {
            buzzTimestamp: serverTimestamp() as Timestamp,
        });
    }

    public async resetPlayerBuzzer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, { buzzTimestamp: null });
    }

    public async resetAllPlayerBuzzers(): Promise<void> {
        const players = this.players();
        const batch = writeBatch(this._firestore);

        players.forEach((player) => {
            if (player.buzzTimestamp !== null) {
                const playerRef = this._getPlayerRef(player.firebaseId);
                batch.set(playerRef, { buzzTimestamp: null }, { merge: true });
            }
        });

        await batch.commit();
    }

    public async lockPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, {
            lockedOut: true,
            buzzTimestamp: null,
        });
    }

    public async unlockPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, { lockedOut: false });
    }

    public async unlockAllPlayers(): Promise<void> {
        const players = this.players();
        const batch = writeBatch(this._firestore);

        players.forEach((player) => {
            if (player.lockedOut !== null) {
                const playerRef = this._getPlayerRef(player.firebaseId);
                batch.set(playerRef, { lockedOut: false }, { merge: true });
            }
        });

        await batch.commit();
    }

    public async uploadImage(imageFile: File): Promise<string> {
        const imageId = v4();
        const resized = await resizeImage(imageFile, 300, 300, 0.5);
        await this._uploadFile(
            resized,
            `${BUZZERS_STORAGE_IMAGES_PATH}/${imageId}`,
        );
        return imageId;
    }

    public async uploadSound(soundFile: File): Promise<string> {
        const soundId = v4();
        await this._uploadFile(
            soundFile,
            `${BUZZERS_STORAGE_SOUNDS_PATH}/${soundId}`,
        );
        return soundId;
    }

    private async _uploadFile(
        file: File,
        path: string,
        onProgress?: (progress: number) => void,
    ): Promise<void> {
        const storageRef = ref(this._storage, path);

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
                    resolve();
                },
            );
        });
    }

    private _getPlayerRef(
        playerId: string,
    ): DocumentReference<Entity<BuzzerPlayer>> {
        return doc(
            this._firestore,
            `${this._playersRef.path}/${playerId}`,
        ).withConverter(this._playerConverter);
    }
}
