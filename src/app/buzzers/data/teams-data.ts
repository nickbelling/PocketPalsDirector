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
import {} from '../../common';
import {
    BaseFirestoreDataStore,
    Entity,
    subscribeToCollection,
} from '../../common/firestore';
import { BUZZERS_TEAMS_COLLECTION_PATH, BuzzerTeam } from '../model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerTeamsDataStore extends BaseFirestoreDataStore {
    private _teamsRef: CollectionReference<BuzzerTeam, DocumentData>;

    public readonly teams = signal<Entity<BuzzerTeam>[]>([]);

    constructor() {
        super();

        this._teamsRef = subscribeToCollection(
            BUZZERS_TEAMS_COLLECTION_PATH,
            (data) => {
                this.teams.set(data);
            },
        );
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
}
