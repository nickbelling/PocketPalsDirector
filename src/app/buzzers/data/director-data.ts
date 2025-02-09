import { inject, Injectable, Signal } from '@angular/core';
import { v4 } from 'uuid';
import { BaseFirestoreDataStore, Entity } from '../../common/firestore';
import { resizeImage } from '../../common/utils';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerState,
    BuzzerTeam,
} from './model';
import { BuzzerPlayersDataStore } from './players-data';
import { BuzzerStateDataStore } from './state-data';
import { BuzzerTeamsDataStore } from './teams-data';

/**
 * The data store service used for the Director's view of the buzzers. Has the
 * ability to change data globally, where the other services do not.
 */
@Injectable({
    providedIn: 'root',
})
export class BuzzerDirectorDataStore extends BaseFirestoreDataStore {
    private _stateData = inject(BuzzerStateDataStore);
    private _playersData = inject(BuzzerPlayersDataStore);
    private _teamsData = inject(BuzzerTeamsDataStore);

    public readonly state: Signal<BuzzerState> = this._stateData.state;
    public readonly players: Signal<Entity<BuzzerPlayer>[]> =
        this._playersData.players;
    public readonly teams: Signal<Entity<BuzzerTeam>[]> = this._teamsData.teams;

    public setState = this._stateData.setState.bind(this._stateData);
    public enableBuzzers = this._stateData.enableBuzzers.bind(this._stateData);
    public disableBuzzers = this._stateData.disableBuzzers.bind(
        this._stateData,
    );

    public addPlayer = this._playersData.addPlayer.bind(this._playersData);
    public editPlayer = this._playersData.editPlayer.bind(this._playersData);
    public deletePlayer = this._playersData.deletePlayer.bind(
        this._playersData,
    );
    public buzzInPlayer = this._playersData.buzzInPlayer.bind(
        this._playersData,
    );
    public resetPlayerBuzzer = this._playersData.resetPlayerBuzzer.bind(
        this._playersData,
    );
    public resetAllPlayerBuzzers = this._playersData.resetAllPlayerBuzzers.bind(
        this._playersData,
    );
    public lockPlayer = this._playersData.lockPlayer.bind(this._playersData);
    public unlockPlayer = this._playersData.unlockPlayer.bind(
        this._playersData,
    );
    public unlockAllPlayers = this._playersData.unlockAllPlayers.bind(
        this._playersData,
    );

    public markCorrect(playerId: string): Promise<void> {
        return this._playersData.markCorrect(
            playerId,
            this.state().correctLocksNextQuestion,
        );
    }

    public markIncorrect(playerId: string): Promise<void> {
        return this._playersData.markIncorrect(
            playerId,
            this.state().incorrectLocksThisQuestion,
            this.state().incorrectLocksTeamThisQuestion,
        );
    }

    public addTeam = this._teamsData.addTeam.bind(this._teamsData);
    public editTeam = this._teamsData.editTeam.bind(this._teamsData);
    public deleteTeam = this._teamsData.deleteTeam.bind(this._teamsData);

    public async uploadImage(imageFile: File): Promise<string> {
        const imageId = v4();
        const resized = await resizeImage(imageFile, 300, 300);
        await this.uploadFile(
            resized,
            `${BUZZERS_STORAGE_IMAGES_PATH}/${imageId}`,
        );
        return imageId;
    }

    public async deleteImage(subPath: string): Promise<void> {
        await this.deleteFile(`${BUZZERS_STORAGE_IMAGES_PATH}/${subPath}`);
    }

    public async uploadSound(soundFile: File): Promise<string> {
        const soundId = v4();
        await this.uploadFile(
            soundFile,
            `${BUZZERS_STORAGE_SOUNDS_PATH}/${soundId}`,
        );
        return soundId;
    }

    public async deleteSound(subPath: string): Promise<void> {
        await this.deleteFile(`${BUZZERS_STORAGE_SOUNDS_PATH}/${subPath}`);
    }
}
