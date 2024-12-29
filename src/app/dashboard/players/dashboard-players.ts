import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    BuzzerController,
    BuzzerPlayerAddDialog,
    BuzzerTeamEditDialog,
} from '../../buzzers/buzzer-controller';
import { BuzzerDisplay } from '../../buzzers/buzzer-display/buzzer-display';
import { BuzzerDirectorDataStore } from '../../buzzers/data';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerTeam,
} from '../../buzzers/data/model';
import { Player } from '../../common/components/player';
import { GamePreview } from '../../common/components/preview';
import { ConfirmDialog } from '../../common/dialog';
import { SoundService } from '../../common/files';
import { Entity, FirebaseUploadedFileUrlPipe } from '../../common/firestore';
import { CommonControllerModule } from '../../games/base/controller';

@Component({
    imports: [
        CommonControllerModule,
        Player,
        GamePreview,
        BuzzerController,
        BuzzerDisplay,
        FirebaseUploadedFileUrlPipe,
    ],
    templateUrl: './dashboard-players.html',
    styleUrl: './dashboard-players.scss',
})
export class DashboardPlayers {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialog);
    private _confirm = inject(ConfirmDialog);
    private _sound = inject(SoundService);

    protected imagesBasePath = BUZZERS_STORAGE_IMAGES_PATH;
    protected soundsBasePath = BUZZERS_STORAGE_SOUNDS_PATH;
    protected buzzerBaseUrl = `${window.location.origin}/buzzer/`;
    protected buzzerDisplayUrl = `${window.location.origin}/buzzer-display`;

    public players = this._data.players;
    public state = this._data.state;
    public teams = this._data.teams;

    public addTeam(): void {
        this._dialog.open(BuzzerTeamEditDialog);
    }

    public editTeam(team: Entity<BuzzerTeam>): void {
        this._dialog.open(BuzzerTeamEditDialog, {
            data: team,
        });
    }

    public deleteTeam(team: Entity<BuzzerTeam>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete team',
            `Are you sure you want to delete ${team.name}?`,
            {
                onDelete: async () => {
                    await this._data.deleteTeam(team);
                },
            },
        );
    }

    public addPlayer(): void {
        this._dialog.open(BuzzerPlayerAddDialog);
    }

    public editPlayer(player: Entity<BuzzerPlayer>): void {
        this._dialog.open(BuzzerPlayerAddDialog, {
            data: player,
        });
    }

    public deletePlayer(player: Entity<BuzzerPlayer>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete player',
            `Are you sure you want to delete ${player.name}?`,
            {
                onDelete: async () => {
                    await this._data.deletePlayer(player);
                },
            },
        );
    }

    public async playSound(soundEffectPath: string | null): Promise<void> {
        if (soundEffectPath != null) {
            await this._sound.playStorageSound(
                this.soundsBasePath + '/' + soundEffectPath,
                true,
            );
        }
    }

    public getTeam(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): Entity<BuzzerTeam> | undefined {
        return teams.find((t) => t.id === player.teamId);
    }
}
