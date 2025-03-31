import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BuzzerDeviceService } from '../buzzers/buzzer-devices';
import { AudioService } from '../common/audio';
import { AuthService } from '../common/auth';
import { BuzzerPlayerService } from './devices/buzzer-player-service';
import { GlobalDataStore } from './global-data-store';

/** The main dashboard component, showing the top toolbar. */
@Component({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatBadgeModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTooltipModule,
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
    private _globalData = inject(GlobalDataStore);
    private _audio = inject(AudioService);
    private _buzzerDevices = inject(BuzzerDeviceService);
    private _playerBuzzers = inject(BuzzerPlayerService);
    public auth = inject(AuthService);

    protected audioEnabled = this._audio.audioEnabled;
    protected activeGames = this._globalData.activeGames;
    protected inactiveGames = this._globalData.inactiveGames;
    protected canUseDevices = this._buzzerDevices.canUseDevices;
    protected assignedBuzzerCount = computed(() => {
        return this._playerBuzzers.playerBuzzerMap().filter((p) => p.player)
            .length;
    });

    constructor() {
        // By default, the admin interface should have sound turned off
        this.audioEnabled.set(false);
    }
}
