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

/**
 * The data store that represents the current state of all of the buzzer
 * players. Shared by the Director and Display services.
 */
@Injectable({
    providedIn: 'root',
})
export class BuzzerPlayersDataStore extends BaseFirestoreDataStore {
    private _playersRef: CollectionReference<BuzzerPlayer, DocumentData>;
    private _playerConverter = getConverter<BuzzerPlayer>();

    /** The global list of BuzzerPlayers. */
    public readonly players = signal<Entity<BuzzerPlayer>[]>([]);

    constructor() {
        super();

        // Subscribe to the collection of players in Firestore and update the
        // Signal whenever anything changes.
        this._playersRef = subscribeToCollection(
            BUZZERS_PLAYERS_COLLECTION_PATH,
            (data) => {
                this.players.set(data);
            },
        );
    }

    /** Adds the given player. */
    public async addPlayer(player: BuzzerPlayer): Promise<void> {
        await addDoc(this._playersRef, {
            ...player,
            createdAt: serverTimestamp(),
        });
    }

    /** Edits the given player. */
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

    /** Deletes the given player. */
    public async deletePlayer(player: Entity<BuzzerPlayer>): Promise<void> {
        // Delete image file from storage if it exists.
        if (player.image) {
            await this.deleteFile(
                `${BUZZERS_STORAGE_IMAGES_PATH}/${player.image}`,
            );
        }

        // Delete sound effect file from storage if it exists.
        if (player.soundEffect) {
            await this.deleteFile(
                `${BUZZERS_STORAGE_SOUNDS_PATH}/${player.soundEffect}`,
            );
        }

        // Delete the player document/record.
        const playerRef = doc(
            this._firestore,
            `${this._playersRef.path}/${player.id}`,
        );

        await deleteDoc(playerRef);
    }

    /**
     * Buzzes in the given player by setting their buzz timestamp to the current
     * time.
     */
    public async buzzInPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, {
            buzzTimestamp: serverTimestamp() as Timestamp,
        });
    }

    /** Buzzes out the given player by setting their buzz timestamp to null. */
    public async resetPlayerBuzzer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, { buzzTimestamp: null });
    }

    /** Resets the buzzers for every player. */
    public async resetAllPlayerBuzzers(): Promise<void> {
        const players = this.players();

        // Batch changes
        const batch = writeBatch(this._firestore);

        players.forEach((player) => {
            if (player.buzzTimestamp !== null) {
                const playerRef = this._getPlayerRef(player.id);
                batch.set(playerRef, { buzzTimestamp: null }, { merge: true });
            }
        });

        // Commit the batch of changes in a single operation
        await batch.commit();
    }

    /** Locks the given player. */
    public async lockPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, {
            lockedOut: true,
            buzzTimestamp: null,
        });
    }

    /** Locks the given player's team. */
    public async lockPlayerTeam(playerId: string): Promise<void> {
        const players = this.players();

        // Batch changes
        const batch = writeBatch(this._firestore);

        const teamId = players.find((p) => p.id === playerId)?.teamId;

        players.forEach((player) => {
            if (player.teamId === teamId) {
                const playerRef = this._getPlayerRef(player.id);
                batch.set(
                    playerRef,
                    { lockedOut: true, buzzTimestamp: null },
                    { merge: true },
                );
            }
        });

        // Commit the batch of changes in a single operation
        await batch.commit();
    }

    /** Unlocks the given player. */
    public async unlockPlayer(playerId: string): Promise<void> {
        await this.editPlayer(playerId, { lockedOut: false });
    }

    /** Unlocks every player. */
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

    /**
     * Marks the given player as "correct", which may also lock them if that
     * option is set, while also unlocking all other players.
     */
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

    /**
     * Marks the given player as "incorrect", which may lock them (or everyone
     * on their team).
     */
    public async markIncorrect(
        playerId: string,
        incorrectLocksPlayerThisQuestion: boolean,
        incorrectLocksTeamThisQuestion: boolean,
    ): Promise<void> {
        if (incorrectLocksTeamThisQuestion) {
            // Lock this player's team
            await this.lockPlayerTeam(playerId);
        } else if (incorrectLocksPlayerThisQuestion) {
            // Lock this player (this also implicitly resets their buzzer)
            await this.lockPlayer(playerId);
        } else {
            // Don't lock, just reset the buzzer
            await this.resetPlayerBuzzer(playerId);
        }
    }

    /** Gets the Firebase document ref for the player with the given ID. */
    private _getPlayerRef(
        playerId: string,
    ): DocumentReference<Entity<BuzzerPlayer>> {
        return doc(
            this._firestore,
            `${this._playersRef.path}/${playerId}`,
        ).withConverter(this._playerConverter);
    }
}
