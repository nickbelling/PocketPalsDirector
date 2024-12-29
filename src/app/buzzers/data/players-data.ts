import { Injectable, signal } from '@angular/core';
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
import {
    BaseFirestoreDataStore,
    Entity,
    getConverter,
    subscribeToCollection,
} from '../../common/firestore';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerPlayersDataStore extends BaseFirestoreDataStore {
    private _playersRef: CollectionReference<BuzzerPlayer, DocumentData>;
    private _playerConverter = getConverter<BuzzerPlayer>();

    public readonly players = signal<Entity<BuzzerPlayer>[]>([]);

    constructor() {
        super();

        this._playersRef = subscribeToCollection(
            BUZZERS_PLAYERS_COLLECTION_PATH,
            (data) => {
                this.players.set(data);
            },
        );
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
            await this.deleteFile(
                `${BUZZERS_STORAGE_IMAGES_PATH}/${player.image}`,
            );
        }

        if (player.soundEffect) {
            await this.deleteFile(
                `${BUZZERS_STORAGE_SOUNDS_PATH}/${player.soundEffect}`,
            );
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

    public async markCorrect(
        playerId: string,
        correctLocksNextQuestion: boolean,
    ): Promise<void> {
        const players = this.players();
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

        if (correctLocksNextQuestion) {
            // Specifically lock the player who correctly answered
            const playerRef = this._getPlayerRef(playerId);
            batch.set(playerRef, { lockedOut: true }, { merge: true });
        }

        await batch.commit();
    }

    public async markIncorrect(
        playerId: string,
        incorrectLocksThisQuestion: boolean,
    ): Promise<void> {
        if (incorrectLocksThisQuestion) {
            // Lock this player (this also implicitly resets their buzzer)
            await this.lockPlayer(playerId);
        } else {
            // Don't lock, just reset the buzzer
            await this.resetPlayerBuzzer(playerId);
        }
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
