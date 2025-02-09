import { Injectable, signal } from '@angular/core';
import {
    addDoc,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import {
    BaseFirestoreDataStore,
    Entity,
    subscribeToCollection,
} from '../../common/firestore';
import { BUZZERS_TEAMS_COLLECTION_PATH, BuzzerTeam } from './model';

/**
 * The data store that represents the current state of all of the buzzer
 * player teams. Shared by the Director, Player and Display services.
 */
@Injectable({
    providedIn: 'root',
})
export class BuzzerTeamsDataStore extends BaseFirestoreDataStore {
    private _teamsRef: CollectionReference<BuzzerTeam, DocumentData>;

    /** The list of player teams. */
    public readonly teams = signal<Entity<BuzzerTeam>[]>([]);

    constructor() {
        super();

        // Subscribe to changes about the teams and update the Signal whenever
        // any of them change.
        this._teamsRef = subscribeToCollection(
            BUZZERS_TEAMS_COLLECTION_PATH,
            (data) => {
                this.teams.set(data);
            },
        );
    }

    /** Adds a team. */
    public async addTeam(team: BuzzerTeam): Promise<void> {
        await addDoc(this._teamsRef, {
            ...team,
            createdAt: serverTimestamp(),
        });
    }

    /** Edits a team. */
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

    /** Deletes the given team. */
    public async deleteTeam(team: Entity<BuzzerTeam>): Promise<void> {
        const teamRef = doc(
            this._firestore,
            `${this._teamsRef.path}/${team.id}`,
        );
        await deleteDoc(teamRef);
    }
}
