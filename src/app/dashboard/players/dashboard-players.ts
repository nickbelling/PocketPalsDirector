import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    BuzzerDirectorDataStore,
    BuzzerModule,
    BuzzerPlayer,
    BuzzerPlayerAddDialog,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerTeam,
    BuzzerTeamEditDialog,
    BuzzerTeamPipe,
} from '../../buzzers';
import {
    CommonControllerModule,
    Entity,
    GamePreview,
    Player,
    SimpleDialogService,
    SoundService,
} from '../../common';

@Component({
    imports: [
        CommonControllerModule,
        Player,
        GamePreview,
        BuzzerTeamPipe,
        BuzzerModule,
    ],
    templateUrl: './dashboard-players.html',
    styleUrl: './dashboard-players.scss',
})
export class DashboardPlayers {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialog);
    private _confirm = inject(SimpleDialogService);
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
            );
        }
    }
}
