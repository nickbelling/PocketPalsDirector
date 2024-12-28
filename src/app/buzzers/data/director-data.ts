import { inject, Injectable, signal } from '@angular/core';
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
import {
    Entity,
    FIRESTORE,
    getConverter,
    resizeImage,
    STORAGE,
    subscribeToCollection,
    subscribeToDocument,
} from '../../common';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STATE_DOC_PATH,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BUZZERS_TEAMS_COLLECTION_PATH,
    BuzzerState,
    BuzzerTeam,
    DEFAULT_BUZZER_STATE,
} from '../model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerDirectorDataStore {
    private _firestore = inject(FIRESTORE);
    private _storage = inject(STORAGE);
    private _stateRef: DocumentReference<BuzzerState, DocumentData>;
    private _playersRef: CollectionReference<BuzzerPlayer, DocumentData>;
    private _teamsRef: CollectionReference<BuzzerTeam, DocumentData>;
    private _playerConverter = getConverter<BuzzerPlayer>();

    public readonly state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    public readonly players = signal<Entity<BuzzerPlayer>[]>([]);
    public readonly teams = signal<Entity<BuzzerTeam>[]>([]);

    constructor() {
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );

        this._playersRef = subscribeToCollection(
            BUZZERS_PLAYERS_COLLECTION_PATH,
            (data) => {
                this.players.set(data);
            },
        );

        this._teamsRef = subscribeToCollection(
            BUZZERS_TEAMS_COLLECTION_PATH,
            (data) => {
                this.teams.set(data);
            },
        );
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

    public async addTeam(team: BuzzerTeam): Promise<void> {
        await addDoc(this._teamsRef, {
            ...team,
            createdAt: serverTimestamp(),
        });
    }

    public async editTeam(
        teamId: string,
        team: BuzzerTeam | Partial<BuzzerTeam>,
    ): Promise<void> {
        const teamRef = doc(
            this._firestore,
            `${this._teamsRef.path}/${teamId}`,
        );
        await setDoc(teamRef, team, { merge: true });
    }

    public async deleteTeam(team: Entity<BuzzerTeam>): Promise<void> {
        const teamRef = doc(
            this._firestore,
            `${this._teamsRef.path}/${team.id}`,
        );
        await deleteDoc(teamRef);
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
            `${this._playersRef.path}/${player.id}`,
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
                const playerRef = this._getPlayerRef(player.id);
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
                const playerRef = this._getPlayerRef(player.id);
                batch.set(playerRef, { lockedOut: false }, { merge: true });
            }
        });

        await batch.commit();
    }

    public async markCorrect(playerId: string): Promise<void> {
        const players = this.players();
        const state = this.state();
        const batch = writeBatch(this._firestore);

        // Unlock all players and reset their buzzers
        players.forEach((player) => {
            if (player.lockedOut || player.buzzTimestamp !== null) {
                const playerRef = this._getPlayerRef(player.id);
                batch.set(
                    playerRef,
                    { buzzTimestamp: null, lockedOut: false },
                    { merge: true },
                );
            }
        });

        if (state.correctLocksNextQuestion) {
            // Specifically lock the player who correctly answered
            const playerRef = this._getPlayerRef(playerId);
            batch.set(playerRef, { lockedOut: true }, { merge: true });
        }

        await batch.commit();
    }

    public async markIncorrect(playerId: string): Promise<void> {
        const state = this.state();

        if (state.incorrectLocksThisQuestion) {
            // Lock this player (this also implicitly resets their buzzer)
            await this.lockPlayer(playerId);
        } else {
            await this.resetPlayerBuzzer(playerId);
        }
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

    public async deleteImage(subPath: string): Promise<void> {
        await this._deleteFile(`${BUZZERS_STORAGE_IMAGES_PATH}/${subPath}`);
    }

    public async uploadSound(soundFile: File): Promise<string> {
        const soundId = v4();
        await this._uploadFile(
            soundFile,
            `${BUZZERS_STORAGE_SOUNDS_PATH}/${soundId}`,
        );
        return soundId;
    }

    public async deleteSound(subPath: string): Promise<void> {
        await this._deleteFile(`${BUZZERS_STORAGE_IMAGES_PATH}/${subPath}`);
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

    private async _deleteFile(path: string): Promise<void> {
        const storageRef = ref(this._storage, path);
        await deleteObject(storageRef);
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
